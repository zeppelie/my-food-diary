import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';
import usFlag from '../assets/us_flag.svg';
import itFlag from '../assets/it_flag.svg';

const LanguageSwitcher = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button className="language-switcher" onClick={toggleLanguage} aria-label="Switch Language">
            <span className="lang-code">
                {language === 'en' ? 'EN' : 'IT'}
            </span>
            <img
                src={language === 'en' ? usFlag : itFlag}
                alt={language === 'en' ? 'US Flag' : 'Italian Flag'}
                className="lang-flag-img"
            />
        </button>
    );
};
export default LanguageSwitcher;
