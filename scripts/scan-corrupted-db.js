/**
 * Scan database for corrupted characters (U+FFFD)
 * Usage: node scripts/scan-corrupted-db.js [book_code]
 */

import { initDB, closeDB } from '../server/db/init.js';

async function scanDB(bookCode) {
    const db = await initDB();

    let query = `
        SELECT book, chapter, verse, text 
        FROM bible_verses 
        WHERE text LIKE '%\uFFFD%' AND version = 'krv'
    `;

    if (bookCode) {
        query += ` AND book = '${bookCode}'`;
    }

    query += ` ORDER BY book, chapter, verse`;

    const result = db.exec(query);

    if (!result.length || !result[0].values.length) {
        console.log(`\n✅ No corrupted characters found${bookCode ? ` in ${bookCode}` : ''}.`);
    } else {
        const rows = result[0].values;
        console.log(`\n❌ Found ${rows.length} corrupted verses:`);

        for (const [book, chapter, verse, text] of rows) {
            console.log(`[${book} ${chapter}:${verse}] ${text}`);

            // Show context
            const idx = text.indexOf('\uFFFD');
            const start = Math.max(0, idx - 15);
            const end = Math.min(text.length, idx + 15);
            console.log(`   Context: ...${text.substring(start, end).replace(/\n/g, ' ')}...`);
        }
    }

    closeDB();
}

const args = process.argv.slice(2);
scanDB(args[0]);
