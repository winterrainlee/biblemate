
import React, { useState, useEffect, useRef } from 'react';
import { Check, Highlighter, MessageSquare, Copy, X, Send, Loader, ChevronLeft, ChevronRight, Settings, Trash2, Edit2, Eraser } from 'lucide-react';
import { getVerseNotesByChapter, saveVerseNote, deleteVerseNote } from '../services/journalApi';
import { format } from 'date-fns';
import './BibleViewer.css';

const BibleViewer = ({
    item, // Optional object including book/chapter
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
    onAddNote,
    onCopyCitation,
    onNavigateToJournal, // [NEW] Link to Journal tab
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
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

    // [NEW] Swipe handlers for mobile chapter navigation
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
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
                quoteText: selectedText
            }));
        }
    };

    const handleHighlightClick = () => {
        onHighlight(popup.verseNum);
        setPopup(prev => ({ ...prev, visible: false }));
    };

    const handleCopyClick = () => {
        onCopyCitation(popup.verseNum, popup.verseText);
        setPopup(prev => ({ ...prev, visible: false }));
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
                        fontSize: '0.9rem',
                        fontStyle: 'italic',
                        fontFamily: 'Nanum Myeongjo, serif',
                        color: 'var(--pk-color-text-secondary)',
                        padding: '8px',
                        backgroundColor: 'var(--pk-color-bg-secondary)',
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--pk-color-primary-light, #e0e7ff)',
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleEditNote(n)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--pk-color-text-secondary)', padding: '2px' }} title="수정">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteNote(n.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--pk-color-danger)', padding: '2px' }} title="삭제">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {renderNoteContent(n.content)}
                            <div className="note-date">{new Date(n.created_at || n.date).toLocaleDateString()}</div>
                        </div>
                    ))}
                    {leftNotes.length === 0 && !isLoadingNotes && (
                        <div className="empty-side-note">전반부 묵상이 없습니다.</div>
                    )}
                </div>
            </aside>

            {/* 중앙 본문 영역 */}
            <main className="bible-main-content">
                <header className="bible-nav-header">
                    <div className="nav-controls-container">
                        {/* Previous Chapter Button */}
                        <button
                            className="nav-btn prev"
                            onClick={handlePrevChapter}
                            disabled={!currentBook || (currentBook === books[0]?.id && currentChapter === 1)}
                            title="이전 장"
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
                </header>



                <div className="bible-text-grid">
                    {verses.length > 0 ? (
                        verses.map(v => {
                            const hlColor = getHighlightStyle(v.verse);
                            const hasNote = chapterNotes.some(n => n.verse == v.verse);
                            const isSelected = selectedVerses.includes(v.verse);
                            return (
                                <div
                                    key={v.verse}
                                    className={`verse-row ${hlColor ? 'has-highlight' : ''}`}
                                    style={{
                                        ...(hlColor ? { backgroundColor: hlColor } : {}),
                                        ...(isSelected ? {
                                            backgroundColor: 'var(--pk-color-primary-light, #e0e7ff)',
                                            boxShadow: 'inset 3px 0 0 var(--pk-color-primary)'
                                        } : {})
                                    }}
                                    onClick={(e) => handleVerseClick(e, v)}
                                    onMouseDown={(e) => e.stopPropagation()} // Prevent document click outside
                                >
                                    <span className="verse-num">{v.verse}</span>
                                    <span className={`verse-content ${hasNote ? 'has-note' : ''}`}>
                                        {v.text || v.content || ''}
                                        {hasNote && <span className="note-indicator">📝</span>}
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
                                {isToday ? '오늘 읽음' : '읽음'}
                            </>
                        ) : (
                            isToday ? '오늘 읽음 표시하기' : '읽음 표시하기'
                        )}
                    </button>
                    {isReadOnCurrentDate && (
                        <p className="chapter-complete-msg">
                            {isToday ? '오늘 성경 읽기를 완료했습니다.' : `${lastReadDate}에 성경 읽기가 완료되었습니다.`}
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
                        className="verse-popup"
                        style={{ left: popup.x, top: popup.y, cursor: 'move' }}
                        onMouseDown={handleMouseDown}
                    >
                        {popup.mode === 'view-notes' ? (
                            <div className="popup-menu-v2">
                                <div className="popup-header">
                                    <span className="popup-title">
                                        {bookName} {chapter}:{popupVerseRef} 묵상 ({chapterNotes.filter(n => n.verse === popup.verseNum).length}개)
                                    </span>
                                    <button
                                        onClick={() => setPopup(prev => ({ ...prev, mode: 'menu' }))}
                                        className="popup-close-btn"
                                        title="뒤로가기"
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
                                    {chapterNotes.filter(n => n.verse === popup.verseNum).map(note => (
                                        <div key={note.id} className="verse-note-card-v2" style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                <div className="note-date">{new Date(note.created_at || note.date).toLocaleDateString()}</div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleEditNote(note)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--pk-color-text-secondary)', padding: '2px' }} title="수정">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteNote(note.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--pk-color-danger)', padding: '2px' }} title="삭제">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
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
                                        {bookName} {chapter}:{popupVerseRef}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setPopup(prev => ({ ...prev, visible: false }));
                                            setSelectedVerses([]);
                                        }}
                                        className="popup-close-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
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
                                                    setPopup(prev => ({ ...prev, visible: false }));
                                                    setSelectedVerses([]);
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
                                                    backgroundColor: '#f3f4f6',
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
                                                    setPopup(prev => ({ ...prev, visible: false }));
                                                    setSelectedVerses([]);
                                                }}
                                                title="하이라이트 지우기"
                                            >
                                                <Eraser size={24} />
                                            </button>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--pk-color-text-tertiary)' }}>지우기</span>
                                        </div>
                                    )}
                                </div>
                                {chapterNotes.some(n => n.verse === popup.verseNum) && (
                                    <button className="action-btn" onClick={() => setPopup(prev => ({ ...prev, mode: 'view-notes' }))}>
                                        <BookOpenIcon size={16} /> 묵상 보기 ({chapterNotes.filter(n => n.verse === popup.verseNum).length})
                                    </button>
                                )}
                                <button className="action-btn" onClick={() => setPopup(prev => ({ ...prev, mode: 'memo' }))}><MessageSquare size={16} /> 묵상하기</button>
                                <button className="action-btn" onClick={handleCopyClick}><Copy size={16} /> 구절 복사</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px', width: '100%' }}>
                                <div className="popup-header">
                                    <span className="popup-title">
                                        {bookName} {chapter}:{popupVerseRef} 묵상
                                    </span>
                                    <button
                                        onClick={() => {
                                            setPopup(prev => ({ ...prev, mode: 'menu' }));
                                            if (popup.visible) {
                                                setPopup(prev => ({ ...prev, visible: false }));
                                                setSelectedVerses([]);
                                            }
                                        }}
                                        className="popup-close-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                {
                                    /* v2.1: Quote Checkbox & Editable Area */
                                }
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <input
                                        type="checkbox"
                                        id="quote-check"
                                        checked={popup.quoteEnabled}
                                        onChange={(e) => setPopup(prev => ({ ...prev, quoteEnabled: e.target.checked }))}
                                        style={{ accentColor: 'var(--pk-color-primary)', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="quote-check" style={{ fontSize: '0.9rem', color: 'var(--pk-color-text)', cursor: 'pointer', fontWeight: '500' }}>
                                        말씀 인용
                                    </label>
                                </div>

                                {popup.quoteEnabled && (
                                    <textarea
                                        value={popup.quoteText}
                                        onChange={(e) => setPopup(prev => ({ ...prev, quoteText: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            minHeight: '60px',
                                            padding: '8px',
                                            fontSize: '0.9rem',
                                            fontStyle: 'italic',
                                            fontFamily: 'Nanum Myeongjo, serif',
                                            color: 'var(--pk-color-text-secondary)',
                                            backgroundColor: 'var(--pk-color-bg-secondary)',
                                            borderRadius: '4px',
                                            border: '1px solid var(--pk-color-border)',
                                            borderLeft: '3px solid var(--pk-color-primary-light, #e0e7ff)',
                                            resize: 'vertical',
                                            outline: 'none',
                                            marginBottom: '4px'
                                        }}
                                    />
                                )}
                                <textarea
                                    autoFocus
                                    value={popup.memoInput}
                                    onChange={(e) => setPopup(prev => ({ ...prev, memoInput: e.target.value }))}
                                    placeholder="이 구절을 통해 주신 마음을 적어보세요..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '10px',
                                        borderRadius: 'var(--pk-radius-md)',
                                        border: '1px solid var(--pk-color-border)',
                                        fontSize: '0.95rem',
                                        backgroundColor: 'var(--pk-color-bg)',
                                        color: 'var(--pk-color-text)',
                                        resize: 'none',
                                        lineHeight: '1.5'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                            handleMemoSubmit();
                                        }
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={handleMemoSubmit}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '10px',
                                            backgroundColor: 'var(--pk-color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--pk-radius-md)',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <Send size={16} />
                                        저장
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPopup(prev => ({ ...prev, visible: false, editTargetDate: null }));
                                            setSelectedVerses([]);
                                        }}
                                        style={{
                                            padding: '10px 16px',
                                            backgroundColor: 'var(--pk-color-bg-secondary)',
                                            color: 'var(--pk-color-text-secondary)',
                                            border: '1px solid var(--pk-color-border)',
                                            borderRadius: 'var(--pk-radius-md)',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            fontWeight: '500',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </main>

            {/* 우측 사이드바: 중간절+1 ~ 마지막절 묵상 */}
            <aside className="bible-side-panel right">
                <div className="side-panel-content">
                    {rightNotes.map(n => (
                        <div key={n.id} className="verse-note-card-v2" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="note-ref">{bookName} {chapter}:{n.verse_range || n.verse}</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleEditNote(n)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--pk-color-text-secondary)', padding: '2px' }} title="수정">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteNote(n.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--pk-color-danger)', padding: '2px' }} title="삭제">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {renderNoteContent(n.content)}
                            <div className="note-date">{new Date(n.created_at || n.date).toLocaleDateString()}</div>
                        </div>
                    ))}
                    {rightNotes.length === 0 && !isLoadingNotes && (
                        <div className="empty-side-note">후반부 묵상이 없습니다.</div>
                    )}
                </div>
            </aside>
        </div>
    );
};

// Helper Icon
const BookOpenIcon = ({ size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

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
