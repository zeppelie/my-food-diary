/**
 * Diary Database Service
 * 
 * Handles API calls to the local Node/SQLite backend.
 */

/**
 * Fetch all meals for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} List of meal entries
 */
export const fetchMealsByDate = async (date) => {
    try {
        const response = await fetch(`/api/meals/${date}`);
        if (!response.ok) throw new Error('Failed to fetch meals');
        return await response.json();
    } catch (error) {
        console.error('Error fetching meals:', error);
        return [];
    }
};

/**
 * Add a new meal entry to the database
 * @param {Object} mealData - The meal object to save
 * @returns {Promise<Object>} The saved meal response
 */
export const saveMealEntry = async (mealData) => {
    try {
        const response = await fetch('/api/meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mealData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save meal');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving meal:', error);
        throw error;
    }
};

/**
 * Delete a meal entry from the database
 * @param {number} id - The ID of the entry to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteMealEntry = async (id) => {
    try {
        const response = await fetch(`/api/meals/${id}`, {
            method: 'DELETE',
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting meal:', error);
        return false;
    }
};

/**
 * Get cached search results for a query
 * @param {string} query - The search query
 * @returns {Promise<Array|null>} Cached results or null if not found
 */
export const getCachedSearch = async (query) => {
    try {
        const response = await fetch(`/api/search/cache?q=${encodeURIComponent(query)}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching search cache:', error);
        return null;
    }
};

/**
 * Cache search results for a query
 * @param {string} query - The search query
 * @param {Array} results - The results to cache
 * @returns {Promise<boolean>} Success status
 */
export const cacheSearchResults = async (query, results) => {
    try {
        const response = await fetch('/api/search/cache', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, results }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error caching search results:', error);
        return false;
    }
};
