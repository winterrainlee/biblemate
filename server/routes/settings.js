import express from 'express';
import { getDB, saveDB } from '../db/init.js';

const router = express.Router();

// Get all settings
router.get('/', (req, res) => {
    try {
        const db = getDB();
        const result = db.exec("SELECT key, value FROM user_settings");

        const settings = {};
        if (result.length > 0 && result[0].values) {
            result[0].values.forEach(([key, value]) => {
                try {
                    settings[key] = JSON.parse(value);
                } catch (e) {
                    settings[key] = value;
                }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Failed to get settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update or create a setting
router.post('/', (req, res) => {
    const { key, value } = req.body;

    if (!key) {
        return res.status(400).json({ error: 'Key is required' });
    }

    try {
        const db = getDB();
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

        db.run(`
            INSERT INTO user_settings (key, value, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_at = excluded.updated_at
        `, [key, valueStr]);

        saveDB();
        res.json({ ok: true });
    } catch (error) {
        console.error('Failed to save setting:', error);
        res.status(500).json({ error: 'Failed to save setting' });
    }
});

export default router;
