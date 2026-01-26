import React, { useState } from 'react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday
} from 'date-fns';
import { ko } from 'date-fns/locale'; // 한국어 로케일
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Calendar.css';

const Calendar = ({ readingLogs = [], compact = false, onDateClick, selectedDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart); // 일요일 시작
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // 날짜별 로그 매핑
    const getLogForDate = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        return readingLogs.filter(log => log.date === formattedDate);
    };

    const handleDayClick = (day, logs) => {
        if (onDateClick) {
            onDateClick(day, logs);
        }
    };

    const handleTodayClick = () => {
        const today = new Date();
        setCurrentMonth(today);
        if (onDateClick) {
            onDateClick(today, getLogForDate(today));
        }
    };

    const handleYearChange = (e) => {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(parseInt(e.target.value));
        setCurrentMonth(newDate);
    };

    const handleMonthChange = (e) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(parseInt(e.target.value));
        setCurrentMonth(newDate);
    };

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let y = 2000; y <= currentYear + 10; y++) {
        years.push(y);
    }
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div className={`calendar-container ${compact ? 'compact' : ''}`}>
            <div className="calendar-header">
                <button onClick={prevMonth} className="nav-btn prev-btn"><ChevronLeft size={20} /></button>
                <div className="calendar-title-selectors">
                    <select
                        value={currentMonth.getFullYear()}
                        onChange={handleYearChange}
                        className="year-select"
                    >
                        {years.map(y => <option key={y} value={y}>{y}년</option>)}
                    </select>
                    <select
                        value={currentMonth.getMonth()}
                        onChange={handleMonthChange}
                        className="month-select"
                    >
                        {months.map(m => <option key={m} value={m}>{m + 1}월</option>)}
                    </select>
                </div>
                <div className="calendar-nav">
                    <button onClick={nextMonth} className="nav-btn"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="calendar-grid">
                {weekDays.map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                ))}

                {days.map(day => {
                    const logs = getLogForDate(day);
                    const hasLog = logs.length > 0;
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                        <div
                            key={day.toString()}
                            className={`calendar-day 
                ${!isSameMonth(day, monthStart) ? 'disabled' : ''} 
                ${isToday(day) ? 'today' : ''}
                ${hasLog ? 'has-log' : ''}
                ${isSelected ? 'selected' : ''}
              `}
                            onClick={() => handleDayClick(day, logs)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="day-number">{format(day, 'd')}</span>
                            {hasLog && (
                                <div className="day-markers">
                                    {logs.slice(0, 3).map((log, idx) => (
                                        <span key={idx} className="log-dot" title={`${log.book} ${log.chapter}장`} />
                                    ))}
                                    {logs.length > 3 && <span className="log-more">+</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

export default React.memo(Calendar);
