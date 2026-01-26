
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function checkVersions() {
    try {
        const dbPath = path.resolve('data/bible.db');
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('--- All Versions in bible_verses ---');
        const versions = await db.all('SELECT DISTINCT version FROM bible_verses');
        console.table(versions);

        await db.close();
    } catch (e) {
        console.error(e);
    }
}

checkVersions();
