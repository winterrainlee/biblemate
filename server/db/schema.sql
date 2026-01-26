-- BibleMate Database Schema
-- Created: 2026-01-04

-- Bible verses table (성경 본문)
CREATE TABLE IF NOT EXISTS bible_verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book TEXT NOT NULL,           -- OSIS book code (e.g., 'Gen', 'Matt')
    chapter INTEGER NOT NULL,      -- Chapter number
    verse INTEGER NOT NULL,        -- Verse number
    version TEXT NOT NULL,         -- 'krv' (개역한글) or 'oeb' (Open English Bible)
    text TEXT NOT NULL,            -- Verse content
    UNIQUE(book, chapter, verse, version)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bible_verses_lookup 
ON bible_verses(book, chapter, version);

-- Highlights table (하이라이트)
CREATE TABLE IF NOT EXISTS highlights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    style TEXT NOT NULL DEFAULT 'yellow',  -- 'yellow', 'red', 'underline'
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(book, chapter, verse)
);

-- Notes table (묵상 노트)
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,     -- YYYY-MM-DD format
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Reading logs table (읽기 기록) - 다중 기록 지원
CREATE TABLE IF NOT EXISTS reading_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,            -- YYYY-MM-DD format (UNIQUE 제거)
    book TEXT NOT NULL,            -- OSIS book code
    chapter_from INTEGER NOT NULL, -- Starting chapter
    chapter_to INTEGER NOT NULL,   -- Ending chapter
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Create index for reading logs lookup by month
CREATE INDEX IF NOT EXISTS idx_reading_logs_month 
ON reading_logs(date);

-- ==========================================
-- V2.0 New Tables (2026-01-25)
-- ==========================================

-- Verse Notes table (구절별 묵상)
CREATE TABLE IF NOT EXISTS verse_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,            -- YYYY-MM-DD format
    book TEXT NOT NULL,            -- OSIS book code
    chapter INTEGER NOT NULL,      -- Chapter number
    verse INTEGER NOT NULL,        -- Verse number
    verse_range TEXT,              -- Selected verse range (e.g., "5-6, 9")
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(date, book, chapter, verse)
);

-- Indexes for verse notes
CREATE INDEX IF NOT EXISTS idx_verse_notes_lookup 
ON verse_notes(book, chapter);
CREATE INDEX IF NOT EXISTS idx_verse_notes_date 
ON verse_notes(date);

-- Free Notes table (자유 묵상 / 묵상일지) - Replaces 'notes'
CREATE TABLE IF NOT EXISTS free_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,     -- YYYY-MM-DD format
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_free_notes_date 
ON free_notes(date);

-- Daily Prayers table (오늘의 기도)
CREATE TABLE IF NOT EXISTS daily_prayers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,     -- YYYY-MM-DD format
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- User Settings table (사용자 설정)
CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);
