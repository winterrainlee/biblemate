/**
 * Database initialization module for BibleMate
 * Uses sql.js (WebAssembly-based SQLite)
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './migration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'bible.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

/**
 * Initialize the database
 * @returns {Promise<object>} SQL.js database instance
 */
export async function initDB() {
    if (db) return db;

    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('📖 Loaded existing database');
    } else {
        db = new SQL.Database();
        console.log('🆕 Created new database');

        // Run schema
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        db.run(schema);
        console.log('📋 Schema applied');

        // Save to file
        saveDB();
    }

    // Check for migrations (V2 update)
    const migrated = runMigrations(db);
    if (migrated) {
        saveDB();
    }

    return db;
}

/**
 * Save database to file
 */
export function saveDB() {
    if (!db) return;

    // Ensure directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log('💾 Database saved');
}

/**
 * Get the database instance
 * @returns {object} SQL.js database instance
 */
export function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call initDB() first.');
    }
    return db;
}

/**
 * Close the database
 */
export function closeDB() {
    if (db) {
        saveDB();
        db.close();
        db = null;
        console.log('🔒 Database closed');
    }
}

// Auto-save on exit
process.on('exit', () => {
    if (db) saveDB();
});

process.on('SIGINT', () => {
    closeDB();
    process.exit(0);
});
