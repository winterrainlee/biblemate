import React, { useId } from 'react';
import { Loader, Send, X } from 'lucide-react';
import { isComposerDirty, toDisplayVerseRange } from './reflectionComposerModel';
import './ReflectionComposer.css';

const ReflectionComposer = ({ session, onDraftChange, onSubmit, onClose }) => {
    const quoteId = useId();
    const { selectionSnapshot, draft, status, error, mode } = session;
    const displayRange = toDisplayVerseRange(selectionSnapshot.verseRange);
    const selectedText = selectionSnapshot.verseItems
        .map(item => selectionSnapshot.verseItems.length === 1 ? item.text : `${item.verse} ${item.text}`)
        .join('\n');
    const isSaving = status === 'saving';
    const canSubmit = draft.memo.trim().length > 0 && !isSaving;

    return (
        <div className="reflection-composer-layer">
            <div className="reflection-composer-backdrop" onMouseDown={onClose} aria-hidden="true" />
            <section
                className="reflection-composer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reflection-composer-title"
                aria-busy={isSaving}
            >
                <header className="reflection-composer__header">
                    <div>
                        <div className="reflection-composer__eyebrow">{mode === 'edit' ? '묵상 수정' : '새 묵상'}</div>
                        <h2 id="reflection-composer-title">
                            {selectionSnapshot.bookName} {selectionSnapshot.chapter}:{displayRange}
                        </h2>
                    </div>
                    <button
                        type="button"
                        className="reflection-composer__close"
                        onClick={onClose}
                        aria-label="묵상 작성 닫기"
                        disabled={isSaving}
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="reflection-composer__body">
                    <div className="reflection-composer__selection">
                        <div className="reflection-composer__reference">
                            {selectionSnapshot.bookName} {selectionSnapshot.chapter}:{displayRange}
                            <span>{selectionSnapshot.versionLabel}</span>
                        </div>
                        <div className="reflection-composer__selected-text">{selectedText}</div>
                    </div>

                    <label className="reflection-composer__quote-toggle" htmlFor={quoteId}>
                        <input
                            id={quoteId}
                            type="checkbox"
                            checked={draft.quoteEnabled}
                            onChange={event => onDraftChange({ quoteEnabled: event.target.checked })}
                            disabled={isSaving}
                        />
                        말씀 인용
                    </label>

                    {draft.quoteEnabled && (
                        <textarea
                            className="reflection-composer__quote"
                            value={draft.quoteText}
                            onChange={event => onDraftChange({ quoteText: event.target.value })}
                            aria-label="인용할 말씀"
                            disabled={isSaving}
                        />
                    )}

                    <textarea
                        className="reflection-composer__memo"
                        autoFocus
                        value={draft.memo}
                        onChange={event => onDraftChange({ memo: event.target.value })}
                        placeholder="이 말씀을 통해 주신 마음을 적어보세요..."
                        aria-label="묵상 내용"
                        disabled={isSaving}
                        onKeyDown={event => {
                            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && canSubmit) {
                                event.preventDefault();
                                onSubmit();
                            }
                        }}
                    />

                    {error && <div className="reflection-composer__error" role="alert">{error}</div>}
                </div>

                <footer className="reflection-composer__actions">
                    <span className="reflection-composer__dirty-status" aria-live="polite">
                        {isComposerDirty(session) && !isSaving ? '저장하지 않은 변경사항이 있습니다.' : ''}
                    </span>
                    <button
                        type="button"
                        className="reflection-composer__cancel"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className="reflection-composer__save"
                        onClick={onSubmit}
                        disabled={!canSubmit}
                    >
                        {isSaving ? <Loader size={17} className="animate-spin" /> : <Send size={17} />}
                        {isSaving ? '저장 중' : '저장'}
                    </button>
                </footer>
            </section>
        </div>
    );
};

export default ReflectionComposer;
