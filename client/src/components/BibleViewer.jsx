
import React, { useState, useEffect, useRef } from 'react';
import { Check, MessageSquare, Copy, X, Send, Loader, ChevronLeft, ChevronRight, Trash2, Edit2, Eraser, BookOpen } from 'lucide-react';
import { getVerseNotesByChapter, saveVerseNote, deleteVerseNote } from '../services/journalApi';
import { format } from 'date-fns';
import './BibleViewer.css';

const BibleViewer = ({
    verses = [],
    highlights = [],
    onHighlight,
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
    const [selectedVerses, setSelectedVerses] = useState([]);
    const [copiedNoteId, setCopiedNoteId] = useState(null);
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
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });
    const closeVersePopup = () => {
        setPopup(prev => ({ ...prev, visible: false, verseRange: null, editTargetDate: null }));
        setSelectedVerses([]);
    };

    // [NEW] Swipe handlers for mobile chapter navigation
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;
    const isInteractiveTouchTarget = (target) => {
        return Boolean(target?.closest?.(
            'button, input, textarea, select, a, [contenteditable="true"], .verse-popup, .mobile-sheet, .mobile-reading-action-bar'
        ));
    };

    const onTouchStart = (e) => {
        if (popup.visible || isInteractiveTouchTarget(e.target)) {
            setTouchStart(null);
            setTouchEnd(null);
            return;
        }
        setTouchEnd(null);
        setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    };
    const onTouchMove = (e) => setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distX = touchStart.x - touchEnd.x;
        const distY = Math.abs(touchStart.y - touchEnd.y);
        // Ignore if vertical movement is greater (scrolling, not swiping)
        if (Math.abs(distX) < minSwipeDistance || distY > Math.abs(distX)) return;

        if (distX > 0) {
            handleNextChapter();
        } else {
            handlePrevChapter();
        }
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
                setPopup(prev => ({ ...prev, visible: false }));
                setSelectedVerses([]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setPopup(prev => ({ ...prev, visible: false }));
                setSelectedVerses([]);
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
        e.stopPropagation(); // Prevent popup from closing (outside click detection)

        let newSelected = [];
        if (popup.visible) {
            // Toggle selection if popup is open
            if (selectedVerses.includes(verse.verse)) {
                newSelected = selectedVerses.filter(v => v !== verse.verse);
            } else {
                newSelected = [...selectedVerses, verse.verse];
            }
        } else {
            // Start new selection
            newSelected = [verse.verse];
        }

        newSelected.sort((a, b) => a - b);
        setSelectedVerses(newSelected);

        // If nothing selected (all deselected), close popup
        if (newSelected.length === 0) {
            setPopup(prev => ({ ...prev, visible: false }));
            return;
        }

        // Aggregate Text for Quote
        const selectedText = verses
            .filter(v => newSelected.includes(v.verse))
            .map(v => newSelected.length > 1 ? `(${v.verse}) ${v.text || v.content}` : (v.text || v.content))
            .join(' ');

        // Primary verse (first one)
        const primaryVerseNum = newSelected[0];

        if (!popup.visible) {
            // Center popup initially (Desktop & Mobile)
            const popupWidth = Math.min(420, window.innerWidth * 0.9);
            const popupHeight = 300; // approx
            const centerX = (window.innerWidth - popupWidth) / 2;
            const centerY = (window.innerHeight - popupHeight) / 2;

            setPopup({
                visible: true,
                x: centerX,
                y: Math.max(20, centerY), // Avoid top cut off
                verseNum: primaryVerseNum,
                verseText: selectedText,
                mode: 'menu',
                memoInput: '',
                quoteEnabled: false,
                quoteText: selectedText
            });
        } else {
            // Update popup context
            setPopup(prev => ({
                ...prev,
                verseNum: primaryVerseNum,
                verseText: selectedText,
                quoteText: selectedText
            }));
        }
    };

    const handleCopyClick = () => {
        onCopyCitation(popup.verseNum, popup.verseText);
        setPopup(prev => ({ ...prev, visible: false }));
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
        setSelectedVerses([verse.verse]);
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

    const openMemoComposer = () => {
        setPopup(prev => ({ ...prev, mode: 'memo', quoteEnabled: false }));
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
            <main className="bible-main-content" style={{ '--bible-text-scale': bibleTextScale / 100 }}>
                <header className={`bible-nav-header${popup.visible ? ' selection-mode' : ''}`}>
                    <div className="mobile-context-row">
                        <button
                            className="mobile-context-trigger"
                            onClick={() => setIsMobileSelectorOpen(true)}
                            aria-label={`${bookName} ${chapter}장, ${currentVersionLabel} 선택`}
                        >
                            <span className="mobile-context-primary">{bookName} {chapter}장 · 오늘 이어 읽기</span>
                            <span className="mobile-context-secondary">{currentVersionLabel} ▼</span>
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
                            이 장의 묵상 {chapterNotes.length}개 보기
                        </button>
                        <button
                            className="mobile-reading-settings-btn"
                            onClick={() => setIsReadingSettingsOpen(true)}
                        >
                            Aa
                        </button>
                    </div>
                </header>

                {isMobileSelectorOpen && (
                    <div className="mobile-sheet-backdrop" onClick={() => setIsMobileSelectorOpen(false)}>
                        <section className="mobile-sheet" onClick={(e) => e.stopPropagation()} aria-label="본문 선택">
                            <div className="mobile-sheet-handle" />
                            <div className="mobile-sheet-header">
                                <div>
                                    <div className="mobile-sheet-title">본문 선택</div>
                                    <div className="mobile-sheet-subtitle">{bookName} {chapter}장 · {currentVersionLabel}</div>
                                </div>
                                <button className="mobile-sheet-close" onClick={() => setIsMobileSelectorOpen(false)} aria-label="닫기">
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
                        <section className="mobile-sheet chapter-notes-sheet" onClick={(e) => e.stopPropagation()} aria-label="이 장의 묵상">
                            <div className="mobile-sheet-handle" />
                            <div className="mobile-sheet-header">
                                <div>
                                    <div className="mobile-sheet-title">{bookName} {chapter}장 묵상</div>
                                    <div className="mobile-sheet-subtitle">이 장의 묵상 {chapterNotes.length}개</div>
                                </div>
                                <button className="mobile-sheet-close" onClick={() => setIsChapterNotesOpen(false)} aria-label="닫기">
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
                        <section className="mobile-sheet" onClick={(e) => e.stopPropagation()} aria-label="본문 가독성 설정">
                            <div className="mobile-sheet-handle" />
                            <div className="mobile-sheet-header">
                                <div>
                                    <div className="mobile-sheet-title">본문 가독성</div>
                                    <div className="mobile-sheet-subtitle">성경 본문에만 적용됩니다</div>
                                </div>
                                <button className="mobile-sheet-close" onClick={() => setIsReadingSettingsOpen(false)} aria-label="닫기">
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
                            const isSelected = selectedVerses.includes(v.verse);
                            return (
                                <div
                                    id={`verse-${v.verse}`}
                                    key={v.verse}
                                    className={`verse-row ${hlColor ? 'has-highlight' : ''}`}
                                    style={{
                                        ...(hlColor ? { backgroundColor: hlColor } : {}),
                                        ...(isSelected ? {
                                            backgroundColor: 'var(--pk-color-primary-light)',
                                            boxShadow: 'inset 3px 0 0 var(--pk-color-primary)'
                                        } : {})
                                    }}
                                    onClick={(e) => handleVerseClick(e, v)}
                                    onMouseDown={(e) => e.stopPropagation()} // Prevent document click outside
                                >
                                    <span className="verse-num">{v.verse}</span>
                                    <span className={`verse-content ${hasNote ? 'has-note' : ''}`}>
                                        {v.text || v.content || ''}
                                        {hasNote && (
                                            <button
                                                className="note-indicator"
                                                onClick={(e) => openVerseNotes(v, e)}
                                                aria-label={`${bookName} ${chapter}:${v.verse} 묵상 보기`}
                                            >
                                                📝
                                            </button>
                                        )}
                                    </span>
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
                                        onClick={() => setPopup(prev => ({ ...prev, mode: 'menu' }))}
                                        className="popup-close-btn"
                                        title="뒤로가기"
                                        aria-label="구절 메뉴로 돌아가기"
                                    >
                                        <ChevronLeft size={18} />
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
                        ) : popup.mode === 'menu' ? (
                            <div className="popup-menu-v2">
                                <div className="popup-header">
                                    <span className="popup-title">
                                        {selectedVerses.length > 1 ? `${selectedVerses.length}개 구절 선택됨` : `${bookName} ${chapter}:${popupVerseRef}`}
                                    </span>
                                    <button
                                        onClick={() => {
                                            closeVersePopup();
                                        }}
                                        className="popup-close-btn"
                                        aria-label="닫기"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                {popup.verseText && (
                                    <div className="view-notes-verse-text">
                                        &ldquo;{popup.verseText}&rdquo;
                                    </div>
                                )}
                                <button className="action-btn primary-action" onClick={openMemoComposer}>
                                    <MessageSquare size={16} /> 이 말씀 묵상하기
                                </button>
                                {getNotesForVerse(popup.verseNum).length > 0 && (
                                    <button className="action-btn" onClick={() => setPopup(prev => ({ ...prev, mode: 'view-notes' }))}>
                                        <BookOpen size={16} /> 묵상 보기 ({getNotesForVerse(popup.verseNum).length})
                                    </button>
                                )}
                                <div className="highlight-palette">
                                    {[
                                        { key: 'yellow', color: 'var(--pk-highlight-yellow)' },
                                        { key: 'green', color: 'var(--pk-highlight-green)' },
                                        { key: 'blue', color: 'var(--pk-highlight-blue)' },
                                        { key: 'red', color: 'var(--pk-highlight-red)' }
                                    ].map(item => (
                                        <div key={item.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <button
                                                className="palette-color-btn"
                                                style={{ backgroundColor: item.color }}
                                                onClick={() => {
                                                    if (selectedVerses.length > 0) {
                                                        selectedVerses.forEach(v => onHighlight(v, item.color));
                                                    } else {
                                                        onHighlight(popup.verseNum, item.color);
                                                    }
                                                    closeVersePopup();
                                                }}
                                                title={highlightLabels?.[item.key] || item.key}
                                            />
                                            <span style={{ fontSize: '0.7rem', color: 'var(--pk-color-text-tertiary)', maxWidth: '36px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {highlightLabels?.[item.key] || (
                                                    item.key === 'yellow' ? '1' :
                                                        item.key === 'green' ? '2' :
                                                            item.key === 'blue' ? '3' : '4'
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                    {(selectedVerses.length > 0 ? selectedVerses.some(v => highlights.some(h => h.verse === v)) : highlights.find(h => h.verse === popup.verseNum)) && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <button
                                                className="palette-color-btn"
                                                style={{
                                                    backgroundColor: 'var(--pk-color-bg-secondary)',
                                                    color: 'var(--pk-color-text-secondary)',
                                                    border: '1px solid var(--pk-color-border)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                onClick={() => {
                                                    const targets = selectedVerses.length > 0 ? selectedVerses : [popup.verseNum];
                                                    targets.forEach(v => {
                                                        const existing = highlights.find(h => h.verse === v);
                                                        if (existing) {
                                                            onHighlight(v, existing.style);
                                                        }
                                                    });
                                                    closeVersePopup();
                                                }}
                                                title="하이라이트 지우기"
                                            >
                                                <Eraser size={24} />
                                            </button>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--pk-color-text-tertiary)' }}>지우기</span>
                                        </div>
                                    )}
                                </div>
                                <button className="action-btn" onClick={handleCopyClick}><Copy size={16} /> 말씀 복사</button>
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
