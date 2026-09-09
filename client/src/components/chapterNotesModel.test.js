import test from 'node:test';
import assert from 'node:assert/strict';
import {
    applyChapterNoteDelete,
    applyChapterNotesFailure,
    getNoteRange,
    removeChapterNote,
    shouldApplyNotesResponse,
    sortChapterNotes,
    toDisplayNoteRange
} from './chapterNotesModel.js';

test('묵상을 절 오름차순, 같은 절은 최신 날짜순으로 정렬한다', () => {
    const notes = [
        { id: 1, verse: 7, date: '2026-09-01' },
        { id: 2, verse: 3, date: '2026-08-01' },
        { id: 3, verse: 3, date: '2026-09-01' }
    ];
    assert.deepEqual(sortChapterNotes(notes).map(note => note.id), [3, 2, 1]);
    assert.deepEqual(notes.map(note => note.id), [1, 2, 3]);
});

test('다중 범위는 저장값을 유지하고 화면에서 en dash로 표시한다', () => {
    const note = { verse: 3, verse_range: '3-5, 7' };
    assert.equal(getNoteRange(note), '3-5, 7');
    assert.equal(toDisplayNoteRange(note), '3–5, 7');
    assert.equal(toDisplayNoteRange({ verse: 9 }), '9');
});

test('삭제 성공 항목만 immutable하게 제거한다', () => {
    const notes = [{ id: 1 }, { id: 2 }];
    const next = removeChapterNote(notes, 1);
    assert.deepEqual(next, [{ id: 2 }]);
    assert.equal(notes.length, 2);
});

test('삭제 성공은 현재 장에서만 항목을 제거하고 삭제 실패 전 상태는 그대로 유지할 수 있다', () => {
    const state = {
        contextKey: 'Gen:1',
        items: [{ id: 1 }, { id: 2 }],
        status: 'idle',
        error: null
    };
    assert.deepEqual(applyChapterNoteDelete(state, 'Gen:1', 1).items, [{ id: 2 }]);
    assert.equal(applyChapterNoteDelete(state, 'Gen:2', 1), state);
    assert.deepEqual(state.items, [{ id: 1 }, { id: 2 }]);
});

test('재조회 실패는 기존 목록을 보존하고 오류와 재시도 상태만 표시한다', () => {
    const state = {
        contextKey: 'Gen:1',
        items: [{ id: 1 }],
        status: 'refreshing',
        error: null
    };
    const failed = applyChapterNotesFailure(state, 'Gen:1', '다시 시도해 주세요.');
    assert.deepEqual(failed.items, state.items);
    assert.equal(failed.status, 'error');
    assert.equal(failed.error, '다시 시도해 주세요.');
    assert.equal(applyChapterNotesFailure(state, 'Gen:2', 'ignored'), state);
});

test('현재 context와 최신 request가 모두 일치할 때만 응답을 적용한다', () => {
    const current = { currentContextKey: 'Gen:1', currentRequestId: 4 };
    assert.equal(shouldApplyNotesResponse({ ...current, responseContextKey: 'Gen:1', responseRequestId: 4 }), true);
    assert.equal(shouldApplyNotesResponse({ ...current, responseContextKey: 'Gen:2', responseRequestId: 4 }), false);
    assert.equal(shouldApplyNotesResponse({ ...current, responseContextKey: 'Gen:1', responseRequestId: 3 }), false);
});
