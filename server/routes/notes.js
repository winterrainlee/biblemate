import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

// Get all notes
router.get('/', (req, res) => {
    try {
        const db = getDB();
        const stmt = db.prepare(`
      SELECT * FROM free_notes ORDER BY date DESC
    `);

        const notes = [];
        while (stmt.step()) {
            notes.push(stmt.getAsObject());
        }
        stmt.free();

        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add or update note
router.post('/', (req, res) => {
    try {
        const { date, content } = req.body;

        if (!date || !content) {
            return res.status(400).json({ error: 'Missing date or content' });
        }

        const db = getDB();
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO free_notes (date, content, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        content = excluded.content,
        updated_at = excluded.updated_at
    `);

        stmt.run([date, content, now, now]);
        stmt.free();

        saveDB(); // Persist changes

        res.json({ success: true, date });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get note by date
router.get('/:date', (req, res) => {
    try {
        const { date } = req.params;
        const db = getDB();

        const stmt = db.prepare('SELECT * FROM free_notes WHERE date = ?');
        stmt.bind([date]);

        let note = null;
        if (stmt.step()) {
            note = stmt.getAsObject();
        }
        stmt.free();

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete note by id
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();

        const stmt = db.prepare('DELETE FROM free_notes WHERE id = ?');
        stmt.run([id]);
        stmt.free();

        saveDB();

        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete note by date
router.delete('/by-date/:date', (req, res) => {
    try {
        const { date } = req.params;
        const db = getDB();

        const stmt = db.prepare('DELETE FROM free_notes WHERE date = ?');
        stmt.run([date]);
        stmt.free();

        saveDB();

        res.json({ success: true, date });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

