import React, { useState, useEffect } from 'react';
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

        try {
            if (existingLog) {
                await api.removeReadingLog(existingLog.id);
            } else {
                await api.addReadingLog({
                    date: dateStr,
                    book: currentBook,
                    chapter: currentChapter,
                    verses_count: verses.length
                });
            }
            loadReadingLogs(); // 이동 없이 로그만 새로고침
        } catch (e) { console.error(e); }
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
                    // 오늘 읽은 기록이 있으면 첫 번째 기록으로
                    const firstLog = todayLogs[0];
                    setCurrentBook(firstLog.book);
                    setCurrentChapter(firstLog.chapter_from || firstLog.chapter || 1);
                } else if (logs.length > 0) {
                    // 오늘 기록은 없지만 과거 기록이 있으면 '가장 최신 기록의 다음 장' 계산
                    // logs는 보통 최신순으로 오겠지만, 안전하게 정렬 (date DESC, id DESC)
                    const sortedLogs = [...logs].sort((a, b) => {
                        if (b.date !== a.date) return b.date.localeCompare(a.date);
                        return b.id - a.id;
                    });
                    const lastLog = sortedLogs[0];
                    const bookMeta = targetBooks.find(b => b.id === lastLog.book);

                    if (bookMeta && lastLog.chapter < bookMeta.chapters) {
                        // 같은 책의 다음 장
                        setCurrentBook(lastLog.book);
                        setCurrentChapter(lastLog.chapter + 1);
                    } else {
                        // 다음 책의 1장
                        const bookIndex = targetBooks.findIndex(b => b.id === lastLog.book);
                        if (bookIndex !== -1 && bookIndex < targetBooks.length - 1) {
                            setCurrentBook(targetBooks[bookIndex + 1].id);
                            setCurrentChapter(1);
                        } else {
                            // 성경의 끝이면 창세기 1장으로 순환
                            setCurrentBook(targetBooks[0].id);
                            setCurrentChapter(1);
                        }
                    }
                } else {
                    // 기록이 하나도 없는 신규 사용자
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
            // alert('구절이 복사되었습니다.'); // Optionally silient
        });
    };

    const handleAddNote = (verseNum, memo) => {
        const citationPrefix = `[${currentBookName} ${currentChapter}:${verseNum}] `;
        const fullText = `${citationPrefix}${memo}\n`;

        if (noteEditorRef.current) {
            noteEditorRef.current.insertCitation(fullText);
            // Scroll to editor if needed
            const editorElement = document.querySelector('.note-editor-wrapper');
            editorElement?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const noteEditorRef = React.useRef(null);

    const handleNotePreviewClick = () => {
        noteEditorRef.current?.focus();
        // On mobile, we might also want to scroll to editor
        const editorElement = document.querySelector('.note-editor-wrapper');
        editorElement?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleBookChange = (bookId) => {
        setCurrentBook(bookId);
        setCurrentChapter(1);
    };

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
                            // 해당 날짜에 읽기 기록이 있으면 첫 번째 기록의 본문으로 이동
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
            <main className="dashboard-main">
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
                        />
                    </div>
                )}

                {dashboardConfig.showNotes && (
                    <div className="note-editor-wrapper">
                        <NoteEditor
                            ref={noteEditorRef}
                            date={dateStr}
                            readingLogs={readingLogs.filter(l => l.date === dateStr)}
                            books={books}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReadingDashboard;
