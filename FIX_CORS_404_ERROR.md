# Fix for CORS and 404 Errors with Gemini API

## Problem Description

Users were experiencing two errors when trying to use the Gemini API:

1. **CORS Error**:
```
Access to fetch at 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=...' 
from origin 'https://tanuzzo14.github.io' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

2. **404 Error**:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=... 
net::ERR_FAILED 404 (Not Found)
```

## Root Cause

The main issue was using an **incorrect Gemini model name**:
- **Wrong**: `gemini-2.5-flash` (this model doesn't exist)
- **Also wrong**: `gemini-2.0-flash` (this model also doesn't exist yet)
- **Correct**: `gemini-1.5-flash` (this is the current available model)

The CORS error was a secondary symptom - when the API endpoint returns 404, it may not include proper CORS headers, causing the CORS error to appear first in the browser console.

## Solution

Updated `config.js` to use the correct Gemini model name:

```javascript
// Before (incorrect)
let GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// After (correct)
let GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
```

## Available Gemini Models

As of now, the available Gemini models are:

- **`gemini-1.5-flash`** - Recommended for most use cases, fast and efficient
- **`gemini-1.5-pro`** - More capable, better for complex tasks
- **`gemini-pro`** - Earlier version, still supported

**Note**: Models like `gemini-2.0-flash` and `gemini-2.5-flash` do not exist yet and will cause 404 errors.

## How to Configure

### Option 1: Using Default Configuration (config.js)

The default fallback configuration in `config.js` now uses the correct model. This will work if `config.json` is not present or fails to load.

### Option 2: Using config.json (Recommended)

1. Copy the example configuration:
   ```bash
   cp config.json.example config.json
   ```

2. Edit `config.json` with your API key:
   ```json
   {
     "GEMINI_API_KEY": "your-actual-api-key-here",
     "GEMINI_API_URL": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
   }
   ```

3. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Testing the Fix

Use the test page to verify the configuration:

1. Open `test_gemini_direct.html` in your browser
2. Check that the configuration loads successfully
3. Click "Test API Connection" button
4. Verify you receive a successful response from Gemini

## Understanding CORS

The CORS error occurs when:
1. A web page hosted on one domain (e.g., `https://tanuzzo14.github.io`)
2. Tries to make an API request to another domain (e.g., `https://generativelanguage.googleapis.com`)
3. And the API server doesn't include proper CORS headers in the response

**Why the CORS error appeared**:
- When the model name was wrong (`gemini-2.5-flash`), the API returned 404
- The 404 response didn't include CORS headers
- The browser blocked the response and showed the CORS error
- This made it look like a CORS issue, when it was actually a 404 issue

**With the correct model name**:
- The API returns 200 OK
- Google's API includes proper CORS headers for successful requests
- The request works correctly

## API Key Security

Since the API is called directly from the client (browser), the API key is visible in network requests. To secure it:

1. **Use HTTP Referrer Restrictions** in Google Cloud Console:
   - Limit the key to only work from your domain (e.g., `https://tanuzzo14.github.io/*`)

2. **Use API Restrictions**:
   - Limit the key to only access the Generative Language API

3. **Monitor Usage**:
   - Set up quotas and alerts in Google Cloud Console
   - Regularly review API usage logs

4. **Don't Commit config.json**:
   - The file is already in `.gitignore`
   - Never commit your actual API key to version control

## Related Files

- `config.js` - Main configuration file (fallback when config.json is not available)
- `config.json.example` - Template for user configuration
- `test_gemini_direct.html` - Test page to verify API connection
- `.gitignore` - Ensures config.json is not committed

## References

- [Google AI Studio - Get API Key](https://makersuite.google.com/app/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Available Gemini Models](https://ai.google.dev/models/gemini)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
