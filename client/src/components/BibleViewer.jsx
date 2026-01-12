import React, { useState, useEffect, useRef } from 'react';
import { Check, Highlighter, MessageSquare, Copy, X, Send, Loader } from 'lucide-react';
import './BibleViewer.css';

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
    chapter = 1,
    onAddNote,
    onCopyCitation,
    completionStatus = 'idle' // idle, loading, success, error
}) => {
    const [selectedVerseIds, setSelectedVerseIds] = useState([]);
    const [popup, setPopup] = useState({
        visible: false,
        x: 0,
        y: 0,
        verseNum: null,
        verseText: '',
        mode: 'menu',
        memoInput: ''
    });
    const popupRef = useRef(null);

    // Close popup on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setPopup(prev => ({ ...prev, visible: false }));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setPopup(prev => ({ ...prev, visible: false }));
            }
        };
        if (popup.visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popup.visible]);

    // Check if a verse has a highlight
    const getHighlightStyle = (verseNum) => {
        // highlights structure needs to be checked. Assuming list of objects with verse field
        const hl = highlights.find(h => h.verse === verseNum);
        return hl ? hl.style : null; // style is color hex code
    };

    const handleVerseClick = (e, verse) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPopup({
            visible: true,
            x: e.clientX,
            y: e.clientY - 10, // Slightly above the click
            verseNum: verse.verse,
            verseText: verse.text,
            mode: 'menu',
            memoInput: ''
        });
    };

    const handleHighlightClick = () => {
        onHighlight(popup.verseNum);
        setPopup(prev => ({ ...prev, visible: false }));
    };

    const handleCopyClick = () => {
        onCopyCitation(popup.verseNum, popup.verseText);
        setPopup(prev => ({ ...prev, visible: false }));
    };

    const handleMemoSubmit = () => {
        if (!popup.memoInput.trim()) return;
        onAddNote(popup.verseNum, popup.memoInput);
        setPopup(prev => ({ ...prev, visible: false }));
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
                                onClick={(e) => handleVerseClick(e, verse)}
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
                marginTop: '1rem',
                /* v1.4.1: 2rem -> 1rem 모바일 공백 줄임 */
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                position: 'sticky',
                bottom: '0.5rem'
                /* v1.4.1: 2rem -> 0.5rem 모바일 간격 줄임 */
            }}>
                {/* Highlight Palette could go here */}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <button
                        onClick={onComplete}
                        disabled={completionStatus === 'loading'}
                        className={`action-btn ${isCompleted ? 'completed' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.75rem',
                            borderRadius: '9999px', // Fully rounded pill
                            backgroundColor: isCompleted
                                ? '#22c55e'
                                : completionStatus === 'success'
                                    ? '#22c55e'
                                    : 'var(--pk-color-primary)',
                            color: 'white',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            cursor: completionStatus === 'loading' ? 'wait' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: completionStatus === 'loading' ? 0.8 : 1
                        }}
                    >
                        {completionStatus === 'loading' ? (
                            <Loader size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : isCompleted || completionStatus === 'success' ? (
                            <Check size={20} />
                        ) : (
                            <BookOpenIcon size={20} />
                        )}

                        <span>
                            {completionStatus === 'loading' ? '처리 중...' :
                                completionStatus === 'success' ? '완료!' :
                                    isCompleted ? '읽기 취소' : '읽기 완료 체크'}
                        </span>
                    </button>

                    {/* 부가 정보 표시 (버튼 하단) */}
                    {(isCompleted || lastReadDate) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--pk-color-text-secondary)', textAlign: 'right', paddingRight: '0.5rem' }}>
                            {isCompleted && lastReadDate && (
                                <span>(이날 외 {lastReadDate}에도 읽음)</span>
                            )}
                            {!isCompleted && lastReadDate && (
                                <span>(이전에 {lastReadDate}에 읽음)</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Popup Tooltip */}
            {popup.visible && (
                <div
                    ref={popupRef}
                    className="verse-popup"
                    style={{
                        position: 'fixed',
                        left: `${popup.x}px`,
                        top: `${popup.y}px`,
                        transform: 'translate(-50%, -100%)',
                        backgroundColor: 'var(--pk-color-bg)',
                        border: '1px solid var(--pk-color-border)',
                        borderRadius: 'var(--pk-radius-lg)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        zIndex: 1000,
                        padding: '8px',
                        minWidth: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}
                >
                    {popup.mode === 'menu' ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={handleHighlightClick}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '8px',
                                    border: 'none',
                                    borderRadius: 'var(--pk-radius-md)',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    fontSize: '0.75rem',
                                    color: 'var(--pk-color-text)'
                                }}
                                className="popup-btn"
                            >
                                <Highlighter size={18} color={getHighlightStyle(popup.verseNum) ? "#64748b" : "#eab308"} />
                                <span>{getHighlightStyle(popup.verseNum) ? '취소' : '형광펜'}</span>
                            </button>
                            <button
                                onClick={() => setPopup(prev => ({ ...prev, mode: 'memo' }))}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '8px',
                                    border: 'none',
                                    borderRadius: 'var(--pk-radius-md)',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    fontSize: '0.75rem',
                                    color: 'var(--pk-color-text)'
                                }}
                                className="popup-btn"
                            >
                                <MessageSquare size={18} color="var(--pk-color-primary)" />
                                <span>메모</span>
                            </button>
                            <button
                                onClick={handleCopyClick}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '8px',
                                    border: 'none',
                                    borderRadius: 'var(--pk-radius-md)',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    fontSize: '0.75rem',
                                    color: 'var(--pk-color-text)'
                                }}
                                className="popup-btn"
                            >
                                <Copy size={18} color="#6366f1" />
                                <span>복사</span>
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--pk-color-text-secondary)' }}>
                                    {popup.verseNum}절 메모
                                </span>
                                <button
                                    onClick={() => setPopup(prev => ({ ...prev, mode: 'menu' }))}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', color: 'var(--pk-color-text-secondary)' }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <textarea
                                autoFocus
                                value={popup.memoInput}
                                onChange={(e) => setPopup(prev => ({ ...prev, memoInput: e.target.value }))}
                                placeholder="묵상을 적어보세요..."
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '8px',
                                    borderRadius: 'var(--pk-radius-md)',
                                    border: '1px solid var(--pk-color-border)',
                                    fontSize: '0.9rem',
                                    backgroundColor: 'var(--pk-color-bg)',
                                    color: 'var(--pk-color-text)',
                                    resize: 'none'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        handleMemoSubmit();
                                    }
                                }}
                            />
                            <button
                                onClick={handleMemoSubmit}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '6px',
                                    backgroundColor: 'var(--pk-color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--pk-radius-md)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}
                            >
                                <Send size={14} />
                                추가하기
                            </button>
                        </div>
                    )}
                </div>
            )}
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
