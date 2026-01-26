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
        // Query for notes between 2026-01-01 and 2026-01-20
        const result = await db.all(
            `SELECT date, content FROM free_notes 
         WHERE date BETWEEN '2026-01-01' AND '2026-01-20' 
         ORDER BY date ASC`
        );

        if (result.length === 0) {
            console.log("No free notes found between 2026-01-01 and 2026-01-20.");
        } else {
            console.log("Found Free Notes (Jan 1 - Jan 20):");
            console.log(JSON.stringify(result, null, 2));
        }
    } catch (err) {
        console.error(err);
    }
})();
