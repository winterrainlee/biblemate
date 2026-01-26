import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { resolve } from 'path';

const DB_PATH = resolve('server/db/database.sqlite');

(async () => {
    try {
        const db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });
        const result = await db.get('SELECT * FROM free_notes WHERE date = ?', '2026-01-24');
        console.log('DB Record for 2026-01-24:', result ? 'FOUND' : 'NOT FOUND');
        if (result) console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
    }
})();
