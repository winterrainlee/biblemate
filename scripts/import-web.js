/**
 * WEB (World English Bible) import script
 * Parses official plain text files and imports into SQLite
 */

import { initDB, getDB, saveDB, closeDB } from '../server/db/init.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const osisMapping = require('../server/config/osis-mapping.json');

// Source directory for WEB plain text files
const WEB_SOURCE_DIR = './docs/assets/test-data/engwebu_readaloud/';

// Mapping from file abbreviation to OSIS code (Canonical 66 books)
const ABBR_TO_OSIS = {
    'GEN': 'Gen', 'EXO': 'Exod', 'LEV': 'Lev', 'NUM': 'Num', 'DEU': 'Deut',
    'JOS': 'Josh', 'JDG': 'Judg', 'RUT': 'Ruth', '1SA': '1Sam', '2SA': '2Sam',
    '1KI': '1Kgs', '2KI': '2Kgs', '1CH': '1Chr', '2CH': '2Chr', 'EZR': 'Ezra',
    'NEH': 'Neh', 'EST': 'Esth', 'JOB': 'Job', 'PSA': 'Ps', 'PRO': 'Prov',
    'ECC': 'Eccl', 'SNG': 'Song', 'ISA': 'Isa', 'JER': 'Jer', 'LAM': 'Lam',
    'EZK': 'Ezek', 'DAN': 'Daniel', 'HOS': 'Hos', 'JOL': 'Joel', 'AMO': 'Amos',
    'OBA': 'Obad', 'JON': 'Jonah', 'MIC': 'Mic', 'NAM': 'Nah', 'HAB': 'Hab',
    'ZEP': 'Zeph', 'HAG': 'Hag', 'ZEC': 'Zech', 'MAL': 'Mal',
    'MAT': 'Matt', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John', 'ACT': 'Acts',
    'ROM': 'Rom', '1CO': '1Cor', '2CO': '2Cor', 'GAL': 'Gal', 'EPH': 'Eph',
    'PHP': 'Phil', 'COL': 'Col', '1TH': '1Thess', '2TH': '2Thess',
    '1TI': '1Tim', '2TI': '2Tim', 'TIT': 'Titus', 'PHM': 'Phlm', 'HEB': 'Heb',
    'JAS': 'Jas', '1PE': '1Pet', '2PE': '2Pet', '1JN': '1John', '2JN': '2John',
    '3JN': '3John', 'JUD': 'Jude', 'REV': 'Rev'
};

/**
 * Parse a single plain text file
 * Skips first 2 lines (Book/Chapter titles), then treats each line as a verse
 */
function parsePlainTextFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const verses = [];

    // Skip first 2 lines (0: Book Name, 1: Chapter Name)
    for (let i = 2; i < lines.length; i++) {
        const text = lines[i].trim();
        if (text) {
            verses.push({
                verse: i - 1, // Line 2 is Verse 1, Line 3 is Verse 2...
                text: text
            });
        }
    }
    return verses;
}

/**
 * Import WEB from local plain text files
 */
async function importWEB(db) {
    console.log('📥 Importing World English Bible (WEB) from local files...');

    const stmt = db.prepare(`
        INSERT INTO bible_verses (book, chapter, verse, version, text) 
        VALUES (?, ?, ?, 'web', ?)
    `);

    // Get all txt files in source directory
    const files = fs.readdirSync(WEB_SOURCE_DIR).filter(f => f.endsWith('.txt'));
    let totalVerses = 0;
    let processedFiles = 0;
    const booksInDB = new Set();

    // Regex to extract abbreviation and chapter: engwebu_NNN_ABB_CC_read.txt
    const fileRegex = /^engwebu_\d{3}_([A-Z0-9]{3})_(\d+)_read\.txt$/;

    for (const filename of files) {
        const match = filename.match(fileRegex);
        if (!match) continue;

        const [_, abbr, chapterStr] = match;
        const osisCode = ABBR_TO_OSIS[abbr];
        const chapter = parseInt(chapterStr);

        if (!osisCode) {
            // Skip non-canonical books (Apocrypha) silently or with a log
            // console.log(`  ⏩ Skipping ${abbr} (Not in canonical list)`);
            continue;
        }

        const filePath = path.join(WEB_SOURCE_DIR, filename);
        try {
            const verses = parsePlainTextFile(filePath);
            for (const v of verses) {
                stmt.run([osisCode, chapter, v.verse, v.text]);
                totalVerses++;
            }
            processedFiles++;
            booksInDB.add(osisCode);
            process.stdout.write(`\r  📦 Processed ${processedFiles} files... (${osisCode} ${chapter})`);
        } catch (error) {
            console.error(`\n  ❌ Error processing ${filename}: ${error.message}`);
        }
    }
    stmt.free();

    console.log(`\n✅ WEB imported: ${totalVerses} verses from ${booksInDB.size} books (${processedFiles} chapters)`);
    return totalVerses;
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting WEB Bible update from local files...\n');

    try {
        const db = await initDB();

        // Remove existing WEB data
        console.log('🗑️ Removing old WEB data...');
        const deleteStmt = db.prepare("DELETE FROM bible_verses WHERE version = 'web'");
        deleteStmt.run();
        deleteStmt.free();
        console.log('✅ Old WEB data removed');

        // Import WEB
        const webCount = await importWEB(db);

        // Save and close
        saveDB();
        closeDB();

        console.log('\n=== Update Summary ===');
        console.log(`World English Bible (WEB): ${webCount} verses`);
        console.log('✅ WEB update completed successfully!');

    } catch (error) {
        console.error('❌ Update failed:', error.message);
        process.exit(1);
    }
}

main();

