import React from 'react';
import './SummaryCard.css';
import { useLanguage } from '../context/LanguageContext';

const MacroRing = ({ radius, value, total, colorClass }) => {
    const circumference = 2 * Math.PI * radius;
    // Cap progress at 1 for the ring visual, but logic handles color
    const percentage = Math.min(Math.max(value / total, 0), 1);
    const dashoffset = circumference - (percentage * circumference);
    const isOver = value > total;

    // If over limit, force colorClass or inline stroke doesn't interact well with CSS class usage unless handled manually.
    // The previous implementation used CSS classes for colors (.macro-item.carbs circle:nth-child(2)).
    // To override, we can just apply a 'danger' style or inline stroke.

    const strokeColor = isOver ? 'var(--danger)' : null;
    const dynamicClass = !isOver ? colorClass : '';

    return (
        <div className="macro-ring-container">
            <svg width={radius * 2 + 10} height={radius * 2 + 10}>
                <circle
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                    r={radius}
                    cx={radius + 5}
                    cy={radius + 5}
                    fill="transparent"
                />
                <circle
                    className={dynamicClass}
                    stroke={strokeColor}
                    strokeWidth="4"
                    r={radius}
                    cx={radius + 5}
                    cy={radius + 5}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s' }}
                />
            </svg>
            <span className="macro-val" style={{ color: isOver ? 'var(--danger)' : 'var(--text-main)' }}>
                {value}g
            </span>
        </div>
    );
};

const SummaryCard = ({
    summary = { goal: 2200, food: 1450, exercise: 320 },
    macros = { carbs: { used: 120, total: 250 }, protein: { used: 90, total: 160 }, fat: { used: 45, total: 70 } }
}) => {
    const { t } = useLanguage();
    const remaining = summary.goal - summary.food + summary.exercise;
    const isOverBudget = remaining < 0;

    // Progress calculation
    const netCalories = summary.food - summary.exercise;
    const percentage = Math.min(Math.max(netCalories / summary.goal, 0), 1);

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (percentage * circumference);

    return (
        <div className="summary-card glass-panel">
            <div className="main-stat">
                <div className="progress-container">
                    <svg width="160" height="160" className="progress-ring">
                        {/* Background Circle */}
                        <circle
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="10"
                            r={radius}
                            cx="80"
                            cy="80"
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <circle
                            stroke={isOverBudget ? 'var(--danger)' : 'var(--primary)'}
                            strokeWidth="10"
                            r={radius}
                            cx="80"
                            cy="80"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s' }}
                        />
                    </svg>
                    <div className="stat-overlay">
                        <span className="remaining-text" style={{ color: isOverBudget ? 'var(--danger)' : 'var(--text-main)' }}>
                            {Math.abs(remaining)}
                        </span>
                        <span className="remaining-label" style={{ color: isOverBudget ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {isOverBudget ? 'Over Limit' : t('remaining')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-item">
                    <span className="label">{t('goal')}</span>
                    <span className="value">{summary.goal}</span>
                </div>
                <div className="stat-item">
                    <span className="label">{t('food')}</span>
                    <span className="value">{summary.food}</span>
                </div>
                <div className="stat-item">
                    <span className="label">{t('exercise')}</span>
                    <span className="value">-{summary.exercise}</span>
                </div>
            </div>

            <div className="macros-row">
                <div className="macro-item carbs">
                    <MacroRing radius={24} value={macros.carbs.used} total={macros.carbs.total} colorClass="" />
                    <span className="macro-label">{t('carbs')}</span>
                </div>
                <div className="macro-item protein">
                    <MacroRing radius={24} value={macros.protein.used} total={macros.protein.total} colorClass="" />
                    <span className="macro-label">{t('protein')}</span>
                </div>
                <div className="macro-item fat">
                    <MacroRing radius={24} value={macros.fat.used} total={macros.fat.total} colorClass="" />
                    <span className="macro-label">{t('fat')}</span>
                </div>
            </div>
        </div>
    );
};
export default SummaryCard;
