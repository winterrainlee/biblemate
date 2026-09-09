import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildVerseNotePayload,
    createComposerSession,
    createSelectionSnapshot,
    formatVerseRange,
    isCurrentSelectionContext,
    isComposerDirty,
    parseStoredContent,
    parseVerseRange,
    runComposerRefreshes,
    toDisplayVerseRange
} from './reflectionComposerModel.js';

const createSnapshot = (verseNumbers = [3, 4, 5, 7]) => createSelectionSnapshot({
    book: 'gen',
    bookName: '창세기',
    chapter: 1,
    version: 'krv',
    versionLabel: '개역한글',
    verseNumbers,
    verseItems: verseNumbers.map(verse => ({ verse, text: `${verse}절 본문` })),
    verseRange: formatVerseRange(verseNumbers)
});

test('연속·비연속 구절 범위를 저장/표시 형식으로 변환한다', () => {
    assert.equal(formatVerseRange([7, 3, 5, 4, 3]), '3-5, 7');
    assert.equal(toDisplayVerseRange('3-5, 7'), '3–5, 7');
    assert.deepEqual(parseVerseRange('3–5, 7', null), [3, 4, 5, 7]);
});

test('selection snapshot은 원본 배열 변경에 영향받지 않는다', () => {
    const verseNumbers = [3, 4];
    const verseItems = [{ verse: 3, text: '첫 번째' }, { verse: 4, text: '두 번째' }];
    const snapshot = createSelectionSnapshot({
        book: 'gen', bookName: '창세기', chapter: 1, version: 'krv', versionLabel: '개역한글',
        verseNumbers, verseItems, verseRange: '3-4'
    });
    verseNumbers.push(5);
    verseItems[0].text = '변경됨';

    assert.deepEqual(snapshot.verseNumbers, [3, 4]);
    assert.equal(snapshot.verseItems[0].text, '첫 번째');
    assert.equal(snapshot.contextKey, 'gen:1:krv');
});

test('create payload는 snapshot의 복합 범위와 인용 형식을 사용한다', () => {
    const session = createComposerSession({
        selectionSnapshot: createSnapshot(),
        draft: { memo: '묵상 내용', quoteEnabled: true, quoteText: '인용 본문' }
    });

    assert.deepEqual(buildVerseNotePayload(session, '2026-09-09'), {
        date: '2026-09-09',
        book: 'gen',
        chapter: 1,
        verse: 3,
        verse_range: '3-5, 7',
        content: '"\uc778\uc6a9 \ubcf8\ubb38"\n\n\ubb35\uc0c1 \ub0b4\uc6a9'
    });
});

test('edit payload는 원래 날짜와 verse_range를 보존한다', () => {
    const session = createComposerSession({
        mode: 'edit',
        source: 'existing-note',
        noteId: 10,
        originalDate: '2026-08-01',
        originalVerseRange: '3-5, 7',
        selectionSnapshot: createSnapshot(),
        draft: parseStoredContent('"\uc778\uc6a9"\n\n\uae30\uc874 \ubb35\uc0c1')
    });
    session.draft.memo = '수정된 묵상';

    const payload = buildVerseNotePayload(session, '2026-09-09');
    assert.equal(payload.date, '2026-08-01');
    assert.equal(payload.verse_range, '3-5, 7');
    assert.equal(payload.content, '"\uc778\uc6a9"\n\n\uc218\uc815\ub41c \ubb35\uc0c1');
});

test('dirty 판정은 draft 구조 변경만 비교한다', () => {
    const session = createComposerSession({
        selectionSnapshot: createSnapshot([3]),
        draft: { memo: '', quoteEnabled: false, quoteText: '3절 본문' }
    });
    assert.equal(isComposerDirty(session), false);
    session.draft.quoteEnabled = true;
    assert.equal(isComposerDirty(session), true);
    session.draft.quoteEnabled = false;
    assert.equal(isComposerDirty(session), false);
});

test('현재 context와 snapshot context가 다르면 stale 결과로 판정한다', () => {
    const snapshot = createSnapshot([3]);
    assert.equal(isCurrentSelectionContext('gen:1:krv', snapshot), true);
    assert.equal(isCurrentSelectionContext('gen:2:krv', snapshot), false);
});

test('저장 후 refresh 실패는 rejected 결과로 격리하고 다시 throw하지 않는다', async () => {
    const results = await runComposerRefreshes(
        async () => { throw new Error('notes refresh failed'); },
        async () => { throw new Error('reading log refresh failed'); }
    );

    assert.deepEqual(results.map(result => result.status), ['rejected', 'rejected']);
});
