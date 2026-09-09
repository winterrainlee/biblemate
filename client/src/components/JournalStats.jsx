import React, { useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import Calendar from './Calendar';
import './JournalStats.css';
import { parseDateOnly } from '../utils/dateOnly';

const JournalStats = ({
    date,
    onDateChange,
    readingLogs = [],
    verseNotes = [],
    freeNotes = [],
    books = []
}) => {
    // 이번 달 데이터 필터링
    const currentMonthData = useMemo(() => {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        const logs = readingLogs.filter(log => {
            const d = parseDateOnly(log.date);
            return d ? d >= monthStart && d <= monthEnd : false;
        });

        const vNotes = verseNotes.filter(note => {
            const d = parseDateOnly(note.date);
            return d ? d >= monthStart && d <= monthEnd : false;
        });

        const fNotes = freeNotes.filter(note => {
            const d = parseDateOnly(note.date);
            return d ? d >= monthStart && d <= monthEnd : false;
        });

        return { logs, vNotes, fNotes };
    }, [date, readingLogs, verseNotes, freeNotes]);

    // 이번 달 읽은 책 목록
    const monthlyBooks = useMemo(() => {
        // Calculate all read chapters globally for completion check
        const allReadChapters = new Set();
        readingLogs.forEach(log => {
            const start = log.chapter_from || log.chapter;
            const end = log.chapter_to || log.chapter;
            for (let c = start; c <= end; c++) {
                allReadChapters.add(`${log.book}:${c}`);
            }
        });

        // Count unique chapters per book this month (no duplicates)
        const bookChapters = {};
        currentMonthData.logs.forEach(log => {
            if (!bookChapters[log.book]) bookChapters[log.book] = new Set();
            const start = log.chapter_from || log.chapter;
            const end = log.chapter_to || log.chapter;
            for (let c = start; c <= end; c++) {
                bookChapters[log.book].add(c);
            }
        });
        const counts = {};
        Object.entries(bookChapters).forEach(([book, chapters]) => {
            counts[book] = chapters.size;
        });

        // 1장이라도 읽은 모든 책 표시
        const sorted = Object.entries(counts)
            .sort(([, a], [, b]) => b - a);

        return sorted.map(([bookId, count]) => {
            const book = books.find(b => b.id === bookId);

            // Check completion
            let isCompleted = false;
            if (book) {
                let readInBook = 0;
                for (let c = 1; c <= book.chapters; c++) {
                    if (allReadChapters.has(`${bookId}:${c}`)) readInBook++;
                }
                isCompleted = readInBook >= book.chapters;
            }

            return {
                name: book?.name || bookId,
                count,
                color: books.findIndex(b => b.id === bookId) >= 39 ? '📗' : '📕',
                type: books.findIndex(b => b.id === bookId) >= 39 ? '신약' : '구약',
                isCompleted
            };
        });
    }, [currentMonthData.logs, books, readingLogs]);

    return (
        <div className="journal-stats">
            <div className="journal-stats-section journal-stats-section--calendar">
                <Calendar
                    readingLogs={readingLogs}
                    compact={true}
                    selectedDate={date}
                    onDateClick={(d) => onDateChange?.(d)}
                />
            </div>

            <div className="journal-stats-section">
                <h3 className="journal-stats-title">이번 달 통계</h3>
                <div className="journal-stats-grid">
                    <div className="journal-stats-item">
                        <span className="journal-stats-icon">📖</span>
                        <div className="journal-stats-info">
                            <span className="journal-stats-label">읽은 장</span>
                            <span className="journal-stats-value">{currentMonthData.logs.length}</span>
                        </div>
                    </div>
                    <div className="journal-stats-item">
                        <span className="journal-stats-icon">✏️</span>
                        <div className="journal-stats-info">
                            <span className="journal-stats-label">묵상</span>
                            <span className="journal-stats-value">{currentMonthData.vNotes.length + currentMonthData.fNotes.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {monthlyBooks.length > 0 && (
                <div className="journal-stats-section">
                    <h3 className="journal-stats-title">이번 달 읽은 책</h3>
                    <div className="journal-stats-books">
                        {monthlyBooks.map((book, idx) => (
                            <div key={idx} className="journal-stats-book-item">
                                <span className="journal-stats-book-icon" title={book.type}>{book.color}</span>
                                <span className="journal-stats-book-badge">
                                    {book.type}
                                </span>
                                <span className="journal-stats-book-name">
                                    {book.name}
                                </span>
                                <span className="journal-stats-book-count">
                                    {book.count}장
                                    {book.isCompleted && <span className="journal-stats-complete" title="완독">✅</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalStats;
