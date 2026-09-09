import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Edit2, Loader, RefreshCw, Trash2, X } from 'lucide-react';
import { toDisplayNoteRange } from './chapterNotesModel';
import './ChapterNotesPanel.css';

const renderNoteContent = (content) => {
    const quoteMatch = String(content || '').match(/^"([\s\S]+?)"\n\n([\s\S]+)$/);
    if (!quoteMatch) return <p className="chapter-notes-panel__memo">{content}</p>;

    return (
        <div className="chapter-notes-panel__content">
            <blockquote>{quoteMatch[1]}</blockquote>
            <p className="chapter-notes-panel__memo">{quoteMatch[2]}</p>
        </div>
    );
};

const ChapterNotesPanel = ({
    bookName,
    chapter,
    notes,
    status,
    error,
    selectedNoteId,
    pendingDeleteId,
    copiedNoteId,
    onClose,
    onRetry,
    onNavigate,
    onCopy,
    onEdit,
    onDelete
}) => {
    const panelRef = useRef(null);
    const closeButtonRef = useRef(null);
    const noteRefs = useRef(new Map());
    const [isWorkspace, setIsWorkspace] = useState(() => window.matchMedia('(min-width: 900px)').matches);
    const isLoading = status === 'loading';

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 900px)');
        const handleChange = event => setIsWorkspace(event.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        if (selectedNoteId == null) return;
        window.requestAnimationFrame(() => {
            const card = noteRefs.current.get(Number(selectedNoteId));
            card?.scrollIntoView({ block: 'nearest' });
            card?.focus({ preventScroll: true });
        });
    }, [selectedNoteId]);

    useEffect(() => {
        if (notes.length > 0 || pendingDeleteId != null) return;
        window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    }, [notes.length, pendingDeleteId]);

    const handleKeyDown = event => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
            return;
        }
        if (isWorkspace || event.key !== 'Tab') return;

        const focusable = [...panelRef.current.querySelectorAll(
            'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
        )];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    return (
        <div className={`chapter-notes-panel-layer${isWorkspace ? ' is-workspace' : ''}`}>
            {!isWorkspace && <div className="chapter-notes-panel-backdrop" onMouseDown={onClose} aria-hidden="true" />}
            <section
                ref={panelRef}
                className="chapter-notes-panel"
                role={isWorkspace ? 'complementary' : 'dialog'}
                aria-modal={isWorkspace ? undefined : true}
                aria-label={`${bookName} ${chapter}장 묵상`}
                onKeyDown={handleKeyDown}
            >
                <header className="chapter-notes-panel__header">
                    <div>
                        <span className="chapter-notes-panel__eyebrow">이 장의 묵상</span>
                        <h2>{bookName} {chapter}장</h2>
                        <p>{notes.length}개의 기록</p>
                    </div>
                    <button ref={closeButtonRef} type="button" className="chapter-notes-panel__close" onClick={onClose} aria-label="이 장의 묵상 닫기" autoFocus>
                        <X size={20} />
                    </button>
                </header>

                <div className="chapter-notes-panel__body" aria-busy={isLoading || status === 'refreshing'}>
                    {error && notes.length > 0 && (
                        <div className="chapter-notes-panel__error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={onRetry}>
                                <RefreshCw size={16} /> 다시 시도
                            </button>
                        </div>
                    )}

                    {error && notes.length === 0 ? (
                        <div className="chapter-notes-panel__error chapter-notes-panel__state" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={onRetry}>
                                <RefreshCw size={16} /> 다시 시도
                            </button>
                        </div>
                    ) : isLoading && notes.length === 0 ? (
                        <div className="chapter-notes-panel__state"><Loader className="animate-spin" size={22} /> 묵상을 불러오는 중</div>
                    ) : notes.length === 0 ? (
                        <div className="chapter-notes-panel__empty">
                            <strong>아직 이 장에 남긴 묵상이 없어요.</strong>
                            <span>말씀을 선택한 뒤 묵상 버튼으로 기록할 수 있습니다.</span>
                        </div>
                    ) : (
                        <div className="chapter-notes-panel__list">
                            {notes.map(note => {
                                const isSelected = Number(selectedNoteId) === Number(note.id);
                                const isDeleting = Number(pendingDeleteId) === Number(note.id);
                                const isCopied = Number(copiedNoteId) === Number(note.id);
                                return (
                                    <article
                                        key={note.id}
                                        ref={node => {
                                            if (node) noteRefs.current.set(Number(note.id), node);
                                            else noteRefs.current.delete(Number(note.id));
                                        }}
                                        className={`chapter-notes-panel__item${isSelected ? ' is-selected' : ''}`}
                                        tabIndex={-1}
                                        aria-current={isSelected ? 'true' : undefined}
                                    >
                                        <div className="chapter-notes-panel__item-header">
                                            <button type="button" className="chapter-notes-panel__reference" onClick={() => onNavigate(note)}>
                                                {bookName} {chapter}:{toDisplayNoteRange(note)}
                                            </button>
                                            <time dateTime={note.date}>{note.date}</time>
                                        </div>
                                        {renderNoteContent(note.content)}
                                        <div className="chapter-notes-panel__actions">
                                            <button type="button" onClick={() => onCopy(note)} aria-label={`${bookName} ${chapter}:${toDisplayNoteRange(note)} 묵상 복사`}>
                                                {isCopied ? <Check size={17} /> : <Copy size={17} />}
                                                {isCopied ? '복사됨' : '복사'}
                                            </button>
                                            <button type="button" onClick={() => onEdit(note)} aria-label={`${bookName} ${chapter}:${toDisplayNoteRange(note)} 묵상 수정`}>
                                                <Edit2 size={17} /> 수정
                                            </button>
                                            <button type="button" className="is-danger" onClick={() => onDelete(note)} disabled={pendingDeleteId != null} aria-label={`${bookName} ${chapter}:${toDisplayNoteRange(note)} 묵상 삭제`}>
                                                {isDeleting ? <Loader className="animate-spin" size={17} /> : <Trash2 size={17} />}
                                                {isDeleting ? '삭제 중' : '삭제'}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ChapterNotesPanel;
