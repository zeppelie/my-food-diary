import React, { useState, useEffect } from 'react';
import './AuthPage.css';
import { useLanguage } from '../context/LanguageContext';
import { resetPassword } from '../services/dbService';

const ResetPasswordPage = ({ onComplete }) => {
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tkn = urlParams.get('token');
        if (tkn) {
            setToken(tkn);
        } else {
            setError('Missing reset token.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const data = await resetPassword(token, password);
            setMessage(data.message);
            setTimeout(() => {
                onComplete();
                // Clean up URL
                window.history.replaceState({}, document.title, "/");
            }, 3000);
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
                    <h1>Reset Password</h1>
                    <p className="auth-subtitle">Choose a new password for your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-message">{message}</div>}

                    <button type="submit" className="btn-primary auth-submit" disabled={isLoading || !!message}>
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>

                    {message && (
                        <button type="button" className="btn-link" onClick={onComplete} style={{ marginTop: '1rem' }}>
                            Go to Login
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
