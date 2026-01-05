
import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PenTool } from 'lucide-react';
import { getReadingSummary } from '../utils/bibleUtils';
import './NotePreview.css';

const NotePreview = ({ date, note, readingLogs, books, onClick }) => {
    // 읽은 말씀 요약 생성 (유틸리티 사용)
    const getReadingSummaryElements = () => {
        const summaries = getReadingSummary(readingLogs, books);
        if (summaries.length === 0) return null;

        return summaries.map((text, index) => (
            <div key={index} className="reading-range-item">
                📖 {text}
            </div>
        ));
    };

    return (
        <div className="note-preview-container" onClick={onClick}>
            <div className="note-preview-header">
                <span className="preview-title">
                    <PenTool size={14} />
                    {format(new Date(date), 'M월 d일 (EEEE)', { locale: ko })} 오늘의 말씀
                </span>
            </div>

            <div className="note-preview-content">
                <div className="reading-summary">
                    {getReadingSummaryElements() || <p className="no-reading">읽은 말씀 기록이 없습니다.</p>}
                </div>
            </div>
        </div>
    );
};

export default NotePreview;
