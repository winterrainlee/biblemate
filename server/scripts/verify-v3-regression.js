#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import { runMigrations } from '../db/migration.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(scriptDir, '..');
const projectDir = path.resolve(serverDir, '..');
const schemaPath = path.join(serverDir, 'db', 'schema.sql');
const originalDbPath = path.join(serverDir, 'data', 'bible.db');
const requestTimeoutMs = 5_000;
const startupTimeoutMs = 15_000;

let child = null;
let tempDir = null;
let cleanupStarted = false;

function sha256(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function databaseGuard() {
    const gitStatusResult = spawnSync(
        'git',
        ['status', '--porcelain=v1', '--', 'server/data/bible.db'],
        { cwd: projectDir, encoding: 'utf8' }
    );
    assert.equal(gitStatusResult.status, 0, '원본 DB Git 상태 확인에 실패했습니다.');
    return {
        hash: sha256(originalDbPath),
        gitStatus: gitStatusResult.stdout,
        stat: fs.existsSync(originalDbPath)
            ? fs.statSync(originalDbPath, { bigint: true })
            : null
    };
}

function assertDatabaseGuardUnchanged(before, after) {
    assert.equal(after.hash, before.hash, '원본 bible.db 해시가 변경되었습니다.');
    assert.equal(after.gitStatus, before.gitStatus, '원본 bible.db Git 상태가 변경되었습니다.');
    assert.equal(Boolean(after.stat), Boolean(before.stat), '원본 bible.db 존재 상태가 변경되었습니다.');
    if (before.stat && after.stat) {
        assert.equal(after.stat.size, before.stat.size, '원본 bible.db 크기가 변경되었습니다.');
        assert.equal(after.stat.ino, before.stat.ino, '원본 bible.db 파일이 교체되었습니다.');
    }
}

async function reservePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            const port = typeof address === 'object' && address ? address.port : null;
            server.close(error => error ? reject(error) : resolve(port));
        });
    });
}

async function createFixtureDatabase(dbPath) {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run(fs.readFileSync(schemaPath, 'utf8'));

    const insert = db.prepare(`
        INSERT INTO bible_verses (book, chapter, verse, version, text)
        VALUES (?, ?, ?, ?, ?)
    `);
    const fixtures = [
        ['Gen', 1, 1, 'krv', '회귀 검증 본문 하나'],
        ['Gen', 1, 2, 'krv', '회귀 검증 본문 둘'],
        ['Gen', 2, 1, 'krv', '회귀 검증 본문 셋'],
        ['Gen', 1, 1, 'oeb', 'Regression fixture verse one']
    ];
    for (const row of fixtures) insert.run(row);
    insert.free();
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    db.close();
}

async function startServer(dbPath, port) {
    const logs = [];
    child = spawn(process.execPath, ['index.js'], {
        cwd: serverDir,
        env: {
            ...process.env,
            ACCESS_PASSWORD: '',
            BIND_HOST: '127.0.0.1',
            DB_PATH: dbPath,
            NODE_ENV: 'test',
            PORT: String(port)
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    const record = chunk => {
        const lines = String(chunk).split(/\r?\n/).filter(Boolean);
        logs.push(...lines.slice(-20));
        if (logs.length > 40) logs.splice(0, logs.length - 40);
    };
    child.stdout.on('data', record);
    child.stderr.on('data', record);

    const baseUrl = `http://127.0.0.1:${port}`;
    const deadline = Date.now() + startupTimeoutMs;
    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`격리 서버가 조기 종료되었습니다.\n${logs.join('\n')}`);
        }
        try {
            const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(500) });
            if (response.ok) return { baseUrl, logs };
        } catch {
            // 서버가 listen 상태가 될 때까지 짧게 재시도한다.
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`격리 서버 시작 시간 초과입니다.\n${logs.join('\n')}`);
}

async function stopServer() {
    if (!child || child.exitCode !== null) return;
    const runningChild = child;
    await new Promise(resolve => {
        const timer = setTimeout(() => {
            if (runningChild.exitCode === null) runningChild.kill('SIGKILL');
        }, 3_000);
        timer.unref();
        runningChild.once('exit', () => {
            clearTimeout(timer);
            resolve();
        });
        runningChild.kill('SIGTERM');
    });
}

