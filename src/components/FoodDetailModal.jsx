import React from 'react';
import './AddFoodModal.css'; // Reusing common modal styles
import { useLanguage } from '../context/LanguageContext';
import CachedImage from './CachedImage';

const FoodDetailModal = ({ isOpen, onClose, item, onDelete }) => {
    const { t } = useLanguage();

    if (!isOpen || !item) return null;

    const handleDelete = () => {
        if (window.confirm(t('deleteConfirmed') || 'Are you sure you want to delete this item?')) {
            onDelete(item.id);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{item.name}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    {item.image_url && (
                        <div className="product-image-large">
                            <CachedImage src={item.image_url} alt={item.name} />
                        </div>
                    )}

                    <div className="product-details">
                        {item.brand && <div className="brand-name">{item.brand}</div>}
                        <div className="serving-info">{item.serving_size}g</div>
                    </div>

                    <div className="nutrition-preview">
                        <h4>{t('nutritionInfo')}</h4>
                        <div className="nutrition-grid">
                            <div className="nutrition-item">
                                <span className="nutrition-label">{t('calories')}</span>
                                <span className="nutrition-value">{item.calories} kcal</span>
                            </div>
                            <div className="nutrition-item">
                                <span className="nutrition-label">{t('protein')}</span>
                                <span className="nutrition-value">{item.proteins}g</span>
                            </div>
                            <div className="nutrition-item">
                                <span className="nutrition-label">{t('carbs')}</span>
                                <span className="nutrition-value">{item.carbs}g</span>
                            </div>
                            <div className="nutrition-item">
                                <span className="nutrition-label">{t('fats')}</span>
                                <span className="nutrition-value">{item.fats}g</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        {t('cancel')}
                    </button>
                    <button className="btn-primary delete-btn" onClick={handleDelete} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444', color: '#ef4444' }}>
                        {t('delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodDetailModal;
