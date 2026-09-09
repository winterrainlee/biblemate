
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Check, MessageSquare, Copy, X, Loader, ChevronLeft, ChevronRight, Eraser } from 'lucide-react';
import { getVerseNotesByChapter, saveVerseNote, deleteVerseNote } from '../services/journalApi';
import { format } from 'date-fns';
import { useTab } from '../contexts/TabContext';
import ReflectionComposer from './ReflectionComposer';
import ChapterNotesPanel from './ChapterNotesPanel';
import {
    applyChapterNoteDelete,
    applyChapterNotesFailure,
    removeChapterNote,
    shouldApplyNotesResponse,
    sortChapterNotes,
    toDisplayNoteRange
} from './chapterNotesModel';
import {
    buildVerseNotePayload,
    createComposerSession,
    createSelectionSnapshot,
    formatVerseRange,
    isCurrentSelectionContext,
    isComposerDirty,
    parseStoredContent,
    parseVerseRange,
    runComposerRefreshes
} from './reflectionComposerModel';
import './BibleViewer.css';

const BibleViewer = ({
    verses = [],
    highlights = [],
    onApplyHighlights,
    onRemoveHighlights,
    onComplete,
    isCompleted,
    isToday,
    lastReadDate,
    isReadOnCurrentDate,
    book = '',
    bookName = '',
    chapter = 1,
    onCopyCitation,
    onToast,
    onNavigateToJournal, // [NEW] Link to Journal tab
    onVerseNoteSaved,
    completionStatus = 'idle', // idle, loading, success, error
    highlightLabels, // [NEW] Shared labels from dashboard

    // Navigation Props
    books = [],
    currentBook,
    currentChapter,
    currentVersion,
    onBookChange,
    onChapterChange,
    onVersionChange
}) => {

    const { registerNavigationGuard } = useTab();


    // Derived state for navigation
    const selectedBookObj = books.find(b => b.id === currentBook);
    const totalChapters = selectedBookObj ? selectedBookObj.chapters : 0;
    const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
    const versionLabels = {
        krv: '개역한글',
        web: 'WEB',
        bbe: 'BBE'
    };
    const currentVersionLabel = versionLabels[currentVersion] || currentVersion;

    // Navigation Handlers
    const handlePrevChapter = () => {
        if (currentChapter > 1) {
            runWithComposerGuard(() => onChapterChange(currentChapter - 1));
        } else {
            // Find previous book
            const currIdx = books.findIndex(b => b.id === currentBook);
            if (currIdx > 0) {
                const prevBook = books[currIdx - 1];
                // Navigate to the LAST chapter of the previous book
                runWithComposerGuard(() => onBookChange(prevBook.id, prevBook.chapters));
            }
        }
    };

    const handleNextChapter = () => {
        if (currentChapter < totalChapters) {
            runWithComposerGuard(() => onChapterChange(currentChapter + 1));
        } else {
            // Next book
            const currIdx = books.findIndex(b => b.id === currentBook);
            if (currIdx < books.length - 1) {
                const nextBook = books[currIdx + 1];
                runWithComposerGuard(() => onBookChange(nextBook.id));
            }
        }
    };
    const notesBook = book || currentBook;
    const notesChapter = chapter || currentChapter;
    const chapterNotesContextKey = `${notesBook}:${notesChapter}`;
    const [chapterNotesState, setChapterNotesState] = useState({
        contextKey: chapterNotesContextKey,
        items: [],
        status: 'idle',
        error: null
    });
    const chapterNotes = chapterNotesState.contextKey === chapterNotesContextKey
        ? chapterNotesState.items
        : [];
    const selectionContextKey = `${currentBook}:${currentChapter}:${currentVersion}`;
    const selectionContextRef = useRef(selectionContextKey);
    const selectedVersesContextRef = useRef(selectionContextKey);
    const [selectedVerses, setSelectedVerses] = useState([]);
    const activeSelectedVerses = selectedVersesContextRef.current === selectionContextKey
        ? selectedVerses
        : [];
    const isSelectionMode = activeSelectedVerses.length > 0;
    const [copiedNoteId, setCopiedNoteId] = useState(null);
    const [toolbarAction, setToolbarAction] = useState(null);
    const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false);
    const [notesSurface, setNotesSurface] = useState({
        open: false,
        selectedNoteId: null,
        returnVerse: null,
        pendingDeleteId: null
    });
    const [isReadingSettingsOpen, setIsReadingSettingsOpen] = useState(false);
    const [bibleTextScale, setBibleTextScale] = useState(() => {
        const saved = localStorage.getItem('bibleTextScale');
        return saved ? Number(saved) : 100;
    });
    const [composerSession, setComposerSession] = useState(null);
    const mainContentRef = useRef(null);
    const chapterNotesTriggerRef = useRef(null);
    const chapterNotesContextRef = useRef(chapterNotesContextKey);
    const chapterNotesRequestRef = useRef(0);
    const composerSessionRef = useRef(null);
    const closeComposerSessionRef = useRef(null);
    const composerRequestRef = useRef(0);
    const composerSaveRef = useRef(null);
    const copyTimeoutRef = useRef(null);
    const toolbarActionRef = useRef(null);
    const lastSelectedVerseRef = useRef(null);
    const verseGestureRef = useRef({ moved: false, target: null, suppressTarget: null, suppressUntil: 0 });
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);

    const refreshChapterNotes = useCallback(async ({ mode = 'loading' } = {}) => {
        const contextKey = chapterNotesContextKey;
        const requestId = ++chapterNotesRequestRef.current;
        setChapterNotesState(previous => ({
            contextKey,
            items: previous.contextKey === contextKey ? previous.items : [],
            status: mode,
            error: null
        }));

        try {
            if (!notesBook || !notesChapter) {
                throw new Error('Chapter notes context is incomplete.');
            }
            const notes = sortChapterNotes(await getVerseNotesByChapter(notesBook, notesChapter));
            if (shouldApplyNotesResponse({
                responseContextKey: contextKey,
                currentContextKey: chapterNotesContextRef.current,
                responseRequestId: requestId,
                currentRequestId: chapterNotesRequestRef.current
            })) {
                setChapterNotesState({ contextKey, items: notes, status: 'idle', error: null });
            }
            return notes;
        } catch (error) {
            if (shouldApplyNotesResponse({
                responseContextKey: contextKey,
                currentContextKey: chapterNotesContextRef.current,
                responseRequestId: requestId,
                currentRequestId: chapterNotesRequestRef.current
            })) {
                setChapterNotesState(previous => applyChapterNotesFailure(
                    previous,
                    contextKey,
                    '이 장의 묵상을 불러오지 못했습니다.'
                ));
            }
            throw error;
        }
    }, [chapterNotesContextKey, notesBook, notesChapter]);

    const commitComposerSession = (update) => {
        const previous = composerSessionRef.current;
        const next = typeof update === 'function' ? update(previous) : update;
        composerSessionRef.current = next;
        setComposerSession(next);
    };

    const restoreReadingScroll = (scrollTop) => {
        window.requestAnimationFrame(() => {
            if (mainContentRef.current) mainContentRef.current.scrollTop = scrollTop;
        });
    };

    const closeComposerSession = ({ force = false, restoreFocus = true } = {}) => {
        const session = composerSessionRef.current;
        if (!session) return true;
        if (session.status === 'saving' && !force) {
            onToast?.('묵상을 저장하고 있습니다.', 'error');
            return false;
        }
        if (!force && isComposerDirty(session)
            && !window.confirm('저장하지 않은 변경사항이 있습니다. 묵상 작성을 닫으시겠습니까?')) {
            return false;
        }

        const scrollTop = mainContentRef.current?.scrollTop || 0;
        composerRequestRef.current += 1;
        composerSaveRef.current = null;
        commitComposerSession(null);
        restoreReadingScroll(scrollTop);
        if (restoreFocus) {
            window.requestAnimationFrame(() => lastSelectedVerseRef.current?.focus());
        }
        return true;
    };
    closeComposerSessionRef.current = closeComposerSession;

    useEffect(() => registerNavigationGuard(
        () => closeComposerSessionRef.current?.({ restoreFocus: false }) ?? true
    ), [registerNavigationGuard]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            const session = composerSessionRef.current;
            if (!session || !isComposerDirty(session)) return;
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const runWithComposerGuard = (action) => {
        if (!composerSessionRef.current || closeComposerSession({ restoreFocus: false })) {
            action();
        }
    };

    const closeVerseSelection = (restoreFocus = true) => {
        toolbarActionRef.current = null;
        setToolbarAction(null);
        setSelectedVerses([]);
        if (restoreFocus) {
            window.requestAnimationFrame(() => lastSelectedVerseRef.current?.focus());
        }
    };

    // [NEW] Swipe handlers for mobile chapter navigation
    const minSwipeDistance = 50;
    const isInteractiveTouchTarget = (target) => {
        return Boolean(target?.closest?.(
            'button, input, textarea, select, a, [contenteditable="true"], .chapter-notes-panel, .reflection-composer, .mobile-sheet, .mobile-reading-action-bar'
        ));
    };

    const onTouchStart = (e) => {
        const isVerseTarget = Boolean(e.target?.closest?.('.verse-select-target'));
        if (notesSurface.open || composerSession || (isInteractiveTouchTarget(e.target) && !isVerseTarget)) {
            touchStartRef.current = null;
            touchEndRef.current = null;
            verseGestureRef.current = { moved: false, target: null, suppressTarget: null, suppressUntil: 0 };
            return;
        }
        verseGestureRef.current = {
            moved: false,
            target: e.target?.closest?.('.verse-select-target') || null,
            suppressTarget: null,
            suppressUntil: 0
        };
        touchEndRef.current = null;
        touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };
    const onTouchMove = (e) => {
        if (!touchStartRef.current) return;
        const nextTouch = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        const distance = Math.hypot(
            nextTouch.x - touchStartRef.current.x,
            nextTouch.y - touchStartRef.current.y
        );
        if (distance >= 10) {
            verseGestureRef.current.moved = true;
        }
        touchEndRef.current = nextTouch;
    };
    const onTouchEnd = () => {
        const start = touchStartRef.current;
        const end = touchEndRef.current;
        touchStartRef.current = null;
        touchEndRef.current = null;
        if (verseGestureRef.current.moved) {
            verseGestureRef.current.suppressTarget = verseGestureRef.current.target;
            verseGestureRef.current.suppressUntil = Date.now() + 700;
        }

        if (!start || !end || isSelectionMode || notesSurface.open || composerSession) return;
        const distX = start.x - end.x;
        const distY = Math.abs(start.y - end.y);
        // Ignore if vertical movement is greater (scrolling, not swiping)
        if (Math.abs(distX) < minSwipeDistance || distY > Math.abs(distX)) return;

        if (distX > 0) {
            handleNextChapter();
        } else {
            handlePrevChapter();
        }
    };
    const onTouchCancel = () => {
        touchStartRef.current = null;
        touchEndRef.current = null;
        verseGestureRef.current = { moved: false, target: null, suppressTarget: null, suppressUntil: 0 };
    };

    // Close transient reading surfaces on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (composerSessionRef.current) {
                    closeComposerSessionRef.current?.();
                } else if (notesSurface.open || isMobileSelectorOpen || isReadingSettingsOpen) {
                    setNotesSurface(previous => ({ ...previous, open: false, selectedNoteId: null }));
                    setIsMobileSelectorOpen(false);
                    setIsReadingSettingsOpen(false);
                } else if (isSelectionMode && !toolbarAction) {
                    closeVerseSelection();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobileSelectorOpen, isReadingSettingsOpen, isSelectionMode, notesSurface.open, toolbarAction]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            chapterNotesRequestRef.current += 1;
            composerRequestRef.current += 1;
            composerSaveRef.current = null;
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('bibleTextScale', String(bibleTextScale));
    }, [bibleTextScale]);

    useEffect(() => {
        selectedVersesContextRef.current = selectionContextKey;
        toolbarActionRef.current = null;
        setToolbarAction(null);
        setSelectedVerses([]);
        touchStartRef.current = null;
        touchEndRef.current = null;
        lastSelectedVerseRef.current = null;
        verseGestureRef.current = { moved: false, target: null, suppressTarget: null, suppressUntil: 0 };
    }, [selectionContextKey]);

    useLayoutEffect(() => {
        selectionContextRef.current = selectionContextKey;
    }, [selectionContextKey]);

    useLayoutEffect(() => {
        chapterNotesContextRef.current = chapterNotesContextKey;
    }, [chapterNotesContextKey]);

    useEffect(() => {
        setNotesSurface(previous => ({
            ...previous,
            selectedNoteId: null,
            returnVerse: null,
            pendingDeleteId: null
        }));
        refreshChapterNotes().catch(error => {
            console.error('Failed to load chapter notes:', error);
        });
    }, [refreshChapterNotes]);

    // Check if a verse has a highlight
    const getHighlightStyle = (verseNum) => {
        const hl = highlights.find(h => h.verse === verseNum);
        if (!hl) return null;

        const style = hl.style;
        // Legacy hex to CSS variable mapping for theme responsiveness
        const mapping = {
            '#fef08a': 'var(--pk-highlight-yellow)',
            '#bbf7d0': 'var(--pk-highlight-green)',
            '#bfdbfe': 'var(--pk-highlight-blue)',
            '#fecaca': 'var(--pk-highlight-red)'
        };

        return mapping[style] || style;
    };

    const handleVerseClick = (e, verse) => {
        e.stopPropagation();
        const isSuppressedTouchClick = e.detail !== 0
            && verseGestureRef.current.suppressTarget === e.currentTarget
            && Date.now() <= verseGestureRef.current.suppressUntil;
        if (isSuppressedTouchClick) {
            verseGestureRef.current = { moved: false, target: null, suppressTarget: null, suppressUntil: 0 };
            return;
        }
        const isSameSelectionContext = selectedVersesContextRef.current === selectionContextKey;
        selectedVersesContextRef.current = selectionContextKey;
        lastSelectedVerseRef.current = e.currentTarget;
        setSelectedVerses(prev => toggleSelectedVerse(
            isSameSelectionContext ? prev : [],
            verse.verse
        ));
    };

    const copyTextToClipboard = async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    };

    const handleCopyNote = async (note) => {
        try {
            await copyTextToClipboard(note.content);
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            setCopiedNoteId(note.id);
            copyTimeoutRef.current = setTimeout(() => {
                setCopiedNoteId(null);
                copyTimeoutRef.current = null;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy verse note:', error);
            alert('복사에 실패했습니다.');
        }
    };

    const handleComposerDraftChange = (change) => {
        commitComposerSession(previous => previous ? {
            ...previous,
            draft: { ...previous.draft, ...change },
            status: previous.status === 'error' ? 'idle' : previous.status,
            error: null
        } : previous);
    };

    const handleComposerSubmit = async () => {
        const session = composerSessionRef.current;
        if (!session || !session.draft.memo.trim() || composerSaveRef.current) return;

        const requestToken = ++composerRequestRef.current;
        const sessionId = session.id;
        composerSaveRef.current = requestToken;
        commitComposerSession(previous => previous?.id === sessionId
            ? { ...previous, status: 'saving', error: null }
            : previous);

        const noteData = buildVerseNotePayload(session, format(new Date(), 'yyyy-MM-dd'));
        try {
            await saveVerseNote(noteData);
        } catch (error) {
            console.error('Failed to save note:', error);
            if (composerSaveRef.current === requestToken && composerSessionRef.current?.id === sessionId) {
                composerSaveRef.current = null;
                commitComposerSession(previous => previous?.id === sessionId
                    ? { ...previous, status: 'error', error: '묵상을 저장하지 못했습니다. 내용을 유지했으니 다시 시도해 주세요.' }
                    : previous);
            }
            return;
        }

        if (composerSaveRef.current !== requestToken || composerSessionRef.current?.id !== sessionId) return;

        closeComposerSession({ force: true });
        if (isCurrentSelectionContext(selectionContextRef.current, session.selectionSnapshot)) {
            closeVerseSelection();
        }
        onToast?.(session.mode === 'edit' ? '묵상을 수정했습니다.' : '묵상을 저장했습니다.', 'success');

        const [notesResult, readingLogResult] = await runComposerRefreshes(
            () => refreshChapterNotes({ mode: 'refreshing' }),
            async () => onVerseNoteSaved?.()
        );
        if (notesResult.status === 'rejected') {
            console.error('Failed to refresh verse notes after save:', notesResult.reason);
        }
        if (readingLogResult.status === 'rejected') {
            console.error('Failed to refresh reading logs after verse note save:', readingLogResult.reason);
        }
    };

    const handleDeleteNote = async (note) => {
        if (!window.confirm(`${bookName} ${notesChapter}:${toDisplayNoteRange(note)} 묵상을 삭제하시겠습니까?`)) return;
        const operationContextKey = chapterNotesContextKey;
        const deletedIndex = chapterNotes.findIndex(item => Number(item.id) === Number(note.id));
        const remainingNotes = removeChapterNote(chapterNotes, note.id);
        const nextFocusedNote = remainingNotes[Math.min(Math.max(deletedIndex, 0), remainingNotes.length - 1)];
        setNotesSurface(previous => ({ ...previous, pendingDeleteId: note.id }));
        try {
            await deleteVerseNote(note.id);
        } catch (error) {
            console.error('Failed to delete note:', error);
            if (chapterNotesContextRef.current === operationContextKey) {
                setNotesSurface(previous => ({ ...previous, pendingDeleteId: null }));
                onToast?.('묵상을 삭제하지 못했습니다.', 'error');
            }
            return;
        }

        setChapterNotesState(previous => applyChapterNoteDelete(previous, operationContextKey, note.id));
        if (chapterNotesContextRef.current !== operationContextKey) return;
        setNotesSurface(previous => ({
            ...previous,
            selectedNoteId: nextFocusedNote?.id ?? null,
            pendingDeleteId: null
        }));
        onToast?.('묵상을 삭제했습니다.', 'success');

        try {
            await refreshChapterNotes({ mode: 'refreshing' });
        } catch (refreshError) {
            console.error('Failed to refresh verse notes after delete:', refreshError);
        }
    };

    const handleEditNote = (note) => {
        const verseNumbers = parseVerseRange(note.verse_range, note.verse);
        const verseItems = verseNumbers.map(verseNumber => {
            const verse = verses.find(item => Number(item.verse) === verseNumber);
            return { verse: verseNumber, text: verse?.text || verse?.content || '' };
        });
        const fallbackQuote = verseItems.length === 1
            ? verseItems[0].text
            : verseItems.map(item => `${item.verse} ${item.text}`).join('\n');
        const snapshot = createSelectionSnapshot({
            book: note.book || book || currentBook,
            bookName,
            chapter: note.chapter || chapter || currentChapter,
            version: currentVersion,
            versionLabel: currentVersionLabel,
            verseNumbers,
            verseItems,
            verseRange: note.verse_range || formatVerseRange(verseNumbers)
        });

        setSelectedVerses([]);
        commitComposerSession(createComposerSession({
            mode: 'edit',
            source: 'existing-note',
            noteId: note.id,
            originalDate: note.date,
            originalVerseRange: note.verse_range || null,
            selectionSnapshot: snapshot,
            draft: parseStoredContent(note.content, fallbackQuote)
        }));
    };

    const openVerseNotes = (verse, event = null) => {
        event?.stopPropagation();
        const selectedNote = chapterNotes.find(note => Number(note.verse) === Number(verse.verse));
        setSelectedVerses([]);
        setNotesSurface(previous => ({
            ...previous,
            open: true,
            selectedNoteId: selectedNote?.id ?? null,
            returnVerse: Number(verse.verse)
        }));
    };

    const openChapterNotes = () => {
        if (toolbarActionRef.current) {
            onToast?.('선택한 말씀 작업을 처리하고 있습니다.', 'error');
            return;
        }
        closeVerseSelection(false);
        setNotesSurface(previous => ({ ...previous, open: true, selectedNoteId: null, returnVerse: null }));
    };

    const closeChapterNotes = ({ restoreFocus = true } = {}) => {
        const returnVerse = notesSurface.returnVerse;
        setNotesSurface(previous => ({ ...previous, open: false, selectedNoteId: null, returnVerse: null }));
        if (!restoreFocus) return;
        window.requestAnimationFrame(() => {
            if (returnVerse != null) {
                document.querySelector(`#verse-${returnVerse} .verse-select-target`)?.focus();
            } else {
                chapterNotesTriggerRef.current?.focus();
            }
        });
    };

    const scrollToVerse = (note) => {
        const verseNum = Number(note.verse);
        const isWorkspace = window.matchMedia('(min-width: 900px)').matches;
        setNotesSurface(previous => ({
            ...previous,
            open: isWorkspace,
            selectedNoteId: note.id,
            returnVerse: verseNum
        }));
        window.requestAnimationFrame(() => {
            const verseElement = document.getElementById(`verse-${verseNum}`);
            verseElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            verseElement?.querySelector('.verse-select-target')?.focus({ preventScroll: true });
        });
    };
    const selectedVerseStorageRange = formatVerseRange(activeSelectedVerses);
    const selectedVerseRange = selectedVerseStorageRange.replaceAll('-', '–');
    const selectedVerseItems = activeSelectedVerses
        .map(verseNumber => {
            const verse = verses.find(item => Number(item.verse) === verseNumber);
            if (!verse) return null;
            return {
                verse: verseNumber,
                text: verse.text || verse.content || ''
            };
        })
        .filter(Boolean);
    const hasCompleteSelectionPayload = selectedVerseItems.length === activeSelectedVerses.length;
    const selectionPayload = {
        book: currentBook,
        bookName,
        chapter: currentChapter,
        version: currentVersion,
        versionLabel: currentVersionLabel,
        verseNumbers: activeSelectedVerses,
        verseItems: selectedVerseItems,
        verseRange: selectedVerseStorageRange
    };
    const selectedHighlightedVerses = activeSelectedVerses.filter(verseNumber =>
        highlights.some(highlight => Number(highlight.verse) === verseNumber)
    );

    const runToolbarAction = async (action, operation, successMessage) => {
        if (toolbarActionRef.current || !hasCompleteSelectionPayload) {
            if (!hasCompleteSelectionPayload) {
                onToast?.('선택한 말씀을 확인할 수 없습니다.', 'error');
            }
            return;
        }

        const actionContextKey = selectionContextKey;
        toolbarActionRef.current = action;
        setToolbarAction(action);

        try {
            await operation(selectionPayload);
            if (selectionContextRef.current !== actionContextKey) return;
            onToast?.(successMessage, 'success');
            closeVerseSelection();
        } catch (error) {
            console.error(`Failed to run toolbar action: ${action}`, error);
            if (selectionContextRef.current === actionContextKey) {
                onToast?.(
                    action === 'copy' ? '말씀 복사에 실패했습니다.' : '하이라이트 변경에 실패했습니다.',
                    'error'
                );
            }
        } finally {
            if (selectionContextRef.current === actionContextKey) {
                toolbarActionRef.current = null;
                setToolbarAction(null);
            }
        }
    };

    const handleApplySelectionHighlight = (color) => {
        runToolbarAction(
            'highlight',
            payload => onApplyHighlights(payload, color),
            '하이라이트를 적용했습니다.'
        );
    };

    const handleRemoveSelectionHighlights = () => {
        if (selectedHighlightedVerses.length === 0) return;
        runToolbarAction(
            'remove-highlight',
            payload => onRemoveHighlights({
                ...payload,
                verseNumbers: selectedHighlightedVerses
            }),
            '하이라이트를 지웠습니다.'
        );
    };

    const handleCopySelection = () => {
        runToolbarAction('copy', onCopyCitation, '말씀을 복사했습니다.');
    };

    const openSelectionComposer = () => {
        if (!hasCompleteSelectionPayload || selectedVerseItems.length === 0) {
            onToast?.('선택한 말씀을 확인할 수 없습니다.', 'error');
            return;
        }

        const primaryVerse = selectedVerseItems[0];
        const quoteText = selectedVerseItems.length === 1
            ? primaryVerse.text
            : selectedVerseItems.map(item => `${item.verse} ${item.text}`).join('\n');
        const snapshot = createSelectionSnapshot(selectionPayload);
        const scrollTop = mainContentRef.current?.scrollTop || 0;
        commitComposerSession(createComposerSession({
            selectionSnapshot: snapshot,
            draft: { memo: '', quoteEnabled: false, quoteText }
        }));
        restoreReadingScroll(scrollTop);
    };

    return (
        <div
            className="bible-viewer-container"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
        >
            <main ref={mainContentRef} className={`bible-main-content${isSelectionMode ? ' selection-active' : ''}`} style={{ '--bible-text-scale': bibleTextScale / 100 }}>
                <header className={`bible-nav-header${composerSession ? ' selection-mode' : ''}`}>
                    <div className="mobile-context-row">
                        <button
                            className="mobile-context-trigger"
                            onClick={() => setIsMobileSelectorOpen(true)}
                            aria-label={`${bookName} ${chapter}장, ${currentVersionLabel} 선택`}
                        >
                            <span className="mobile-context-primary">{bookName} {chapter}장</span>
                            <span className="mobile-context-secondary">{currentVersionLabel}</span>
                        </button>
                        <span
                            className={`mobile-status-badge ${isCompleted ? 'completed' : ''}`}
                            onClick={() => isCompleted && onNavigateToJournal(lastReadDate)}
                            title={isCompleted ? "해당 날짜 묵상일지로 이동" : ""}
                        >
                            {isCompleted ? '✓ 읽음' : '읽지 않음'}
                        </span>
                    </div>
                    <div className="nav-controls-container">
                        {/* Previous Chapter Button */}
                        <button
                            className="nav-btn prev"
                            onClick={handlePrevChapter}
                            disabled={!currentBook || (currentBook === books[0]?.id && currentChapter === 1)}
                            title="이전 장"
                            aria-label="이전 장"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="nav-selectors">
                            {/* Version Selector */}
                            <div className="nav-select-wrapper version-select-wrapper">
                                <select
                                    value={currentVersion}
                                    onChange={(e) => runWithComposerGuard(() => onVersionChange(e.target.value))}
                                    className="nav-select version-select"
                                >
                                    <option value="krv">개역한글</option>
                                    <option value="web">WEB</option>
                                    <option value="bbe">BBE</option>
                                </select>
                            </div>

                            {/* Book Selector */}
                            <div className="nav-select-wrapper">
                                <select
                                    value={currentBook}
                                    onChange={(e) => runWithComposerGuard(() => onBookChange(e.target.value))}
                                    className="nav-select book-select"
                                >
                                    {books.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Chapter Selector */}
                            <div className="nav-select-wrapper">
                                <select
                                    value={currentChapter}
                                    onChange={(e) => runWithComposerGuard(() => onChapterChange(Number(e.target.value)))}
                                    className="nav-select chapter-select"
                                >
                                    {chapters.map(ch => (
                                        <option key={ch} value={ch}>{ch}장</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Next Chapter Button */}
                        <button
                            className="nav-btn next"
                            onClick={handleNextChapter}
                            disabled={!currentBook || (currentBook === books[books.length - 1]?.id && currentChapter === totalChapters)}
                            title="다음 장"
                            aria-label="다음 장"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="reading-meta-row">
                        <div
                            className="reading-status-container"
                            onClick={() => isCompleted && onNavigateToJournal(lastReadDate)}
                            style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                            title={isCompleted ? "해당 날짜 묵상일지로 이동" : ""}
                        >
                            <span className={`status-label ${isCompleted ? 'completed' : ''}`}>
                                {isCompleted ? '읽음' : '읽지 않음'}
                            </span>
                            {lastReadDate && (
                                <span className="status-date">
                                    ({lastReadDate === format(new Date(), 'yyyy-MM-dd') ? '오늘' : lastReadDate})
                                </span>
                            )}
                        </div>
                        <div className="mobile-sub-actions">
                            <button
                                ref={chapterNotesTriggerRef}
                                className="mobile-chapter-notes-btn"
                                onClick={openChapterNotes}
                                aria-haspopup="dialog"
                                aria-expanded={notesSurface.open}
                            >
                                이 장의 묵상 {chapterNotes.length}개
                            </button>
                            <button
                                className="mobile-reading-settings-btn"
                                onClick={() => setIsReadingSettingsOpen(true)}
                                aria-label="본문 가독성 설정"
                            >
                                Aa
                            </button>
                        </div>
                    </div>
                </header>

                {isMobileSelectorOpen && (
                    <div className="mobile-sheet-backdrop" onClick={() => setIsMobileSelectorOpen(false)}>
                        <section className="mobile-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="본문 선택">
                            <div className="mobile-sheet-handle" />
                            <div className="mobile-sheet-header">
                                <div>
                                    <div className="mobile-sheet-title">본문 선택</div>
                                    <div className="mobile-sheet-subtitle">{bookName} {chapter}장 · {currentVersionLabel}</div>
                                </div>
                                <button className="mobile-sheet-close" onClick={() => setIsMobileSelectorOpen(false)} aria-label="닫기" autoFocus>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mobile-selector-fields">
                                <label>
                                    <span>역본</span>
                                    <select value={currentVersion} onChange={(e) => runWithComposerGuard(() => onVersionChange(e.target.value))}>
                                        <option value="krv">개역한글</option>
                                        <option value="web">WEB</option>
                                        <option value="bbe">BBE</option>
                                    </select>
                                </label>
                                <label>
                                    <span>성경</span>
                                    <select value={currentBook} onChange={(e) => runWithComposerGuard(() => onBookChange(e.target.value))}>
                                        {books.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span>장</span>
                                    <select value={currentChapter} onChange={(e) => runWithComposerGuard(() => onChapterChange(Number(e.target.value)))}>
                                        {chapters.map(ch => (
                                            <option key={ch} value={ch}>{ch}장</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </section>
                    </div>
                )}

                {isReadingSettingsOpen && (
                    <div className="mobile-sheet-backdrop" onClick={() => setIsReadingSettingsOpen(false)}>
                        <section className="mobile-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="본문 가독성 설정">
                            <div className="mobile-sheet-handle" />
                            <div className="mobile-sheet-header">
                                <div>
                                    <div className="mobile-sheet-title">본문 가독성</div>
                                    <div className="mobile-sheet-subtitle">성경 본문에만 적용됩니다</div>
                                </div>
                                <button className="mobile-sheet-close" onClick={() => setIsReadingSettingsOpen(false)} aria-label="닫기" autoFocus>
                                    <X size={20} />
                                </button>
                            </div>
                            <label className="reading-setting-control">
                                <span>본문 크기 {bibleTextScale}%</span>
                                <input
                                    type="range"
                                    min="90"
                                    max="125"
                                    step="5"
                                    value={bibleTextScale}
                                    onChange={(e) => setBibleTextScale(Number(e.target.value))}
                                />
                            </label>
                        </section>
                    </div>
                )}



                <div className="bible-text-grid">
                    {verses.length > 0 ? (
                        verses.map(v => {
                            const hlColor = getHighlightStyle(v.verse);
                            const hasNote = chapterNotes.some(n => n.verse == v.verse);
                            const isSelected = activeSelectedVerses.includes(Number(v.verse));
                            return (
                                <div
                                    id={`verse-${v.verse}`}
                                    key={v.verse}
                                    className={`verse-row${hlColor ? ' has-highlight' : ''}${isSelected ? ' is-selected' : ''}`}
                                    style={hlColor ? { backgroundColor: hlColor } : undefined}
                                >
                                    {hasNote && (
                                        <button
                                            type="button"
                                            className="note-indicator"
                                            onClick={(e) => openVerseNotes(v, e)}
                                            aria-label={`${bookName} ${chapter}:${v.verse} 묵상 보기`}
                                        >
                                            <span className="note-indicator-line" aria-hidden="true" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="verse-select-target"
                                        aria-pressed={isSelected}
                                        onClick={(e) => handleVerseClick(e, v)}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        <span className="verse-meta">
                                            <span className="verse-num">{v.verse}</span>
                                        </span>
                                        <span className={`verse-content ${hasNote ? 'has-note' : ''}`}>
                                            {v.text || v.content || ''}
                                        </span>
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-color-text-secondary)', breakInside: 'avoid-column' }}>
                            구절을 불러오는 중입니다...
                        </div>
                    )}
                </div>

                {/* [NEW] Chapter Completion Button */}
                <div className="chapter-complete-section">
                    <button
                        className={`chapter-complete-btn ${isReadOnCurrentDate ? 'completed' : ''}`}
                        onClick={onComplete}
                        disabled={completionStatus === 'loading'}
                    >
                        {completionStatus === 'loading' ? (
                            <Loader size={20} className="animate-spin" />
                        ) : isReadOnCurrentDate ? (
                            <>
                                <Check size={20} />
                                {isToday ? '오늘의 말씀 완료' : '읽음'}
                            </>
                        ) : (
                            isToday ? '오늘의 말씀을 마쳤습니다' : '읽음 표시하기'
                        )}
                    </button>
                    {isReadOnCurrentDate && (
                        <p className="chapter-complete-msg">
                            {isToday ? '오늘의 말씀을 마쳤습니다.' : `${lastReadDate}에 성경 읽기가 완료되었습니다.`}
                            <span
                                className="journal-link"
                                onClick={onNavigateToJournal}
                                style={{
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    color: 'var(--pk-color-primary)',
                                    marginLeft: '8px',
                                    fontWeight: '600'
                                }}
                            >
                                기록 보기
                            </span>
                        </p>
                    )}
                </div>

                <div className="selection-live-status" role="status" aria-live="polite" aria-atomic="true">
                    {isSelectionMode ? (
                        toolbarAction
                            ? `${activeSelectedVerses.length}개 구절 작업 처리 중`
                            : `${activeSelectedVerses.length}개 구절 선택됨, ${bookName} ${chapter}장 ${selectedVerseRange}절`
                    ) : ''}
                </div>

                {isSelectionMode && !composerSession ? (
                    <div
                        className="verse-selection-bar"
                        aria-label="선택한 구절 도구"
                        aria-busy={Boolean(toolbarAction)}
                        role="region"
                    >
                        <div className="verse-selection-header">
                            <div className="verse-selection-status">
                                <strong>{activeSelectedVerses.length}개 구절 선택됨</strong>
                                <span title={`${bookName} ${chapter}:${selectedVerseRange} · ${currentVersionLabel}`}>
                                    {bookName} {chapter}:{selectedVerseRange} · {currentVersionLabel}
                                </span>
                            </div>
                            <div className="verse-selection-header-actions">
                                <button
                                    type="button"
                                    className="verse-selection-close"
                                    onClick={() => closeVerseSelection()}
                                    aria-label="구절 선택 종료"
                                    disabled={Boolean(toolbarAction)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="verse-selection-actions" aria-label="선택한 구절 작업">
                            {[
                                { key: 'yellow', color: 'var(--pk-highlight-yellow)', fallback: '1' },
                                { key: 'green', color: 'var(--pk-highlight-green)', fallback: '2' },
                                { key: 'blue', color: 'var(--pk-highlight-blue)', fallback: '3' },
                                { key: 'red', color: 'var(--pk-highlight-red)', fallback: '4' }
                            ].map(item => {
                                const label = highlightLabels?.[item.key] || item.fallback;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className="verse-selection-color-action"
                                        onClick={() => handleApplySelectionHighlight(item.color)}
                                        aria-label={`${label} 하이라이트 적용`}
                                        title={`${label} 하이라이트`}
                                        disabled={Boolean(toolbarAction) || !hasCompleteSelectionPayload}
                                    >
                                        <span className="verse-selection-color-swatch" style={{ backgroundColor: item.color }} aria-hidden="true" />
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                className="verse-selection-action verse-selection-erase-action"
                                onClick={handleRemoveSelectionHighlights}
                                disabled={selectedHighlightedVerses.length === 0 || Boolean(toolbarAction)}
                            >
                                {toolbarAction === 'remove-highlight' ? <Loader size={19} className="animate-spin" /> : <Eraser size={19} />}
                                <span>지우기</span>
                            </button>
                            <button
                                type="button"
                                className="verse-selection-action"
                                onClick={openSelectionComposer}
                                disabled={Boolean(toolbarAction) || !hasCompleteSelectionPayload}
                            >
                                <MessageSquare size={19} />
                                <span>묵상</span>
                            </button>
                            <button
                                type="button"
                                className="verse-selection-action"
                                onClick={handleCopySelection}
                                disabled={Boolean(toolbarAction) || !hasCompleteSelectionPayload}
                            >
                                {toolbarAction === 'copy' ? <Loader size={19} className="animate-spin" /> : <Copy size={19} />}
                                <span>복사</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <nav className={`mobile-reading-action-bar${composerSession ? ' selection-hidden' : ''}`} aria-label="성경 읽기 작업">
                        <button
                            className="mobile-reading-nav-btn"
                            onClick={handlePrevChapter}
                            disabled={!currentBook || (currentBook === books[0]?.id && currentChapter === 1)}
                        >
                            <ChevronLeft size={20} />
                            이전
                        </button>
                        {isReadOnCurrentDate ? (
                            <button className="mobile-reading-primary-btn completed" onClick={onNavigateToJournal}>
                                <Check size={18} />
                                묵상일지 보기
                            </button>
                        ) : (
                            <button className="mobile-reading-primary-btn" onClick={onComplete} disabled={completionStatus === 'loading'}>
                                {completionStatus === 'loading' ? <Loader size={18} className="animate-spin" /> : <Check size={18} />}
                                {isToday ? '오늘의 말씀 완료' : '읽음 표시'}
                            </button>
                        )}
                        <button
                            className="mobile-reading-nav-btn"
                            onClick={handleNextChapter}
                            disabled={!currentBook || (currentBook === books[books.length - 1]?.id && currentChapter === totalChapters)}
                        >
                            다음
                            <ChevronRight size={20} />
                        </button>
                    </nav>
                )}

            </main>

            {composerSession && (
                <ReflectionComposer
                    session={composerSession}
                    onDraftChange={handleComposerDraftChange}
                    onSubmit={handleComposerSubmit}
                    onClose={() => closeComposerSession()}
                />
            )}

            {notesSurface.open && !composerSession && (
                <ChapterNotesPanel
                    bookName={bookName}
                    chapter={notesChapter}
                    notes={chapterNotes}
                    status={chapterNotesState.status}
                    error={chapterNotesState.error}
                    selectedNoteId={notesSurface.selectedNoteId}
                    pendingDeleteId={notesSurface.pendingDeleteId}
                    copiedNoteId={copiedNoteId}
                    onClose={() => closeChapterNotes()}
                    onRetry={() => refreshChapterNotes().catch(retryError => {
                        console.error('Failed to retry chapter notes:', retryError);
                    })}
                    onNavigate={scrollToVerse}
                    onCopy={handleCopyNote}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                />
            )}
        </div>
    );
};

const toggleSelectedVerse = (selectedVerses, verseNumber) => {
    const normalizedVerse = Number(verseNumber);
    const nextSelection = new Set(selectedVerses.map(Number));

    if (nextSelection.has(normalizedVerse)) {
        nextSelection.delete(normalizedVerse);
    } else {
        nextSelection.add(normalizedVerse);
    }

    return [...nextSelection].sort((a, b) => a - b);
};

export default React.memo(BibleViewer);
