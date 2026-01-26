import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'bible.db');

async function checkDB() {
    console.log(`Checking DB at: ${DB_PATH}`);
    if (!fs.existsSync(DB_PATH)) {
        console.error('DB file not found!');
        return;
    }

    const SQL = await initSqlJs();
    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(fileBuffer);

    try {
        // 1. Check KRV books
        const bookStmt = db.prepare("SELECT DISTINCT book FROM bible_verses WHERE version = 'krv' LIMIT 10");
        const books = [];
        while (bookStmt.step()) {
            books.push(bookStmt.getAsObject().book);
        }
        console.log(`KRV Books (first 10): ${JSON.stringify(books)}`);
        bookStmt.free();

        // 2. Try to find Gen 1:1 in KRV
        console.log("Searching for KRV Gen 1:1...");
        const stmt = db.prepare("SELECT * FROM bible_verses WHERE version = 'krv' AND book = 'Gen' AND chapter = 1 AND verse = 1");
        if (stmt.step()) {
            console.log("Found:", stmt.getAsObject());
        } else {
            console.log("Not found!");

            // Try to find ANY verse in KRV with similar book name
            const fuzzyStmt = db.prepare("SELECT * FROM bible_verses WHERE version = 'krv' AND book LIKE 'G%' LIMIT 1");
            if (fuzzyStmt.step()) {
                console.log("Found similar:", fuzzyStmt.getAsObject());
            }
        }
        stmt.free();

    } catch (e) {
        console.error('Error querying DB:', e);
    }
}

checkDB();
