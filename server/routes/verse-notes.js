import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

/**
 * GET /api/verse-notes?date=YYYY-MM-DD
 * 날짜별 구절 묵상 목록
 */
router.get('/', (req, res) => {
    try {
        const { date } = req.query;
        const db = getDB();

        let stmt;
        if (date) {
            stmt = db.prepare('SELECT * FROM verse_notes WHERE date = ? ORDER BY book, chapter, verse');
            stmt.bind([date]);
        } else {
            stmt = db.prepare('SELECT * FROM verse_notes ORDER BY date DESC, book, chapter, verse');
        }

        const notes = [];
        while (stmt.step()) {
            notes.push(stmt.getAsObject());
        }
        stmt.free();

        res.json(notes);
    } catch (error) {
        console.error('GET /verse-notes error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * GET /api/verse-notes/chapter/:book/:chapter
 * 묵상이 존재하는 구절 번호 목록 (📝 표시용)
 */
router.get('/chapter/:book/:chapter', (req, res) => {
    try {
        const { book, chapter } = req.params;
        const db = getDB();

        const stmt = db.prepare('SELECT DISTINCT verse FROM verse_notes WHERE book = ? AND chapter = ?');
        stmt.bind([book, parseInt(chapter)]);

        const verses = [];
        while (stmt.step()) {
            verses.push(stmt.getAsObject().verse);
        }
        stmt.free();

        res.json(verses);
    } catch (error) {
        console.error('GET /verse-notes/chapter error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * GET /api/verse-notes/:book/:chapter
 * 해당 장의 모든 묵상
 */
router.get('/:book/:chapter', (req, res) => {
    try {
        const { book, chapter } = req.params;
        const db = getDB();

        const stmt = db.prepare('SELECT * FROM verse_notes WHERE book = ? AND chapter = ? ORDER BY verse, date DESC');
        stmt.bind([book, parseInt(chapter)]);

        const notes = [];
        while (stmt.step()) {
            notes.push(stmt.getAsObject());
        }
        stmt.free();

        res.json(notes);
    } catch (error) {
        console.error('GET /verse-notes/:book/:chapter error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * POST /api/verse-notes
 * 구절 묵상 생성/수정 (UPSERT)
 * Body: { date, book, chapter, verse, content }
 */
router.post('/', (req, res) => {
    try {
        const { date, book, chapter, verse, content, verse_range } = req.body;

        if (!date || !book || chapter === undefined || verse === undefined || !content) {
            return res.status(400).json({ code: 'MISSING_FIELDS', message: '필수 필드가 누락되었습니다.' });
        }

        const db = getDB();
        const now = new Date().toISOString();

        // UPSERT: 같은 날짜, 같은 구절이면 수정
        const stmt = db.prepare(`
            INSERT INTO verse_notes (date, book, chapter, verse, content, verse_range, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date, book, chapter, verse) DO UPDATE SET
                content = excluded.content,
                verse_range = excluded.verse_range,
                updated_at = excluded.updated_at
        `);
        stmt.run([date, book, parseInt(chapter), parseInt(verse), content, verse_range || null, now, now]);
        stmt.free();

        saveDB();

        res.json({ ok: true, message: '저장되었습니다.' });
    } catch (error) {
        console.error('POST /verse-notes error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

/**
 * DELETE /api/verse-notes/:id
 * 구절 묵상 삭제
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();

        const stmt = db.prepare('DELETE FROM verse_notes WHERE id = ?');
        stmt.run([parseInt(id)]);
        stmt.free();

        saveDB();

        res.json({ ok: true, message: '삭제되었습니다.' });
    } catch (error) {
        console.error('DELETE /verse-notes/:id error:', error);
        res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message });
    }
});

export default router;