async function cleanup() {
    if (cleanupStarted) return;
    cleanupStarted = true;
    await stopServer();
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
}

async function api(baseUrl, pathname, options = {}) {
    const headers = { ...options.headers };
    let body = options.body;
    if (body !== undefined && typeof body !== 'string') {
        headers['content-type'] = 'application/json';
        body = JSON.stringify(body);
    }
    const response = await fetch(`${baseUrl}${pathname}`, {
        ...options,
        body,
        headers,
        signal: AbortSignal.timeout(requestTimeoutMs)
    });
    const text = await response.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }
    return { response, data };
}

async function expectStatus(baseUrl, pathname, status, options = {}) {
    const result = await api(baseUrl, pathname, options);
    assert.equal(result.response.status, status, `${options.method || 'GET'} ${pathname} 상태 코드`);
    return result.data;
}

async function testBible(baseUrl) {
    const health = await expectStatus(baseUrl, '/api/health', 200);
    assert.equal(health.ok, true);

    const books = await expectStatus(baseUrl, '/api/bible/books?version=krv', 200);
    const genesis = books.find(book => book.id === 'Gen');
    assert.ok(genesis);
    assert.equal(genesis.chapters, 2);

    const chapter = await expectStatus(baseUrl, '/api/bible/Gen/1?version=oeb', 200);
    assert.equal(chapter.version, 'oeb');
    assert.equal(chapter.verses.length, 1);

    const range = await expectStatus(baseUrl, '/api/bible/Gen/range?from=1&to=2&version=krv', 200);
    assert.equal(range.data.verses.length, 3);
}

async function testReadingLogs(baseUrl) {
    const single = { date: '2099-01-01', book: 'Gen', chapter: 1 };
    await expectStatus(baseUrl, '/api/reading-logs', 200, { method: 'POST', body: single });
    await expectStatus(baseUrl, '/api/reading-logs', 200, { method: 'POST', body: single });

    const range = { date: '2099-01-02', book: 'Gen', chapter_from: 1, chapter_to: 2 };
    await expectStatus(baseUrl, '/api/reading-logs', 200, { method: 'POST', body: range });
    let logs = await expectStatus(baseUrl, '/api/reading-logs', 200);
    assert.equal(logs.filter(log => log.date === single.date).length, 1);
    assert.equal(logs.find(log => log.date === range.date).chapter_to, 2);

    const rangeId = logs.find(log => log.date === range.date).id;
    await expectStatus(baseUrl, `/api/reading-logs/${rangeId}`, 200, { method: 'DELETE' });
    logs = await expectStatus(baseUrl, '/api/reading-logs', 200);
    assert.equal(logs.some(log => log.id === rangeId), false);
}

async function testHighlights(baseUrl) {
    const styles = ['yellow', 'green', 'blue', 'pink'];
    for (let index = 0; index < styles.length; index += 1) {
        await expectStatus(baseUrl, '/api/highlights', 200, {
            method: 'POST',
            body: { book: 'Gen', chapter: 1, verse: index + 1, style: styles[index] }
        });
    }
    let highlights = await expectStatus(baseUrl, '/api/highlights', 200);
    assert.deepEqual(new Set(highlights.map(item => item.style)), new Set(styles));

    await expectStatus(baseUrl, '/api/highlights', 200, {
        method: 'POST',
        body: { book: 'Gen', chapter: 1, verse: 1, style: 'blue' }
    });
    highlights = await expectStatus(baseUrl, '/api/highlights', 200);
    assert.equal(highlights.filter(item => item.book === 'Gen' && item.chapter === 1 && item.verse === 1).length, 1);
    assert.equal(highlights.find(item => item.book === 'Gen' && item.chapter === 1 && item.verse === 1).style, 'blue');

    const removable = highlights.find(item => item.verse === 4);
    await expectStatus(baseUrl, `/api/highlights/${removable.id}`, 200, { method: 'DELETE' });
    highlights = await expectStatus(baseUrl, '/api/highlights', 200);
    assert.equal(highlights.some(item => item.id === removable.id), false);
}

