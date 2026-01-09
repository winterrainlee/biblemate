import { initDB, closeDB } from '../server/db/init.js';

async function checkJob36() {
    const db = await initDB();
    const result = db.exec(`
        SELECT count(*) 
        FROM bible_verses 
        WHERE book = 'Job' AND chapter = 36 AND version = 'krv'
    `);
    console.log(`Job 36 count:`, result[0].values[0][0]);

    if (result[0].values[0][0] > 0) {
        const first = db.exec(`SELECT verse, text FROM bible_verses WHERE book='Job' AND chapter=36 AND version='krv' LIMIT 1`);
        console.log(`Job 36:1:`, first[0].values[0]);
    }

    closeDB();
}

checkJob36();
