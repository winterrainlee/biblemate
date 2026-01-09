import { initDB, closeDB } from '../server/db/init.js';

async function checkJob35() {
    const db = await initDB();
    const result = db.exec(`
        SELECT verse, text 
        FROM bible_verses 
        WHERE book = 'Job' AND chapter = 35 AND version = 'krv'
        ORDER BY verse
    `);

    if (result.length && result[0].values) {
        for (const [verse, text] of result[0].values) {
            console.log(`[Verse ${verse}] ${text.substring(0, 50)}...`);
            if (verse === 16) {
                console.log(`Length of 16: ${text.length}`);
            }
        }
    }

    closeDB();
}

checkJob35();
