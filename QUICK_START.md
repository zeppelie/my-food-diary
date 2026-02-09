# 🚀 Quick Start Guide - Food Search Feature

## What Was Built

A complete food search system that lets users:
1. Search for food products from a database of 2.8M+ items
2. View nutritional information (calories, proteins, carbs, fats)
3. Adjust serving sizes with real-time nutrition calculations
4. Add foods to any meal (breakfast, lunch, dinner, snacks)

## How to Use

### Step 1: Open Your App
The development server is already running at:
```
http://localhost:5173/
```

### Step 2: Add Food to a Meal
1. Click the **"Add Food"** button on any meal section
2. A search modal will appear

### Step 3: Search for Food
1. Type in the search box (e.g., "banana", "chicken", "oatmeal")
2. Results appear automatically (debounced for performance)
3. Browse through the results

### Step 4: Select a Product
1. Click on any product to select it
2. The product will highlight with a purple border
3. A serving size input will appear below

### Step 5: Adjust Serving Size
1. Change the serving size (default is 100g)
2. Watch the nutrition values update in real-time
3. Review the calculated calories and macros

### Step 6: Add to Meal
1. Click **"Add to [Meal Name]"** button
2. The modal closes
3. Your food appears in the meal section!

## Example Searches

Try these to see it in action:
- **"banana"** - Simple fruit
- **"chicken breast"** - Protein source
- **"oatmeal"** - Breakfast staple
- **"coca cola"** - Branded product
- **"nutella"** - Popular spread

## Features

### ✨ Smart Search
- **Debounced** - Waits 400ms after you stop typing
- **Fast** - Results appear quickly
- **Filtered** - Only shows products with nutrition data

### 📊 Nutrition Info
- **Calories** - Per serving
- **Proteins** - In grams
- **Carbs** - In grams
- **Fats** - In grams

### 🎨 Beautiful UI
- **Glassmorphism** - Matches your app design
- **Smooth animations** - Professional feel
- **Product images** - Visual product identification
- **Responsive** - Works on all screen sizes

### 🌍 Multi-Language
- **English** - Full support
- **Italian** - Full support
- Switches automatically with your app language

## File Structure

```
src/
├── services/
│   └── foodService.js          ← API integration
├── utils/
│   └── debounce.js             ← Performance optimization
├── components/
│   ├── AddFoodModal.jsx        ← Search UI component
│   ├── AddFoodModal.css        ← Styling
│   └── MealSection.jsx         ← Updated with modal
└── translations.js             ← Updated with new strings
```

## Key Functions

### Search for Products
```javascript
import { searchFoodProducts } from './services/foodService';

const results = await searchFoodProducts('banana', 20);
// Returns array of products with nutrition info
```

### Get Product by Barcode
```javascript
import { getProductByBarcode } from './services/foodService';

const product = await getProductByBarcode('3017620422003');
// Returns single product or null
```

## Data Schema

### Product Object
```javascript
{
  id: "3017620422003",
  name: "Nutella",
  calories: 539,
  macros: {
    proteins: 6.3,
    carbs: 57.5,
    fats: 30.9
  },
  imageUrl: "https://...",
  brand: "Ferrero"
}
```

### Meal Item (after adding)
```javascript
{
  name: "Nutella",
  brand: "Ferrero",
  servingSize: 150,
  cals: 809,              // Calculated for 150g
  macros: {
    proteins: 9.5,        // Calculated for 150g
    carbs: 86.3,          // Calculated for 150g
    fats: 46.4            // Calculated for 150g
  }
}
```

## Troubleshooting

### No Results Found
- Check your internet connection
- Try a different search term
- Some products may not have nutrition data

### Search is Slow
- This is normal - API can be slow sometimes
- There's a 10-second timeout for safety

### Modal Won't Open
- Check browser console for errors
- Make sure dev server is running
- Refresh the page

## Testing

### Manual Testing
1. Open `http://localhost:5173/`
2. Click "Add Food" on breakfast
3. Search for "banana"
4. Select first result
5. Change serving to 150g
6. Click "Add to Breakfast"
7. Verify banana appears in breakfast section

### Console Testing
Open browser console and run:
```javascript
import { searchFoodProducts } from './src/services/foodService.js';
const results = await searchFoodProducts('banana');
console.log(results);
```

## Documentation

For more details, see:
- **`IMPLEMENTATION_SUMMARY.md`** - Complete overview
- **`FOOD_SERVICE_README.md`** - API documentation
- **`src/tests/foodServiceTests.js`** - Test examples

## API Source

This feature uses the **Open Food Facts** database:
- 🌍 2.8+ million products worldwide
- 🆓 Free and open source
- 📊 Community-maintained nutrition data
- 🔗 https://world.openfoodfacts.org

## Next Steps

### Customize
- Adjust debounce delay in `AddFoodModal.jsx` (line 28)
- Change default serving size (line 18)
- Modify result count (line 32)
- Update styling in `AddFoodModal.css`

### Extend
- Add favorites functionality
- Implement recent searches
- Add barcode scanner
- Create custom food entries
- Add meal templates

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review `FOOD_SERVICE_README.md`
3. Run the test suite in `src/tests/foodServiceTests.js`
4. Verify the dev server is running

## Summary

You now have a **production-ready food search feature** with:
- ✅ Real-time search with 2.8M+ products
- ✅ Automatic nutrition calculations
- ✅ Beautiful, responsive UI
- ✅ Multi-language support
- ✅ Error handling and optimization
- ✅ Comprehensive documentation

**Enjoy building your food diary app!** 🎉

---

*Built with React, Vite, and Open Food Facts API*
