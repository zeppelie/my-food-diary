/**
 * Diary Database Service
 * 
 * Handles API calls to the local Node/SQLite backend with JWT support.
 */

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const setAuthToken = (token) => localStorage.setItem('auth_token', token);
export const removeAuthToken = () => localStorage.removeItem('auth_token');
export const getAuthToken = () => localStorage.getItem('auth_token');

/**
 * Authentication Methods
 */
export const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Login failed');
    }
    const data = await response.json();
    setAuthToken(data.token);
    return data;
};

export const signup = async (email, password, name) => {
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Signup failed');
    }
    const data = await response.json();
    setAuthToken(data.token);
    return data;
};

export const forgotPassword = async (email) => {
    const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return await response.json();
};

export const resetPassword = async (token, newPassword) => {
    const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Reset failed');
    }
    return await response.json();
};

/**
 * User Profile Methods
 */
export const fetchUserProfile = async () => {
    const response = await fetch('/api/user/profile', {
        headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
};

export const updateUserProfile = async (profileData) => {
    const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
};

/**
 * Meal Methods (Protected)
 */
export const fetchMealsByDate = async (date) => {
    try {
        const response = await fetch(`/api/meals/${date}`, {
            headers: { ...getAuthHeader() }
        });
        if (response.status === 401) {
            removeAuthToken();
            window.location.reload(); // Force login
            return [];
        }
        if (!response.ok) throw new Error('Failed to fetch meals');
        return await response.json();
    } catch (error) {
        console.error('Error fetching meals:', error);
        return [];
    }
};

export const saveMealEntry = async (mealData) => {
    const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify(mealData),
    });

    if (!response.ok) {
        if (response.status === 401) {
            removeAuthToken();
            window.location.reload();
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to save meal');
    }

    return await response.json();
};

export const deleteMealEntry = async (id) => {
    try {
        const response = await fetch(`/api/meals/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        if (response.status === 401) {
            removeAuthToken();
            window.location.reload();
            return false;
        }
        return response.ok;
    } catch (error) {
        console.error('Error deleting meal:', error);
        return false;
    }
};

/**
 * Cache Methods (Unprotected)
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

export const cacheSearchResults = async (query, results) => {
    try {
        const response = await fetch('/api/search/cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, results }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error caching search results:', error);
        return false;
    }
};