async function testVerseNotes(baseUrl) {
    const note = {
        date: '2099-02-01', book: 'Gen', chapter: 2, verse: 1,
        verse_range: '1-2, 4', content: '자동 회귀 검증 묵상'
    };
    const first = await expectStatus(baseUrl, '/api/verse-notes', 200, { method: 'POST', body: note });
    assert.equal(first.readingLog.created, true);
    const second = await expectStatus(baseUrl, '/api/verse-notes', 200, {
        method: 'POST', body: { ...note, content: '자동 회귀 검증 묵상 수정' }
    });
    assert.equal(second.readingLog.created, false);

    const byDate = await expectStatus(baseUrl, `/api/verse-notes?date=${note.date}`, 200);
    assert.equal(byDate.length, 1);
    assert.equal(byDate[0].content, '자동 회귀 검증 묵상 수정');
    assert.equal(byDate[0].verse_range, note.verse_range);
    const noteId = byDate[0].id;

    const byChapter = await expectStatus(baseUrl, '/api/verse-notes/Gen/2', 200);
    assert.equal(byChapter.length, 1);
    const existingVerses = await expectStatus(baseUrl, '/api/verse-notes/chapter/Gen/2', 200);
    assert.deepEqual(existingVerses, [1]);

    let logs = await expectStatus(baseUrl, '/api/reading-logs', 200);
    assert.equal(logs.filter(log => log.date === note.date && log.book === note.book && log.chapter_from === 2).length, 1);
    await expectStatus(baseUrl, `/api/verse-notes/${noteId}`, 200, { method: 'DELETE' });
    assert.equal((await expectStatus(baseUrl, `/api/verse-notes?date=${note.date}`, 200)).length, 0);
    logs = await expectStatus(baseUrl, '/api/reading-logs', 200);
    assert.equal(logs.filter(log => log.date === note.date).length, 1);
}

async function testNotesPrayersAndSettings(baseUrl) {
    await expectStatus(baseUrl, '/api/free-notes', 200, {
        method: 'POST', body: { date: '2099-03-01', content: '자동 회귀 검증 자유 묵상' }
    });
    await expectStatus(baseUrl, '/api/free-notes', 200, {
        method: 'POST', body: { date: '2099-03-01', content: '자동 회귀 검증 자유 묵상 수정' }
    });
    const freeNote = await expectStatus(baseUrl, '/api/free-notes/2099-03-01', 200);
    assert.equal(freeNote.content, '자동 회귀 검증 자유 묵상 수정');

    await expectStatus(baseUrl, '/api/prayers', 200, {
        method: 'POST', body: { date: '2099-03-01', content: '자동 회귀 검증 기도' }
    });
    assert.equal((await expectStatus(baseUrl, '/api/prayers/2099-03-01', 200)).content, '자동 회귀 검증 기도');

    const settingValue = { yellow: '기억', green: '감사', blue: '약속', pink: '기도' };
    await expectStatus(baseUrl, '/api/settings', 200, {
        method: 'POST', body: { key: 'highlightLabels', value: settingValue }
    });
    const settings = await expectStatus(baseUrl, '/api/settings', 200);
    assert.deepEqual(settings.highlightLabels, settingValue);
}

function tableCounts(exportData) {
    return Object.fromEntries(
        ['reading_logs', 'highlights', 'verse_notes', 'free_notes', 'daily_prayers', 'user_settings']
            .map(key => [key, exportData.data[key]?.length || 0])
    );
}

