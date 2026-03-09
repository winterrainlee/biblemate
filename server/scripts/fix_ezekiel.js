import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const BSKOREA_URL = 'https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=ezk&chap=';

async function fetchChapter(chap) {
    const url = `${BSKOREA_URL}${chap}&sec=1&cVersion=&fontSize=15px&fontWeight=normal`;
    const response = await fetch(url);
    const html = await response.text();

    const regex = /<span class="number">(\d+)&nbsp;&nbsp;&nbsp;<\/span>(.*?)<br \/>/gi;
    const verses = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
        const verseNum = parseInt(match[1], 10);
        let verseText = match[2];
        verseText = verseText.replace(/<[^>]+>/g, '').trim(); // Remove HTML
        verses.push({ verse: verseNum, text: verseText });
    }

    return verses;
}

async function main() {
    const db = await open({
        filename: '../data/bible.db',
        driver: sqlite3.Database
    });

    // Check what book code is used for Ezekiel
    const bookcodes = await db.all("SELECT DISTINCT book, version FROM bible_verses WHERE book LIKE '%ez%'");
    console.log('Found Ezekiel metadata in DB:', bookcodes);

    const targetBookCode = bookcodes.length > 0 ? bookcodes[0].book : 'Ezk';

    console.log(`Starting to update chapter 1-48 for '${targetBookCode}'...`);

    for (let chap = 1; chap <= 48; chap++) {
        console.log(`Fetching chapter ${chap}...`);
        const verses = await fetchChapter(chap);

        if (verses.length === 0) {
            console.warn(`Warning: No verses found for Chapter ${chap}!`);
            continue;
        }

        let updatedCount = 0;

        // Begin transaction for safety
        await db.exec('BEGIN TRANSACTION');
        try {
            for (const v of verses) {
                // Find existing verse to determine which versions to update
                // (If app has multiple versions, we might just update all of them to this correct text,
                // or just 'GAE' / 'krv' depending on what's available).
                // For simplicity, let's just update all Korean versions (like 'krv', 'gae') for this book/chapter/verse.
                // Or safely update without checking version, but only if it's already there
                const res = await db.run(
                    `UPDATE bible_verses SET text = ? WHERE book = ? AND version = 'krv' AND chapter = ? AND verse = ?`,
                    [v.text, targetBookCode, chap, v.verse]
                );
                updatedCount += res.changes;
            }
            await db.exec('COMMIT');
            console.log(`Chapter ${chap} updated: ${verses.length} verses processed, ${updatedCount} rows affected in DB`);
        } catch (err) {
            await db.exec('ROLLBACK');
            console.error(`Error updating Chapter ${chap}:`, err);
        }

        // Be nice to the server (1 second delay)
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('Finished updating all chapters.');
    await db.close();
}

main().catch(console.error);
