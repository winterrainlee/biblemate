import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import fs from 'fs';

// Try to load .env file if it exists (Node 21.7+)
if (process.loadEnvFile) {
  try {
    process.loadEnvFile();
  } catch (e) {
    // Fallback or ignore if .env doesn't exist
  }
}
import { initDB } from './db/init.js';

import bibleRoutes from './routes/bible.js';
import highlightRoutes from './routes/highlights.js';
import noteRoutes from './routes/notes.js';
import readingRoutes from './routes/reading.js';
import backupRoutes from './routes/backup.js';
import authRoutes, { authMiddleware } from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Auth routes (before auth middleware)
app.use('/api/auth', authRoutes);

// Health check (before auth middleware)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'BibleMate server is running' });
});

// Auth middleware for protected routes
app.use('/api', authMiddleware);

// API Routes
app.use('/api/bible', bibleRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reading-logs', readingRoutes);
app.use('/api/backup', backupRoutes);

// Static files (React build) - Production only
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Initialize DB and start server
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    if (process.env.ACCESS_PASSWORD) {
      console.log('🔒 Access password protection enabled');
    }
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
