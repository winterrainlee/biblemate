import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDbPath = path.resolve(__dirname, 'data/bible.db');
const targetDbPath = path.resolve(__dirname, 'db/database.sqlite');

async function mergeData() {
    console.log(`Source DB: ${sourceDbPath}`);
    console.log(`Target DB: ${targetDbPath}`);

    const sourceDb = await open({
        filename: sourceDbPath,
        driver: sqlite3.Database
    });

    const targetDb = await open({
        filename: targetDbPath,
        driver: sqlite3.Database
    });

    // 1. Get notes and free_notes from source
    console.log("Reading data from source...");
    const sourceNotes = await sourceDb.all("SELECT date, content, created_at, updated_at FROM notes");
    const sourceFreeNotes = await sourceDb.all("SELECT date, content, created_at, updated_at FROM free_notes");

    // Combine them, prioritizing free_notes if dates overlap
    const combined = new Map();
    sourceNotes.forEach(n => combined.set(n.date, n));
    sourceFreeNotes.forEach(n => combined.set(n.date, n));

    console.log(`Found ${combined.size} unique date records in source.`);

    // 2. Insert into target free_notes
    console.log("Merging into target database...");
    let mergedCount = 0;
    for (const [date, note] of combined) {
        // Use INSERT OR IGNORE to respect existing data in target database.sqlite
        const result = await targetDb.run(
            `INSERT OR IGNORE INTO free_notes (date, content, created_at, updated_at) 
             VALUES (?, ?, ?, ?)`,
            [note.date, note.content, note.created_at, note.updated_at]
        );
        if (result.changes > 0) {
            mergedCount++;
            console.log(`+ Dynamic merged: ${date}`);
        } else {
            console.log(`- Skiped (exists): ${date}`);
        }
    }

    console.log(`Successfully merged ${mergedCount} new records.`);

    await sourceDb.close();
    await targetDb.close();
}

mergeData().catch(err => {
    console.error(err);
    process.exit(1);
});
