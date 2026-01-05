/**
 * WEB (World English Bible) import script
 * Downloads from TehShrike/world-english-bible and imports into SQLite
 */

import { initDB, getDB, saveDB, closeDB } from '../server/db/init.js';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const osisMapping = require('../server/data/osis-mapping.json');

// TehShrike WEB repository base URL
const WEB_BASE_URL = 'https://raw.githubusercontent.com/TehShrike/world-english-bible/master/json/';

// Book filename mapping (TehShrike uses lowercase book names)
const OSIS_TO_FILENAME = {
    'Gen': 'genesis', 'Exod': 'exodus', 'Lev': 'leviticus', 'Num': 'numbers', 'Deut': 'deuteronomy',
    'Josh': 'joshua', 'Judg': 'judges', 'Ruth': 'ruth', '1Sam': '1samuel', '2Sam': '2samuel',
    '1Kgs': '1kings', '2Kgs': '2kings', '1Chr': '1chronicles', '2Chr': '2chronicles', 'Ezra': 'ezra',
    'Neh': 'nehemiah', 'Esth': 'esther', 'Job': 'job', 'Ps': 'psalms', 'Prov': 'proverbs',
    'Eccl': 'ecclesiastes', 'Song': 'songofsolomon', 'Isa': 'isaiah', 'Jer': 'jeremiah', 'Lam': 'lamentations',
    'Ezek': 'ezekiel', 'Dan': 'daniel', 'Hos': 'hosea', 'Joel': 'joel', 'Amos': 'amos',
    'Obad': 'obadiah', 'Jonah': 'jonah', 'Mic': 'micah', 'Nah': 'nahum', 'Hab': 'habakkuk',
    'Zeph': 'zephaniah', 'Hag': 'haggai', 'Zech': 'zechariah', 'Mal': 'malachi',
    'Matt': 'matthew', 'Mark': 'mark', 'Luke': 'luke', 'John': 'john', 'Acts': 'acts',
    'Rom': 'romans', '1Cor': '1corinthians', '2Cor': '2corinthians', 'Gal': 'galatians', 'Eph': 'ephesians',
    'Phil': 'philippians', 'Col': 'colossians', '1Thess': '1thessalonians', '2Thess': '2thessalonians',
    '1Tim': '1timothy', '2Tim': '2timothy', 'Titus': 'titus', 'Phlm': 'philemon', 'Heb': 'hebrews',
    'Jas': 'james', '1Pet': '1peter', '2Pet': '2peter', '1John': '1john', '2John': '2john',
    '3John': '3john', 'Jude': 'jude', 'Rev': 'revelation'
};

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Parse TehShrike WEB JSON format
 * Their format is an array of objects with type/chapterNumber/verseNumber/value
 */
function parseWEBBook(bookData) {
    const verses = [];
    for (const item of bookData) {
        if (item.type === 'paragraph text' || item.type === 'line text') {
            if (item.chapterNumber && item.verseNumber && item.value) {
                // Check if we already have this verse (multiple sections per verse)
                const existing = verses.find(v =>
                    v.chapter === item.chapterNumber && v.verse === item.verseNumber
                );
                if (existing) {
                    existing.text += ' ' + item.value.trim();
                } else {
                    verses.push({
                        chapter: item.chapterNumber,
                        verse: item.verseNumber,
                        text: item.value.trim()
                    });
                }
            }
        }
    }
    return verses;
}

/**
 * Import WEB (World English Bible)
 */
async function importWEB(db) {
    console.log('\n📥 Downloading World English Bible (WEB)...');

    const stmt = db.prepare(`
        INSERT OR REPLACE INTO bible_verses (book, chapter, verse, version, text) 
        VALUES (?, ?, ?, 'web', ?)
    `);

    let totalVerses = 0;
    let successBooks = 0;
    const osisKeys = Object.keys(osisMapping);

    for (const osisCode of osisKeys) {
        const filename = OSIS_TO_FILENAME[osisCode];
        if (!filename) {
            console.warn(`⚠️ No filename mapping for ${osisCode}`);
            continue;
        }

        const url = `${WEB_BASE_URL}${filename}.json`;

        try {
            const bookData = await fetchJSON(url);
            const verses = parseWEBBook(bookData);

            for (const v of verses) {
                stmt.run([osisCode, v.chapter, v.verse, v.text]);
                totalVerses++;
            }

            successBooks++;
            process.stdout.write(`\r  ${osisMapping[osisCode]?.ko || osisCode}: ${verses.length} verses imported`);
        } catch (error) {
            console.warn(`\n  ⚠️ Failed to import ${osisCode}: ${error.message}`);
        }
    }
    stmt.free();

    console.log(`\n✅ WEB imported: ${totalVerses} verses from ${successBooks} books`);
    return totalVerses;
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting WEB Bible import...\n');

    try {
        const db = await initDB();

        // First, remove existing BBE data
        console.log('🗑️ Removing old BBE data...');
        const deleteStmt = db.prepare("DELETE FROM bible_verses WHERE version = 'bbe'");
        deleteStmt.run();
        deleteStmt.free();
        console.log('✅ BBE data removed');

        // Import WEB
        const webCount = await importWEB(db);

        // Save and close
        saveDB();
        closeDB();

        console.log('\n=== Import Summary ===');
        console.log(`World English Bible (WEB): ${webCount} verses`);
        console.log('✅ WEB import completed successfully!');

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        process.exit(1);
    }
}

main();
