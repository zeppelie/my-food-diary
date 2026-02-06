import React, { useRef } from 'react';
import './DateHeader.css';
import { useLanguage } from '../context/LanguageContext';

const DateHeader = ({ currentDate = new Date(), onDateChange }) => {
  const { t, language } = useLanguage();
  const dateInputRef = useRef(null);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleDateClick = () => {
    if (dateInputRef.current) {
      // Try to show picker (modern browsers) or focus
      if (dateInputRef.current.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.value) {
      onDateChange(new Date(e.target.value));
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Format yyyy-mm-dd for input value
  const dateValue = currentDate.toISOString().split('T')[0];

  return (
    <div className="date-header glass-panel">
      <button className="nav-btn" onClick={handlePrevDay} aria-label="Previous day">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div className="date-display" onClick={handleDateClick} title="Choose date">
        <span className="day-name">{isToday(currentDate) ? t('today') : ''}&nbsp;</span>
        <span className="full-date">{formatDate(currentDate)}</span>

        <input
          type="date"
          ref={dateInputRef}
          value={dateValue}
          onChange={handleInputChange}
          className="hidden-date-input"
          aria-label="Select Date"
        />
      </div>

      <div className="right-nav-group">
        {!isToday(currentDate) && (
          <button className="return-today-btn" onClick={() => onDateChange(new Date())}>
            {t('today')}
          </button>
        )}
        <button className="nav-btn" onClick={handleNextDay} aria-label="Next day">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};
export default DateHeader;
