import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

(async () => {
    try {
        const dbPath = path.resolve('data/bible.db');
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('--- Reading Logs (Last 10) ---');
        const logs = await db.all('SELECT * FROM reading_logs ORDER BY id DESC LIMIT 10');
        console.table(logs);

        console.log('\n--- Distinct Books in Logs ---');
        const books = await db.all('SELECT DISTINCT book FROM reading_logs');
        console.table(books);

        console.log('\n--- Searching for Zechariah (Zec/Zech) ---');
        const zecLogs = await db.all("SELECT * FROM reading_logs WHERE book LIKE 'Ze%'");
        console.table(zecLogs);
    } catch (e) {
        console.error(e);
    }
})();
