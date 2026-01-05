import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

// Get all reading logs
router.get('/', (req, res) => {
    try {
        const db = getDB();
        const stmt = db.prepare(`
            SELECT id, date, book, chapter_from, chapter_to, created_at, updated_at 
            FROM reading_logs 
            ORDER BY date DESC
        `);

        const logs = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            // For backward compatibility, also expose as 'chapter' if single chapter
            logs.push({
                ...row,
                chapter: row.chapter_from // alias for single chapter reading
            });
        }
        stmt.free();

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add reading log (날짜+책+장 조합으로 중복 방지)
router.post('/', (req, res) => {
    try {
        const { book, chapter, chapter_from, chapter_to, date } = req.body;
        const startChapter = chapter_from || chapter;
        const endChapter = chapter_to || chapter;

        if (!book || !startChapter || !date) {
            return res.status(400).json({ error: 'Missing required fields (book, chapter/chapter_from, date)' });
        }

        const db = getDB();

        // Check if exact same log exists (date + book + chapter range)
        const checkStmt = db.prepare(`
            SELECT id FROM reading_logs 
            WHERE date = ? AND book = ? AND chapter_from = ? AND chapter_to = ?
        `);
        checkStmt.bind([date, book, startChapter, endChapter]);

        if (checkStmt.step()) {
            checkStmt.free();
            return res.json({ success: true, message: 'Already logged', book, chapter_from: startChapter, chapter_to: endChapter, date });
        }
        checkStmt.free();

        // Insert new record
        const insertStmt = db.prepare(`
            INSERT INTO reading_logs (book, chapter_from, chapter_to, date, created_at, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `);
        insertStmt.run([book, startChapter, endChapter, date]);
        insertStmt.free();

        saveDB();

        res.json({ success: true, book, chapter_from: startChapter, chapter_to: endChapter, date });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete reading log
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const stmt = db.prepare('DELETE FROM reading_logs WHERE id = ?');
        stmt.run([id]);
        stmt.free();
        saveDB();
        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

