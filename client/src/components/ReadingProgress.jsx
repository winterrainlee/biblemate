import React, { useState } from 'react';
import './ReadingProgress.css';

const ReadingProgress = ({ books = [], readingLogs = [] }) => {
    const [activeRange, setActiveRange] = useState('OT'); // OT (구약), NT (신약)

    // 성경 구분 (개선된 방식)
    const OT_BOOKS = books.slice(0, 39);
    const NT_BOOKS = books.slice(39);

    const currentBooks = activeRange === 'OT' ? OT_BOOKS : NT_BOOKS;

    // 책별 진행률 계산
    const getProgress = (bookId, totalChapters) => {
        const readChapters = new Set(
            readingLogs
                .filter(log => log.book === bookId)
                .flatMap(log => {
                    const from = log.chapter_from || log.chapter;
                    const to = log.chapter_to || log.chapter;
                    const chs = [];
                    for (let c = from; c <= to; c++) chs.push(c);
                    return chs;
                })
        ).size;

        const percent = totalChapters > 0 ? Math.round((readChapters / totalChapters) * 100) : 0;
        return { readChapters, percent };
    };

    // 전체 진행률 계산
    const calcTotalProgress = (bookList) => {
        const totalChapters = bookList.reduce((acc, book) => acc + book.chapters, 0);
        const bookIds = bookList.map(b => b.id);

        // Log unique chapters read in this collection
        const readCount = new Set(
            readingLogs
                .filter(log => bookIds.includes(log.book))
                .flatMap(log => {
                    const from = log.chapter_from || log.chapter;
                    const to = log.chapter_to || log.chapter;
                    const chs = [];
                    for (let c = from; c <= to; c++) chs.push(`${log.book}-${c}`);
                    return chs;
                })
        ).size;

        return totalChapters > 0 ? ((readCount / totalChapters) * 100).toFixed(1) : 0;
    };

    const otProgress = calcTotalProgress(OT_BOOKS);
    const ntProgress = calcTotalProgress(NT_BOOKS);

    const currentProgress = activeRange === 'OT' ? otProgress : ntProgress;

    return (
        <div className="reading-progress">
            <h3 className="reading-progress-title">📊 말씀 여정</h3>

            <div className="reading-progress-tabs">
                <button
                    className={`reading-progress-tab ${activeRange === 'OT' ? 'active' : ''}`}
                    onClick={() => setActiveRange('OT')}
                >
                    구약
                </button>
                <button
                    className={`reading-progress-tab ${activeRange === 'NT' ? 'active' : ''}`}
                    onClick={() => setActiveRange('NT')}
                >
                    신약
                </button>
            </div>

            {/* Overall Progress Display */}
            <div className="reading-progress-overall">
                <div className="reading-progress-overall-info">
                    <span>{activeRange === 'OT' ? '구약' : '신약'} 말씀 여정</span>
                    <span className="reading-progress-percent">{currentProgress}%</span>
                </div>
                <div className="reading-progress-track">
                    <div
                        className="reading-progress-fill"
                        style={{ width: `${currentProgress}%`, backgroundColor: activeRange === 'OT' ? 'var(--pk-color-primary)' : 'var(--pk-color-success)' }}
                    />
                </div>
            </div>

            <div className="reading-progress-list">
                {currentBooks.map(book => {
                    const { readChapters, percent } = getProgress(book.id, book.chapters);
                    return (
                        <div key={book.id} className="reading-progress-item">
                            <div className="reading-progress-book-info">
                                <span className="reading-progress-book-name">{book.name}</span>
                                <span className="reading-progress-book-stats">{readChapters}/{book.chapters}</span>
                            </div>
                            <div className="reading-progress-book-track">
                                <div
                                    className="reading-progress-book-fill"
                                    style={{ width: `${percent}%` }}
                                    title={`${percent}%`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReadingProgress;
