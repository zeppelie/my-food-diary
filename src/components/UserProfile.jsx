import React, { useState, useRef, useEffect } from 'react';
import './UserProfile.css';
import { useLanguage } from '../context/LanguageContext';

const UserProfile = ({ user, onLogout, onProfileClick }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        setIsOpen(false);
        onLogout();
    };

    const handleProfileClick = () => {
        setIsOpen(false);
        onProfileClick();
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getInitials = (name) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="user-profile-container" ref={menuRef}>
            <button className="profile-trigger glass-panel" onClick={toggleMenu} aria-label="User profile">
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                    <div className="avatar-placeholder">{getInitials(user?.name)}</div>
                )}
            </button>

            {isOpen && (
                <div className="profile-dropdown glass-panel">
                    <div className="user-info-brief">
                        <p className="user-name">{user?.name}</p>
                        <p className="user-email">{user?.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <ul className="dropdown-menu">
                        <li className="menu-item" onClick={handleProfileClick}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            {t('profile')}
                        </li>
                        <li className="menu-item logout" onClick={handleLogout}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            {t('logout')}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
