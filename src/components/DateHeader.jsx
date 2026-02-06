import React from 'react';
import './DateHeader.css';
import { useLanguage } from '../context/LanguageContext';

const DateHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="date-header glass-panel">
      <button className="nav-btn" aria-label="Previous day">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div className="date-display">
        <span className="day-name">{t('today')}</span>
        <span className="full-date">Fri, Feb 6</span>
      </div>
      <button className="nav-btn" aria-label="Next day">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
};
export default DateHeader;
