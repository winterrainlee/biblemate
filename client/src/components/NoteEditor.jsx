
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback } from 'react';
import { Save, Copy, Loader, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { api } from '../services/api';
import { getReadingSummary } from '../utils/bibleUtils';
import { parseDateOnly } from '../utils/dateOnly';
import './NoteEditor.css';

const NoteEditor = forwardRef(({ date, readingLogs, books }, ref) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const textareaRef = useRef(null);

    // Expose method to parent via ref
    useImperativeHandle(ref, () => ({
        insertCitation: (citationText) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.substring(0, start) + citationText + content.substring(end);

            setContent(newContent);

            // Focus and set cursor position after insertion (optional but better UX)
            setTimeout(() => {
                textarea.focus();
                const newPos = start + citationText.length;
                textarea.setSelectionRange(newPos, newPos);
            }, 0);
        },
        focus: () => {
            textareaRef.current?.focus();
        }
    }));

    const loadNote = useCallback(async () => {
        setIsLoading(true);
        try {
            const note = await api.getNote(date);
            setContent(note?.content || '');
            setLastSaved(note?.updated_at || null);
        } catch (error) {
            console.error('Failed to load note', error);
            setContent('');
        } finally {
            setIsLoading(false);
        }
    }, [date]);

    const handleSave = useCallback(async () => {
        if (!date) return;
        setIsSaving(true);
        try {
            await api.saveNote({ date, content });
            setLastSaved(new Date().toISOString());
        } catch (error) {
            console.error('Failed to save note', error);
        } finally {
            setIsSaving(false);
        }
    }, [content, date]);

    // Load note when date changes
    useEffect(() => {
        if (date) {
            loadNote();
        }
    }, [date, loadNote]);

    // Auto-save logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (date && content) {
                // Determine if we need to save? 
                // Simple approach: Just save on debounce if dirty?
                // The API determines if create or update.
                handleSave();
            }
        }, 3000); // 3 seconds debounce

        return () => clearTimeout(timer);
    }, [content, date, handleSave]);

    const handleCopy = () => {
        const dateObj = parseDateOnly(date);
        const dateHeader = dateObj
            ? format(dateObj, '[yyyy년 M월 d일 EEEE]', { locale: ko })
            : `[${date}]`;
        const summaries = getReadingSummary(readingLogs, books);
        const summaryText = summaries.length > 0 ? summaries.join(', ') : '읽은 기록 없음';

        const copyText = `${dateHeader} ${summaryText}\n\n${content}`;

        navigator.clipboard.writeText(copyText).then(() => {
            alert('날짜와 읽은 범위를 포함하여 노트가 복사되었습니다.');
        });
    };

    const handleDelete = async () => {
        if (!confirm('정말 이 노트를 삭제하시겠습니까?')) return;
        try {
            await api.deleteNote(date);
            setContent('');
            setLastSaved(null);
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleApplyForm = () => {
        const form = `[발견한 하나님]
- 본문 구절에 근거해서 '~~한 하나님 (장:절)'으로 작성

[의문점과 대답]
- 읽으며 궁금했던 점과 답을 찾은 내용

[기도로 마무리]
- 

`;
        setContent(prev => form + prev);
    };

    const dateObj = parseDateOnly(date);

    return (
        <div className="note-editor-container">
            <div className="editor-header">
                <h3>{dateObj ? format(dateObj, 'yyyy년 M월 d일 EEEE 묵상기록', { locale: ko }) : '묵상기록'}</h3>
                <div className="editor-actions">
                    <button onClick={handleApplyForm} className="action-btn primary" title="양식 적용">
                        <FileText size={18} />
                        <span className="btn-label">양식</span>
                    </button>
                    <button onClick={() => handleSave()} className="action-btn icon-only" title="저장" disabled={isSaving}>
                        {isSaving ? <Loader size={18} className="spin" /> : <Save size={18} />}
                    </button>
                    <button onClick={handleDelete} className="action-btn icon-only delete" title="삭제">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={handleCopy} className="action-btn" title="복사">
                        <Copy size={18} />
                        <span className="btn-label">복사</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-state">노트 불러오는 중...</div>
            ) : (
                <textarea
                    ref={textareaRef}
                    className="note-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="이날의 말씀을 통해 느낀 점을 기록해보세요..."
                />
            )}

            <div className="editor-footer">
                {lastSaved ? (
                    <span className="save-status">마지막 저장: {format(new Date(lastSaved), 'yyyy-MM-dd HH:mm:ss')}</span>
                ) : (
                    <span className="save-status">저장되지 않음</span>
                )}
            </div>
        </div>
    );
});

export default NoteEditor;
