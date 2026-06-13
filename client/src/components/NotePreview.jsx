
import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PenTool } from 'lucide-react';
import { getReadingSummary } from '../utils/bibleUtils';
import { parseDateOnly } from '../utils/dateOnly';
import './NotePreview.css';

const NotePreview = ({ date, readingLogs, books, onClick }) => {
    const parsedDate = parseDateOnly(date);
    // 읽은 말씀 요약 생성 (유틸리티 사용)
    const getReadingSummaryElements = () => {
        // 읽은 순서(ID순)대로 정렬하여 표시
        const sortedLogs = [...readingLogs].sort((a, b) => a.id - b.id);
        const summaries = getReadingSummary(sortedLogs, books);
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
                    {parsedDate ? format(parsedDate, 'M월 d일 (EEEE)', { locale: ko }) : ''} 오늘 펼친 말씀
                </span>
            </div>

            <div className="note-preview-content">
                <div className="reading-summary">
                    {getReadingSummaryElements() || <p className="no-reading">아직 펼친 말씀이 없어요.</p>}
                </div>
            </div>
        </div>
    );
};

export default NotePreview;
