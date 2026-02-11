/**
 * Image Service - Handles local caching of food product images
 * using the browser's Cache API.
 */

const CACHE_NAME = 'food-diary-images-v1';

/**
 * Caches an image URL locally
 * @param {string} url - The image URL to cache
 */
export const cacheImage = async (url) => {
    if (!url || !('caches' in window)) return;

    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
            await cache.put(url, response);
        }
    } catch (error) {
        console.warn('Failed to cache image:', url, error);
    }
};

/**
 * Retrieves a cached image URL or returns the original
 * @param {string} url - The original image URL
 * @returns {Promise<string>} - The cached blob URL or original URL
 */
export const getCachedImage = async (url) => {
    if (!url || !('caches' in window)) return url;

    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
            const blob = await cachedResponse.blob();
            return URL.createObjectURL(blob);
        }

        // If not in cache, we could choose to cache it now
        // but let's keep it simple and just return original
        return url;
    } catch (error) {
        return url;
    }
};

/**
 * Clear all cached images
 */
export const clearImageCache = async () => {
    if ('caches' in window) {
        await caches.delete(CACHE_NAME);
    }
};
