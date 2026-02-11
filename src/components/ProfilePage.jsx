import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useLanguage } from '../context/LanguageContext';
import { fetchUserProfile, updateUserProfile } from '../services/dbService';

const ProfilePage = ({ onBack }) => {
    const { t } = useLanguage();
    const [profile, setProfile] = useState({
        weight: 70,
        height: 170,
        age: 30,
        gender: 'male',
        activity_level: 1.2,
        daily_kcal_goal: 2000,
        use_custom_goal: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchUserProfile();
                if (data) {
                    setProfile({
                        ...data,
                        weight: data.weight || 70,
                        height: data.height || 170,
                        age: data.age || 30,
                        gender: data.gender || 'male',
                        activity_level: data.activity_level || 1.2,
                        daily_kcal_goal: data.daily_kcal_goal || 2000,
                        use_custom_goal: !!data.use_custom_goal
                    });
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const calculateKcal = (p) => {
        // Mifflin-St Jeor Equation
        let bmr;
        if (p.gender === 'male') {
            bmr = (10 * p.weight) + (6.25 * p.height) - (5 * p.age) + 5;
        } else {
            bmr = (10 * p.weight) + (6.25 * p.height) - (5 * p.age) - 161;
        }
        return Math.round(bmr * p.activity_level);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const processedValue = name === 'gender' ? value : parseFloat(value);

        setProfile(prev => {
            const nextProfile = { ...prev, [name]: processedValue };

            // Only update goal automatically if NOT using a custom goal
            if (!nextProfile.use_custom_goal && name !== 'daily_kcal_goal') {
                nextProfile.daily_kcal_goal = calculateKcal(nextProfile);
            }

            return nextProfile;
        });
    };

    const handleToggleCustom = (e) => {
        const checked = e.target.checked;
        setProfile(prev => {
            const nextProfile = { ...prev, use_custom_goal: checked };
            if (!checked) {
                nextProfile.daily_kcal_goal = calculateKcal(nextProfile);
            }
            return nextProfile;
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');
        try {
            await updateUserProfile(profile);
            setMessage(t('profileUpdated'));
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="loading-screen">{t('loadingProfile')}</div>;

    return (
        <div className="profile-page-container">
            <div className="profile-card glass-panel">
                <div className="profile-header">
                    <button className="back-btn" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <h1>{t('profile')}</h1>
                </div>

                <form className="profile-form" onSubmit={handleSave}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('weight')}</label>
                            <input
                                type="number"
                                name="weight"
                                value={profile.weight}
                                onChange={handleInputChange}
                                step="0.1"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('height')}</label>
                            <input
                                type="number"
                                name="height"
                                value={profile.height}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('age')}</label>
                            <input
                                type="number"
                                name="age"
                                value={profile.age}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('gender')}</label>
                            <select name="gender" value={profile.gender} onChange={handleInputChange}>
                                <option value="male">{t('male')}</option>
                                <option value="female">{t('female')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('activityLevel')}</label>
                        <select name="activity_level" value={profile.activity_level} onChange={handleInputChange}>
                            <option value="1.2">{t('sedentary')} (1.2)</option>
                            <option value="1.375">{t('lightlyActive')} (1.375)</option>
                            <option value="1.55">{t('moderatelyActive')} (1.55)</option>
                            <option value="1.725">{t('veryActive')} (1.725)</option>
                        </select>
                    </div>

                    <div className="custom-goal-toggle">
                        <label className="switch-container">
                            <input
                                type="checkbox"
                                checked={profile.use_custom_goal}
                                onChange={handleToggleCustom}
                            />
                            <span className="switch-label">{t('useCustomGoal')}</span>
                        </label>
                    </div>

                    <div className={`goal-preview card-glass ${profile.use_custom_goal ? 'is-custom' : ''}`}>
                        <h3>{profile.use_custom_goal ? t('customGoal') : t('dailyGoalCalc')}</h3>
                        {profile.use_custom_goal ? (
                            <div className="custom-goal-input-wrapper">
                                <input
                                    type="number"
                                    name="daily_kcal_goal"
                                    value={profile.daily_kcal_goal}
                                    onChange={handleInputChange}
                                    className="goal-input"
                                />
                                <span className="goal-unit">{t('kcal')}</span>
                            </div>
                        ) : (
                            <div className="goal-value">{profile.daily_kcal_goal} <span>{t('kcal')}</span></div>
                        )}
                        <p className="calculation-hint">
                            {profile.use_custom_goal
                                ? t('customGoalHint')
                                : t('calcGoalHint')}
                        </p>
                    </div>

                    {message && <div className="auth-message">{message}</div>}

                    <button type="submit" className="btn-primary save-btn" disabled={isSaving}>
                        {isSaving ? '...' : t('saveProfile')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
