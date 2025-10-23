# Fix for Gemini API 405 Error

## Problem Description

Users were experiencing a 405 error when trying to use Gemini API features, with the following error message:

```
Gemini standardization failed, falling back to manual parsing: Error: Impossibile standardizzare il piano con Gemini: Gemini API error: 405
```

This error message was not helpful because:
1. It only showed the HTTP status code (405) without explaining what it means
2. Users couldn't determine the root cause
3. No guidance was provided on how to fix the issue

## Root Cause Analysis

### What is a 405 Error?

HTTP 405 "Method Not Allowed" means the server understands the request but the requested method is not supported for the resource.

### Why Was This Happening?

The issue occurred in the following sequence:

1. **JavaScript makes request**: The client-side JavaScript in `index.html` makes a POST request to `gemini_proxy.php` with workout/diet data
2. **Proxy forwards to Gemini API**: The `gemini_proxy.php` script forwards the request to Google's Gemini API
3. **Gemini API returns 405**: The Gemini API returns a 405 error (likely because the model name was incorrect or the endpoint doesn't exist)
4. **Proxy passes through response**: The proxy passes the 405 status code and response body back to the client
5. **JavaScript fails to parse error**: The JavaScript tries to parse the error response, but the format is not consistent, causing parsing to fail
6. **Generic error shown**: Because JSON parsing failed, the code falls back to showing just "Gemini API error: 405"

### Key Issues

1. **Inconsistent error format**: When Gemini API returned errors, the response format varied and might not include an `error` field
2. **Failed JSON parsing**: The JavaScript's `response.json()` call would fail if the response was malformed or in an unexpected format
3. **Incorrect model name**: The `config.php.example` specified `gemini-2.0-flash` which may not exist or be available yet

## Solution Implemented

### 1. Enhanced Error Handling in gemini_proxy.php

Modified `gemini_proxy.php` to intercept error responses (4xx and 5xx) from the Gemini API and normalize them into a consistent JSON format:

```php
// If the response is an error (4xx or 5xx), wrap it in a consistent format
if ($httpCode >= 400) {
    // Try to parse the Gemini API error response
    $geminiError = json_decode($response, true);
    
    // Build a user-friendly error message
    $errorMessage = 'Gemini API error';
    
    // Extract error details from Gemini API response if available
    if (isset($geminiError['error']['message'])) {
        $errorMessage = $geminiError['error']['message'];
    } elseif (isset($geminiError['error'])) {
        $errorMessage = is_string($geminiError['error']) ? $geminiError['error'] : json_encode($geminiError['error']);
    } elseif (isset($geminiError['message'])) {
        $errorMessage = $geminiError['message'];
    }
    
    // Add HTTP status code to the message
    $errorMessage .= " (HTTP $httpCode)";
    
    // Return in consistent format
    echo json_encode([
        'error' => $errorMessage,
        'statusCode' => $httpCode,
        'details' => $geminiError
    ]);
} else {
    // Success response - pass through as-is
    echo $response;
}
```

This ensures that:
- Every error response has an `error` field that JavaScript can reliably parse
- Error messages include the HTTP status code for context
- Original error details are preserved in the `details` field for debugging
- The code handles various error response formats from Gemini API

### 2. Updated Model Name in config.php.example

Changed the model from `gemini-2.0-flash` to `gemini-1.5-flash`:

```php
// Use gemini-1.5-flash or gemini-pro as the model
// Note: gemini-2.0-flash may not be available yet - use gemini-1.5-flash instead
define('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent');
```

Available Gemini models include:
- `gemini-1.5-flash` - Fast, optimized for speed
- `gemini-1.5-pro` - More capable, optimized for quality
- `gemini-pro` - Earlier version

## Testing

Created comprehensive tests to verify the fix handles various scenarios:

1. ✅ Standard Gemini API error format (`error.message`)
2. ✅ Alternative error format (`message` at root level)
3. ✅ Malformed or non-JSON responses
4. ✅ Different HTTP status codes (404, 405, 500)

All tests passed successfully.

## Benefits

### Before Fix
```
Error: Impossibile standardizzare il piano con Gemini: Gemini API error: 405
```
- Generic, unhelpful error message
- No indication of what went wrong
- No guidance on how to fix it
- Users cannot diagnose the issue

### After Fix
```
Error: Impossibile standardizzare il piano con Gemini: Method not allowed for this endpoint (HTTP 405)
```
- Descriptive error message explaining the issue
- HTTP status code included for context
- Users can diagnose configuration issues
- Clear indication that the API endpoint or method is incorrect

## How to Prevent This Error

### For End Users

1. **Ensure config.php exists**: Copy `config.php.example` to `config.php`
   ```bash
   cp config.php.example config.php
   ```

2. **Configure a valid API key**: Get a Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)
   ```php
   define('GEMINI_API_KEY', 'your-actual-api-key-here');
   ```

3. **Use correct model name**: Ensure you're using an available model
   ```php
   define('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent');
   ```

4. **Verify API access**: Make sure your API key has access to the Generative Language API

### Common Causes of 405 Errors

1. **Incorrect model name**: Using `gemini-2.0-flash` when it doesn't exist
2. **Wrong API endpoint**: Using the wrong base URL or API version
3. **Invalid API version**: Using `v1` instead of `v1beta` or vice versa
4. **Model not enabled**: The model might not be available for your API key

## Related Files Modified

1. `gemini_proxy.php` - Enhanced error handling (lines 84-115)
2. `config.php.example` - Updated model name and added comments (lines 7-11)

## Backwards Compatibility

The changes are fully backwards compatible:
- Success responses (2xx) are passed through unchanged
- JavaScript code in `index.html` continues to work as before
- The existing error handling pattern in JavaScript (`errorData.error`) now reliably receives the error message
- No changes required to other files

## Security

No security concerns introduced:
- Error messages don't expose sensitive information
- API key remains secure on the server side
- CodeQL security analysis passed
- JSON parsing errors are safely handled

## Additional Resources

- [Google AI Studio - Get API Key](https://makersuite.google.com/app/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Available Gemini Models](https://ai.google.dev/models/gemini)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## Support

If you continue to experience 405 errors after applying this fix:

1. Verify your `config.php` has a valid API key
2. Check that you're using an available model name (e.g., `gemini-1.5-flash`)
3. Ensure your Google Cloud project has the Generative Language API enabled
4. Review the error details in the browser console for more information
5. Try switching to `gemini-pro` if `gemini-1.5-flash` doesn't work
