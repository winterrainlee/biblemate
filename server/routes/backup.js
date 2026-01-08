import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

// Constants
const APP_VERSION = '1.3.0';
const CURRENT_SCHEMA_VERSION = 1;
const SUPPORTED_SCHEMA_VERSIONS = [1];

// Required fields per entity
const REQUIRED_FIELDS = {
    reading_logs: ['date', 'book', 'chapter_from', 'chapter_to'],
    notes: ['date', 'content'],
    highlights: ['book', 'chapter', 'verse']
};

/**
 * Validate required fields for an entity
 * @returns {string|null} Error message or null if valid
 */
function validateEntity(entityName, records) {
    const requiredFields = REQUIRED_FIELDS[entityName];
    if (!requiredFields) return null;

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        for (const field of requiredFields) {
            if (record[field] === undefined || record[field] === null) {
                return `${entityName}[${i}].${field} is required`;
            }
        }
    }
    return null;
}

/**
 * Parse schema version from backup data
 * Handles both legacy (version: "1.1") and new (schema_version: 1) formats
 */
function parseSchemaVersion(backupData) {
    // New format: schema_version (integer)
    if (typeof backupData.schema_version === 'number') {
        return backupData.schema_version;
    }
    // Legacy format: version "1.1" -> schema_version 1
    if (backupData.version === '1.1') {
        return 1;
    }
    // No version info
    return null;
}

// Export all user data (reading_logs, notes, highlights)
router.get('/export', (req, res) => {
    try {
        const db = getDB();

        // Get all reading logs
        const readingStmt = db.prepare('SELECT * FROM reading_logs ORDER BY date DESC');
        const readingLogs = [];
        while (readingStmt.step()) {
            readingLogs.push(readingStmt.getAsObject());
        }
        readingStmt.free();

        // Get all notes
        const notesStmt = db.prepare('SELECT * FROM notes ORDER BY created_at DESC');
        const notes = [];
        while (notesStmt.step()) {
            notes.push(notesStmt.getAsObject());
        }
        notesStmt.free();

        // Get all highlights
        const highlightsStmt = db.prepare('SELECT * FROM highlights ORDER BY created_at DESC');
        const highlights = [];
        while (highlightsStmt.step()) {
            highlights.push(highlightsStmt.getAsObject());
        }
        highlightsStmt.free();

        // Prepare export data with new metadata format
        const exportData = {
            app_version: APP_VERSION,
            schema_version: CURRENT_SCHEMA_VERSION,
            exported_at: new Date().toISOString(),
            data: {
                reading_logs: readingLogs,
                notes: notes,
                highlights: highlights
            }
        };

        res.json(exportData);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            ok: false,
            error_code: 'EXPORT_FAILED',
            message: error.message
        });
    }
});

// Import user data (overwrites existing data)
router.post('/import', (req, res) => {
    try {
        const backupData = req.body;

        // Validate basic structure
        if (!backupData || typeof backupData !== 'object') {
            return res.status(400).json({
                ok: false,
                error_code: 'INVALID_FORMAT',
                message: 'Invalid backup file format'
            });
        }

        // Check for data object
        const { data } = backupData;
        if (!data || typeof data !== 'object') {
            return res.status(400).json({
                ok: false,
                error_code: 'INVALID_FORMAT',
                message: 'Missing or invalid "data" object'
            });
        }

        // Parse and validate schema version
        const schemaVersion = parseSchemaVersion(backupData);
        if (schemaVersion === null) {
            return res.status(400).json({
                ok: false,
                error_code: 'INVALID_FORMAT',
                message: 'Missing version information. Please use a valid backup file.'
            });
        }

        if (!SUPPORTED_SCHEMA_VERSIONS.includes(schemaVersion)) {
            return res.status(400).json({
                ok: false,
                error_code: 'UNSUPPORTED_SCHEMA',
                message: `Schema version ${schemaVersion} is not supported. Please update the app to restore this backup.`
            });
        }

        const { reading_logs = [], notes = [], highlights = [] } = data;

        // Validate array types
        if (!Array.isArray(reading_logs) || !Array.isArray(notes) || !Array.isArray(highlights)) {
            return res.status(400).json({
                ok: false,
                error_code: 'INVALID_FORMAT',
                message: 'Expected arrays for reading_logs, notes, and highlights'
            });
        }

        // Validate required fields
        for (const entityName of ['reading_logs', 'notes', 'highlights']) {
            const errorMsg = validateEntity(entityName, data[entityName] || []);
            if (errorMsg) {
                return res.status(400).json({
                    ok: false,
                    error_code: 'INVALID_SCHEMA',
                    message: errorMsg
                });
            }
        }

        const db = getDB();
        const now = new Date().toISOString();

        // Start transaction
        db.run('BEGIN TRANSACTION');

        try {
            // Clear existing data
            db.run('DELETE FROM reading_logs');
            db.run('DELETE FROM notes');
            db.run('DELETE FROM highlights');

            // Insert reading logs
            if (reading_logs.length > 0) {
                const readingStmt = db.prepare(
                    'INSERT INTO reading_logs (id, date, book, chapter_from, chapter_to, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
                );
                for (const record of reading_logs) {
                    readingStmt.bind([
                        record.id,
                        record.date,
                        record.book,
                        record.chapter_from,
                        record.chapter_to,
                        record.created_at || now,
                        record.updated_at || now
                    ]);
                    readingStmt.step();
                    readingStmt.reset();
                }
                readingStmt.free();
            }

            // Insert notes
            if (notes.length > 0) {
                const notesStmt = db.prepare(
                    'INSERT INTO notes (id, date, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
                );
                for (const note of notes) {
                    notesStmt.bind([
                        note.id,
                        note.date,
                        note.content,
                        note.created_at || now,
                        note.updated_at || note.created_at || now
                    ]);
                    notesStmt.step();
                    notesStmt.reset();
                }
                notesStmt.free();
            }

            // Insert highlights
            if (highlights.length > 0) {
                const highlightsStmt = db.prepare(
                    'INSERT INTO highlights (id, book, chapter, verse, style, created_at) VALUES (?, ?, ?, ?, ?, ?)'
                );
                for (const highlight of highlights) {
                    highlightsStmt.bind([
                        highlight.id,
                        highlight.book,
                        highlight.chapter,
                        highlight.verse,
                        highlight.style || 'yellow',
                        highlight.created_at || now
                    ]);
                    highlightsStmt.step();
                    highlightsStmt.reset();
                }
                highlightsStmt.free();
            }

            // Commit transaction
            db.run('COMMIT');

            // Persist changes to file
            saveDB();

            res.json({
                ok: true,
                message: 'Data imported successfully',
                imported: {
                    reading_logs: reading_logs.length,
                    notes: notes.length,
                    highlights: highlights.length
                }
            });
        } catch (error) {
            // Rollback on error
            db.run('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({
            ok: false,
            error_code: 'IMPORT_FAILED',
            message: error.message
        });
    }
});

export default router;
