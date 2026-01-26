import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

// Constants
const APP_VERSION = '2.0.0';
const CURRENT_SCHEMA_VERSION = 3;
const SUPPORTED_SCHEMA_VERSIONS = [1, 2, 3];

// Required fields per entity
const REQUIRED_FIELDS = {
    reading_logs: ['date', 'book', 'chapter_from', 'chapter_to'],
    notes: ['date', 'content'], // Legacy
    highlights: ['book', 'chapter', 'verse'],
    verse_notes: ['date', 'book', 'chapter', 'verse', 'content'],
    free_notes: ['date', 'content'],
    daily_prayers: ['date', 'content']
};

/**
 * Validate required fields and types for an entity
 * @returns {string|null} Error message or null if valid
 */
function validateEntity(entityName, records) {
    const requiredFields = REQUIRED_FIELDS[entityName];
    if (!requiredFields) return null;

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        for (const field of requiredFields) {
            const value = record[field];

            // 1. Check existence
            if (value === undefined || value === null) {
                return `${entityName}[${i}].${field} is required`;
            }

            // 2. Check types
            if (field.includes('date') && typeof value !== 'string') {
                return `${entityName}[${i}].${field} must be a string (date)`;
            }
            if ((field.includes('chapter') || field.includes('verse') || field === 'id') && typeof value !== 'number') {
                // Allow null for id (auto-generated) but if present must be number
                if (field === 'id' && value === null) continue;
                return `${entityName}[${i}].${field} must be a number`;
            }
            if ((field === 'book' || field === 'content' || field === 'style') && typeof value !== 'string') {
                return `${entityName}[${i}].${field} must be a string`;
            }
        }
    }
    return null;
}

/**
 * Parse schema version from backup data
 * Handles both legacy (version: "1.1") and new (schema_version: 1 or higher) formats
 */
function parseSchemaVersion(backupData) {
    if (typeof backupData.schema_version === 'number') {
        return backupData.schema_version;
    }
    if (backupData.version === '1.1') {
        return 1;
    }
    return null;
}

// Export all user data
router.get('/export', (req, res) => {
    try {
        const db = getDB();
        const exportData = {
            app_version: APP_VERSION,
            schema_version: CURRENT_SCHEMA_VERSION,
            exported_at: new Date().toISOString(),
            data: {}
        };

        // Helper to fetch data
        const fetchData = (table) => {
            try {
                const stmt = db.prepare(`SELECT * FROM ${table}`);
                const rows = [];
                while (stmt.step()) rows.push(stmt.getAsObject());
                stmt.free();
                return rows;
            } catch (e) {
                // Table might not exist yet if fresh install and no migration ran
                return [];
            }
        };

        exportData.data.reading_logs = fetchData('reading_logs');
        exportData.data.highlights = fetchData('highlights');

        // V2 New Tables
        exportData.data.verse_notes = fetchData('verse_notes');
        exportData.data.free_notes = fetchData('free_notes');
        exportData.data.daily_prayers = fetchData('daily_prayers');
        exportData.data.user_settings = fetchData('user_settings');

        // Legacy: Check if we have notes to export (only if free_notes is empty? No, export what we have)
        // Note: We stop exporting 'notes' to encourage V2 format, but if needed we could.
        // For now, let's NOT export legacy 'notes' table to JSON to force migration on import.

        res.json(exportData);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ ok: false, error_code: 'EXPORT_FAILED', message: error.message });
    }
});

