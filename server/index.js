import express from 'express';
import cors from 'cors';
import { initDB } from './db/init.js';

import bibleRoutes from './routes/bible.js';
import highlightRoutes from './routes/highlights.js';
import noteRoutes from './routes/notes.js';
import readingRoutes from './routes/reading.js';
import backupRoutes from './routes/backup.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bible', bibleRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reading-logs', readingRoutes);
app.use('/api/backup', backupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'BibleMate server is running' });
});

// Initialize DB and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
