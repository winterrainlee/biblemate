import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import Calendar from '../components/Calendar';
import BibleSelector from '../components/BibleSelector';
import BibleViewer from '../components/BibleViewer';
import NoteEditor from '../components/NoteEditor';
import NotePreview from '../components/NotePreview';
import { api } from '../services/api';
import './ReadingDashboard.css';

const ReadingDashboard = () => {
    // Global State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentBook, setCurrentBook] = useState('Gen');
    const [currentChapter, setCurrentChapter] = useState(1);
    const [currentVersion, setCurrentVersion] = useState('krv');

    // Data State
    const [books, setBooks] = useState([]);
    const [readingLogs, setReadingLogs] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [verses, setVerses] = useState([]);
    const [highlights, setHighlights] = useState([]);

    // Loading State
    const [isLoading, setIsLoading] = useState(true);

    // UI State
    const [completionStatus, setCompletionStatus] = useState('idle'); // idle, loading, success, error
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

    // Split Screen State (R4)
    const [splitRatio, setSplitRatio] = useState(50); // Default 50%
    const [isDragging, setIsDragging] = useState(false);
    const dashboardMainRef = useRef(null);

    // Load split ratio from localStorage
    useEffect(() => {
        const savedRatio = localStorage.getItem('bibleSplitRatio');
        if (savedRatio) {
            const parsed = parseFloat(savedRatio);
            if (!isNaN(parsed) && parsed >= 20 && parsed <= 80) {
                setSplitRatio(parsed);
            }
        }
    }, []);

    // Drag Handlers
    const handleDragStart = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragMove = useCallback((e) => {
        if (!isDragging || !dashboardMainRef.current) return;

        const containerRect = dashboardMainRef.current.getBoundingClientRect();
        // Calculate percentage relative to container width
        // Mouse X relative to container left
        const relativeX = e.clientX - containerRect.left;
        const newRatio = (relativeX / containerRect.width) * 100;

        // Constrain between 20% and 80%
        const constrained = Math.min(Math.max(newRatio, 20), 80);
        setSplitRatio(constrained);
    }, [isDragging]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        localStorage.setItem('bibleSplitRatio', splitRatio.toString());
    }, [splitRatio]);

    // Global Drag Listeners
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        } else {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);


    // Show Toast Helper
    const showToast = (message, type = 'info') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    // Dashboard Config (from Settings)
    const [dashboardConfig, setDashboardConfig] = useState({ showReading: true, showNotes: true });

    // Load dashboard config from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('dashboardConfig');
        if (saved) {
            try {
                setDashboardConfig(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse dashboard config:', e);
            }
        }
    }, []);

    const currentBookName = books.find(b => b.id === currentBook)?.name || currentBook;
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isToday = dateStr === todayStr;

    // 선택된 날짜(dateStr)에 읽었는지 여부
    const isChapterCompleted = readingLogs.some(l => l.date === dateStr && l.book === currentBook && l.chapter === currentChapter);

    // 이전에 읽은 기록들 (오늘 제외)
    const pastLogs = readingLogs.filter(l => l.date !== dateStr && l.book === currentBook && l.chapter === currentChapter);
    const lastReadDate = pastLogs.length > 0 ? pastLogs[0].date : null;

    const handleChapterComplete = async () => {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        // 오늘 날짜의 기록만 찾아서 토글
        const existingLog = readingLogs.find(l => l.date === dateStr && l.book === currentBook && l.chapter === currentChapter);

        setCompletionStatus('loading');
        try {
            if (existingLog) {
                // 이미 오늘 읽은 기록이 있다면 -> 삭제 (읽기 취소)
                await api.removeReadingLog(existingLog.id);
                showToast('읽기 기록이 취소되었습니다.', 'info');
                setCompletionStatus('idle');
            } else {
                // 추가
                const isAlreadyLoggedToday = readingLogs.some(l => l.date === dateStr && l.book === currentBook && l.chapter === currentChapter);
                if (isAlreadyLoggedToday) {
                    showToast('이미 오늘 읽은 장입니다.', 'warning');
                    setCompletionStatus('idle');
                    return;
                }

                await api.addReadingLog({
                    date: dateStr,
                    book: currentBook,
                    chapter: currentChapter,
                    verses_count: verses.length
                });
                showToast('읽기 완료! 참 잘하셨습니다.', 'success');
                setCompletionStatus('success');
                // 잠시 후 success 상태 해제
                setTimeout(() => setCompletionStatus('idle'), 2000);
            }
            loadReadingLogs(); // 이동 없이 로그만 새로고침
        } catch (e) {
            console.error(e);
            showToast('오류가 발생했습니다.', 'error');
            setCompletionStatus('error');
            setTimeout(() => setCompletionStatus('idle'), 2000);
        }
    };

    // Initial Load
    useEffect(() => {
        const init = async () => {
            const booksData = await loadBooks();
            await loadReadingLogs(true, booksData);
        };
        init();
    }, []);

    // Load Note and Logs when Date Changes
    useEffect(() => {
        loadNoteForDate(currentDate);
    }, [currentDate]);

    // Load Bible Content when Location Changes
    useEffect(() => {
        if (currentBook && currentChapter) {
            loadChapter();
            loadHighlights();
        }
    }, [currentBook, currentChapter, currentVersion]);

    // --- API Calls ---
    const loadBooks = async () => {
        try {
            const data = await api.getBooks();
            setBooks(data);
            return data;
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    const [hasInitialMoved, setHasInitialMoved] = useState(false);

    const loadReadingLogs = async (shouldMove = false, booksData = null) => {
        try {
            const logs = await api.getReadingLogs();
            setReadingLogs(logs);

            if (shouldMove && !hasInitialMoved) {
                const targetBooks = booksData || books;
                if (!targetBooks || targetBooks.length === 0) return;

                const todayStr = format(new Date(), 'yyyy-MM-dd');
                const todayLogs = logs.filter(l => l.date === todayStr);

                if (todayLogs.length > 0) {
                    const firstLog = todayLogs[0];
                    setCurrentBook(firstLog.book);
                    setCurrentChapter(firstLog.chapter_from || firstLog.chapter || 1);
                } else if (logs.length > 0) {
                    const sortedLogs = [...logs].sort((a, b) => {
                        if (b.date !== a.date) return b.date.localeCompare(a.date);
                        return b.id - a.id;
                    });
                    const lastLog = sortedLogs[0];
                    const bookMeta = targetBooks.find(b => b.id === lastLog.book);

                    if (bookMeta && lastLog.chapter < bookMeta.chapters) {
                        setCurrentBook(lastLog.book);
                        setCurrentChapter(lastLog.chapter + 1);
                    } else {
                        const bookIndex = targetBooks.findIndex(b => b.id === lastLog.book);
                        if (bookIndex !== -1 && bookIndex < targetBooks.length - 1) {
                            setCurrentBook(targetBooks[bookIndex + 1].id);
                            setCurrentChapter(1);
                        } else {
                            setCurrentBook(targetBooks[0].id);
                            setCurrentChapter(1);
                        }
                    }
                } else {
                    setCurrentBook('Gen');
                    setCurrentChapter(1);
                }
                setHasInitialMoved(true);
            }
        } catch (e) { console.error(e); }
    };

    const loadNoteForDate = async (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        try {
            const note = await api.getNote(dateStr);
            setCurrentNote(note);
        } catch (e) {
            console.error(e);
            setCurrentNote(null);
        }
    };

    const loadChapter = async () => {
        setIsLoading(true);
        try {
            const data = await api.getChapter(currentBook, currentChapter, currentVersion);
            setVerses(data.verses);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const loadHighlights = async () => {
        try {
            const all = await api.getHighlights();
            const filtered = all.filter(h => h.book === currentBook && h.chapter === currentChapter && h.style);
            setHighlights(filtered);
        } catch (e) { console.error(e); }
    };

    const handleHighlight = async (verseNum) => {
        const existing = highlights.find(h => h.book === currentBook && h.verse === verseNum);
        if (existing) {
            await api.removeHighlight(existing.id);
            setHighlights(prev => prev.filter(h => h.id !== existing.id));
        } else {
            const newHl = { book: currentBook, chapter: currentChapter, verse: verseNum, style: '#fef08a' };
            await api.addHighlight(newHl);
            loadHighlights();
        }
    };

    const handleCopyCitation = (verseNum, verseText) => {
        const citation = `[${currentBookName} ${currentChapter}:${verseNum}] ${verseText}`;
        navigator.clipboard.writeText(citation).then(() => {
            // alert('구절이 복사되었습니다.'); 
        });
    };

    const handleAddNote = (verseNum, memo) => {
        const citationPrefix = `[${currentBookName} ${currentChapter}:${verseNum}] `;
        const fullText = `${citationPrefix}${memo}\n`;

        if (noteEditorRef.current) {
            noteEditorRef.current.insertCitation(fullText);
            const editorElement = document.querySelector('.note-editor-wrapper');
            editorElement?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const noteEditorRef = useRef(null);

    const handleNotePreviewClick = () => {
        noteEditorRef.current?.focus();
        const editorElement = document.querySelector('.note-editor-wrapper');
        editorElement?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleBookChange = (bookId) => {
        setCurrentBook(bookId);
        setCurrentChapter(1);
    };

    const shouldShowResizer = dashboardConfig.showReading && dashboardConfig.showNotes;

    return (
        <div className="dashboard-container">
            {/* Left Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-section">
                    <Calendar
                        readingLogs={readingLogs}
                        compact={true}
                        selectedDate={currentDate}
                        onDateClick={(date, logs) => {
                            setCurrentDate(date);
                            if (logs && logs.length > 0) {
                                const log = logs[0];
                                setCurrentBook(log.book);
                                setCurrentChapter(log.chapter_from || log.chapter || 1);
                            }
                        }}
                    />
                </div>

                <div className="sidebar-section">
                    <NotePreview
                        date={dateStr}
                        note={currentNote}
                        readingLogs={readingLogs.filter(l => l.date === dateStr)}
                        books={books}
                        onClick={handleNotePreviewClick}
                    />
                </div>

                <div className="sidebar-section">
                    <BibleSelector
                        books={books}
                        currentBook={currentBook}
                        currentChapter={currentChapter}
                        currentVersion={currentVersion}
                        onBookChange={handleBookChange}
                        onChapterChange={setCurrentChapter}
                        onVersionChange={setCurrentVersion}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main
                className="dashboard-main"
                ref={dashboardMainRef}
                style={{ '--split-ratio': `${splitRatio}%` }}
            >
                {dashboardConfig.showReading && (
                    <div className="bible-viewer-wrapper">
                        <BibleViewer
                            verses={verses}
                            highlights={highlights}
                            onHighlight={handleHighlight}
                            onAddNote={handleAddNote}
                            onCopyCitation={handleCopyCitation}
                            onComplete={handleChapterComplete}
                            isCompleted={isChapterCompleted}
                            isToday={isToday}
                            lastReadDate={lastReadDate}
                            bookName={currentBookName}
                            chapter={currentChapter}
                            completionStatus={completionStatus}
                        />
                    </div>
                )}

                {/* Resizer Divider */}
                {shouldShowResizer && (
                    <div
                        className={`resizer ${isDragging ? 'dragging' : ''}`}
                        onMouseDown={handleDragStart}
                        title="드래그하여 크기 조절"
                    />
                )}

                {dashboardConfig.showNotes && (
                    <div className={`note-editor-wrapper ${!dashboardConfig.showReading ? 'full-height' : ''}`}>
                        <NoteEditor
                            ref={noteEditorRef}
                            date={dateStr}
                            readingLogs={readingLogs.filter(l => l.date === dateStr)}
                            books={books}
                        />
                    </div>
                )}
            </main>

            {/* Global Toast */}
            {toast.visible && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#eab308' : '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 2000,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default ReadingDashboard;
