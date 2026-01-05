/**
 * Bible data import script
 * Downloads and imports Korean Bible (개역한글) and English Bible (KJV) into SQLite
 */

import { initDB, saveDB, closeDB } from '../server/db/init.js';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const osisMapping = require('../server/data/osis-mapping.json');

// Data sources
const KRV_URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json';
const BBE_URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_bbe.json';

// Book abbreviation mapping (thiagobodruk format -> OSIS)
const ABBREV_TO_OSIS = {
    'gn': 'Gen', 'ex': 'Exod', 'lv': 'Lev', 'nm': 'Num', 'dt': 'Deut',
    'js': 'Josh', 'jud': 'Judg', 'rt': 'Ruth', '1sm': '1Sam', '2sm': '2Sam',
    '1kgs': '1Kgs', '2kgs': '2Kgs', '1ch': '1Chr', '2ch': '2Chr', 'ezr': 'Ezra',
    'ne': 'Neh', 'et': 'Esth', 'job': 'Job', 'ps': 'Ps', 'prv': 'Prov',
    'ec': 'Eccl', 'so': 'Song', 'is': 'Isa', 'jr': 'Jer', 'lm': 'Lam',
    'ez': 'Ezek', 'dn': 'Dan', 'ho': 'Hos', 'Os': 'Hos', 'jl': 'Joel', 'am': 'Amos',
    'ob': 'Obad', 'jn': 'Jonah', 'mi': 'Mic', 'na': 'Nah', 'hk': 'Hab',
    'zp': 'Zeph', 'hg': 'Hag', 'zc': 'Zech', 'ml': 'Mal',
    'mt': 'Matt', 'mk': 'Mark', 'lk': 'Luke', 'jo': 'John', 'act': 'Acts',
    'rm': 'Rom', '1co': '1Cor', '2co': '2Cor', 'gl': 'Gal', 'eph': 'Eph',
    'ph': 'Phil', 'cl': 'Col', '1ts': '1Thess', '2ts': '2Thess', '1tm': '1Tim',
    '2tm': '2Tim', 'tt': 'Titus', 'phm': 'Phlm', 'hb': 'Heb', 'jm': 'Jas',
    '1pe': '1Pet', '2pe': '2Pet', '1jo': '1John', '2jo': '2John', '3jo': '3John',
    'jd': 'Jude', 're': 'Rev', 'rv': 'Rev'
};

/**
 * Fetch JSON from URL (handles BOM)
 */
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    // Remove BOM if present
                    if (data.charCodeAt(0) === 0xFEFF) {
                        data = data.slice(1);
                    }
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Import Korean Bible (개역한글)
 */
async function importKRV(db) {
    console.log('📥 Downloading Korean Bible (개역한글)...');
    const data = await fetchJSON(KRV_URL);

    console.log('📝 Importing Korean Bible...');
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO bible_verses (book, chapter, verse, version, text) 
    VALUES (?, ?, ?, 'krv', ?)
  `);

    let totalVerses = 0;
    for (const book of data) {
        const osisCode = ABBREV_TO_OSIS[book.abbrev.toLowerCase()];
        if (!osisCode) {
            console.warn(`⚠️ Unknown book abbreviation: ${book.abbrev}`);
            continue;
        }

        book.chapters.forEach((chapter, chapterIndex) => {
            chapter.forEach((verseText, verseIndex) => {
                stmt.run([osisCode, chapterIndex + 1, verseIndex + 1, verseText.trim()]);
                totalVerses++;
            });
        });

        process.stdout.write(`\r  ${osisMapping[osisCode]?.ko || osisCode}: ${book.chapters.length}장 완료`);
    }
    stmt.free();

    console.log(`\n✅ Korean Bible imported: ${totalVerses} verses`);
    return totalVerses;
}

/**
 * Import English Bible (BBE)
 */
async function importBBE(db) {
    console.log('\n📥 Downloading English Bible (BBE)...');
    const data = await fetchJSON(BBE_URL);

    console.log('📝 Importing English Bible (BBE)...');
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO bible_verses (book, chapter, verse, version, text) 
    VALUES (?, ?, ?, 'bbe', ?)
  `);

    let totalVerses = 0;
    for (const book of data) {
        let abbr = book.abbrev.toLowerCase();
        const osisCode = ABBREV_TO_OSIS[abbr];

        if (!osisCode) {
            process.stdout.write(`\r  ⚠️ Skipping unknown book: ${abbr} `);
            continue;
        }

        book.chapters.forEach((chapter, chapterIndex) => {
            chapter.forEach((verseText, verseIndex) => {
                stmt.run([osisCode, chapterIndex + 1, verseIndex + 1, verseText.trim()]);
                totalVerses++;
            });
        });

        process.stdout.write(`\r  ${osisCode}: ${book.chapters.length} chaps imported`);
    }
    stmt.free();

    console.log(`\n✅ English Bible (BBE) imported: ${totalVerses} verses`);
    return totalVerses;
}

/**
 * Main import function
 */
async function main() {
    console.log('🚀 Starting Bible data import...\n');

    try {
        const db = await initDB();

        // Import Korean Bible
        const krvCount = await importKRV(db);

        // Import English Bible
        const bbeCount = await importBBE(db);

        // Save and close
        saveDB();
        closeDB();

        console.log('\n=== Import Summary ===');
        console.log(`Korean Bible (개역한글): ${krvCount} verses`);
        console.log(`English Bible (BBE): ${bbeCount} verses`);
        console.log('✅ All imports completed successfully!');

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        process.exit(1);
    }
}

main();
