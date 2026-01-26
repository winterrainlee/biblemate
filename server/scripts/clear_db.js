import { initDB, getDB, saveDB } from '../db/init.js';

async function clearAttributes() {
    console.log('🧹 Clearing Database for Backup Test...');
    try {
        await initDB();
        const db = getDB();

        const tables = ['reading_logs', 'highlights', 'verse_notes', 'free_notes', 'daily_prayers'];

        db.run('BEGIN TRANSACTION');

        for (const table of tables) {
            db.run(`DELETE FROM ${table}`);
            console.log(`   - Cleared ${table}`);
        }

        db.run('COMMIT');
        saveDB();

        console.log('✨ Database cleared successfully!');
    } catch (error) {
        console.error('❌ Failed to clear database:', error);
        process.exit(1);
    }
}

clearAttributes();
