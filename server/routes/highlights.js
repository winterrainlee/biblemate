import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

// Get all highlights
router.get('/', (req, res) => {
    try {
        const db = getDB();
        const stmt = db.prepare(`
      SELECT * FROM highlights ORDER BY created_at DESC
    `);

        const highlights = [];
        while (stmt.step()) {
            highlights.push(stmt.getAsObject());
        }
        stmt.free();

        res.json(highlights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add highlight
router.post('/', (req, res) => {
    try {
        const { book, chapter, verse, style } = req.body;

        if (!book || !chapter || !verse || !style) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const db = getDB();
        const stmt = db.prepare(`
      INSERT OR REPLACE INTO highlights (book, chapter, verse, style, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

        stmt.run([book, chapter, verse, style]);
        stmt.free();

        saveDB(); // Persist changes

        res.json({ success: true, book, chapter, verse, style });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove highlight
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();

        const stmt = db.prepare('DELETE FROM highlights WHERE id = ?');
        stmt.run([id]);
        stmt.free();

        saveDB(); // Persist changes

        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
