import React, { useState } from 'react';
import './AuthPage.css';
import { useLanguage } from '../context/LanguageContext';
import { login, signup, forgotPassword } from '../services/dbService';

const AuthPage = ({ onAuthSuccess }) => {
    const { t } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const data = await login(email, password);
                onAuthSuccess(data.user);
            } else {
                const data = await signup(email, password, name);
                onAuthSuccess(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email first');
            return;
        }
        setIsLoading(true);
        try {
            const data = await forgotPassword(email);
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <div className="brand-logo">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <h1>{isLogin ? t('login') : t('signup')}</h1>
                    <p className="auth-subtitle">Girt Food Diary</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label>{t('fullName')}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>{t('email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-message">{message}</div>}

                    <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
                        {isLoading
                            ? (isLogin ? t('signingIn') : t('signingUp'))
                            : (isLogin ? t('login') : t('signup'))
                        }
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin && (
                        <button className="btn-link" onClick={handleForgotPassword}>
                            {t('forgotPassword')}
                        </button>
                    )}

                    <button className="btn-link toggle-auth" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? t('needAccount') : t('alreadyHaveAccount')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
