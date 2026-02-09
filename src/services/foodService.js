/**
 * Food Service - Open Food Facts API Integration
 * 
 * This service handles fetching and mapping food product data from the
 * Open Food Facts API to the local application schema.
 * 
 * Configured for Italian products using it.openfoodfacts.org
 */

// Use Italian Open Food Facts endpoint for better Italian product coverage
// Use Italian Open Food Facts subdomain for faster regional routing
const OPEN_FOOD_FACTS_API = 'https://it.openfoodfacts.org/cgi/search.pl';
const OPEN_FOOD_FACTS_PRODUCT_API = 'https://it.openfoodfacts.org/api/v0/product';


/**
 * @typedef {Object} FoodProduct
 * @property {string} id - Unique product identifier (barcode)
 * @property {string} name - Product name
 * @property {number} calories - Calories per 100g
 * @property {Object} macros - Macronutrients per 100g
 * @property {number} macros.proteins - Protein in grams
 * @property {number} macros.carbs - Carbohydrates in grams
 * @property {number} macros.fats - Fats in grams
 * @property {string|null} imageUrl - Product image URL
 * @property {string|null} brand - Product brand
 */

/**
 * Maps Open Food Facts API response to local data schema
 * @param {Object} apiProduct - Raw product data from API
 * @returns {FoodProduct|null} Mapped product or null if invalid
 */
const mapProductToSchema = (apiProduct) => {
    try {
        // Extract nutriments (per 100g by default in Open Food Facts)
        const nutriments = apiProduct.nutriments || {};

        // Get product name (Strictly using product_name as requested in limited fields)
        const name = apiProduct.product_name || 'Unknown Product';

        // Skip products without basic nutritional data
        if (name === 'Unknown Product' && !nutriments['energy-kcal_100g']) {
            return null;
        }

        return {
            id: apiProduct.code || apiProduct._id || `temp-${Date.now()}`,
            name: name,
            calories: Math.round(
                nutriments['energy-kcal_100g'] ||
                nutriments['energy-kcal'] ||
                (nutriments['energy-kj_100g'] ? nutriments['energy-kj_100g'] / 4.184 : 0) ||
                (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0)
            ),
            macros: {
                proteins: parseFloat((nutriments.proteins_100g || nutriments.proteins || 0).toFixed(1)),
                carbs: parseFloat((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0).toFixed(1)),
                fats: parseFloat((nutriments.fat_100g || nutriments.fat || 0).toFixed(1))
            },
            imageUrl: apiProduct.image_front_url || null,
            brand: null // Field excluded for performance optimization
        };
    } catch (error) {
        console.error('Error mapping product:', error);
        return null;
    }
};

/**
 * Searches for food products using the Open Food Facts API
 * @param {string} searchQuery - Search term
 * @param {number} pageSize - Number of results to return (default: 20)
 * @returns {Promise<FoodProduct[]>} Array of mapped food products
 * @throws {Error} If the API request fails
 */
export const searchFoodProducts = async (searchQuery, pageSize = 20) => {
    // Validate input
    if (!searchQuery || typeof searchQuery !== 'string') {
        throw new Error('Search query must be a non-empty string');
    }

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length === 0) {
        return [];
    }

    try {
        // Build API URL with localized parameters and strictly limited fields
        const params = new URLSearchParams({
            search_terms: trimmedQuery,
            action: 'process',
            json: '1',
            page_size: '15', // Reduced payload size
            cc: 'it',       // Country: Italy
            lc: 'it',       // Language: Italian
            fields: 'code,product_name,nutriments,image_front_url' // Strictly limited fields
        });

        const url = `${OPEN_FOOD_FACTS_API}?${params.toString()}`;

        console.log('🔍 Searching for:', trimmedQuery);
        console.log('📡 API URL:', url);

        // Fetch data with increased timeout (30 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.warn('⏱️ Request timeout after 60 seconds');
            controller.abort();
        }, 60000); // Increased to 60 seconds

        const fetchStartTime = Date.now();

        const response = await fetch(url, {
            signal: controller.signal,
            mode: 'cors'
        });

        clearTimeout(timeoutId);

        const fetchDuration = Date.now() - fetchStartTime;
        console.log(`✅ Response received in ${fetchDuration}ms`);

        if (!response.ok) {
            console.error('❌ API response not OK:', response.status, response.statusText);
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`📦 Received ${data.products?.length || 0} products from API`);

        // Map and filter products
        const products = (data.products || [])
            .map(mapProductToSchema)
            .filter(product => product !== null);

        console.log(`✨ Mapped to ${products.length} valid products`);
        return products;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ Request aborted due to timeout');
            throw new Error('Request timeout - the server is taking too long to respond. Please try again.');
        }

        if (error.message.includes('Failed to fetch')) {
            console.error('❌ Network error - possibly CORS or connection issue');
            throw new Error('Network error - please check your internet connection');
        }

        console.error('❌ Food search error:', error);
        throw new Error(`Failed to search food products: ${error.message}`);
    }
};

/**
 * Fetches a specific product by barcode
 * @param {string} barcode - Product barcode
 * @returns {Promise<FoodProduct|null>} Mapped product or null if not found
 */
export const getProductByBarcode = async (barcode) => {
    if (!barcode || typeof barcode !== 'string') {
        throw new Error('Barcode must be a non-empty string');
    }

    try {
        const url = `${OPEN_FOOD_FACTS_PRODUCT_API}/${barcode}.json`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 0 || !data.product) {
            return null;
        }

        return mapProductToSchema(data.product);

    } catch (error) {
        console.error('Product fetch error:', error);
        throw new Error(`Failed to fetch product: ${error.message}`);
    }
};
