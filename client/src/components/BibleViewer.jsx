
import React, { useState, useEffect, useRef } from 'react';
import { Check, MessageSquare, Copy, X, Send, Loader, ChevronLeft, ChevronRight, Trash2, Edit2, Eraser, MoreHorizontal } from 'lucide-react';
import { getVerseNotesByChapter, saveVerseNote, deleteVerseNote } from '../services/journalApi';
import { format } from 'date-fns';
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
            onChapterChange(currentChapter - 1);
        } else {
            // Find previous book
            const currIdx = books.findIndex(b => b.id === currentBook);
            if (currIdx > 0) {
                const prevBook = books[currIdx - 1];
                // Navigate to the LAST chapter of the previous book
                onBookChange(prevBook.id, prevBook.chapters);
            }
        }
    };

    const handleNextChapter = () => {
        if (currentChapter < totalChapters) {
            onChapterChange(currentChapter + 1);
        } else {
            // Next book
            const currIdx = books.findIndex(b => b.id === currentBook);
            if (currIdx < books.length - 1) {
                const nextBook = books[currIdx + 1];
                onBookChange(nextBook.id);
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
    const [isToolbarMoreOpen, setIsToolbarMoreOpen] = useState(false);
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
        mode: 'menu',
        memoInput: '',
        quoteEnabled: false,
        quoteText: '',
        editTargetDate: null // [NEW] Track original date for edits
    });
    const popupRef = useRef(null);
    const copyTimeoutRef = useRef(null);
    const toolbarActionRef = useRef(null);
    const lastSelectedVerseRef = useRef(null);
    const verseGestureRef = useRef({ moved: false, target: null, suppressTarget: null, suppressUntil: 0 });
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });
    const closeVersePopup = () => {
        setPopup(prev => ({ ...prev, visible: false, verseRange: null, editTargetDate: null }));
    };

    const closeVerseSelection = (restoreFocus = true) => {
        toolbarActionRef.current = null;
        setToolbarAction(null);
        setIsToolbarMoreOpen(false);
        setSelectedVerses([]);
        if (restoreFocus) {
            window.requestAnimationFrame(() => lastSelectedVerseRef.current?.focus());
        }
    };

    // [NEW] Swipe handlers for mobile chapter navigation
    const minSwipeDistance = 50;
    const isInteractiveTouchTarget = (target) => {
        return Boolean(target?.closest?.(
            'button, input, textarea, select, a, [contenteditable="true"], .verse-popup, .mobile-sheet, .mobile-reading-action-bar'
        ));
    };

    const onTouchStart = (e) => {
        const isVerseTarget = Boolean(e.target?.closest?.('.verse-select-target'));
        if (popup.visible || (isInteractiveTouchTarget(e.target) && !isVerseTarget)) {
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

        if (!start || !end || isSelectionMode || popup.visible) return;
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
                if (isToolbarMoreOpen) {
                    setIsToolbarMoreOpen(false);
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
    }, [isChapterNotesOpen, isMobileSelectorOpen, isReadingSettingsOpen, isSelectionMode, isToolbarMoreOpen, popup.visible, toolbarAction]);

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
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('bibleTextScale', String(bibleTextScale));
    }, [bibleTextScale]);

    useEffect(() => {
        selectionContextRef.current = selectionContextKey;
        toolbarActionRef.current = null;
        setToolbarAction(null);
        setIsToolbarMoreOpen(false);
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

    const handleMemoSubmit = async () => {
        if (!popup.memoInput.trim()) return;

        const finalContent = popup.quoteEnabled
            ? `"${popup.quoteText}"\n\n${popup.memoInput} `
            : popup.memoInput;

        // Use selected verses for range if available, otherwise fall back to existing range in popup
        const rangeString = selectedVerses.length > 1
            ? formatVerseRange(selectedVerses)
            : (popup.verseRange || null);

        const primaryVerse = selectedVerses.length > 0 ? selectedVerses[0] : popup.verseNum;

        const noteData = {
            date: popup.editTargetDate || format(new Date(), 'yyyy-MM-dd'),
            book: book || currentBook, // Use currentBook if book prop is empty
            chapter: chapter || currentChapter,
            verse: primaryVerse,
            verse_range: rangeString,
            content: finalContent
        };

        try {
            await saveVerseNote(noteData);
            setPopup(prev => ({ ...prev, visible: false, verseRange: null, editTargetDate: null })); // Clear range & date
            setSelectedVerses([]);

            // Refresh notes
            const targetBook = book || currentBook; // Consistent with noteData
            const notes = await getVerseNotesByChapter(targetBook, chapter || currentChapter);
            setChapterNotes(notes);
            try {
                await onVerseNoteSaved?.();
            } catch (refreshError) {
                console.error('Failed to refresh reading logs after verse note save:', refreshError);
            }
            onToast?.('묵상을 저장했습니다.', 'success');

            // Optional: alert or toast success
        } catch (error) {
            console.error('Failed to save note:', error);
            alert('묵상 저장 실패');
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
        // Parse content to check for quote
        const quoteMatch = note.content.match(/^"([\s\S]+?)"\n\n([\s\S]+)$/);
        let quoteText = '';
        let memoInput = note.content;
        let quoteEnabled = false;

        if (quoteMatch) {
            quoteText = quoteMatch[1];
            memoInput = quoteMatch[2];
            quoteEnabled = true;
        } else {
            // Try to find verse text if not in note, but for edit just init empty or basic
            const v = verses.find(v => v.verse === note.verse);
            quoteText = v?.text || v?.content || '';
        }

        setSelectedVerses([]); // Clear any selection
        setPopup({
            visible: true,
            x: window.innerWidth / 2 - 180, // Center horizontally
            y: window.innerHeight / 2 - 200, // Center vertically
            verseNum: note.verse,
            verseRange: note.verse_range, // [NEW] Set range
            verseText: verses.find(v => v.verse === note.verse)?.text || '',
            mode: 'memo',
            memoInput: memoInput,
            quoteEnabled: quoteEnabled,
            quoteText: quoteText,
            editTargetDate: note.date // [NEW] Keep original date
        });
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
            mode: 'view-notes',
            memoInput: '',
            quoteEnabled: false,
            quoteText: verseText,
            editTargetDate: null
        });
    };

    const closeComposer = () => {
        if (popup.mode === 'memo' && popup.memoInput.trim()) {
            const shouldClose = window.confirm('작성 중인 묵상이 있습니다. 닫으시겠습니까?');
            if (!shouldClose) return;
        }
        closeVersePopup();
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
    const popupVerseRef = popup.verseRange ||
        (selectedVerses.length > 1 ? formatVerseRange(selectedVerses) :
            (chapterNotes.find(n => n.verse === popup.verseNum)?.verse_range || popup.verseNum));
    const selectedVerseRange = formatVerseRange(activeSelectedVerses).replaceAll('-', '–');
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
        verseRange: selectedVerseRange
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
        setIsToolbarMoreOpen(false);

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
        setIsToolbarMoreOpen(false);
        setPopup({
            visible: true,
            x: Math.max(20, window.innerWidth / 2 - 210),
            y: Math.max(20, window.innerHeight / 2 - 200),
            verseNum: primaryVerse.verse,
            verseRange: formatVerseRange(activeSelectedVerses),
            verseText: primaryVerse.text,
            mode: 'memo',
            memoInput: '',
            quoteEnabled: false,
            quoteText,
            editTargetDate: null
        });
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
            <main className={`bible-main-content${isSelectionMode ? ' selection-active' : ''}`} style={{ '--bible-text-scale': bibleTextScale / 100 }}>
                <header className={`bible-nav-header${popup.visible ? ' selection-mode' : ''}`}>
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
                                    onChange={(e) => onVersionChange(e.target.value)}
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
                                    onChange={(e) => onBookChange(e.target.value)}
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
                                    onChange={(e) => onChapterChange(Number(e.target.value))}
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
                                    <select value={currentVersion} onChange={(e) => onVersionChange(e.target.value)}>
                                        <option value="krv">개역한글</option>
                                        <option value="web">WEB</option>
                                        <option value="bbe">BBE</option>
                                    </select>
                                </label>
                                <label>
                                    <span>성경</span>
                                    <select value={currentBook} onChange={(e) => onBookChange(e.target.value)}>
                                        {books.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <span>장</span>
                                    <select value={currentChapter} onChange={(e) => onChapterChange(Number(e.target.value))}>
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
                        className={`verse-popup verse-popup--${popup.mode}`}
                        style={{ left: popup.x, top: popup.y, cursor: 'move' }}
                        onMouseDown={handleMouseDown}
                    >
                        {popup.mode === 'view-notes' ? (
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
                        ) : (
                            <div className="memo-composer">
                                <div className="popup-header">
                                    <span className="popup-title">
                                        {bookName} {chapter}:{popupVerseRef} 묵상
                                    </span>
                                    <button
                                        onClick={closeComposer}
                                        className="popup-close-btn"
                                        aria-label="작성 닫기"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="composer-selected-verse">
                                    <div className="composer-selected-ref">{bookName} {chapter}:{popupVerseRef}</div>
                                    <div className="composer-selected-text">&ldquo;{popup.quoteText || popup.verseText}&rdquo;</div>
                                </div>
                                {
                                    /* v2.1: Quote Checkbox & Editable Area */
                                }
                                <div className="quote-toggle-row">
                                    <input
                                        type="checkbox"
                                        id="quote-check"
                                        checked={popup.quoteEnabled}
                                        onChange={(e) => setPopup(prev => ({ ...prev, quoteEnabled: e.target.checked }))}
                                    />
                                    <label htmlFor="quote-check">
                                        말씀 인용
                                    </label>
                                </div>

                                {popup.quoteEnabled && (
                                    <textarea
                                        className="quote-textarea"
                                        value={popup.quoteText}
                                        onChange={(e) => setPopup(prev => ({ ...prev, quoteText: e.target.value }))}
                                    />
                                )}
                                <textarea
                                    className="memo-textarea"
                                    autoFocus
                                    value={popup.memoInput}
                                    onChange={(e) => setPopup(prev => ({ ...prev, memoInput: e.target.value }))}
                                    placeholder="이 구절을 통해 주신 마음을 적어보세요..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                            handleMemoSubmit();
                                        }
                                    }}
                                />
                                <div className="memo-composer-actions">
                                    <button
                                        onClick={handleMemoSubmit}
                                        className="memo-save-btn"
                                    >
                                        <Send size={16} />
                                        저장
                                    </button>
                                    <button
                                        onClick={closeComposer}
                                        className="memo-cancel-btn"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="selection-live-status" role="status" aria-live="polite" aria-atomic="true">
                    {isSelectionMode ? (
                        toolbarAction
                            ? `${activeSelectedVerses.length}개 구절 작업 처리 중`
                            : `${activeSelectedVerses.length}개 구절 선택됨, ${bookName} ${chapter}장 ${selectedVerseRange}절`
                    ) : ''}
                </div>

                {isSelectionMode ? (
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
                                    className="verse-selection-more"
                                    onClick={() => setIsToolbarMoreOpen(open => !open)}
                                    aria-label="선택 도구 더보기"
                                    aria-expanded={isToolbarMoreOpen}
                                    disabled={Boolean(toolbarAction)}
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                                <button
                                    type="button"
                                    className="verse-selection-close"
                                    onClick={() => closeVerseSelection()}
                                    aria-label="구절 선택 종료"
                                    disabled={Boolean(toolbarAction)}
                                >
                                    <X size={20} />
                                </button>
                                {isToolbarMoreOpen && (
                                    <div className="verse-selection-more-menu" role="menu">
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleRemoveSelectionHighlights}
                                            disabled={selectedHighlightedVerses.length === 0 || Boolean(toolbarAction)}
                                        >
                                            <Eraser size={18} />
                                            하이라이트 지우기
                                        </button>
                                    </div>
                                )}
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
                    <nav className={`mobile-reading-action-bar${popup.visible ? ' selection-hidden' : ''}`} aria-label="성경 읽기 작업">
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

const formatVerseRange = (verses) => {
    if (!verses.length) return '';
    const sorted = [...verses].sort((a, b) => a - b);
    let result = [];
    let start = sorted[0];
    let prev = start;

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === prev + 1) {
            prev = sorted[i];
        } else {
            result.push(start === prev ? `${start}` : `${start}-${prev}`);
            start = sorted[i];
            prev = start;
        }
    }
    result.push(start === prev ? `${start}` : `${start}-${prev}`);
    return result.join(', ');
};

export default React.memo(BibleViewer);
