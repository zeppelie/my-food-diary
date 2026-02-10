import React, { useState } from 'react';
import './MealSection.css';
import { useLanguage } from '../context/LanguageContext';
import AddFoodModal from './AddFoodModal';
import FoodDetailModal from './FoodDetailModal';

const MealSection = ({ title, items = [], onAddFood, onDeleteItem }) => {
    const { t } = useLanguage();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const totalCalories = items.reduce((acc, item) => acc + (item.calories || item.cals || 0), 0);

    const handleAddFood = (foodItem) => {
        if (onAddFood) {
            onAddFood(foodItem);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    return (
        <>
            <div className="meal-section glass-panel">
                <div className="meal-header">
                    <h3>{title}</h3>
                    <span className="meal-cals">{totalCalories} {t('kcal')}</span>
                </div>

                <div className="meal-items">
                    {items.length > 0 ? (
                        items.map((item, idx) => (
                            <div
                                key={item.id || idx}
                                className="meal-item clickable"
                                onClick={() => handleItemClick(item)}
                            >
                                <span className="meal-item-name">{item.name}</span>
                                <span className="meal-item-cals">{item.calories || item.cals}</span>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">{t('noItems')}</div>
                    )}
                </div>

                <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    {t('addFood')}
                </button>
            </div>

            <AddFoodModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddFood={handleAddFood}
                mealType={title}
            />

            <FoodDetailModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
                onDelete={onDeleteItem}
            />
        </>
    );
};
export default MealSection;