async function testBackup(baseUrl) {
    const before = await expectStatus(baseUrl, '/api/backup/export', 200);
    assert.equal(before.schema_version, 3);
    assert.ok(before.exported_at);
    const countsBeforeInvalid = tableCounts(before);

    const invalid = await expectStatus(baseUrl, '/api/backup/import', 400, {
        method: 'POST',
        body: { schema_version: 3, data: { reading_logs: [{ date: 7 }] } }
    });
    assert.equal(invalid.error_code, 'INVALID_SCHEMA');
    assert.deepEqual(tableCounts(await expectStatus(baseUrl, '/api/backup/export', 200)), countsBeforeInvalid);

    const rollbackPayload = structuredClone(before);
    const duplicate = {
        id: 700,
        date: '2099-04-01',
        book: 'Gen',
        chapter_from: 1,
        chapter_to: 1,
        created_at: '2099-04-01T00:00:00.000Z',
        updated_at: '2099-04-01T00:00:00.000Z'
    };
    rollbackPayload.data.reading_logs = [duplicate, { ...duplicate, date: '2099-04-02' }];
    const rollbackResult = await expectStatus(baseUrl, '/api/backup/import', 500, {
        method: 'POST', body: rollbackPayload
    });
    assert.equal(rollbackResult.error_code, 'IMPORT_FAILED');
    assert.deepEqual(tableCounts(await expectStatus(baseUrl, '/api/backup/export', 200)), countsBeforeInvalid);

    const v3 = structuredClone(before);
    v3.data.free_notes = [{ id: 801, date: '2099-05-01', content: 'v3 백업 회귀 fixture' }];
    await expectStatus(baseUrl, '/api/backup/import', 200, { method: 'POST', body: v3 });
    assert.equal((await expectStatus(baseUrl, '/api/free-notes/2099-05-01', 200)).content, 'v3 백업 회귀 fixture');

    const legacy = {
        version: '1.1',
        data: {
            reading_logs: [], highlights: [],
            notes: [{ id: 901, date: '2099-06-01', content: 'v1.1 호환 fixture' }]
        }
    };
    await expectStatus(baseUrl, '/api/backup/import', 200, { method: 'POST', body: legacy });
    assert.equal((await expectStatus(baseUrl, '/api/free-notes/2099-06-01', 200)).content, 'v1.1 호환 fixture');
}

async function testLegacyMigration() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run(`
        CREATE TABLE notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT
        );
        CREATE TABLE reading_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            book TEXT NOT NULL,
            chapter_from INTEGER NOT NULL,
            chapter_to INTEGER NOT NULL,
            created_at TEXT,
            updated_at TEXT
        );
        CREATE TABLE highlights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            style TEXT NOT NULL
        );
        INSERT INTO notes (date, content) VALUES ('2099-07-01', 'migration fixture');
    `);
    assert.equal(runMigrations(db), true);
    const tables = new Set(db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.flat());
    for (const table of ['verse_notes', 'free_notes', 'daily_prayers', 'user_settings']) assert.ok(tables.has(table));
    const columns = db.exec('PRAGMA table_info(verse_notes)')[0].values.map(row => row[1]);
    assert.ok(columns.includes('verse_range'));
    assert.equal(db.exec('SELECT content FROM free_notes')[0].values[0][0], 'migration fixture');
    assert.equal(db.exec('SELECT content FROM notes')[0].values[0][0], 'migration fixture');
    db.close();
}

async function main() {
    const originalBefore = databaseGuard();
    const suites = [];
    try {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'biblemate-v3-regression-'));
        const fixtureDbPath = path.join(tempDir, 'fixture.db');
        assert.notEqual(path.resolve(fixtureDbPath), path.resolve(originalDbPath));

        await createFixtureDatabase(fixtureDbPath);
        const port = await reservePort();
        const { baseUrl } = await startServer(fixtureDbPath, port);

        suites.push(
            ['health/bible', testBible],
            ['reading logs', testReadingLogs],
            ['highlights', testHighlights],
            ['verse notes', testVerseNotes],
            ['free notes/prayers/settings', testNotesPrayersAndSettings],
            ['backup compatibility/rollback', testBackup],
            ['legacy migration', async () => testLegacyMigration()]
        );
        for (const [name, suite] of suites) {
            await suite(baseUrl);
            console.log(`PASS ${name}`);
        }
    } finally {
        await cleanup();
        assertDatabaseGuardUnchanged(originalBefore, databaseGuard());
    }
    console.log(`PASS original database guard (${path.relative(projectDir, originalDbPath)})`);
    console.log(`PASS ${suites.length + 1} regression checks`);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
        cleanup().finally(() => process.exit(128 + (signal === 'SIGINT' ? 2 : 15)));
    });
}

main().catch(async error => {
    await cleanup();
    console.error(`FAIL ${error.message}`);
    process.exitCode = 1;
});
