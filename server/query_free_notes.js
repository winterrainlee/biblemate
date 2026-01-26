import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'db/database.sqlite');

async function query() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const startDate = '2026-01-01';
    const endDate = '2026-01-24';

    console.log(`--- Checking tables for date range: ${startDate} to ${endDate} ---`);

    const freeRows = await db.all(
        "SELECT date FROM free_notes ORDER BY date ASC"
    );
    if (freeRows.length === 0) {
        console.log("No data found.");
    } else {
        console.log("\n[All free_notes Dates]");
        freeRows.forEach(row => console.log(row.date));
    }

    console.log("\n[verse_notes] (distinct dates)");
    const verseRows = await db.all(
        "SELECT DISTINCT date FROM verse_notes WHERE date BETWEEN ? AND ? ORDER BY date ASC",
        [startDate, endDate]
    );
    if (verseRows.length === 0) {
        console.log("No data found.");
    } else {
        verseRows.forEach(row => console.log(row.date));
    }

    console.log("\n[notes] (old table)");
    const oldRows = await db.all(
        "SELECT date FROM notes WHERE date BETWEEN ? AND ? ORDER BY date ASC",
        [startDate, endDate]
    );
    if (oldRows.length === 0) {
        console.log("No data found.");
    } else {
        oldRows.forEach(row => console.log(row.date));
    }

    const freeCount = await db.get("SELECT COUNT(*) as count FROM free_notes");
    const oldCount = await db.get("SELECT COUNT(*) as count FROM notes");
    const verseCount = await db.get("SELECT COUNT(*) as count FROM verse_notes");

    console.log("\n--- Total Record Counts ---");
    console.log(`free_notes: ${freeCount.count}`);
    console.log(`notes: ${oldCount.count}`);
    console.log(`verse_notes: ${verseCount.count}`);

    await db.close();
}

query().catch(err => {
    console.error(err);
    process.exit(1);
});
