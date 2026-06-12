import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import Calendar from '../components/Calendar';
import BibleSelector from '../components/BibleSelector';
import BibleViewer from '../components/BibleViewer';
import NotePreview from '../components/NotePreview';
import JournalPage from './JournalPage';
import { api } from '../services/api';
import { useTab } from '../contexts/TabContext';
import { parseDateInput } from '../utils/dateOnly';
import './ReadingDashboard.css';

const ReadingDashboard = () => {
    const { activeTab, setActiveTab } = useTab();
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

    // UI State
    const [completionStatus, setCompletionStatus] = useState('idle'); // idle, loading, success, error
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

    // Show Toast Helper
    const showToast = (message, type = 'info') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    // Highlight Labels (UX1)
    const [highlightLabels, setHighlightLabels] = useState(() => {
        try {
            const saved = localStorage.getItem('highlightLabels_v2');
            return saved ? JSON.parse(saved) : {
                'yellow': '1',
                'green': '2',
                'blue': '3',
                'red': '4'
            };
        } catch {
            return {
                'yellow': '1',
                'green': '2',
                'blue': '3',
                'red': '4'
            };
        }
    });

    // Force sync highlight labels on mount and focus/visible to ensure updates from Settings are reflected
    useEffect(() => {
        const loadLabels = async () => {
            try {
                // 1. Try server first
                const settings = await api.getSettings();
                if (settings && settings.highlightLabels_v2) {
                    const serverLabels = settings.highlightLabels_v2;
                    setHighlightLabels(serverLabels);
                    localStorage.setItem('highlightLabels_v2', JSON.stringify(serverLabels));
                    return;
                }

                // 2. Fallback to localStorage
                const saved = localStorage.getItem('highlightLabels_v2');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setHighlightLabels(parsed);
                }
            } catch (e) {
                console.error('Failed to sync highlight labels', e);
                // Fallback to localStorage on error
                const saved = localStorage.getItem('highlightLabels_v2');
                if (saved) {
                    try {
                        setHighlightLabels(JSON.parse(saved));
                    } catch {
                        console.warn('Invalid highlight label settings in localStorage');
                    }
                }
            }
        };

        loadLabels(); // Run immediately
        window.addEventListener('focus', loadLabels); // Run on tab focus
        window.addEventListener('highlightLabelsUpdated', loadLabels); // [NEW] Sync on custom event
        return () => {
            window.removeEventListener('focus', loadLabels);
            window.removeEventListener('highlightLabelsUpdated', loadLabels);
        };
    }, []);

    const currentBookName = books.find(b => b.id === currentBook)?.name || currentBook;
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isToday = dateStr === todayStr;

    // 선택된 날짜(dateStr)에 읽었는지 여부 (날짜 상관없이 읽은 기록이 있으면 True)
    const isChapterCompleted = readingLogs.some(l => l.book === currentBook && l.chapter == currentChapter);

    // 가장 최근 읽은 기록 (오늘 포함 모든 기록 중 최신)
    const allLogs = readingLogs.filter(l => l.book === currentBook && l.chapter == currentChapter);
    let lastReadDate = allLogs.length > 0 ? allLogs[0].date : null;
    if (lastReadDate === todayStr) lastReadDate = '오늘';

    // --- API Calls ---
    const loadBooks = useCallback(async () => {
        try {
            const data = await api.getBooks();
            setBooks(data);
            return data;
        } catch (e) {
            console.error(e);
            return [];
        }
    }, []);

    const hasInitialMovedRef = useRef(false);

    const loadReadingLogs = useCallback(async (shouldMove = false, booksData = []) => {
        try {
            const logs = await api.getReadingLogs();
            // [Fix] Ensure chapter numbers are actually numbers to prevent sync issues
            const sanitizedLogs = logs.map(log => ({
                ...log,
                chapter: Number(log.chapter),
                chapter_from: Number(log.chapter_from), // Keep original if exists
                chapter_to: Number(log.chapter_to)
            }));
            setReadingLogs(sanitizedLogs);

            if (shouldMove && !hasInitialMovedRef.current) {
                const targetBooks = booksData;
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
                hasInitialMovedRef.current = true;
            }
        } catch (e) { console.error(e); }
    }, []);

    const loadNoteForDate = useCallback(async (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        try {
            const note = await api.getNote(dateStr);
            setCurrentNote(note);
        } catch (e) {
            console.error(e);
            setCurrentNote(null);
        }
    }, []);

    const loadChapter = useCallback(async () => {
        try {
            const data = await api.getChapter(currentBook, currentChapter, currentVersion);
            setVerses(data.verses);
        } catch (e) { console.error(e); }
    }, [currentBook, currentChapter, currentVersion]);

    const loadHighlights = useCallback(async () => {
        try {
            const all = await api.getHighlights();
            const filtered = all.filter(h => h.book === currentBook && h.chapter === currentChapter && h.style);
            setHighlights(filtered);
        } catch (e) { console.error(e); }
    }, [currentBook, currentChapter]);

    const handleChapterComplete = async () => {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        // 오늘 날짜의 기록만 찾아서 토글
        const existingLog = readingLogs.find(l => l.date === dateStr && l.book === currentBook && l.chapter == currentChapter);

        setCompletionStatus('loading');
        try {
            if (existingLog) {
                // 이미 오늘 읽은 기록이 있다면 -> 삭제 (읽기 취소)
                await api.removeReadingLog(existingLog.id);
                showToast('읽기 기록이 취소되었습니다.', 'info');
                setCompletionStatus('idle');
            } else {
                // 추가
                const isAlreadyLoggedToday = readingLogs.some(l => l.date === dateStr && l.book === currentBook && l.chapter == currentChapter);
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

            const pendingLocation = localStorage.getItem('pendingBibleLocation');
            if (pendingLocation) {
                try {
                    const parsed = JSON.parse(pendingLocation);
                    if (parsed?.book && parsed?.chapter) {
                        setCurrentBook(parsed.book);
                        setCurrentChapter(Number(parsed.chapter));
                        setActiveTab('bible');
                    }
                } catch {
                    console.warn('Invalid pending Bible location');
                } finally {
                    localStorage.removeItem('pendingBibleLocation');
                }
            }
        };
        init();
    }, [loadBooks, loadReadingLogs, setActiveTab]);

    // Load Note and Logs when Date Changes
    useEffect(() => {
        loadNoteForDate(currentDate);
    }, [currentDate, loadNoteForDate]);

    // Load Bible Content when Location Changes
    useEffect(() => {
        if (currentBook && currentChapter) {
            loadChapter();
            loadHighlights();
        }
    }, [currentBook, currentChapter, loadChapter, loadHighlights]);

    const handleHighlight = async (verseNum, color = '#fef08a') => {
        const existing = highlights.find(h => h.book === currentBook && h.verse === verseNum);

        if (existing) {
            if (existing.style === color) {
                // Toggle off if same color
                await api.removeHighlight(existing.id);
                setHighlights(prev => prev.filter(h => h.id !== existing.id));
            } else {
                // Update color if different (Server uses INSERT OR REPLACE)
                const updatedHl = { book: currentBook, chapter: currentChapter, verse: verseNum, style: color };
                await api.addHighlight(updatedHl);
                loadHighlights();
            }
        } else {
            // New highlight
            const newHl = { book: currentBook, chapter: currentChapter, verse: verseNum, style: color };
            await api.addHighlight(newHl);
            loadHighlights();
        }
    };

    const handleCopyCitation = (verseNum, verseText) => {
        const citation = `[${currentBookName} ${currentChapter}:${verseNum}] ${verseText}`;
        const copyText = async () => {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(citation);
                return;
            }

            const textarea = document.createElement('textarea');
            textarea.value = citation;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        };

        copyText()
            .then(() => showToast('구절을 복사했습니다.', 'success'))
            .catch((error) => {
                console.error('Failed to copy verse:', error);
                showToast('복사에 실패했습니다.', 'error');
            });
    };

    const handleNotePreviewClick = () => {
        // v2.0: Note preview click action can be defined here (e.g. open popup)
        // Currently NoteEditor is removed from main view
    };

    const handleBookChange = (bookId, chapterId = 1) => {
        setCurrentBook(bookId);
        setCurrentChapter(chapterId);
    };

    const handleNavigateToJournal = (targetDate = null) => {
        if (targetDate) {
            // '오늘' 문자열 처리 또는 YYYY-MM-DD 파싱
            const d = targetDate === '오늘' ? new Date() : parseDateInput(targetDate);
            if (d) setCurrentDate(d);
        }
        setActiveTab('journal');
    };

    const handleNavigateToBible = (book, chapter) => {
        setCurrentBook(book);
        setCurrentChapter(chapter);
        setActiveTab('bible');
    };

    return (
        <div className={`dashboard-container ${activeTab === 'bible' ? 'bible-mode-active' : ''}`}>
            {/* Left Sidebar - Only show on Bible tab */}
            {activeTab === 'bible' && (
                <aside className="dashboard-sidebar">
                    {/* v1.4.1: hideCalendarOnMobile 적용 - CSS media query로 숨김 처리 */}
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
            )}

            {/* Main Content */}
            <main className="dashboard-main">
                {/* V2.0: Conditional rendering based on active tab */}
                {activeTab === 'bible' ? (
                    <div className="bible-viewer-wrapper" style={{ width: '100%' }}>
                        <BibleViewer
                            verses={verses}
                            highlights={highlights}
                            onHighlight={handleHighlight}
                            onCopyCitation={handleCopyCitation}
                            onToast={showToast}
                            onComplete={handleChapterComplete}
                            onNavigateToJournal={() => handleNavigateToJournal(lastReadDate)}
                            isCompleted={isChapterCompleted}
                            highlightLabels={highlightLabels}
                            isToday={isToday}
                            lastReadDate={lastReadDate}
                            isReadOnCurrentDate={readingLogs.some(l => l.date === dateStr && l.book === currentBook && l.chapter == currentChapter)}
                            book={currentBook}
                            bookName={currentBookName}
                            chapter={currentChapter}
                            completionStatus={completionStatus}
                            books={books}
                            currentBook={currentBook}
                            currentChapter={currentChapter}
                            currentVersion={currentVersion}
                            onBookChange={handleBookChange}
                            onChapterChange={setCurrentChapter}
                            onVersionChange={setCurrentVersion}
                        />
                    </div>
                ) : (
                    <JournalPage
                        date={currentDate}
                        onDateChange={setCurrentDate}
                        readingLogs={readingLogs}
                        books={books}
                        onNavigateToBible={handleNavigateToBible}
                    />
                )}
            </main>

            {/* Global Toast */}
            {toast.visible && (
                <div style={{
                    position: 'fixed',
                    bottom: 'calc(24px + var(--pk-safe-area-bottom))',
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
