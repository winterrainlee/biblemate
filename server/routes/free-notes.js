import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

/**
 * GET /api/free-notes
 * 모든 자유 묵상 조회 (통계용)
 */
router.get('/', (req, res) => {
    try {
        const db = getDB();
        const stmt = db.prepare('SELECT * FROM free_notes ORDER BY date DESC');
        const notes = [];
        while (stmt.step()) {
            notes.push(stmt.getAsObject());
        }
        stmt.free();
        res.json(notes);
    } catch (error) {
        console.error('GET /free-notes error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * GET /api/free-notes/:date
 * 자유 묵상 조회
 */
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
            return res.status(404).json({ code: 'NOT_FOUND', message: '해당 날짜의 묵상이 없습니다.' });
        }

        res.json(note);
    } catch (error) {
        console.error('GET /free-notes/:date error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * POST /api/free-notes
 * 자유 묵상 저장 (UPSERT)
 * Body: { date, content }
 */
router.post('/', (req, res) => {
    try {
        const { date, content } = req.body;

        if (!date || !content) {
            return res.status(400).json({ code: 'MISSING_FIELDS', message: '날짜와 내용이 필요합니다.' });
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

        saveDB();

        res.json({ ok: true, message: '저장되었습니다.' });
    } catch (error) {
        console.error('POST /free-notes error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * DELETE /api/free-notes/:date
 * 자유 묵상 삭제
 */
router.delete('/:date', (req, res) => {
    try {
        const { date } = req.params;
        const db = getDB();

        const stmt = db.prepare('DELETE FROM free_notes WHERE date = ?');
        stmt.run([date]);
        stmt.free();

        saveDB();

        res.json({ ok: true, message: '삭제되었습니다.' });
    } catch (error) {
        console.error('DELETE /free-notes/:date error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

export default router;
