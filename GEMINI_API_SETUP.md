# Gemini API Setup Guide

## Overview

This application now uses **direct client-side calls** to the Google Gemini API. The API configuration is stored in `config.json`.

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure the Application

1. Copy the example configuration file:
   ```bash
   cp config.json.example config.json
   ```

2. Edit `config.json` and replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```json
   {
     "GEMINI_API_KEY": "your-actual-api-key-here",
     "GEMINI_API_URL": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
   }
   ```

### 3. Security Considerations

⚠️ **IMPORTANT SECURITY NOTES:**

- The `config.json` file is **excluded from git** via `.gitignore` to prevent accidentally committing your API key
- Your API key will be **visible in the browser** to anyone who inspects the network traffic or JavaScript console
- For production use, consider these security measures:
  - Implement API key restrictions in [Google Cloud Console](https://console.cloud.google.com/)
  - Restrict the key to specific domains/IP addresses
  - Set usage quotas to prevent abuse
  - Consider using a server-side proxy for better security (the previous `gemini_proxy.php` approach)

### 4. API Key Restrictions (Recommended)

To protect your API key:

1. Go to [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your API key and click "Edit"
3. Under "Application restrictions":
   - Select "HTTP referrers (websites)"
   - Add your website domains (e.g., `yourdomain.com/*`, `localhost/*`)
4. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Generative Language API"
5. Save changes

## API Call Pattern

The application makes direct fetch calls to the Gemini API using this pattern:

```javascript
const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  })
});
```

## Files Modified

- `config.js` - Loads configuration from `config.json`
- `index.html` - Updated 4 API call locations
- `pro.html` - Updated 2 API call locations
- `config.json` - Configuration file (not committed to git)
- `config.json.example` - Template for configuration

## Troubleshooting

### Error: "Failed to load config.json"
- Make sure `config.json` exists in the root directory
- Check browser console for CORS errors
- Ensure you're running the app through a web server (not `file://`)

### Error: "API key not valid"
- Verify your API key is correct in `config.json`
- Check if the API key has been deleted or expired in Google Cloud Console
- Ensure the Generative Language API is enabled for your project

### Error: "403 Forbidden"
- Check if API key restrictions are blocking your domain
- Verify usage quotas haven't been exceeded

## Migration from Proxy

If you were previously using `gemini_proxy.php`:

1. The proxy is no longer required for API calls
2. The `config.php` file is no longer used for Gemini configuration
3. All API calls now go directly from the browser to Google's servers
4. You can keep `gemini_proxy.php` as a backup or remove it if desired

## Support

For issues with:
- **API Key Setup**: See [Google AI Studio Documentation](https://ai.google.dev/tutorials/setup)
- **API Errors**: Check [Gemini API Documentation](https://ai.google.dev/api)
- **Application Issues**: Check the browser console for error messages
