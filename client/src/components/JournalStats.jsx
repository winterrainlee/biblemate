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
            <div className="stats-section no-padding">
                <Calendar
                    readingLogs={readingLogs}
                    compact={true}
                    selectedDate={date}
                    onDateClick={(d) => onDateChange?.(d)}
                />
            </div>

            <div className="stats-section">
                <h3 className="stats-title">── 이번 달 통계 ──</h3>
                <div className="stats-grid">
                    <div className="stats-item">
                        <span className="stats-icon">📖</span>
                        <div className="stats-info">
                            <span className="stats-label">읽은 장</span>
                            <span className="stats-value">{currentMonthData.logs.length}</span>
                        </div>
                    </div>
                    <div className="stats-item">
                        <span className="stats-icon">✏️</span>
                        <div className="stats-info">
                            <span className="stats-label">묵상</span>
                            <span className="stats-value">{currentMonthData.vNotes.length + currentMonthData.fNotes.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {monthlyBooks.length > 0 && (
                <div className="stats-section">
                    <h3 className="stats-title">── 이번 달 읽은 책 ──</h3>
                    <div className="top-books-list">
                        {monthlyBooks.map((book, idx) => (
                            <div key={idx} className="top-book-item" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 0'
                            }}>
                                <span className="book-icon" title={book.type}>{book.color}</span>
                                <span className="book-type-badge" style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--pk-color-bg-secondary)',
                                    color: 'var(--pk-color-text-tertiary)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {book.type}
                                </span>
                                <span className="book-name" style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: '600'
                                }}>
                                    {book.name}
                                </span>
                                <span className="book-count" style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--pk-color-text-secondary)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {book.count}장
                                    {book.isCompleted && <span title="완독" style={{ marginLeft: '4px', cursor: 'help' }}>✅</span>}
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
