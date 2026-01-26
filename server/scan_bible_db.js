import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'data/bible.db');

async function query() {
    console.log(`Checking database: ${dbPath}`);
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tables in bible.db:", tables.map(t => t.name).join(', '));

    const startDate = '2026-01-01';
    const endDate = '2026-01-24';

    for (const table of tables) {
        const columns = await db.all(`PRAGMA table_info(${table.name})`);
        const hasDate = columns.some(c => c.name === 'date');

        if (hasDate) {
            console.log(`\nChecking table: ${table.name}`);
            const rows = await db.all(
                `SELECT date FROM ${table.name} WHERE date BETWEEN ? AND ? ORDER BY date ASC`,
                [startDate, endDate]
            );
            if (rows.length > 0) {
                console.log(`Found ${rows.length} rows:`);
                rows.forEach(row => console.log(row.date));
            } else {
                console.log("No data found in range.");
            }
        }
    }

    await db.close();
}

query().catch(err => {
    console.error(err);
    process.exit(1);
});
