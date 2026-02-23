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
import { initDB, saveDB } from './db/init.js';

import bibleRoutes from './routes/bible.js';
import highlightRoutes from './routes/highlights.js';
import readingRoutes from './routes/reading.js';
import backupRoutes from './routes/backup.js';
import authRoutes, { authMiddleware } from './routes/auth.js';
import verseNoteRoutes from './routes/verse-notes.js';
import freeNoteRoutes from './routes/free-notes.js';
import prayerRoutes from './routes/prayers.js';
import settingsRoutes from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null;

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // 1. No origin (server-to-server, curl, mobile app) -> Allow
    if (!origin) return callback(null, true);

    // 2. No environment variable set -> Allow all (Backward compatibility / Dev)
    if (!allowedOrigins) return callback(null, true);

    // 3. Check allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // 4. Block
    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  }
}));
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
// Legacy /api/notes removed in v2.1 — use /api/free-notes instead
app.use('/api/reading-logs', readingRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/verse-notes', verseNoteRoutes);
app.use('/api/free-notes', freeNoteRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/settings', settingsRoutes);

// Static files (React build) - Production only
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// API fallback - return JSON for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: 'API route not found' });
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Initialize DB and start server
initDB().then(() => {
  const HOST = process.env.BIND_HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    if (process.env.ACCESS_PASSWORD) {
      console.log('Access password protection enabled');
    }
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Closing server...`);

    // Force exit after 10 seconds to prevent hanging
    const timer = setTimeout(() => {
      console.warn('Graceful shutdown timed out, forcing exit.');
      process.exit(1);
    }, 10000);
    timer.unref(); // Don't keep the event loop alive just for the timeout

    server.close(() => {
      clearTimeout(timer);
      console.log('Server closed successfully.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
