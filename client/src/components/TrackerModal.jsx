
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './TrackerModal.css';

const TrackerModal = () => {
    const [books, setBooks] = useState([]);
    const [readingLogs, setReadingLogs] = useState([]);
    const [loading, setLoading] = useState(true);

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
    const progress = totalChapters > 0 ? Math.round((readCount / totalChapters) * 100) : 0;

    // Calculate OT/NT
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

    if (loading) {
        return <div className="tracker-content"><p>로딩 중...</p></div>;
    }

    return (
        <div className="tracker-content">
            {/* Summary */}
            <div className="tracker-summary">
                <h4>나의 읽기 현황</h4>
                <div className="stat-row">
                    <div className="stat-main">
                        <div className="stat-box">
                            <span className="stat-number">{readCount}</span>
                            <span className="stat-label">/ {totalChapters}장</span>
                        </div>
                        <div className="progress-area">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="progress-text">{progress}%</span>
                        </div>
                    </div>

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
                </div>
            </div>

            {/* Bible Reading Chart */}
            <div className="bible-chart">
                {books.map(book => {
                    const chaptersArray = Array.from({ length: book.chapters }, (_, i) => i + 1);
                    const readInBook = chaptersArray.filter(c => readChapters.has(`${book.id}:${c}`)).length;
                    const bookDone = readInBook === book.chapters;

                    return (
                        <div key={book.id} className={`book-row ${bookDone ? 'complete' : ''}`}>
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrackerModal;
