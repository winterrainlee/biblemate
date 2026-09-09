
import React, { useState, useEffect, useRef } from 'react';
import { Check, MessageSquare, Copy, X, Loader, ChevronLeft, ChevronRight, Trash2, Edit2, Eraser } from 'lucide-react';
import { getVerseNotesByChapter, saveVerseNote, deleteVerseNote } from '../services/journalApi';
import { format } from 'date-fns';
import ReflectionComposer from './ReflectionComposer';
import {
    buildVerseNotePayload,
    createComposerSession,
    createSelectionSnapshot,
    formatVerseRange,
    isComposerDirty,
    parseStoredContent,
    parseVerseRange
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
    const [chapterNotes, setChapterNotes] = useState([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const selectionContextKey = `${currentBook}:${currentChapter}:${currentVersion}`;
    const selectionContextRef = useRef(selectionContextKey);
    const [selectedVerses, setSelectedVerses] = useState([]);
    const activeSelectedVerses = selectionContextRef.current === selectionContextKey
        ? selectedVerses
        : [];
    const isSelectionMode = activeSelectedVerses.length > 0;
    const [copiedNoteId, setCopiedNoteId] = useState(null);
    const [toolbarAction, setToolbarAction] = useState(null);
    const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false);
    const [isChapterNotesOpen, setIsChapterNotesOpen] = useState(false);
    const [isReadingSettingsOpen, setIsReadingSettingsOpen] = useState(false);
    const [bibleTextScale, setBibleTextScale] = useState(() => {
        const saved = localStorage.getItem('bibleTextScale');
        return saved ? Number(saved) : 100;
    });
    const [popup, setPopup] = useState({
        visible: false,
        x: 0,
        y: 0,
        verseNum: null,
        verseText: '',
        verseRange: null
    });
    const [composerSession, setComposerSession] = useState(null);
    const popupRef = useRef(null);
    const mainContentRef = useRef(null);
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
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });
    const closeVersePopup = () => {
        setPopup(prev => ({ ...prev, visible: false, verseRange: null }));
    };

    const commitComposerSession = (update) => {
        setComposerSession(previous => {
            const next = typeof update === 'function' ? update(previous) : update;
            composerSessionRef.current = next;
            return next;
        });
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
            'button, input, textarea, select, a, [contenteditable="true"], .verse-popup, .reflection-composer, .mobile-sheet, .mobile-reading-action-bar'
        ));
    };

    const onTouchStart = (e) => {
        const isVerseTarget = Boolean(e.target?.closest?.('.verse-select-target'));
        if (popup.visible || composerSession || (isInteractiveTouchTarget(e.target) && !isVerseTarget)) {
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

        if (!start || !end || isSelectionMode || popup.visible || composerSession) return;
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

    // Drag handlers
    const handleMouseDown = (e) => {
        // Prevent drag if clicking on interactive elements (textarea, button, etc.)
        if (['BUTTON', 'TEXTAREA', 'INPUT'].includes(e.target.tagName)) return;

        dragRef.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialLeft: popup.x,
            initialTop: popup.y
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!dragRef.current.isDragging) return;

        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        setPopup(prev => ({
            ...prev,
            x: dragRef.current.initialLeft + dx,
            y: dragRef.current.initialTop + dy
        }));
    };

    const handleMouseUp = () => {
        dragRef.current.isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Close popup on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (composerSessionRef.current) {
                    closeComposerSessionRef.current?.();
                } else if (popup.visible || isMobileSelectorOpen || isChapterNotesOpen || isReadingSettingsOpen) {
                    setPopup(prev => ({ ...prev, visible: false }));
                    setIsMobileSelectorOpen(false);
                    setIsChapterNotesOpen(false);
                    setIsReadingSettingsOpen(false);
                } else if (isSelectionMode && !toolbarAction) {
                    closeVerseSelection();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isChapterNotesOpen, isMobileSelectorOpen, isReadingSettingsOpen, isSelectionMode, popup.visible, toolbarAction]);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setPopup(prev => ({ ...prev, visible: false }));
            }
        };
        if (popup.visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popup.visible]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
            composerRequestRef.current += 1;
            composerSaveRef.current = null;
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('bibleTextScale', String(bibleTextScale));
    }, [bibleTextScale]);

    useEffect(() => {
        selectionContextRef.current = selectionContextKey;
        toolbarActionRef.current = null;
        setToolbarAction(null);
        setSelectedVerses([]);
        touchStartRef.current = null;
        touchEndRef.current = null;
        lastSelectedVerseRef.current = null;
        verseGestureRef.current = { moved: false, target: null, suppressTarget: null, suppressUntil: 0 };
    }, [selectionContextKey]);

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
        const isSameSelectionContext = selectionContextRef.current === selectionContextKey;
        selectionContextRef.current = selectionContextKey;
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

        try {
            const noteData = buildVerseNotePayload(session, format(new Date(), 'yyyy-MM-dd'));
            await saveVerseNote(noteData);
            if (composerSaveRef.current !== requestToken || composerSessionRef.current?.id !== sessionId) return;

            const notes = await getVerseNotesByChapter(
                session.selectionSnapshot.book,
                session.selectionSnapshot.chapter
            );
            if (selectionContextKey === session.selectionSnapshot.contextKey) {
                setChapterNotes(notes);
            }
            try {
                await onVerseNoteSaved?.();
            } catch (refreshError) {
                console.error('Failed to refresh reading logs after verse note save:', refreshError);
            }
            if (composerSaveRef.current !== requestToken || composerSessionRef.current?.id !== sessionId) return;

            closeComposerSession({ force: true });
            if (selectionContextKey === session.selectionSnapshot.contextKey) {
                closeVerseSelection();
            }
            onToast?.(session.mode === 'edit' ? '묵상을 수정했습니다.' : '묵상을 저장했습니다.', 'success');
        } catch (error) {
            console.error('Failed to save note:', error);
            if (composerSaveRef.current === requestToken && composerSessionRef.current?.id === sessionId) {
                composerSaveRef.current = null;
                commitComposerSession(previous => previous?.id === sessionId
                    ? { ...previous, status: 'error', error: '묵상을 저장하지 못했습니다. 내용을 유지했으니 다시 시도해 주세요.' }
                    : previous);
            }
        } finally {
            if (composerSaveRef.current === requestToken) {
                composerSaveRef.current = null;
            }
        }
    };

    // Load chapter notes when book/chapter changes
    useEffect(() => {
        const loadNotes = async () => {
            const targetBook = book || bookName; // Use book code if available
            if (!targetBook || !chapter) return;
            setIsLoadingNotes(true);
            try {
                const notes = await getVerseNotesByChapter(targetBook, chapter);
                setChapterNotes(notes);
            } catch (err) {
                console.error('Failed to load chapter notes:', err);
                setChapterNotes([]); // Clear notes on error
            } finally {
                setIsLoadingNotes(false);
            }
        };
        loadNotes();
    }, [book, bookName, chapter]);

    const handleDeleteNote = async (id) => {
        if (!window.confirm('묵상을 삭제하시겠습니까?')) return;
        try {
            await deleteVerseNote(id);
            // Refresh
            const targetBook = book || currentBook;
            const notes = await getVerseNotesByChapter(targetBook, chapter || currentChapter);
            setChapterNotes(notes);
        } catch (error) {
            console.error('Failed to delete note:', error);
            alert('삭제 실패');
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
        setPopup(previous => ({ ...previous, visible: false }));
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

    const getNotesForVerse = (verseNum) => chapterNotes.filter(n => n.verse === verseNum);

    const openVerseNotes = (verse, event = null) => {
        event?.stopPropagation();
        const verseText = verse?.text || verse?.content || popup.verseText || '';
        setSelectedVerses([]);
        setPopup({
            visible: true,
            x: Math.max(20, window.innerWidth / 2 - 210),
            y: Math.max(20, window.innerHeight / 2 - 180),
            verseNum: verse.verse,
            verseText,
            verseRange: chapterNotes.find(note => Number(note.verse) === Number(verse.verse))?.verse_range || null
        });
    };

    const scrollToVerse = (verseNum) => {
        setIsChapterNotesOpen(false);
        window.requestAnimationFrame(() => {
            document.getElementById(`verse-${verseNum}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        });
    };

    // Split notes for left/right sidebars
    // Use floor to favor putting the middle item on the right (except for length 1)
    const midVerse = verses.length > 0 ? verses[Math.max(0, Math.floor(verses.length / 2) - 1)]?.verse : 0;
    const leftNotes = chapterNotes.filter(n => n.verse <= midVerse);
    const rightNotes = chapterNotes.filter(n => n.verse > midVerse);

    // [⑤] 팝업 헤더용 구절 표시 로직 (다중 선택 및 기존 묵상 범위 대응)
    const popupVerseRef = popup.verseRange
        || chapterNotes.find(n => n.verse === popup.verseNum)?.verse_range
        || popup.verseNum;
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
        setPopup(previous => ({ ...previous, visible: false }));
        commitComposerSession(createComposerSession({
            selectionSnapshot: snapshot,
            draft: { memo: '', quoteEnabled: false, quoteText }
        }));
        restoreReadingScroll(scrollTop);
    };

    // Helper to render note content with optional quote styling
    const renderNoteContent = (content) => {
        // Check if content starts with a quote pattern: "..."\n\n
        // Pattern: Starts with ", ends with "\n\n
        const quoteMatch = content.match(/^"([\s\S]+?)"\n\n([\s\S]+)$/);

        if (quoteMatch) {
            const quoteText = quoteMatch[1];
            const userMemo = quoteMatch[2];
            return (
                <div className="note-content-wrapper">
                    <div className="note-quote-styled" style={{
                        fontSize: '1rem',
                        fontFamily: 'var(--pk-font-body)',
                        color: 'var(--pk-color-text-secondary)',
                        padding: '10px 12px',
                        backgroundColor: 'var(--pk-color-bg-elevated)',
                        borderRadius: 'var(--pk-radius-md)',
                        border: '1px solid var(--pk-color-border)',
                        marginBottom: '8px'
                    }}>
                        "{quoteText}"
                    </div>
                    <p className="note-text">{userMemo}</p>
                </div>
            );
        }
        return <p className="note-text">{content}</p>;
    };

    const renderNoteActions = (note) => {
        const isCopied = copiedNoteId === note.id;

        return (
            <div className="note-action-row">
                <button
                    onClick={() => handleCopyNote(note)}
                    className={`note-action-btn ${isCopied ? 'copied' : ''}`}
                    title={isCopied ? '복사됨' : '복사'}
                    aria-label={isCopied ? '묵상 복사됨' : '묵상 복사'}
                >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button onClick={() => handleEditNote(note)} className="note-action-btn" title="수정" aria-label="묵상 수정">
                    <Edit2 size={14} />
                </button>
                <button onClick={() => handleDeleteNote(note.id)} className="note-action-btn danger" title="삭제" aria-label="묵상 삭제">
                    <Trash2 size={14} />
                </button>
            </div>
        );
    };

    return (
        <div
            className="bible-viewer-container"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
        >
            {/* 좌측 사이드바: 1절 ~ 중간절 묵상 */}
            <aside className="bible-side-panel left">
                <div className="side-panel-content">
                    {leftNotes.map(n => (
                        <div key={n.id} className="verse-note-card-v2" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="note-ref">{bookName} {chapter}:{n.verse_range || n.verse}</div>
                                {renderNoteActions(n)}
                            </div>

                            {renderNoteContent(n.content)}
                            <div className="note-date">{new Date(n.created_at || n.date).toLocaleDateString()}</div>
                        </div>
                    ))}
                    {leftNotes.length === 0 && !isLoadingNotes && (
                        <div className="empty-side-note">아직 앞부분에 남긴 묵상이 없어요.</div>
                    )}
                </div>
            </aside>

            {/* 중앙 본문 영역 */}
            <main ref={mainContentRef} className={`bible-main-content${isSelectionMode ? ' selection-active' : ''}`} style={{ '--bible-text-scale': bibleTextScale / 100 }}>
                <header className={`bible-nav-header${popup.visible || composerSession ? ' selection-mode' : ''}`}>
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
                                className="mobile-chapter-notes-btn"
                                onClick={() => setIsChapterNotesOpen(true)}
                                disabled={chapterNotes.length === 0}
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

                {isChapterNotesOpen && (
                    <div className="mobile-sheet-backdrop" onClick={() => setIsChapterNotesOpen(false)}>
                        <section className="mobile-sheet chapter-notes-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="이 장의 묵상">
                            <div className="mobile-sheet-handle" />
                            <div className="mobile-sheet-header">
                                <div>
                                    <div className="mobile-sheet-title">{bookName} {chapter}장 묵상</div>
                                    <div className="mobile-sheet-subtitle">이 장의 묵상 {chapterNotes.length}개</div>
                                </div>
                                <button className="mobile-sheet-close" onClick={() => setIsChapterNotesOpen(false)} aria-label="닫기" autoFocus>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="chapter-notes-list-mobile">
                                {chapterNotes.length > 0 ? chapterNotes.map(note => (
                                    <article key={note.id} className="verse-note-card-v2 mobile-note-card">
                                        <div className="mobile-note-card-header">
                                            <button className="note-ref mobile-note-ref" onClick={() => scrollToVerse(note.verse)}>
                                                {bookName} {chapter}:{note.verse_range || note.verse}
                                            </button>
                                            {renderNoteActions(note)}
                                        </div>
                                        {renderNoteContent(note.content)}
                                    </article>
                                )) : (
                                    <p className="mobile-empty-note">아직 이 장에 남긴 묵상이 없어요.</p>
                                )}
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

                {popup.visible && (
                    <div
                        ref={popupRef}
                        className="verse-popup verse-popup--view-notes"
                        style={{ left: popup.x, top: popup.y, cursor: 'move' }}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="popup-menu-v2">
                            <div className="popup-header">
                                <span className="popup-title">
                                    {bookName} {chapter}:{popupVerseRef} 묵상 ({getNotesForVerse(popup.verseNum).length}개)
                                </span>
                                <button
                                    onClick={closeVersePopup}
                                    className="popup-close-btn"
                                    title="닫기"
                                    aria-label="묵상 보기 닫기"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            {popup.verseText && (
                                <div className="view-notes-verse-text">
                                    &ldquo;{popup.verseText}&rdquo;
                                </div>
                            )}
                            <div className="popup-notes-list" style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {getNotesForVerse(popup.verseNum).map(note => (
                                    <div key={note.id} className="verse-note-card-v2" style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <div className="note-date">{new Date(note.created_at || note.date).toLocaleDateString()}</div>
                                            {renderNoteActions(note)}
                                        </div>
                                        {renderNoteContent(note.content)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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
                    <nav className={`mobile-reading-action-bar${popup.visible || composerSession ? ' selection-hidden' : ''}`} aria-label="성경 읽기 작업">
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

            {/* 우측 사이드바: 중간절+1 ~ 마지막절 묵상 */}
            <aside className="bible-side-panel right">
                <div className="side-panel-content">
                    {rightNotes.map(n => (
                        <div key={n.id} className="verse-note-card-v2" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="note-ref">{bookName} {chapter}:{n.verse_range || n.verse}</div>
                                {renderNoteActions(n)}
                            </div>

                            {renderNoteContent(n.content)}
                            <div className="note-date">{new Date(n.created_at || n.date).toLocaleDateString()}</div>
                        </div>
                    ))}
                    {rightNotes.length === 0 && !isLoadingNotes && (
                        <div className="empty-side-note">아직 뒷부분에 남긴 묵상이 없어요.</div>
                    )}
                </div>
            </aside>
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
