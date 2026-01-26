import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

/**
 * GET /api/prayers/:date
 * 오늘의 기도 조회
 */
router.get('/:date', (req, res) => {
    try {
        const { date } = req.params;
        const db = getDB();

        const stmt = db.prepare('SELECT * FROM daily_prayers WHERE date = ?');
        stmt.bind([date]);

        let prayer = null;
        if (stmt.step()) {
            prayer = stmt.getAsObject();
        }
        stmt.free();

        if (!prayer) {
            return res.status(404).json({ code: 'NOT_FOUND', message: '해당 날짜의 기도가 없습니다.' });
        }

        res.json(prayer);
    } catch (error) {
        console.error('GET /prayers/:date error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * POST /api/prayers
 * 기도 저장 (UPSERT)
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
            INSERT INTO daily_prayers (date, content, created_at, updated_at)
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
        console.error('POST /prayers error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * DELETE /api/prayers/:date
 * 기도 삭제
 */
router.delete('/:date', (req, res) => {
    try {
        const { date } = req.params;
        const db = getDB();

        const stmt = db.prepare('DELETE FROM daily_prayers WHERE date = ?');
        stmt.run([date]);
        stmt.free();

        saveDB();

        res.json({ ok: true, message: '삭제되었습니다.' });
    } catch (error) {
        console.error('DELETE /prayers/:date error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

export default router;
