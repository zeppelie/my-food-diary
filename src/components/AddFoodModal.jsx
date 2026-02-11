import React, { useState, useEffect } from 'react';
import './AddFoodModal.css';
import { searchFoodProducts } from '../services/foodService';
import { useDebouncedCallback } from '../utils/debounce';
import { useLanguage } from '../context/LanguageContext';
import { getCachedSearch, cacheSearchResults } from '../services/dbService';
import CachedImage from './CachedImage';

/**
 * AddFoodModal Component
 * 
 * Modal dialog for searching and adding food items to meals.
 * Features caching, loading states, and error handling.
 */
const AddFoodModal = ({ isOpen, onClose, onAddFood, mealType }) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [servingSize, setServingSize] = useState(100);

    // Manual search function (uses cache first, then API)
    const handleSearch = async (query, forceApi = false) => {
        const trimmedQuery = (typeof query === 'string' ? query : searchQuery).trim();
        if (!trimmedQuery || trimmedQuery.length < 2) {
            setSearchResults([]);
            setIsLoading(false);
            return;
        }

        // If results are already here (e.g. from proactive cache check), don't show loading
        const alreadyHaveCachedResults = searchResults.length > 0 &&
            (query === undefined || query === searchQuery);

        if (!alreadyHaveCachedResults || forceApi) {
            setIsLoading(true);
        }

        setError(null);

        try {
            // Check cache first
            const cachedResults = await getCachedSearch(trimmedQuery);
            if (cachedResults && cachedResults.length > 0) {
                setSearchResults(cachedResults);

                // If we're not forcing API, we can return early with cached results
                if (!forceApi) {
                    setIsLoading(false);
                    return;
                }
                // If we ARE forcing API, we keep going to get fresh data from OpenFoodFacts
                console.log('🔄 Cache hit, but forcing API refresh for complete search...');
            }

            // Fallback to API (or forced API refresh)
            const results = await searchFoodProducts(trimmedQuery, 30);

            // Only update if we got results (avoid clearing cache if API fails)
            if (results && results.length > 0) {
                setSearchResults(results);
                // Update cache with fresh data
                await cacheSearchResults(trimmedQuery, results);
            } else if (!cachedResults || cachedResults.length === 0) {
                // Only clear if we have absolutely nothing
                setSearchResults([]);
            }
        } catch (err) {
            // If we had cached results, don't show error if API fails (just keep cache)
            if (searchResults.length === 0) {
                setError(err.message);
            } else {
                console.warn('API fetch failed after cache hit:', err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced Cache Check (on change)
    const debouncedCheckCache = useDebouncedCallback(async (value) => {
        const trimmed = value.trim();
        if (trimmed.length < 2) return;

        try {
            const cached = await getCachedSearch(trimmed);
            if (cached && cached.length > 0) {
                setSearchResults(cached);
            }
        } catch (err) {
            console.error('Proactive cache check failed:', err);
        }
    }, 100);

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Be proactive: if we already searched this, show it immediately!
        // Using debounced version to reduce server load
        debouncedCheckCache(value);
    };

    // Handle key down (specific for Enter)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // If a product is selected, add it to the diary
            if (selectedProduct) {
                handleAddFood();
            } else {
                // Otherwise, perform search - FORCE API call on Enter
                handleSearch(searchQuery, true);
            }
        }
    };

    // Calculate nutrition for selected serving size
    const calculateNutrition = (product) => {
        const multiplier = servingSize / 100;
        return {
            calories: Math.round(product.calories * multiplier),
            proteins: parseFloat((product.macros.proteins * multiplier).toFixed(1)),
            carbs: parseFloat((product.macros.carbs * multiplier).toFixed(1)),
            fats: parseFloat((product.macros.fats * multiplier).toFixed(1))
        };
    };

    // Handle adding food to meal
    const handleAddFood = () => {
        if (!selectedProduct) return;

        const nutrition = calculateNutrition(selectedProduct);

        const foodItem = {
            name: selectedProduct.name,
            brand: selectedProduct.brand,
            imageUrl: selectedProduct.imageUrl,
            servingSize: servingSize,
            cals: nutrition.calories,
            macros: {
                proteins: nutrition.proteins,
                carbs: nutrition.carbs,
                fats: nutrition.fats
            }
        };

        onAddFood(foodItem, mealType);
        handleClose();
    };

    // Reset modal state
    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedProduct(null);
        setServingSize(100);
        setError(null);
        onClose();
    };

    // Don't render if not open
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header">
                    <h2>{t('addFood')} - {mealType}</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Search Input */}
                <div className="search-section">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t('searchFood') || 'Search for food...'}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        {isLoading && (
                            <div className="loading-spinner"></div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Search Results */}
                <div className="results-section">
                    {searchResults.length > 0 ? (
                        <div className="results-list">
                            {searchResults.map((product) => (
                                <div
                                    key={product.id}
                                    className={`result-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        // Automatically set serving size from API suggestion if available
                                        if (product.suggestedServingSize) {
                                            setServingSize(product.suggestedServingSize);
                                        } else {
                                            setServingSize(100);
                                        }
                                    }}
                                >
                                    {product.imageUrl && (
                                        <CachedImage src={product.imageUrl} alt={product.name} className="product-image" />
                                    )}
                                    <div className="product-info">
                                        <div className="product-name">{product.name}</div>
                                        {product.brand && <div className="product-brand">{product.brand}</div>}
                                        <div className="product-nutrition">
                                            {product.calories} kcal |
                                            P: {product.macros.proteins}g |
                                            C: {product.macros.carbs}g |
                                            F: {product.macros.fats}g
                                            <span className="per-100g"> (per 100g)</span>
                                            {product.suggestedServingSize && product.suggestedServingSize !== 100 && (
                                                <div className="suggested-portion">
                                                    💡 Portion: {product.suggestedServingSize}g
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery.length >= 2 && !isLoading ? (
                        <div className="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <p>{t('noResults') || 'No results found'}</p>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 6v6l4 2"></path>
                            </svg>
                            <p>{t('startTyping') || 'Start typing to search for food...'}</p>
                        </div>
                    )}
                </div>

                {/* Selected Product Details */}
                {selectedProduct && (
                    <div className="selected-product-section">
                        <h3>{t('servingSize') || 'Serving Size'}</h3>
                        <div className="serving-size-input">
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={servingSize}
                                onChange={(e) => setServingSize(Math.max(1, parseInt(e.target.value) || 100))}
                            />
                            <span>g</span>
                        </div>

                        <div className="nutrition-preview">
                            <h4>{t('nutritionInfo') || 'Nutrition Information'}</h4>
                            {(() => {
                                const nutrition = calculateNutrition(selectedProduct);
                                return (
                                    <div className="nutrition-grid">
                                        <div className="nutrition-item">
                                            <span className="nutrition-label">{t('calories') || 'Calories'}</span>
                                            <span className="nutrition-value">{nutrition.calories} kcal</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-label">{t('protein') || 'Protein'}</span>
                                            <span className="nutrition-value">{nutrition.proteins}g</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-label">{t('carbs') || 'Carbs'}</span>
                                            <span className="nutrition-value">{nutrition.carbs}g</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-label">{t('fats') || 'Fats'}</span>
                                            <span className="nutrition-value">{nutrition.fats}g</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={handleClose}>
                        {t('cancel') || 'Cancel'}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleAddFood}
                        disabled={!selectedProduct}
                    >
                        {t('add') || 'Add to'} {mealType}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddFoodModal;
