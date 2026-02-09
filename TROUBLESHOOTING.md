# 🔧 Troubleshooting Timeout Issues

## Problem
API calls to Open Food Facts are timing out when searching for food products.

## Solutions Implemented

### 1. ✅ Increased Timeout Duration
- **Changed from**: 10 seconds
- **Changed to**: 30 seconds
- **Why**: The Open Food Facts API can be slow, especially for complex searches
- **File**: `src/services/foodService.js` (line 98)

### 2. ✅ Removed User-Agent Header
- **Issue**: Custom User-Agent headers can cause CORS issues in browsers
- **Solution**: Removed the header from fetch requests
- **File**: `src/services/foodService.js` (line 106)

### 3. ✅ Added Detailed Logging
- **Added**: Console logs for debugging
- **Shows**: Search terms, API URLs, response times, product counts
- **How to use**: Open browser DevTools Console (F12) to see logs

### 4. ✅ Improved Error Messages
- **Timeout errors**: Now show "server is taking too long"
- **Network errors**: Now show "check your internet connection"
- **API errors**: Now include status code and status text

## Testing the Fix

### Option 1: Test in Your App
1. Open your app at `http://localhost:5173/`
2. Open Browser DevTools (F12) → Console tab
3. Click "Add Food" on any meal
4. Search for "pollo" or "banana"
5. Watch the console for logs:
   ```
   🔍 Searching for: pollo
   📡 API URL: https://world.openfoodfacts.org/cgi/search.pl?...
   ✅ Response received in 2345ms
   📦 Received 15 products from API
   ✨ Mapped to 12 valid products
   ```

### Option 2: Use the API Test Page
1. Open `api-test.html` in your browser
2. Enter "pollo" in the search box
3. Click "Test Search API"
4. Watch the results panel

**To open the test page:**
```bash
# In your browser, navigate to:
file:///c:/Users/gabriele.albertazzi/.gemini/antigravity/scratch/Girt/api-test.html

# Or from VS Code, right-click api-test.html → "Open with Live Server"
```

## Common Causes of Timeouts

### 1. Slow Internet Connection
**Symptom**: Timeouts happen consistently
**Solution**: 
- Check your internet speed
- Try a different network
- The 30-second timeout should handle most slow connections

### 2. Open Food Facts Server Issues
**Symptom**: Timeouts happen intermittently
**Solution**:
- The API is community-run and can be slow
- Try again in a few minutes
- Check https://status.openfoodfacts.org/ (if available)

### 3. CORS Issues
**Symptom**: "Failed to fetch" or CORS errors in console
**Solution**:
- Already fixed by removing User-Agent header
- If still happening, use the CORS proxy option (see below)

### 4. Firewall/Antivirus Blocking
**Symptom**: Immediate failures or connection refused
**Solution**:
- Check if your firewall is blocking the request
- Try disabling antivirus temporarily
- Check browser extensions (ad blockers, privacy tools)

## Alternative Solutions

### Option A: Use CORS Proxy (If Direct Access Fails)

If you continue to have CORS issues, you can use a CORS proxy:

```javascript
// In src/services/foodService.js, add this constant at the top:
const USE_CORS_PROXY = true;
const CORS_PROXY = 'https://corsproxy.io/?';

// Then modify the fetch call:
const finalUrl = USE_CORS_PROXY 
  ? `${CORS_PROXY}${encodeURIComponent(url)}`
  : url;

const response = await fetch(finalUrl, {
  signal: controller.signal,
  mode: 'cors',
});
```

**Note**: CORS proxies are slower but more reliable.

### Option B: Reduce Page Size

If timeouts persist, try requesting fewer products:

```javascript
// In src/components/AddFoodModal.jsx, line 32
// Change from:
const results = await searchFoodProducts(query, 15);

// To:
const results = await searchFoodProducts(query, 5);
```

### Option C: Use Alternative API Endpoint

Try the simpler search endpoint:

```javascript
// Replace the URL construction with:
const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(trimmedQuery)}&json=1&page_size=${pageSize}`;
```

## Debugging Steps

### Step 1: Check Console Logs
1. Open DevTools (F12)
2. Go to Console tab
3. Look for the emoji logs:
   - 🔍 = Search started
   - 📡 = API URL
   - ✅ = Success
   - ❌ = Error
   - ⏱️ = Timeout

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Search for a food item
4. Look for the request to `openfoodfacts.org`
5. Check:
   - Status code (should be 200)
   - Response time
   - Response preview

### Step 3: Test API Directly
1. Open `api-test.html` in browser
2. Run all three tests:
   - Direct API Call
   - Simple Search
   - CORS Proxy
3. See which one works

### Step 4: Check API Status
1. Open https://world.openfoodfacts.org in browser
2. Verify the site is accessible
3. Try a manual search on their website

## Expected Behavior

### Normal Response Times
- **Fast**: 500-2000ms (0.5-2 seconds)
- **Slow**: 2000-10000ms (2-10 seconds)
- **Very Slow**: 10000-30000ms (10-30 seconds)
- **Timeout**: >30000ms (>30 seconds)

### Typical Results
- **Search "banana"**: 15+ products
- **Search "chicken"**: 15+ products
- **Search "pollo"**: 10+ products (Italian/Spanish)
- **Search "xyz123"**: 0 products (invalid)

## What Changed in the Code

### Before (10-second timeout):
```javascript
const timeoutId = setTimeout(() => controller.abort(), 10000);
```

### After (30-second timeout with logging):
```javascript
const timeoutId = setTimeout(() => {
  console.warn('⏱️ Request timeout after 30 seconds');
  controller.abort();
}, 30000);
```

### Before (with User-Agent):
```javascript
const response = await fetch(url, {
  signal: controller.signal,
  headers: {
    'User-Agent': 'Girt-FoodDiary/1.0'
  }
});
```

### After (without User-Agent):
```javascript
const response = await fetch(url, {
  signal: controller.signal,
  mode: 'cors',
  // Removed User-Agent header
});
```

## Testing Checklist

- [ ] Open app in browser
- [ ] Open DevTools Console (F12)
- [ ] Click "Add Food"
- [ ] Search for "pollo"
- [ ] Wait for results (should be < 30 seconds)
- [ ] Check console for logs
- [ ] Verify products appear
- [ ] Try different search terms
- [ ] Test on different network

## If Still Not Working

### Last Resort Options:

1. **Use Mock Data** (for development):
   ```javascript
   // Temporarily return mock data
   export const searchFoodProducts = async (searchQuery) => {
     return [
       {
         id: '1',
         name: 'Chicken Breast',
         calories: 165,
         macros: { proteins: 31, carbs: 0, fats: 3.6 },
         imageUrl: null,
         brand: null
       }
     ];
   };
   ```

2. **Build Your Own Backend**:
   - Create a simple Node.js/Express server
   - Server makes API calls (no CORS issues)
   - Your app calls your server

3. **Use Different API**:
   - USDA FoodData Central
   - Nutritionix API
   - Edamam Food Database

## Contact & Support

- **Open Food Facts**: https://world.openfoodfacts.org
- **API Documentation**: https://wiki.openfoodfacts.org/API
- **GitHub Issues**: https://github.com/openfoodfacts

## Summary

The timeout issue should now be resolved with:
- ✅ 30-second timeout (was 10 seconds)
- ✅ Removed problematic User-Agent header
- ✅ Better error messages
- ✅ Detailed console logging
- ✅ Test page for debugging

**Try searching again and check the console logs!**
