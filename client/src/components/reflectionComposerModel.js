const EMPTY_DRAFT = Object.freeze({
    memo: '',
    quoteEnabled: false,
    quoteText: ''
});

export const formatVerseRange = (verseNumbers) => {
    const sorted = [...new Set(verseNumbers.map(Number).filter(Number.isFinite))]
        .sort((a, b) => a - b);
    if (sorted.length === 0) return '';

    const parts = [];
    let start = sorted[0];
    let previous = start;

    for (let index = 1; index < sorted.length; index += 1) {
        const current = sorted[index];
        if (current === previous + 1) {
            previous = current;
            continue;
        }
        parts.push(start === previous ? `${start}` : `${start}-${previous}`);
        start = current;
        previous = current;
    }

    parts.push(start === previous ? `${start}` : `${start}-${previous}`);
    return parts.join(', ');
};

export const parseVerseRange = (verseRange, fallbackVerse) => {
    if (!verseRange) return Number.isFinite(Number(fallbackVerse)) ? [Number(fallbackVerse)] : [];

    const result = [];
    for (const part of String(verseRange).split(',')) {
        const normalized = part.trim().replaceAll('–', '-');
        const [rawStart, rawEnd] = normalized.split('-').map(value => Number(value.trim()));
        if (!Number.isFinite(rawStart)) continue;
        const end = Number.isFinite(rawEnd) ? rawEnd : rawStart;
        for (let verse = Math.min(rawStart, end); verse <= Math.max(rawStart, end); verse += 1) {
            result.push(verse);
        }
    }

    return [...new Set(result)].sort((a, b) => a - b);
};

export const createSelectionSnapshot = ({
    book,
    bookName,
    chapter,
    version,
    versionLabel,
    verseNumbers,
    verseItems,
    verseRange
}) => {
    const numbers = [...verseNumbers].map(Number).sort((a, b) => a - b);
    const items = verseItems.map(item => ({
        verse: Number(item.verse),
        text: String(item.text || '')
    }));

    return Object.freeze({
        contextKey: `${book}:${chapter}:${version}`,
        book,
        bookName,
        chapter: Number(chapter),
        version,
        versionLabel,
        verseNumbers: Object.freeze(numbers),
        verseRange: verseRange || formatVerseRange(numbers),
        verseItems: Object.freeze(items.map(Object.freeze)),
        primaryVerse: numbers[0]
    });
};

export const parseStoredContent = (content, fallbackQuoteText = '') => {
    const quoteMatch = String(content || '').match(/^"([\s\S]+?)"\n\n([\s\S]+)$/);
    if (!quoteMatch) {
        return { memo: String(content || ''), quoteEnabled: false, quoteText: fallbackQuoteText };
    }

    return { memo: quoteMatch[2], quoteEnabled: true, quoteText: quoteMatch[1] };
};

export const createComposerSession = ({
    mode = 'create',
    source = 'selection',
    noteId = null,
    originalDate = null,
    originalVerseRange = null,
    selectionSnapshot,
    draft = EMPTY_DRAFT
}) => {
    const initialDraft = {
        memo: String(draft.memo || ''),
        quoteEnabled: Boolean(draft.quoteEnabled),
        quoteText: String(draft.quoteText || '')
    };

    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        mode,
        source,
        noteId,
        originalDate,
        originalVerseRange,
        selectionSnapshot,
        initialDraft,
        draft: { ...initialDraft },
        status: 'idle',
        error: null
    };
};

export const isComposerDirty = (session) => Boolean(session) && (
    session.draft.memo !== session.initialDraft.memo
    || session.draft.quoteEnabled !== session.initialDraft.quoteEnabled
    || session.draft.quoteText !== session.initialDraft.quoteText
);

export const isCurrentSelectionContext = (currentContextKey, selectionSnapshot) => (
    currentContextKey === selectionSnapshot.contextKey
);

export const runComposerRefreshes = (loadNotes, refreshReadingLog) => Promise.allSettled([
    loadNotes(),
    refreshReadingLog()
]);

export const buildVerseNotePayload = (session, today) => {
    const { selectionSnapshot, draft } = session;
    const content = draft.quoteEnabled
        ? `"${draft.quoteText}"\n\n${draft.memo}`
        : draft.memo;
    const range = session.mode === 'edit'
        ? session.originalVerseRange
        : (selectionSnapshot.verseNumbers.length > 1
            ? formatVerseRange(selectionSnapshot.verseNumbers)
            : null);

    return {
        date: session.originalDate || today,
        book: selectionSnapshot.book,
        chapter: selectionSnapshot.chapter,
        verse: selectionSnapshot.primaryVerse,
        verse_range: range || null,
        content
    };
};

export const toDisplayVerseRange = (verseRange) => String(verseRange || '').replaceAll('-', '–');
