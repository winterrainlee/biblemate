import { parseVerseRange } from './reflectionComposerModel.js';

export const getNoteRange = (note) => String(note?.verse_range || note?.verse || '');

export const toDisplayNoteRange = (note) => getNoteRange(note).replaceAll('-', '–');

export const sortChapterNotes = (notes = []) => [...notes].sort((left, right) => {
    const verseDifference = Number(left.verse) - Number(right.verse);
    if (verseDifference !== 0) return verseDifference;

    const dateDifference = String(right.date || '').localeCompare(String(left.date || ''));
    if (dateDifference !== 0) return dateDifference;

    return Number(right.id || 0) - Number(left.id || 0);
});

export const removeChapterNote = (notes, noteId) => (
    notes.filter(note => Number(note.id) !== Number(noteId))
);

export const filterChapterNotesByVerses = (notes = [], selectedVerses = []) => {
    const selectedVerseSet = new Set(selectedVerses.map(Number).filter(Number.isFinite));
    if (selectedVerseSet.size === 0) return [];

    return notes.filter(note => (
        parseVerseRange(note?.verse_range, note?.verse)
            .some(verse => selectedVerseSet.has(Number(verse)))
    ));
};

export const applyChapterNoteDelete = (state, contextKey, noteId) => (
    state.contextKey === contextKey
        ? { ...state, items: removeChapterNote(state.items, noteId), status: 'idle', error: null }
        : state
);

export const applyChapterNotesFailure = (state, contextKey, error) => (
    state.contextKey === contextKey
        ? { ...state, status: 'error', error }
        : state
);

export const shouldApplyNotesResponse = ({
    responseContextKey,
    currentContextKey,
    responseRequestId,
    currentRequestId
}) => (
    responseContextKey === currentContextKey
    && responseRequestId === currentRequestId
);
