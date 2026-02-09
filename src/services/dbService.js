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
