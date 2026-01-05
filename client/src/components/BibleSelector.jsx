import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './BibleSelector.css';

const BibleSelector = ({
    books = [],
    currentBook,
    currentChapter,
    currentVersion,
    onBookChange,
    onChapterChange,
    onVersionChange
}) => {
    // Find current book object to get chapter count
    const selectedBook = books.find(b => b.id === currentBook);
    const totalChapters = selectedBook ? selectedBook.chapters : 0;
    const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

    return (
        <div className="bible-selector">
            {/* Version Selector - Full Width */}
            <div className="selector-row full-width">
                <label className="selector-label">성경 역본</label>
                <select
                    value={currentVersion}
                    onChange={(e) => onVersionChange(e.target.value)}
                    className="selector-select"
                >
                    <option value="krv">개역한글 (KRV)</option>
                    <option value="web">WEB (English)</option>
                </select>
            </div>

            {/* Book & Chapter Selectors - Compact Row */}
            <div className="selector-compact-row">
                {/* Book Selector */}
                <div className="selector-row" style={{ flex: '0.9' }}>
                    <label className="selector-label">성경</label>
                    <select
                        value={currentBook}
                        onChange={(e) => onBookChange(e.target.value)}
                        className="selector-select"
                    >
                        {books.map(book => (
                            <option key={book.id} value={book.id}>
                                {book.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Chapter Selector */}
                <div className="selector-row" style={{ flex: '1.1' }}>
                    <label className="selector-label">장</label>
                    <div className="chapter-nav-container">
                        <button
                            onClick={() => onChapterChange(currentChapter - 1)}
                            disabled={currentChapter <= 1}
                            className="nav-arrow-btn"
                            aria-label="이전 장"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <select
                            value={currentChapter}
                            onChange={(e) => onChapterChange(Number(e.target.value))}
                            className="selector-select"
                            style={{ textAlign: 'center' }}
                        >
                            {chapters.map(ch => (
                                <option key={ch} value={ch}>{ch}장</option>
                            ))}
                        </select>

                        <button
                            onClick={() => onChapterChange(currentChapter + 1)}
                            disabled={currentChapter >= totalChapters}
                            className="nav-arrow-btn"
                            aria-label="다음 장"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BibleSelector;
