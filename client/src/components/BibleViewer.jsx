import React, { useState } from 'react';
import { Check, Bookmark, Highlighter } from 'lucide-react';

const BibleViewer = ({
    item, // Optional object including book/chapter
    verses = [],
    highlights = [],
    onHighlight,
    onComplete,
    isCompleted,
    isToday,
    lastReadDate,
    bookName = '',
    chapter = 1
}) => {
    const [selectedVerseIds, setSelectedVerseIds] = useState([]);

    // Check if a verse has a highlight
    const getHighlightStyle = (verseNum) => {
        // highlights structure needs to be checked. Assuming list of objects with verse field
        const hl = highlights.find(h => h.verse === verseNum);
        return hl ? hl.style : null; // style is color hex code
    };

    const handleVerseClick = (verseNum) => {
        onHighlight(verseNum);
    };

    return (
        <div className="bible-viewer">
            {/* Breadcrumb Header */}
            <div className="viewer-header" style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {bookName} {chapter}장
                </h2>
                {isCompleted && (
                    <span style={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Check size={14} />
                        {isToday ? '오늘 읽음' : '이날 읽음'} {lastReadDate && <span style={{ fontSize: '0.75rem', fontWeight: '400', opacity: '0.8' }}>(그 외: {lastReadDate})</span>}
                    </span>
                )}
                {!isCompleted && lastReadDate && (
                    <span style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Check size={14} />
                        이전에 읽음 ({lastReadDate})
                    </span>
                )}
            </div>

            <div className="verses-container" style={{
                backgroundColor: 'var(--pk-color-bg)',
                borderRadius: 'var(--pk-radius-lg)',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid var(--pk-color-border)',
                lineHeight: '1.8',
                fontSize: '1.1rem'
            }}>
                {verses.length > 0 ? (
                    verses.map((verse) => {
                        const hlColor = getHighlightStyle(verse.verse);
                        return (
                            <div
                                key={verse.verse}
                                className="verse-item"
                                onClick={() => handleVerseClick(verse.verse)}
                                style={{
                                    marginBottom: '0.5rem',
                                    position: 'relative',
                                    backgroundColor: hlColor || 'transparent',
                                    padding: hlColor ? '2px 4px' : '0',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <sup style={{
                                    marginRight: '0.5rem',
                                    color: 'var(--pk-color-primary)',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem'
                                }}>
                                    {verse.verse}
                                </sup>
                                <span className="verse-text">{verse.text}</span>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--pk-color-text-secondary)' }}>
                        구절을 불러오는 중입니다...
                    </div>
                )}
            </div>

            {/* Action Bar (Floating or Fixed at bottom) */}
            <div className="viewer-actions" style={{
                marginTop: '2rem',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                position: 'sticky',
                bottom: '2rem'
            }}>
                {/* Highlight Palette could go here */}

                <button
                    onClick={onComplete}
                    className={`action-btn ${isCompleted ? 'completed' : ''}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--pk-radius-full)',
                        backgroundColor: isCompleted ? '#22c55e' : 'var(--pk-color-primary)',
                        color: 'white',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {isCompleted ? <Check size={20} /> : <BookOpenIcon size={20} />}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span>{isCompleted ? '읽기 취소' : '읽기 완료 체크'}</span>
                        {lastReadDate && !isCompleted && (
                            <span style={{ fontSize: '0.7rem', opacity: '0.9', fontWeight: '400' }}>
                                (이전에 {lastReadDate}에 읽음)
                            </span>
                        )}
                        {isCompleted && lastReadDate && (
                            <span style={{ fontSize: '0.7rem', opacity: '0.9', fontWeight: '400' }}>
                                ({isToday ? '오늘 외 ' : '이날 외 '} {lastReadDate}에도 읽음)
                            </span>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

// Helper Icon
const BookOpenIcon = ({ size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

export default BibleViewer;
