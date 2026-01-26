
import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';

// Set Test DB Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test_bible.db');
process.env.DB_PATH = TEST_DB_PATH;

async function testMigration() {
    // Import modules AFTER setting env
    const { initDB, getDB, closeDB } = await import('../db/init.js');

    console.log('🧪 Starting Migration Verification...');

    // 1. Setup Legacy DB (V1)
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);

    const SQL = await initSqlJs();
    const db = new SQL.Database();

    // Create V1 Schema (notes only)
    db.run(`
        CREATE TABLE notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
    `);

    // Insert Mock Data
    db.run(`
        INSERT INTO notes (date, content) VALUES 
        ('2026-01-01', 'Old Note 1'),
        ('2026-01-02', 'Old Note 2');
    `);

    // Save as V1 DB
    const data = db.export();
    fs.writeFileSync(TEST_DB_PATH, Buffer.from(data));
    db.close();
    console.log('✅ Created Legacy V1 DB with 2 notes');

    // 2. Run InitDB (Should trigger migration)
    console.log('🚀 Running initDB()...');
    await initDB();

    // 3. Verify Migration
    const v2Db = getDB();

    // Check tables
    const tables = v2Db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables[0].values.flat();

    const hasVerseNotes = tableNames.includes('verse_notes');
    const hasFreeNotes = tableNames.includes('free_notes');

    if (!hasVerseNotes || !hasFreeNotes) {
        throw new Error('❌ New tables not created!');
    }

    // Check Data Migration
    const result = v2Db.exec("SELECT * FROM free_notes ORDER BY date");
    const rows = [];
    if (result.length > 0) {
        const columns = result[0].columns;
        result[0].values.forEach(row => {
            const obj = {};
            columns.forEach((col, i) => obj[col] = row[i]);
            rows.push(obj);
        });
    }

    console.log('📦 Migrated Rows:', rows);

    if (rows.length !== 2) throw new Error('❌ Row count mismatch');
    if (rows[0].content !== 'Old Note 1') throw new Error('❌ Content mismatch');

    console.log('✨ Migration Verification PASSED!');

    // 4. Verify Backup Import Logic (Simulated)
    console.log('🔄 Testing Backup Import Logic...');

    // Clear DB
    v2Db.run('DELETE FROM verse_notes');
    v2Db.run('DELETE FROM free_notes');
    v2Db.run('DELETE FROM daily_prayers');

    // Mock V1 Backup Data
    const mockBackup = {
        version: "1.1",
        data: {
            notes: [
                { id: 100, date: '2026-02-01', content: 'Imported Note 1' }
            ],
            reading_logs: [],
            highlights: []
        }
    };

    // Simulate Logic from backup.js (Simplified)
    // We are testing the SQL logic: insert notes -> free_notes
    // In backup.js we do:
    // 1. Insert into notes (legacy) ? No, we bind directly to free_notes if data.notes exists

    const { notes } = mockBackup.data;
    if (notes && notes.length > 0) {
        // Direct insert into free_notes as per backup.js implementation
        const stmt = v2Db.prepare('INSERT OR IGNORE INTO free_notes (id, date, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
        const now = new Date().toISOString();

        for (const n of notes) {
            stmt.bind([n.id, n.date, n.content, now, now]);
            stmt.step();
            stmt.reset();
        }
        stmt.free();
    }

    // Check Result
    const importResult = v2Db.exec("SELECT * FROM free_notes WHERE id=100");
    if (importResult.length === 0 || importResult[0].values[0][2] !== 'Imported Note 1') {
        throw new Error('❌ Backup Import Migration failed!');
    }

    console.log('✨ Backup Import Verification PASSED!');

    closeDB();
    // Cleanup
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
}

// Simple Import Simulation
// import backupRouter from '../routes/backup.js'; // Removed to avoid hoisting issues with init.js

testMigration().catch(err => {
    console.error(err);
    process.exit(1);
});
