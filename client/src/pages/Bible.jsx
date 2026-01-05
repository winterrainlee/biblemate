import React, { useState, useEffect } from 'react';
import BibleSelector from '../components/BibleSelector';
import BibleViewer from '../components/BibleViewer';
import { api } from '../services/api';
import { format } from 'date-fns';

const Bible = () => {
    // State
    const [books, setBooks] = useState([]);
    const [currentBook, setCurrentBook] = useState('Gen'); // Default Genesis
    const [currentChapter, setCurrentChapter] = useState(1);
    const [currentVersion, setCurrentVersion] = useState('krv');

    const [verses, setVerses] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [readingLogs, setReadingLogs] = useState([]); // To check if completed

    // Initial Load: Books
    useEffect(() => {
        loadBooks();
        loadReadingLogs();
    }, [currentVersion]); // Reload books if version changes (for chapter consistency)

    // Load Chapter Content
    useEffect(() => {
        if (currentBook && currentChapter) {
            loadChapter();
            loadHighlights();
        }
    }, [currentBook, currentChapter, currentVersion]);

    const loadBooks = async () => {
        try {
            const data = await api.getBooks(); // getBooks needs to be implemented in API service (it is)
            setBooks(data);
        } catch (error) {
            console.error('Failed to load books', error);
        }
    };

    const loadChapter = async () => {
        try {
            const data = await api.getChapter(currentBook, currentChapter, currentVersion);
            setVerses(data.verses);
            window.scrollTo(0, 0); // Scroll to top on chapter change
        } catch (error) {
            console.error('Failed to load chapter', error);
        }
    };

    const loadHighlights = async () => {
        // API should support filtering by book/chapter or we fetch all and filter client side
        // Implementing client side filter for now as API getHighlights returns all
        try {
            const allHighlights = await api.getHighlights();
            // Filter for current chapter
            const filtered = allHighlights.filter(
                h => h.book === currentBook && h.chapter === currentChapter && h.style // Ensure style exists
            );
            setHighlights(filtered);
        } catch (error) {
            console.error('Failed to load highlights', error);
        }
    };

    const loadReadingLogs = async () => {
        try {
            const logs = await api.getReadingLogs();
            setReadingLogs(logs);
        } catch (error) {
            console.error('Err logs', error);
        }
    };

    // Handlers
    const handleBookChange = (bookId) => {
        setCurrentBook(bookId);
        setCurrentChapter(1); // Reset to chapter 1
    };

    const handleChapterChange = (chapter) => {
        setCurrentChapter(chapter);
    };

    const handleVersionChange = (version) => {
        setCurrentVersion(version);
    };

    const handleHighlight = async (verseNum) => {
        // Toggle logic: If exists, remove. If not, add (default yellow).
        const existing = highlights.find(h => h.verse === verseNum);

        if (existing) {
            // Remove
            try {
                await api.removeHighlight(existing.id); // API needs delete endpoint
                setHighlights(prev => prev.filter(h => h.verse !== verseNum));
            } catch (e) { console.error(e); }
        } else {
            // Add
            const newHl = {
                book: currentBook,
                chapter: currentChapter,
                verse: verseNum,
                style: '#fef08a' // Default yellow
            };
            try {
                await api.addHighlight(newHl);
                // Refresh highlights to get ID
                loadHighlights();
            } catch (e) { console.error(e); }
        }
    };

    const handleComplete = async () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        try {
            await api.addReadingLog({
                date: today,
                book: currentBook,
                chapter: currentChapter,
                verses_count: verses.length
            });
            // Update logs state to reflect completion immediately
            loadReadingLogs();
            alert('읽기 완료가 기록되었습니다! 🎉');
        } catch (error) {
            console.error('Log failed', error);
            alert('기록 실패');
        }
    };

    // Check if current chapter is completed today
    // Note: readingLogs might store date string. 
    // We check if there's a log for this book/chapter regardless of date? 
    // Usually "read today" or "read ever". User might re-read.
    // Let's check if read *today*.
    const today = format(new Date(), 'yyyy-MM-dd');
    const isCompletedToday = readingLogs.some(
        l => l.book === currentBook && l.chapter === currentChapter && l.date === today
    );

    return (
        <div className="page-bible container">
            <div style={{ marginBottom: '1.5rem', position: 'sticky', top: '80px', zIndex: 5 }}>
                <BibleSelector
                    books={books}
                    currentBook={currentBook}
                    currentChapter={currentChapter}
                    currentVersion={currentVersion}
                    onBookChange={handleBookChange}
                    onChapterChange={handleChapterChange}
                    onVersionChange={handleVersionChange}
                />
            </div>

            <BibleViewer
                verses={verses}
                highlights={highlights}
                onHighlight={handleHighlight}
                onComplete={handleComplete}
                isCompleted={isCompletedToday}
            />
        </div>
    );
};

export default Bible;
