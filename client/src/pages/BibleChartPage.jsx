import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import './BibleChartPage.css';

const BibleChartPage = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [readingLogs, setReadingLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'ot', 'nt'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [booksData, logs] = await Promise.all([
                api.getBooks(),
                api.getReadingLogs()
            ]);
            setBooks(booksData);
            setReadingLogs(logs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Build a set of read chapters: "Book:Chapter"
    const readChapters = new Set();
    readingLogs.forEach(log => {
        const from = log.chapter_from || log.chapter;
        const to = log.chapter_to || log.chapter;
        for (let c = from; c <= to; c++) {
            readChapters.add(`${log.book}:${c}`);
        }
    });

    // Calculate totals
    const totalChapters = books.reduce((sum, b) => sum + b.chapters, 0);
    const readCount = readChapters.size;

    // Calculate OT/NT total and read counts
    let otTotal = 0, ntTotal = 0, otRead = 0, ntRead = 0;
    const ntStartAt = books.findIndex(b => b.id === 'Matt');

    books.forEach((book, idx) => {
        const isNT = idx >= ntStartAt && ntStartAt !== -1;
        if (isNT) ntTotal += book.chapters; else otTotal += book.chapters;

        for (let c = 1; c <= book.chapters; c++) {
            if (readChapters.has(`${book.id}:${c}`)) {
                if (isNT) ntRead++; else otRead++;
            }
        }
    });

    // Dynamic Stats based on filter
    let displayRead = readCount;
    let displayTotal = totalChapters;

    if (filter === 'ot') {
        displayRead = otRead;
        displayTotal = otTotal;
    } else if (filter === 'nt') {
        displayRead = ntRead;
        displayTotal = ntTotal;
    }

    const displayProgress = displayTotal > 0 ? Math.round((displayRead / displayTotal) * 100) : 0;
    const findNextUnread = (bookList = books) => {
        for (const book of bookList) {
            for (let chapter = 1; chapter <= book.chapters; chapter++) {
                if (!readChapters.has(`${book.id}:${chapter}`)) {
                    return { book: book.id, chapter };
                }
            }
        }
        return null;
    };

    // Filter Books
    const filteredBooks = books.filter((book, idx) => {
        if (filter === 'all') return true;
        const isNT = idx >= ntStartAt && ntStartAt !== -1;
        if (filter === 'nt') return isNT;
        if (filter === 'ot') return !isNT;
        return true;
    });
    const nextUnread = findNextUnread(filteredBooks);

    const navigateToBible = (book, chapter) => {
        localStorage.setItem('pendingBibleLocation', JSON.stringify({ book, chapter }));
        navigate('/');
    };

    if (loading) {
        return (
            <div className="chart-page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="chart-page-container">
            {/* Header */}
            <div className="chart-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} className="chart-back-btn" title="뒤로가기">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="chart-title">성경 읽기표</h1>
                </div>

                {/* Filter Buttons moved to Header Right */}
                <div className="header-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        전체
                    </button>
                    <button
                        className={`filter-btn ${filter === 'ot' ? 'active' : ''}`}
                        onClick={() => setFilter('ot')}
                    >
                        구약
                    </button>
                    <button
                        className={`filter-btn ${filter === 'nt' ? 'active' : ''}`}
                        onClick={() => setFilter('nt')}
                    >
                        신약
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="chart-content">
                <div className="chart-summary">
                    <div className="stat-row">
                        <div className="stat-main">
                            <div className="stat-box">
                                <span className="stat-number">{displayRead}</span>
                                <span className="stat-label">/ {displayTotal}장</span>
                            </div>
                            <div className="progress-area">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${displayProgress}%` }}></div>
                                </div>
                                <span className="progress-text">{displayProgress}%</span>
                            </div>
                            {nextUnread && (
                                <button className="next-unread-btn" onClick={() => navigateToBible(nextUnread.book, nextUnread.chapter)}>
                                    다음 안 읽은 장 읽기
                                </button>
                            )}
                        </div>

                        {filter === 'all' && (
                            <>
                                <div className="stat-divider"></div>
                                <div className="stat-details">
                                    <div className="detail-item">
                                        <span className="detail-label">구약</span>
                                        <span className="detail-value">{otRead} / {otTotal}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">신약</span>
                                        <span className="detail-value">{ntRead} / {ntTotal}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Grid Chart */}
                <div className="bible-chart-grid">
                    {filteredBooks.map(book => {
                        const chaptersArray = Array.from({ length: book.chapters }, (_, i) => i + 1);
                        const readInBook = chaptersArray.filter(c => readChapters.has(`${book.id}:${c}`)).length;
                        const bookDone = readInBook === book.chapters;

                        return (
                            <button
                                key={book.id}
                                className={`book-row ${bookDone ? 'complete' : ''}`}
                                onClick={() => {
                                    const nextInBook = findNextUnread([book]);
                                    navigateToBible(book.id, nextInBook?.chapter || 1);
                                }}
                            >
                                <span className="book-name" title={book.name}>
                                    {book.name}
                                </span>
                                <div className="chapter-grid">
                                    {chaptersArray.map(ch => (
                                        <div
                                            key={ch}
                                            className={`chapter-cell ${readChapters.has(`${book.id}:${ch}`) ? 'read' : ''}`}
                                            title={`${book.name} ${ch}장`}
                                        />
                                    ))}
                                </div>
                                <span className="book-progress">{readInBook}/{book.chapters}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BibleChartPage;
