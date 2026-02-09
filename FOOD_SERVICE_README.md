# Food Search Service - Documentation

## Overview

This backend service integrates with the **Open Food Facts API** to search for food products and retrieve nutritional information. The service includes debounced search optimization, error handling, and automatic data mapping to the local application schema.

## Files Created

### 1. `src/services/foodService.js`
Main service module for API integration.

**Key Functions:**
- `searchFoodProducts(searchQuery, pageSize)` - Search for food products
- `getProductByBarcode(barcode)` - Fetch a specific product by barcode
- `mapProductToSchema(apiProduct)` - Internal mapping function

**Features:**
- ✅ Timeout handling (10 seconds)
- ✅ Error handling with user-friendly messages
- ✅ Data validation and filtering
- ✅ Automatic mapping to local schema
- ✅ Support for multiple product name fields
- ✅ Fallback values for missing nutritional data

### 2. `src/utils/debounce.js`
Debounce utility for optimizing search performance.

**Exports:**
- `debounce(func, delay)` - Standard debounce function
- `useDebouncedCallback(callback, delay)` - React hook for debouncing

### 3. `src/components/AddFoodModal.jsx`
React component for the food search UI.

**Features:**
- ✅ Debounced search (400ms delay)
- ✅ Loading states
- ✅ Error handling with visual feedback
- ✅ Product selection
- ✅ Serving size adjustment
- ✅ Real-time nutrition calculation
- ✅ Multi-language support
- ✅ Glassmorphism design

### 4. `src/components/AddFoodModal.css`
Comprehensive styling with modern UI patterns.

## Data Schema

### Local Food Product Schema

```javascript
{
  id: string,              // Unique product identifier (barcode)
  name: string,            // Product name
  calories: number,        // Calories per 100g
  macros: {
    proteins: number,      // Protein in grams per 100g
    carbs: number,         // Carbohydrates in grams per 100g
    fats: number          // Fats in grams per 100g
  },
  imageUrl: string|null,   // Product image URL
  brand: string|null       // Product brand
}
```

### Meal Item Schema (after adding to meal)

```javascript
{
  name: string,            // Product name
  brand: string|null,      // Product brand
  servingSize: number,     // Serving size in grams
  cals: number,           // Calories for the serving size
  macros: {
    proteins: number,      // Protein for the serving size
    carbs: number,         // Carbs for the serving size
    fats: number          // Fats for the serving size
  }
}
```

## Usage Examples

### Basic Search

```javascript
import { searchFoodProducts } from './services/foodService';

// Search for products
try {
  const results = await searchFoodProducts('chicken breast', 20);
  console.log(results);
  // Returns array of FoodProduct objects
} catch (error) {
  console.error('Search failed:', error.message);
}
```

### Barcode Lookup

```javascript
import { getProductByBarcode } from './services/foodService';

// Fetch specific product
try {
  const product = await getProductByBarcode('3017620422003');
  if (product) {
    console.log(product.name, product.calories);
  } else {
    console.log('Product not found');
  }
} catch (error) {
  console.error('Fetch failed:', error.message);
}
```

### Using the AddFoodModal Component

```javascript
import AddFoodModal from './components/AddFoodModal';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddFood = (foodItem, mealType) => {
    console.log('Adding food:', foodItem);
    console.log('To meal:', mealType);
    // Add to your state management
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Add Food
      </button>
      
      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFood={handleAddFood}
        mealType="Breakfast"
      />
    </>
  );
}
```

## API Details

### Open Food Facts API

**Base URL:** `https://world.openfoodfacts.org`

**Search Endpoint:**
```
GET /cgi/search.pl?search_terms={query}&json=1&page_size={size}
```

**Product Endpoint:**
```
GET /api/v0/product/{barcode}.json
```

**Rate Limits:** No strict rate limits, but please be respectful

**Documentation:** https://wiki.openfoodfacts.org/API

## Error Handling

The service handles various error scenarios:

1. **Network Errors** - Caught and wrapped with user-friendly messages
2. **Timeout** - 10-second timeout with specific error message
3. **Invalid Input** - Validation with descriptive error messages
4. **Missing Data** - Products without nutritional data are filtered out
5. **API Errors** - HTTP status codes handled appropriately

## Optimization Features

### Debouncing
- Search requests are debounced by 400ms
- Prevents excessive API calls while typing
- Improves performance and user experience

### Data Filtering
- Only products with valid nutritional data are returned
- Products without names are filtered out
- Ensures data quality

### Timeout Protection
- 10-second timeout prevents hanging requests
- Automatic cleanup of timeout handlers
- User-friendly timeout messages

## Internationalization

The modal supports multiple languages through the translation system:

**English Translations:**
- searchFood: "Search for food..."
- noResults: "No results found"
- startTyping: "Start typing to search for food..."
- servingSize: "Serving Size"
- nutritionInfo: "Nutrition Information"
- calories: "Calories"
- cancel: "Cancel"
- add: "Add to"

**Italian Translations:**
- searchFood: "Cerca cibo..."
- noResults: "Nessun risultato trovato"
- startTyping: "Inizia a digitare per cercare cibo..."
- servingSize: "Porzione"
- nutritionInfo: "Informazioni Nutrizionali"
- calories: "Calorie"
- cancel: "Annulla"
- add: "Aggiungi a"

## Testing the Implementation

### Manual Testing Steps

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Click "Add Food" button** on any meal section

3. **Test search functionality:**
   - Type "banana" - should show banana products
   - Type "chicken" - should show chicken products
   - Type "xyz123abc" - should show "No results found"

4. **Test product selection:**
   - Click on a product to select it
   - Adjust serving size
   - Verify nutrition values update

5. **Test adding food:**
   - Select a product
   - Adjust serving size
   - Click "Add to [Meal]"
   - Verify food appears in the meal section

### Example Test Queries

- "banana" - Common fruit
- "chicken breast" - Protein source
- "oatmeal" - Breakfast item
- "coca cola" - Branded product
- "3017620422003" - Nutella barcode (for barcode testing)

## Future Enhancements

Potential improvements for the service:

1. **Caching** - Cache recent searches to reduce API calls
2. **Favorites** - Save frequently used products
3. **Custom Foods** - Allow users to create custom food entries
4. **Barcode Scanner** - Integrate camera for barcode scanning
5. **Recent Searches** - Show recently searched items
6. **Nutritional Goals** - Highlight foods matching user goals
7. **Offline Support** - Cache products for offline use
8. **Advanced Filters** - Filter by allergens, diet type, etc.

## Troubleshooting

### Common Issues

**Issue:** Search returns no results
- **Solution:** Check internet connection, try different search terms

**Issue:** Timeout errors
- **Solution:** Check network speed, API might be slow

**Issue:** Products missing nutrition data
- **Solution:** This is expected - products are filtered if data is incomplete

**Issue:** Modal doesn't open
- **Solution:** Check browser console for errors, verify state management

## Support

For issues with the Open Food Facts API:
- Documentation: https://wiki.openfoodfacts.org/
- GitHub: https://github.com/openfoodfacts
- Contact: contact@openfoodfacts.org

## License

This implementation is part of the Girt food diary application.
Open Food Facts data is licensed under ODbL (Open Database License).
