import express from 'express';
import { getDB } from '../db/init.js';
import { createRequire } from 'module';

const router = express.Router();
const require = createRequire(import.meta.url);
const osisMapping = require('../data/osis-mapping.json');

// Route removed: Get all books with metadata (duplicate/conflicting)

// Get list of books with chapter counts
router.get('/books', (req, res) => {
    try {
        const { version = 'krv' } = req.query;
        const db = getDB();

        // Get max chapters for each book
        const stmt = db.prepare(`
      SELECT book, MAX(chapter) as chapters 
      FROM bible_verses 
      WHERE version = ?
      GROUP BY book
    `);

        const chapterCounts = {};
        stmt.bind([version]);
        while (stmt.step()) {
            const row = stmt.getAsObject();
            chapterCounts[row.book] = row.chapters;
        }
        stmt.free();

        // Map OSIS keys to detailed objects, maintaining order if possible
        // Note: osisMapping object keys might not preserving canonical order. 
        // Ideally we should have an array of book codes in order.
        // For now, we rely on the object keys or we can define canonical order.
        // Let's use the keys from osisMapping as base.

        const books = Object.keys(osisMapping).map(osis => ({
            id: osis,
            name: osisMapping[osis].ko, // Assuming 'ko' property exists
            chapters: chapterCounts[osis] || 0 // Default to 0 if not found
        })).filter(b => b.chapters > 0); // Only return books that exist in DB

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chapter range content (spec-final: GET /api/bible/:book/range?from=1&to=3)
router.get('/:book/range', (req, res) => {
    try {
        const { book } = req.params;
        const { from, to, version = 'krv' } = req.query;

        // Validate parameters
        if (!from || !to) {
            return res.status(400).json({ error: 'Missing required query params: from, to' });
        }

        const fromChapter = parseInt(from);
        const toChapter = parseInt(to);

        if (isNaN(fromChapter) || isNaN(toChapter) || fromChapter > toChapter) {
            return res.status(400).json({ error: 'Invalid chapter range' });
        }

        // Validate book
        if (!osisMapping[book]) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const db = getDB();

        // Get verses for the chapter range
        const stmt = db.prepare(`
            SELECT chapter, verse, text 
            FROM bible_verses 
            WHERE book = ? AND chapter >= ? AND chapter <= ? AND version = ?
            ORDER BY chapter ASC, verse ASC
        `);

        const verses = [];
        stmt.bind([book, fromChapter, toChapter, version]);
        while (stmt.step()) {
            verses.push(stmt.getAsObject());
        }
        stmt.free();

        res.json({
            ok: true,
            data: {
                version,
                book,
                from: fromChapter,
                to: toChapter,
                verses
            }
        });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Get chapter content
router.get('/:book/:chapter', (req, res) => {
    try {
        const { book, chapter } = req.params;
        const { version = 'krv' } = req.query; // Default to 'krv' if not specified

        const db = getDB();

        // Validate book and chapter
        if (!osisMapping[book]) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Get verses
        const stmt = db.prepare(`
      SELECT verse, text 
      FROM bible_verses 
      WHERE book = ? AND chapter = ? AND version = ?
      ORDER BY verse ASC
    `);

        const verses = [];
        stmt.bind([book, chapter, version]);
        while (stmt.step()) {
            verses.push(stmt.getAsObject());
        }
        stmt.free();

        res.json({
            book,
            chapter: parseInt(chapter),
            version,
            verses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search verses
router.get('/search', (req, res) => {
    try {
        const { q, version = 'krv' } = req.query;
        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const db = getDB();
        const stmt = db.prepare(`
      SELECT book, chapter, verse, text, version
      FROM bible_verses
      WHERE text LIKE ? AND version = ?
      LIMIT 100
    `);

        const results = [];
        stmt.bind([`%${q}%`, version]);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