// Import user data (overwrites existing data)
router.post('/import', (req, res) => {
    try {
        const backupData = req.body;

        // Basic validation
        if (!backupData || !backupData.data || typeof backupData.data !== 'object') {
            return res.status(400).json({ ok: false, error_code: 'INVALID_FORMAT', message: 'Invalid backup format' });
        }

        const schemaVersion = parseSchemaVersion(backupData);
        if (schemaVersion === null) {
            return res.status(400).json({ ok: false, error_code: 'INVALID_FORMAT', message: 'Missing version info' });
        }

        // Allow V1 (schema 1) and V2 (schema 2, 3...)
        // We will migrate V1 data to V2 structure

        const { data } = backupData;

        // Entities to process
        const entities = ['reading_logs', 'highlights', 'verse_notes', 'free_notes', 'daily_prayers', 'notes', 'user_settings']; // notes for legacy import

        // Validate array types
        for (const key of Object.keys(data)) {
            if (entities.includes(key) && !Array.isArray(data[key])) {
                return res.status(400).json({ ok: false, error_code: 'INVALID_FORMAT', message: `${key} must be an array` });
            }
        }

        // Validate required fields
        for (const entity of entities) {
            if (data[entity]) {
                const errMsg = validateEntity(entity, data[entity]);
                if (errMsg) return res.status(400).json({ ok: false, error_code: 'INVALID_SCHEMA', message: errMsg });
            }
        }

        const db = getDB();
        const now = new Date().toISOString();

        db.run('BEGIN TRANSACTION');

        try {
            // 1. Clear V2 tables
            db.run('DELETE FROM reading_logs');
            db.run('DELETE FROM highlights');
            db.run('DELETE FROM verse_notes');
            db.run('DELETE FROM free_notes');
            db.run('DELETE FROM daily_prayers');
            db.run('DELETE FROM user_settings');

            // Note: We don't interact with legacy 'notes' table here, just ignoring it or reading from backup.

            // 2. Helper for insertion
            const insert = (table, fields, records) => {
                if (!records || records.length === 0) return;
                const placeholders = fields.map(() => '?').join(',');
                const stmt = db.prepare(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${placeholders})`);

                for (const r of records) {
                    const values = fields.map(f => {
                        if (f === 'created_at' || f === 'updated_at') return r[f] || now;
                        // Use id from backup if present, else null (autoincrement) - but we explicit list id in backup
                        // Actually, let's skip 'id' in fields list and let sqlite generate new ones? 
                        // Or preserve IDs? Preserving IDs is better for integrity if we had relations (we don't much).
                        // Let's preserve IDs if possible, but conflicts might occur if we merge.
                        // Since we deleted all, preserving ID is fine.
                        return r[f];
                    });

                    // Handle optional fields not in record
                    // Ideally we define strict columns.
                    // For simplicity, let's stick to the specific columns we defined below.
                    stmt.bind(values);
                    stmt.step();
                    stmt.reset();
                }
                stmt.free();
            };

            // 3. Import Standard Data
            if (data.reading_logs) {
                // reading_logs: id, date, book, chapter_from, chapter_to, created_at, updated_at
                const stmt = db.prepare('INSERT INTO reading_logs (id, date, book, chapter_from, chapter_to, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
                for (const r of data.reading_logs) {
                    stmt.bind([r.id, r.date, r.book, r.chapter_from, r.chapter_to, r.created_at || now, r.updated_at || now]);
                    stmt.step(); stmt.reset();
                }
                stmt.free();
            }

            if (data.highlights) {
                // highlights: id, book, chapter, verse, style, created_at
                const stmt = db.prepare('INSERT INTO highlights (id, book, chapter, verse, style, created_at) VALUES (?, ?, ?, ?, ?, ?)');
                for (const r of data.highlights) {
                    stmt.bind([r.id, r.book, r.chapter, r.verse, r.style || 'yellow', r.created_at || now]);
                    stmt.step(); stmt.reset();
                }
                stmt.free();
            }

            // 4. Import V2 Data
            if (data.verse_notes) {
                const stmt = db.prepare('INSERT INTO verse_notes (id, date, book, chapter, verse, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                for (const r of data.verse_notes) {
                    stmt.bind([r.id, r.date, r.book, r.chapter, r.verse, r.content, r.created_at || now, r.updated_at || now]);
                    stmt.step(); stmt.reset();
                }
                stmt.free();
            }

            if (data.daily_prayers) {
                const stmt = db.prepare('INSERT INTO daily_prayers (id, date, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
                for (const r of data.daily_prayers) {
                    stmt.bind([r.id, r.date, r.content, r.created_at || now, r.updated_at || now]);
                    stmt.step(); stmt.reset();
                }
                stmt.free();
            }

            if (data.user_settings) {
                const stmt = db.prepare('INSERT INTO user_settings (key, value, updated_at) VALUES (?, ?, ?)');
                for (const r of data.user_settings) {
                    stmt.bind([r.key, r.value, r.updated_at || now]);
                    stmt.step(); stmt.reset();
                }
                stmt.free();
            }

            // 5. Handle 'free_notes' AND Legacy 'notes'
            // Strategy: Import 'free_notes' first. Then import 'notes' into 'free_notes' (ignoring duplicates by date).

            const freeNotesStmt = db.prepare('INSERT OR IGNORE INTO free_notes (id, date, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');

            // 5-1. Import native free_notes
            if (data.free_notes) {
                for (const r of data.free_notes) {
                    freeNotesStmt.bind([r.id, r.date, r.content, r.created_at || now, r.updated_at || now]);
                    freeNotesStmt.step(); freeNotesStmt.reset();
                }
            }

            // 5-2. Migrate legacy 'notes' -> 'free_notes'
            if (data.notes) {
                for (const r of data.notes) {
                    // Map legacy 'notes' to 'free_notes'. 
                    // id is preserved, but might conflict if free_notes has same id.
                    // Better to let ID auto-increment (pass null) if we are mixing?
                    // But if we want to preserve legacy IDs, pass them.
                    // Since specific unique constraint is DATE, conflicting IDs will error on primary key?
                    // Let's try to preserve ID. If ID conflict, it will fail.
                    // If conflict, maybe we should ignore ID and let it auto-gen?
                    // Warning: If we have both free_notes and notes, IDs might clash.
                    // Safe approach: If migrating 'notes', use their ID. If we already imported 'free_notes', we assume they are distinct or priority given.
                    // Let's trust 'INSERT OR IGNORE' on DATE to handle logic duplications.
                    // For ID conflicts: 'INSERT OR IGNORE' handles PK conflicts too? Yes.

                    freeNotesStmt.bind([r.id, r.date, r.content, r.created_at || now, r.updated_at || now]);
                    freeNotesStmt.step(); freeNotesStmt.reset();
                }
            }
            freeNotesStmt.free();

            db.run('COMMIT');
            saveDB();

            res.json({
                ok: true,
                message: 'Data imported and migrated successfully',
                imported: {
                    reading_logs: (data.reading_logs?.length || 0),
                    free_notes_migrated: (data.notes?.length || 0) + (data.free_notes?.length || 0),
                    highlights: (data.highlights?.length || 0)
                }
            });

        } catch (error) {
            db.run('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ ok: false, error_code: 'IMPORT_FAILED', message: error.message });
    }
});

export default router;
