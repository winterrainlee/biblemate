import express from 'express';
import { getDB } from '../db/init.js';

const router = express.Router();

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

        // Prepare export data with metadata
        const exportData = {
            version: '1.1',
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
        res.status(500).json({ error: 'Failed to export data', message: error.message });
    }
});

// Import user data (overwrites existing data)
router.post('/import', (req, res) => {
    try {
        const { data } = req.body;

        // Validate request
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Invalid import data format' });
        }

        const { reading_logs, notes, highlights } = data;

        // Basic validation
        if (!Array.isArray(reading_logs) || !Array.isArray(notes) || !Array.isArray(highlights)) {
            return res.status(400).json({ error: 'Invalid data structure: expected arrays for reading_logs, notes, and highlights' });
        }

        const db = getDB();

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
                        record.created_at || new Date().toISOString(),
                        record.updated_at || new Date().toISOString()
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
                        note.created_at || new Date().toISOString(),
                        note.updated_at || note.created_at || new Date().toISOString()
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
                        highlight.style || 'yellow', // Default style
                        highlight.created_at
                    ]);
                    highlightsStmt.step();
                    highlightsStmt.reset();
                }
                highlightsStmt.free();
            }

            // Commit transaction
            db.run('COMMIT');

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
        res.status(500).json({ error: 'Failed to import data', message: error.message });
    }
});

export default router;
