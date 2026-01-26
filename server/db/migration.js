/**
 * Database Migration Module
 * Handles schema updates and data migration for v2.0
 */

/**
 * Check and apply migrations
 * @param {object} db - SQL.js database instance
 */
export function runMigrations(db) {
    console.log('🔄 Checking for migrations...');

    let v2MigrationApplied = false;
    // 1. Check if 'verse_notes' table exists (V2 indicator)
    const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='verse_notes'");
    const v2Exists = result.length > 0 && result[0].values.length > 0;

    if (!v2Exists) {
        console.log('🚀 Starting V2 Migration...');
        try {
            db.run('BEGIN TRANSACTION');

            // 1. Create new tables if they don't exist

            // Verse Notes
            db.run(`
                CREATE TABLE IF NOT EXISTS verse_notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    book TEXT NOT NULL,
                    chapter INTEGER NOT NULL,
                    verse INTEGER NOT NULL,
                    verse_range TEXT,
                    content TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now')),
                    UNIQUE(date, book, chapter, verse)
                );
            `);
            db.run(`CREATE INDEX IF NOT EXISTS idx_verse_notes_lookup ON verse_notes(book, chapter);`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_verse_notes_date ON verse_notes(date);`);

            // Free Notes
            db.run(`
                CREATE TABLE IF NOT EXISTS free_notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL UNIQUE,
                    content TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                );
            `);
            db.run(`CREATE INDEX IF NOT EXISTS idx_free_notes_date ON free_notes(date);`);

            // Daily Prayers
            db.run(`
                CREATE TABLE IF NOT EXISTS daily_prayers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL UNIQUE,
                    content TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                );
            `);

            console.log('✅ Created new tables (verse_notes, free_notes, daily_prayers)');

            // 2. Migrate data from 'notes' to 'free_notes'
            const notesCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='notes'");
            if (notesCheck.length > 0 && notesCheck[0].values.length > 0) {
                const countResult = db.exec("SELECT COUNT(*) FROM notes");
                const count = countResult[0].values[0][0];

                if (count > 0) {
                    console.log(`📦 Migrating ${count} records from 'notes' to 'free_notes'...`);
                    db.run(`
                        INSERT OR IGNORE INTO free_notes (date, content, created_at, updated_at)
                        SELECT date, content, created_at, updated_at FROM notes
                    `);
                }
            }

            db.run('COMMIT');
            console.log('🎉 V2 Migration completed successfully.');
            v2MigrationApplied = true;
        } catch (error) {
            console.error('❌ Migration failed:', error);
            db.run('ROLLBACK');
            throw error;
        }
    } else {
        console.log('✅ Database is up to date (V2)');
        // Patch: Check if verse_range column exists in verse_notes
        try {
            const tableInfo = db.exec("PRAGMA table_info(verse_notes)");
            if (tableInfo.length > 0) {
                const columns = tableInfo[0].values.map(v => v[1]);
                if (!columns.includes('verse_range')) {
                    console.log('🩹 Patching verse_notes table: Adding verse_range column...');
                    db.run("ALTER TABLE verse_notes ADD COLUMN verse_range TEXT");
                    console.log('✅ Added verse_range column to verse_notes.');
                    v2MigrationApplied = true;
                }
            }
        } catch (error) {
            console.error('❌ Failed to patch verse_notes table:', error);
        }
    }

    // 3. User Settings Table
    const settingsResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings'");
    const settingsExists = settingsResult.length > 0 && settingsResult[0].values.length > 0;
    let settingsMigrationApplied = false;

    if (!settingsExists) {
        console.log('⚙️ Creating user_settings table...');
        try {
            db.run(`
                CREATE TABLE IF NOT EXISTS user_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TEXT DEFAULT (datetime('now'))
                );
            `);
            console.log('✅ Created user_settings table');
            settingsMigrationApplied = true;
        } catch (error) {
            console.error('❌ Failed to create user_settings table:', error);
        }
    }

    return v2MigrationApplied || settingsMigrationApplied;
}
