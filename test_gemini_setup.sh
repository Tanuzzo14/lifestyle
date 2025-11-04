#!/bin/bash

# Test script for Gemini API integration
# This script verifies that the secure configuration is properly set up

echo "=========================================="
echo "Gemini API Integration Test"
echo "=========================================="
echo ""

# Test 1: Check if config.php exists
echo "Test 1: Checking if config.php exists..."
if [ -f "config.php" ]; then
    echo "✓ config.php found"
else
    echo "✗ config.php not found"
    echo "  Please copy config.php.example to config.php and configure your API key"
    exit 1
fi

# Test 2: Check if config.php is in .gitignore
echo ""
echo "Test 2: Checking if config.php is ignored by git..."
if git check-ignore -q config.php; then
    echo "✓ config.php is properly ignored by git"
else
    echo "✗ config.php is NOT ignored by git (security risk!)"
    exit 1
fi

# Test 3: Check if config.php can be loaded
echo ""
echo "Test 3: Checking if config.php can be loaded..."
php -r "
require_once 'config.php';
if (!defined('GEMINI_API_KEY')) {
    echo '✗ GEMINI_API_KEY not defined in config.php\n';
    exit(1);
}
if (GEMINI_API_KEY === '--') {
    echo '✗ API key not configured (still using placeholder)\n';
    echo '  Please edit config.php and add your actual Gemini API key\n';
    exit(1);
}
echo '✓ config.php loaded successfully with API key configured\n';
"

if [ $? -ne 0 ]; then
    exit 1
fi

# Test 4: Check if gemini_proxy.php exists and is valid PHP
echo ""
echo "Test 4: Checking if gemini_proxy.php exists and is valid..."
if [ -f "gemini_proxy.php" ]; then
    php -l gemini_proxy.php > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✓ gemini_proxy.php is valid PHP"
    else
        echo "✗ gemini_proxy.php has syntax errors"
        exit 1
    fi
else
    echo "✗ gemini_proxy.php not found"
    exit 1
fi

# Test 5: Check if config.js has been updated (no hardcoded keys)
echo ""
echo "Test 5: Checking if config.js is secure..."
if grep -q "GEMINI_API_KEY.*AIza" config.js; then
    echo "✗ config.js contains a hardcoded API key (security risk!)"
    exit 1
else
    echo "✓ config.js does not contain hardcoded API keys"
fi

# Test 6: Check if HTML files use the proxy
echo ""
echo "Test 6: Checking if HTML files use the proxy..."
if grep -q "GEMINI_PROXY_URL" index.html && grep -q "GEMINI_PROXY_URL" pro.html; then
    echo "✓ HTML files are configured to use the proxy"
else
    echo "✗ HTML files are not properly configured to use the proxy"
    exit 1
fi

echo ""
echo "=========================================="
echo "All tests passed! ✓"
echo "=========================================="
echo ""
echo "The Gemini API integration is properly configured."
echo "You can now use the application with secure API access."
echo ""
echo "Note: Actual API calls will only work when deployed to a server"
echo "with internet access and a valid Gemini API key."
