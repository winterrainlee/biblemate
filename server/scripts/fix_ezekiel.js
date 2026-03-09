import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const BSKOREA_URL = 'https://www.bskorea.or.kr/bible/korbibReadpage.php?version=HAN&book=ezk&chap=';
const DEFAULT_DELAY_MS = 700;
const EZEKIEL_TOTAL_CHAPTERS = 48;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'bible.db');

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: false,
        fromChapter: 1,
        toChapter: EZEKIEL_TOTAL_CHAPTERS,
        delayMs: DEFAULT_DELAY_MS
    };

    for (const arg of args) {
        if (arg === '--dry-run') {
            options.dryRun = true;
            continue;
        }
        if (arg.startsWith('--from=')) {
            options.fromChapter = Number.parseInt(arg.split('=')[1], 10);
            continue;
        }
        if (arg.startsWith('--to=')) {
            options.toChapter = Number.parseInt(arg.split('=')[1], 10);
            continue;
        }
        if (arg.startsWith('--delay-ms=')) {
            options.delayMs = Number.parseInt(arg.split('=')[1], 10);
            continue;
        }
    }

    if (!Number.isInteger(options.fromChapter) || !Number.isInteger(options.toChapter)) {
        throw new Error('--from, --to 값은 정수여야 합니다.');
    }
    if (options.fromChapter < 1 || options.toChapter > EZEKIEL_TOTAL_CHAPTERS || options.fromChapter > options.toChapter) {
        throw new Error(`유효한 장 범위는 1~${EZEKIEL_TOTAL_CHAPTERS} 입니다. (입력: ${options.fromChapter}~${options.toChapter})`);
    }
    if (!Number.isInteger(options.delayMs) || options.delayMs < 0) {
        throw new Error('--delay-ms 값은 0 이상의 정수여야 합니다.');
    }

    return options;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeHtmlEntities(text) {
    const named = {
        nbsp: ' ',
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        apos: "'"
    };

    return text
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
        .replace(/&([a-zA-Z]+);/g, (m, name) => (name in named ? named[name] : m));
}

function normalizeVerseText(htmlFragment) {
    const withoutHidden = htmlFragment
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(p|div|li|td)>/gi, ' ');

    const noTags = withoutHidden.replace(/<[^>]+>/g, ' ');
    const decoded = decodeHtmlEntities(noTags).replace(/\u00a0/g, ' ');

    return decoded.replace(/\s+/g, ' ').trim();
}

function trimToVerseBoundary(rawText) {
    const patterns = [
        /([\s\S]*?)<\/font>\s*<\/span>/i,
        /([\s\S]*?)<\/span>\s*<\/td>/i,
        /([\s\S]*?)<\/span>\s*<\//i
    ];

    for (const pattern of patterns) {
        const match = rawText.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return rawText;
}

function extractVersesFromHtml(html) {
    const markerRegex = /<span[^>]*class=["']number["'][^>]*>\s*([0-9]+(?:\s*-\s*[0-9]+)?)(?:\s|&nbsp;)*<\/span>/gi;
    const markers = [];
    let match;

    while ((match = markerRegex.exec(html)) !== null) {
        const raw = match[1].replace(/\s+/g, '');
        const [startRaw, endRaw] = raw.split('-');
        const verseStart = Number.parseInt(startRaw, 10);
        const verseEnd = endRaw ? Number.parseInt(endRaw, 10) : verseStart;

        if (!Number.isInteger(verseStart) || !Number.isInteger(verseEnd) || verseStart < 1 || verseEnd < verseStart) {
            continue;
        }

        markers.push({
            verseStart,
            verseEnd,
            contentStart: markerRegex.lastIndex,
            markerStart: match.index
        });
    }

    if (markers.length === 0) {
        return [];
    }

    const verses = [];
    for (let i = 0; i < markers.length; i++) {
        const current = markers[i];
        const next = markers[i + 1];
        const endIndex = next ? next.markerStart : html.length;
        const rawText = trimToVerseBoundary(html.slice(current.contentStart, endIndex));
        const text = normalizeVerseText(rawText);
        for (let verse = current.verseStart; verse <= current.verseEnd; verse++) {
            verses.push({ verse, text });
        }
    }

    return verses;
}

function validateVerses(chapter, verses) {
    if (verses.length === 0) {
        throw new Error(`${chapter}장: 추출된 절이 없습니다.`);
    }

    for (let i = 0; i < verses.length; i++) {
        const expectedVerse = i + 1;
        if (verses[i].verse !== expectedVerse) {
            throw new Error(`${chapter}장: 절 번호가 연속적이지 않습니다. expected=${expectedVerse}, actual=${verses[i].verse}`);
        }
        if (!verses[i].text) {
            throw new Error(`${chapter}장 ${verses[i].verse}절: 본문이 비어 있습니다.`);
        }
        if (/Ezekiel\s+\d+:\d+/i.test(verses[i].text)) {
            throw new Error(`${chapter}장 ${verses[i].verse}절: 영어 참조 태그 오염 패턴이 감지되었습니다.`);
        }
    }
}

async function fetchHtmlWithRetry(url, retries = 2) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                await sleep(400 * (attempt + 1));
            }
        }
    }
    throw lastError;
}

