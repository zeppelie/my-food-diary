/**
 * Food Service Test Examples
 * 
 * This file demonstrates how to use the food service functions.
 * You can run these tests in the browser console or integrate them into your app.
 */

import { searchFoodProducts, getProductByBarcode } from './services/foodService';

/**
 * Test 1: Basic Search
 */
export async function testBasicSearch() {
    console.log('🔍 Testing basic search...');

    try {
        const results = await searchFoodProducts('banana', 5);
        console.log(`✅ Found ${results.length} products`);
        console.log('First result:', results[0]);
        return results;
    } catch (error) {
        console.error('❌ Search failed:', error.message);
        throw error;
    }
}

/**
 * Test 2: Search with Different Queries
 */
export async function testMultipleSearches() {
    console.log('🔍 Testing multiple searches...');

    const queries = ['chicken breast', 'oatmeal', 'apple', 'milk'];

    for (const query of queries) {
        try {
            const results = await searchFoodProducts(query, 3);
            console.log(`✅ "${query}": ${results.length} results`);
            if (results.length > 0) {
                console.log(`   First: ${results[0].name} - ${results[0].calories} kcal`);
            }
        } catch (error) {
            console.error(`❌ "${query}" failed:`, error.message);
        }
    }
}

/**
 * Test 3: Barcode Lookup
 */
export async function testBarcodeLookup() {
    console.log('🔍 Testing barcode lookup...');

    // Nutella barcode
    const barcode = '3017620422003';

    try {
        const product = await getProductByBarcode(barcode);
        if (product) {
            console.log('✅ Product found:', product.name);
            console.log('   Calories:', product.calories);
            console.log('   Macros:', product.macros);
        } else {
            console.log('❌ Product not found');
        }
        return product;
    } catch (error) {
        console.error('❌ Barcode lookup failed:', error.message);
        throw error;
    }
}

/**
 * Test 4: Error Handling - Empty Query
 */
export async function testEmptyQuery() {
    console.log('🔍 Testing empty query handling...');

    try {
        const results = await searchFoodProducts('', 10);
        console.log('✅ Empty query handled correctly, returned:', results);
        return results;
    } catch (error) {
        console.error('❌ Empty query test failed:', error.message);
        throw error;
    }
}

/**
 * Test 5: Error Handling - Invalid Input
 */
export async function testInvalidInput() {
    console.log('🔍 Testing invalid input handling...');

    try {
        await searchFoodProducts(null, 10);
        console.log('❌ Should have thrown an error');
    } catch (error) {
        console.log('✅ Invalid input handled correctly:', error.message);
    }
}

/**
 * Test 6: Data Mapping Verification
 */
export async function testDataMapping() {
    console.log('🔍 Testing data mapping...');

    try {
        const results = await searchFoodProducts('coca cola', 1);
        if (results.length > 0) {
            const product = results[0];

            // Verify all required fields exist
            const requiredFields = ['id', 'name', 'calories', 'macros'];
            const macroFields = ['proteins', 'carbs', 'fats'];

            let allFieldsPresent = true;

            for (const field of requiredFields) {
                if (!(field in product)) {
                    console.error(`❌ Missing field: ${field}`);
                    allFieldsPresent = false;
                }
            }

            for (const field of macroFields) {
                if (!(field in product.macros)) {
                    console.error(`❌ Missing macro field: ${field}`);
                    allFieldsPresent = false;
                }
            }

            if (allFieldsPresent) {
                console.log('✅ All required fields present');
                console.log('   Product:', product);
            }

            return product;
        } else {
            console.log('⚠️ No results to verify');
        }
    } catch (error) {
        console.error('❌ Data mapping test failed:', error.message);
        throw error;
    }
}

/**
 * Run All Tests
 */
export async function runAllTests() {
    console.log('🚀 Running all food service tests...\n');

    try {
        await testBasicSearch();
        console.log('\n---\n');

        await testMultipleSearches();
        console.log('\n---\n');

        await testBarcodeLookup();
        console.log('\n---\n');

        await testEmptyQuery();
        console.log('\n---\n');

        await testInvalidInput();
        console.log('\n---\n');

        await testDataMapping();
        console.log('\n---\n');

        console.log('✅ All tests completed!');
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

// Example: How to use in browser console
// Open browser console and run:
// import { runAllTests } from './src/tests/foodServiceTests.js';
// runAllTests();
