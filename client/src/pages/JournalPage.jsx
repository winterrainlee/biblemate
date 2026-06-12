import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Type, Download, Upload, Eye, EyeOff, LogOut, CheckCircle, AlertCircle, CalendarOff, Edit2, Trash2, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { parseDateInput } from '../utils/dateOnly';
import Modal from '../components/Modal'; // Import Modal
import {
    getVerseNotesByDate,
    getAllVerseNotes,
    saveVerseNote,
    deleteVerseNote,
    getFreeNote,
    saveFreeNote,
    deleteFreeNote,
    getPrayer,
    savePrayer,
    deletePrayer,
    getAllFreeNotes
} from '../services/journalApi';
import './JournalPage.css';

// Components
import ReadingProgress from '../components/ReadingProgress';
import JournalStats from '../components/JournalStats';


const JournalPage = ({ date, onDateChange, readingLogs = [], books = [], onNavigateToBible }) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Date navigation handlers
    const handlePrevDay = () => onDateChange?.(subDays(date, 1));
    const handleNextDay = () => onDateChange?.(addDays(date, 1));
    // Data States
    const [verseNotes, setVerseNotes] = useState([]);
    const [allVerseNotes, setAllVerseNotes] = useState([]); // stats 용
    const [allFreeNotes, setAllFreeNotes] = useState([]); // stats 용 [NEW]
    const [freeNote, setFreeNote] = useState(null);
    const [prayer, setPrayer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Edit States
    const [editingFreeNote, setEditingFreeNote] = useState(false);
    const [editingPrayer, setEditingPrayer] = useState(false);
    const [freeNoteContent, setFreeNoteContent] = useState('');
    const [prayerContent, setPrayerContent] = useState('');
    const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);

    // Verse Note Edit State
    const [editingVerseNote, setEditingVerseNote] = useState(null); // { note, content }

    // Copy State
    const [isCopied, setIsCopied] = useState(false);
    const [copiedVerseNoteId, setCopiedVerseNoteId] = useState(null);
    const verseNoteCopyTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (verseNoteCopyTimeoutRef.current) {
                clearTimeout(verseNoteCopyTimeoutRef.current);
            }
        };
    }, []);

    // Swipe handlers for mobile
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;
    const isEditing = editingFreeNote || editingPrayer || Boolean(editingVerseNote);
    const isInteractiveTouchTarget = (target) => {
        return Boolean(target?.closest?.(
            'button, input, textarea, select, a, [contenteditable="true"]'
        ));
    };

    const onTouchStart = (e) => {
        if (isEditing || isInteractiveTouchTarget(e.target)) {
            setTouchStart(null);
            setTouchEnd(null);
            return;
        }
        setTouchEnd(null);
        setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    };

    const onTouchMove = (e) => setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distX = touchStart.x - touchEnd.x;
        const distY = Math.abs(touchStart.y - touchEnd.y);
        // Ignore if vertical movement is greater (scrolling, not swiping)
        if (Math.abs(distX) < minSwipeDistance || distY > Math.abs(distX)) return;

        if (distX > 0) {
            handleNextDay();
        } else {
            handlePrevDay();
        }
    };

    const loadJournalData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [, allNotesData, freeNotesData, freeNoteData, prayerData] = await Promise.all([
                getVerseNotesByDate(dateStr),
                getAllVerseNotes(),
                getAllFreeNotes(),
                getFreeNote(dateStr).catch(() => null),
                getPrayer(dateStr).catch(() => null)
            ]);

            // [Modified] Filter notes by created_at instead of date
            // The user wants to see notes CREATED on this day, regardless of the assigned reading date.
            const filteredNotes = (allNotesData || []).filter(note => {
                const createdDate = note.created_at || note.date;
                const parsed = parseDateInput(createdDate);
                return parsed ? format(parsed, 'yyyy-MM-dd') === dateStr : false;
            });

            // Sort by Book > Chapter > Verse
            filteredNotes.sort((a, b) => {
                const bookIdxA = books.findIndex(bk => bk.id === a.book);
                const bookIdxB = books.findIndex(bk => bk.id === b.book);
                if (bookIdxA !== bookIdxB) return bookIdxA - bookIdxB;
                if (a.chapter !== b.chapter) return a.chapter - b.chapter;
                return a.verse - b.verse;
            });

            setVerseNotes(filteredNotes);
            setAllVerseNotes(allNotesData || []);
            setAllFreeNotes(freeNotesData || []);
            setFreeNote(freeNoteData);
            setPrayer(prayerData);
            setFreeNoteContent(freeNoteData?.content || '');
            setPrayerContent(prayerData?.content || '');
        } catch (error) {
            console.error('Failed to load journal data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [books, dateStr]);

    // Load data when date changes
    useEffect(() => {
        loadJournalData();
    }, [loadJournalData]);

    // Get book name helper
    const getBookName = (bookId) => {
        const book = books.find(b => b.id === bookId);
        return book?.name || bookId;
    };
    // Handler: Save Free Note
    const handleSaveFreeNote = async () => {
        if (!freeNoteContent.trim()) return;
        try {
            await saveFreeNote({ date: dateStr, content: freeNoteContent });
            setFreeNote({ date: dateStr, content: freeNoteContent });
            setEditingFreeNote(false);
        } catch (error) {
            console.error('Failed to save free note:', error);
        }
    };

    // Handler: Delete Free Note
    const handleDeleteFreeNote = async () => {
        if (!confirm('자유 묵상을 삭제하시겠습니까?')) return;
        try {
            await deleteFreeNote(dateStr);
            setFreeNote(null);
            setFreeNoteContent('');
        } catch (error) {
            console.error('Failed to delete free note:', error);
        }
    };

    // Handler: Save Prayer
    const handleSavePrayer = async () => {
        if (!prayerContent.trim()) return;
        try {
            await savePrayer({ date: dateStr, content: prayerContent });
            setPrayer({ date: dateStr, content: prayerContent });
            setEditingPrayer(false);
        } catch (error) {
            console.error('Failed to save prayer:', error);
        }
    };

    // Handler: Delete Prayer
    const handleDeletePrayer = async () => {
        if (!confirm('오늘의 기도를 삭제하시겠습니까?')) return;
        try {
            await deletePrayer(dateStr);
            setPrayer(null);
            setPrayerContent('');
        } catch (error) {
            console.error('Failed to delete prayer:', error);
        }
    };

    // Handler: Delete Verse Note
    const handleDeleteVerseNote = async (id) => {
        if (!confirm('이 묵상을 삭제하시겠습니까?')) return;
        try {
            await deleteVerseNote(id);
            setVerseNotes(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete verse note:', error);
        }
    };

    // Handler: Save Verse Note Edit
    const handleSaveVerseNoteEdit = async () => {
        if (!editingVerseNote || !editingVerseNote.content.trim()) return;
        try {
            const { note, content } = editingVerseNote;
            await saveVerseNote({
                id: note.id, // Ensure ID is passed for update
                date: note.date,
                book: note.book,
                chapter: note.chapter,
                verse: note.verse,
                verse_range: note.verse_range, // Preserve range
                content: content
            });

            // Update local state
            setVerseNotes(prev => prev.map(n =>
                n.id === note.id ? { ...n, content: content } : n
            ));

            setEditingVerseNote(null);
        } catch (error) {
            console.error('Failed to update verse note:', error);
            alert('수정 실패');
        }
    };

    const copyTextToClipboard = async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    };

    // Handler: Copy All Meditation
    const handleCopyAll = async () => {
        try {
            const parts = [];

            // Header: ## YYYY-MM-DD 책 장 범위
            const readingLabel = todayLogs.length > 0
                ? todayLogs.map(log => {
                    const name = getBookName(log.book);
                    const ch = log.chapter_from || log.chapter;
                    return `${name} ${ch}장`;
                }).join(', ')
                : '';
            parts.push(`## ${dateStr}${readingLabel ? ' ' + readingLabel : ''}`);

            // [발견한 하나님] - 구절별 묵상
            if (verseNotes.length > 0) {
                parts.push('');
                parts.push('[발견한 하나님]');
                verseNotes.forEach(note => {
                    const ref = `${getBookName(note.book)} ${note.chapter}:${note.verse_range || note.verse}`;
                    parts.push(`${note.content} (${ref})`);
                });
            }

            // [자유 묵상]
            if (freeNote?.content) {
                parts.push('');
                parts.push('[자유 묵상]');
                parts.push(freeNote.content);
            }

            // [오늘의 기도]
            if (prayer?.content) {
                parts.push('');
                parts.push('[오늘의 기도]');
                parts.push(prayer.content);
            }

            const text = parts.join('\n');
            await copyTextToClipboard(text);

            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('복사에 실패했습니다.');
        }
    };

    // Handler: Copy Single Verse Note
    const handleCopyVerseNote = async (note) => {
        try {
            await copyTextToClipboard(note.content);
            if (verseNoteCopyTimeoutRef.current) {
                clearTimeout(verseNoteCopyTimeoutRef.current);
            }
            setCopiedVerseNoteId(note.id);
            verseNoteCopyTimeoutRef.current = setTimeout(() => {
                setCopiedVerseNoteId(null);
                verseNoteCopyTimeoutRef.current = null;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy verse note:', error);
            alert('복사에 실패했습니다.');
        }
    };

    // Filter reading logs for selected date and sort by Bible order
    const todayLogs = readingLogs
        .filter(log => log.date === dateStr)
        .sort((a, b) => {
            const bookIdxA = books.findIndex(bk => bk.id === a.book);
            const bookIdxB = books.findIndex(bk => bk.id === b.book);
            if (bookIdxA !== bookIdxB) return bookIdxA - bookIdxB;

            const startA = a.chapter_from || a.chapter || 0;
            const startB = b.chapter_from || b.chapter || 0;
            return startA - startB;
        });
    const monthKey = format(date, 'yyyy-MM');
    const monthlyReadDays = new Set(readingLogs.filter(log => log.date?.startsWith(monthKey)).map(log => log.date));
    const monthlyNoteDays = new Set([
        ...allFreeNotes
            .filter(note => note.date?.startsWith(monthKey))
            .map(note => note.date),
        ...allVerseNotes
            .map(note => parseDateInput(note.created_at || note.date))
            .filter(Boolean)
            .map(parsed => format(parsed, 'yyyy-MM-dd'))
            .filter(noteDate => noteDate.startsWith(monthKey))
    ]);
    const recentActivityDates = Array.from(new Set([
        ...readingLogs.map(log => log.date).filter(Boolean),
        ...allFreeNotes.map(note => note.date).filter(Boolean),
        ...allVerseNotes
            .map(note => parseDateInput(note.created_at || note.date))
            .filter(Boolean)
            .map(parsed => format(parsed, 'yyyy-MM-dd'))
    ]))
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 6);

    const goToday = () => onDateChange?.(new Date());
    const handleDateInputChange = (event) => {
        const parsed = parseDateInput(event.target.value);
        if (parsed) {
            onDateChange?.(parsed);
            setIsDateSheetOpen(false);
        }
    };

    const startTodayMeditation = () => {
        setEditingFreeNote(true);
        setEditingPrayer(false);
    };

    if (isLoading) {
        return (
            <div className="journal-page">
                <div className="journal-loading">로딩 중...</div>
            </div>
        );
    }

    const hasAnyContent = todayLogs.length > 0 || verseNotes.length > 0 || freeNote || prayer;

    return (
        <div
            className="journal-container"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >


            <div className="journal-inner">
                {/* Desktop Left Sidebar: Reading Progress */}
                <aside className="journal-side journal-left">
                    <div className="journal-side-content">
                        <ReadingProgress
                            books={books}
                            readingLogs={readingLogs}
                        />
                    </div>
                </aside>

                {/* Main Center Panel */}
                <main className="journal-page">
                    {/* Header */}
                    <header className="journal-header">
                        <div className="date-nav">
                            <button className="nav-btn" onClick={handlePrevDay} title="이전 날짜">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="date-info">
                                <button className="journal-date-button" onClick={() => setIsDateSheetOpen(true)}>
                                    {format(date, 'yyyy년 M월 d일 (E)', { locale: ko })}
                                </button>
                                {isToday(date) && <span className="today-badge-static">오늘</span>}
                            </div>
                            <button className="nav-btn" onClick={handleNextDay} title="다음 날짜">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                        {!isToday(date) && (
                            <button className="journal-today-btn" onClick={goToday}>
                                오늘
                            </button>
                        )}
                    </header>

                    <section className="mobile-journal-summary" aria-label="이번 달 묵상 요약">
                        <div>
                            <span className="summary-value">{monthlyReadDays.size}</span>
                            <span className="summary-label">읽은 날</span>
                        </div>
                        <div>
                            <span className="summary-value">{monthlyNoteDays.size}</span>
                            <span className="summary-label">묵상한 날</span>
                        </div>
                        <button onClick={() => setIsDateSheetOpen(true)}>날짜 이동</button>
                    </section>

                    {isDateSheetOpen && (
                        <div className="journal-date-sheet-backdrop" onClick={() => setIsDateSheetOpen(false)}>
                            <section className="journal-date-sheet" onClick={(e) => e.stopPropagation()} aria-label="날짜 선택">
                                <div className="date-sheet-handle" />
                                <div className="date-sheet-header">
                                    <div>
                                        <div className="date-sheet-title">날짜 선택</div>
                                        <div className="date-sheet-subtitle">{format(date, 'yyyy년 M월', { locale: ko })}</div>
                                    </div>
                                    <button className="date-sheet-close" onClick={() => setIsDateSheetOpen(false)}>닫기</button>
                                </div>
                                <input
                                    className="date-sheet-input"
                                    type="date"
                                    value={dateStr}
                                    onChange={handleDateInputChange}
                                />
                                <div className="date-sheet-actions">
                                    <button onClick={goToday}>오늘로 이동</button>
                                </div>
                                {recentActivityDates.length > 0 && (
                                    <div className="recent-date-list">
                                        <div className="recent-date-title">최근 기록</div>
                                        {recentActivityDates.map(activityDate => (
                                            <button
                                                key={activityDate}
                                                onClick={() => {
                                                    const parsed = parseDateInput(activityDate);
                                                    if (parsed) onDateChange?.(parsed);
                                                    setIsDateSheetOpen(false);
                                                }}
                                            >
                                                {format(parseDateInput(activityDate), 'M월 d일 EEEE', { locale: ko })}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* Empty State */}
                    {!hasAnyContent && !editingFreeNote && !editingPrayer && (
                        <div className="journal-empty">
                            <span className="empty-icon">📝</span>
                            <p>작성된 묵상이 없습니다</p>
                            <div className="empty-actions">
                                <button onClick={startTodayMeditation}>오늘 묵상 시작하기</button>
                            </div>
                        </div>
                    )}

                    {/* Section: 읽은 말씀 */}
                    {todayLogs.length > 0 && (
                        <section className="journal-section">
                            <div className="section-header">
                                <h3 className="section-title">📖 읽은 말씀</h3>
                                {hasAnyContent && (
                                    <div className="section-actions">
                                        <button
                                            className={`copy-all-btn${isCopied ? ' copied' : ''}`}
                                            onClick={handleCopyAll}
                                            title="오늘의 묵상 복사"
                                        >
                                            {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                            <span>{isCopied ? '복사됨' : '묵상 복사'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <ul className="reading-list">
                                {todayLogs.map((log, idx) => (
                                    <li
                                        key={idx}
                                        className="reading-item"
                                        onClick={() => onNavigateToBible?.(log.book, log.chapter_from || log.chapter)}
                                    >
                                        <span className="reading-badge">✓</span>
                                        {getBookName(log.book)} {log.chapter_from || log.chapter}장
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Section: 구절별 묵상 */}
                    {verseNotes.length > 0 && (
                        <section className="journal-section">
                            <h3 className="section-title">✨ 구절별 묵상</h3>
                            <div className="verse-notes-list">
                                {verseNotes.map(note => {
                                    const isEditing = editingVerseNote?.note.id === note.id;
                                    const isVerseNoteCopied = copiedVerseNoteId === note.id;

                                    return (
                                        <div key={note.id} className="verse-note-card">
                                            <div className="verse-note-header">
                                                <span
                                                    className="verse-ref"
                                                    onClick={() => onNavigateToBible?.(note.book, note.chapter)}
                                                >
                                                    {getBookName(note.book)} {note.chapter}:{note.verse_range || note.verse}
                                                </span>
                                                {!isEditing && (
                                                    <div className="note-actions">
                                                        <button
                                                            className={`icon-btn${isVerseNoteCopied ? ' copied' : ''}`}
                                                            onClick={() => handleCopyVerseNote(note)}
                                                            title={isVerseNoteCopied ? '복사됨' : '복사'}
                                                        >
                                                            {isVerseNoteCopied ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                        <button
                                                            className="icon-btn"
                                                            onClick={() => setEditingVerseNote({ note, content: note.content })}
                                                            title="수정"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="icon-btn delete"
                                                            onClick={() => handleDeleteVerseNote(note.id)}
                                                            title="삭제"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {isEditing ? (
                                                <div className="editor-box" style={{ marginTop: '0.5rem' }}>
                                                    <textarea
                                                        value={editingVerseNote.content}
                                                        onChange={(e) => setEditingVerseNote(prev => ({ ...prev, content: e.target.value }))}
                                                        rows={5}
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--pk-color-border)' }}
                                                    />
                                                    <div className="editor-actions">
                                                        <button className="btn-save" onClick={handleSaveVerseNoteEdit}>저장</button>
                                                        <button className="btn-cancel" onClick={() => setEditingVerseNote(null)}>취소</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="verse-note-content">
                                                        {note.content.split(/(".*?")/s).map((part, idx) => {
                                                            if (part.startsWith('"') && part.endsWith('"') && part.length > 2) {
                                                                return (
                                                                    <div key={idx} className="verse-quote-box">
                                                                        {part.slice(1, -1)}
                                                                    </div>
                                                                );
                                                            }
                                                            return <span key={idx}>{part}</span>;
                                                        })}
                                                    </div>
                                                    <div className="note-date">{new Date(note.created_at || note.date).toLocaleDateString()}</div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Section: 자유 묵상 */}
                    <section className="journal-section">
                        <div className="section-header">
                            <h3 className="section-title">💭 자유 묵상</h3>
                            {freeNote && !editingFreeNote && (
                                <div className="section-actions">
                                    <button className="icon-btn" onClick={() => setEditingFreeNote(true)} title="수정"><Edit2 size={16} /></button>
                                    <button className="icon-btn delete" onClick={handleDeleteFreeNote} title="삭제"><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>
                        {editingFreeNote ? (
                            <div className="editor-box">
                                <textarea
                                    value={freeNoteContent}
                                    onChange={(e) => setFreeNoteContent(e.target.value)}
                                    placeholder="오늘의 묵상을 자유롭게 작성하세요..."
                                    rows={5}
                                />
                                <div className="editor-actions">
                                    <button className="btn-save" onClick={handleSaveFreeNote}>저장</button>
                                    <button className="btn-cancel" onClick={() => {
                                        setEditingFreeNote(false);
                                        setFreeNoteContent(freeNote?.content || '');
                                    }}>취소</button>
                                </div>
                            </div>
                        ) : freeNote ? (
                            <p className="section-content">{freeNote.content}</p>
                        ) : (
                            <button className="add-btn" onClick={() => setEditingFreeNote(true)}>
                                + 자유 묵상 추가
                            </button>
                        )}
                    </section>

                    {/* Section: 오늘의 기도 */}
                    <section className="journal-section">
                        <div className="section-header">
                            <h3 className="section-title">🙏 오늘의 기도</h3>
                            {prayer && !editingPrayer && (
                                <div className="section-actions">
                                    <button className="icon-btn" onClick={() => setEditingPrayer(true)} title="수정"><Edit2 size={16} /></button>
                                    <button className="icon-btn delete" onClick={handleDeletePrayer} title="삭제"><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>
                        {editingPrayer ? (
                            <div className="editor-box">
                                <textarea
                                    value={prayerContent}
                                    onChange={(e) => setPrayerContent(e.target.value)}
                                    placeholder="오늘 드리는 기도를 작성하세요..."
                                    rows={5}
                                />
                                <div className="editor-actions">
                                    <button className="btn-save" onClick={handleSavePrayer}>저장</button>
                                    <button className="btn-cancel" onClick={() => {
                                        setEditingPrayer(false);
                                        setPrayerContent(prayer?.content || '');
                                    }}>취소</button>
                                </div>
                            </div>
                        ) : prayer ? (
                            <p className="section-content">{prayer.content}</p>
                        ) : (
                            <button className="add-btn" onClick={() => setEditingPrayer(true)}>
                                + 오늘의 기도 추가
                            </button>
                        )}
                    </section>
                </main>

                {/* Desktop Right Sidebar: Stats & Calendar */}
                <aside className="journal-side journal-right">
                    <div className="journal-side-content">
                        <JournalStats
                            date={date}
                            onDateChange={onDateChange}
                            readingLogs={readingLogs}
                            verseNotes={allVerseNotes}
                            freeNotes={allFreeNotes}
                            books={books}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default JournalPage;