async function fetchChapter(chapter) {
    const url = `${BSKOREA_URL}${chapter}&sec=1&cVersion=&fontSize=15px&fontWeight=normal`;
    const html = await fetchHtmlWithRetry(url, 2);
    const verses = extractVersesFromHtml(html);
    validateVerses(chapter, verses);
    return verses;
}

async function resolveTargetBookCode(db) {
    const ezek = await db.get(
        `SELECT COUNT(*) AS count
         FROM bible_verses
         WHERE book = 'Ezek' AND version = 'krv'`
    );
    if (ezek && ezek.count > 0) {
        return 'Ezek';
    }

    const fallback = await db.all(
        `SELECT book, COUNT(*) AS count
         FROM bible_verses
         WHERE version = 'krv' AND LOWER(book) LIKE '%ez%'
         GROUP BY book
         ORDER BY count DESC`
    );

    if (fallback.length === 1) {
        console.warn(`[WARN] 'Ezek' 코드가 없어 '${fallback[0].book}'으로 대체합니다.`);
        return fallback[0].book;
    }

    throw new Error(
        `에스겔 대상 book 코드를 확정할 수 없습니다. candidates=${JSON.stringify(fallback)}`
    );
}

async function updateChapter(db, targetBookCode, chapter, verses, dryRun) {
    const current = await db.get(
        `SELECT COUNT(*) AS count
         FROM bible_verses
         WHERE book = ? AND version = 'krv' AND chapter = ?`,
        [targetBookCode, chapter]
    );

    if (!current || current.count === 0) {
        throw new Error(`${chapter}장: DB 기존 구절이 없어 업데이트를 중단합니다.`);
    }

    await db.exec('BEGIN TRANSACTION');
    try {
        let updatedCount = 0;
        for (const verse of verses) {
            const result = await db.run(
                `UPDATE bible_verses
                 SET text = ?
                 WHERE book = ? AND version = 'krv' AND chapter = ? AND verse = ?`,
                [verse.text, targetBookCode, chapter, verse.verse]
            );
            updatedCount += result.changes;
        }

        if (updatedCount !== verses.length) {
            throw new Error(`${chapter}장: 업데이트 건수 불일치 (expected=${verses.length}, updated=${updatedCount})`);
        }

        const lastVerse = verses[verses.length - 1].verse;
        const deleteResult = await db.run(
            `DELETE FROM bible_verses
             WHERE book = ? AND version = 'krv' AND chapter = ? AND verse > ?`,
            [targetBookCode, chapter, lastVerse]
        );

        if (dryRun) {
            await db.exec('ROLLBACK');
            return { updatedCount, deletedCount: deleteResult.changes, dryRun: true };
        }

        await db.exec('COMMIT');
        return { updatedCount, deletedCount: deleteResult.changes, dryRun: false };
    } catch (error) {
        await db.exec('ROLLBACK');
        throw error;
    }
}

async function main() {
    const options = parseArgs();
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    try {
        const targetBookCode = await resolveTargetBookCode(db);
        console.log(`Target DB: ${DB_PATH}`);
        console.log(`Mode: ${options.dryRun ? 'DRY RUN (rollback)' : 'APPLY'}`);
        console.log(`Book Code: ${targetBookCode}`);
        console.log(`Chapter Range: ${options.fromChapter}-${options.toChapter}`);

        for (let chapter = options.fromChapter; chapter <= options.toChapter; chapter++) {
            console.log(`\n[${chapter}] Fetching HAN source...`);
            const verses = await fetchChapter(chapter);
            const result = await updateChapter(db, targetBookCode, chapter, verses, options.dryRun);
            console.log(
                `[${chapter}] verses=${verses.length}, updated=${result.updatedCount}, deletedExtra=${result.deletedCount}, mode=${result.dryRun ? 'DRY' : 'APPLY'}`
            );

            if (chapter < options.toChapter && options.delayMs > 0) {
                await sleep(options.delayMs);
            }
        }

        console.log('\nFinished Ezekiel update successfully.');
    } finally {
        await db.close();
    }
}

main().catch(error => {
    console.error('Failed to update Ezekiel:', error.message);
    process.exit(1);
});
