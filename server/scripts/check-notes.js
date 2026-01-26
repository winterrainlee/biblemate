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
        const result = await db.all('SELECT date, content FROM free_notes ORDER BY date DESC LIMIT 10');

        if (result.length === 0) {
            console.log("No free notes found.");
        } else {
            console.log("Found Free Notes:");
            console.log(JSON.stringify(result, null, 2));
        }
    } catch (err) {
        console.error(err);
    }
})();
