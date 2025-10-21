# Manual Testing Guide for Auth Module Separation

## Overview
This guide provides step-by-step instructions to manually test the authentication module separation.

## Prerequisites
- PHP 7.0 or higher installed
- Web browser (Chrome, Firefox, Safari, or Edge)
- The lifestyle application files

## Setup
1. Start the PHP development server:
   ```bash
   cd /path/to/lifestyle
   php -S localhost:8000
   ```

2. Open your browser and navigate to:
   - Main application: http://localhost:8000/index.html
   - Auth test page: http://localhost:8000/test_auth.html

## Test Cases

### Test 1: Login with Existing User (Client)
**Objective:** Verify that login works with the auth module

1. Navigate to http://localhost:8000/index.html
2. Enter credentials:
   - Username: `tano`
   - Password: `tano123`
3. Click "ACCEDI"

**Expected Result:**
- ✓ User is logged in successfully
- ✓ Redirected to summary dashboard
- ✓ Username displayed in dashboard: "TANO"
- ✓ Workout plan visible (2 exercises for LUNEDÌ)

### Test 2: Login with Professional User
**Objective:** Verify professional users are redirected to pro.html

1. If logged in, logout first
2. Navigate to http://localhost:8000/index.html
3. Enter credentials:
   - Username: `mario`
   - Password: `mario`
4. Click "ACCEDI"

**Expected Result:**
- ✓ User is logged in successfully
- ✓ Automatically redirected to pro.html (professional dashboard)
- ✓ Client list shows TANO

### Test 3: Register New User
**Objective:** Verify user registration works with the auth module

1. If logged in, logout first
2. Navigate to http://localhost:8000/index.html
3. Click "REGISTRATI"
4. Enter new credentials:
   - Username: `testuser`
   - Password: `testpass123`
   - User Type: `Utente`
5. Click "REGISTRATI"

**Expected Result:**
- ✓ Registration successful message displayed
- ✓ User is redirected to wizard configuration (Step 1 of 4)
- ✓ Can complete wizard and access dashboard

### Test 4: Invalid Login
**Objective:** Verify error handling for invalid credentials

1. If logged in, logout first
2. Navigate to http://localhost:8000/index.html
3. Enter invalid credentials:
   - Username: `invalid`
   - Password: `wrongpass`
4. Click "ACCEDI"

**Expected Result:**
- ✓ Error message displayed: "NOME UTENTE O PASSWORD NON VALIDI."
- ✓ User remains on login page
- ✓ No redirect occurs

### Test 5: Logout
**Objective:** Verify logout functionality

1. Login with any valid user
2. Once in the dashboard, click "LOGOUT" button

**Expected Result:**
- ✓ User is logged out
- ✓ Redirected to login page
- ✓ Message displayed: "DISCONNESSO."
- ✓ Cannot access dashboard without logging in again

### Test 6: Session Persistence
**Objective:** Verify user session persists across page refreshes

1. Login with valid credentials
2. Once in the dashboard, refresh the page (F5 or Ctrl+R)

**Expected Result:**
- ✓ User remains logged in
- ✓ Dashboard is displayed immediately
- ✓ No redirect to login page

### Test 7: Auth Module Test Page
**Objective:** Verify the auth module works independently

1. Navigate to http://localhost:8000/test_auth.html
2. Test Login:
   - Use credentials: tano / tano123
   - Click "Test Login"
   
**Expected Result:**
- ✓ Success message: "Login successful! User: TANO, Type: user"

3. Test Check Auth:
   - Click "Test Check Auth"
   
**Expected Result:**
- ✓ Success message: "User is authenticated! User: TANO, Type: user"

4. Test Logout:
   - Click "Test Logout"
   
**Expected Result:**
- ✓ Success message: "Logout successful!"

5. Test Check Auth Again:
   - Click "Test Check Auth"
   
**Expected Result:**
- ✓ Error message: "No authenticated user found"

### Test 8: Duplicate Registration Prevention
**Objective:** Verify users cannot register with existing username

1. If logged in, logout first
2. Navigate to http://localhost:8000/index.html
3. Click "REGISTRATI"
4. Try to register with existing username:
   - Username: `tano`
   - Password: `anything`
5. Click "REGISTRATI"

**Expected Result:**
- ✓ Error message: "NOME UTENTE GIÀ IN USO. SCEGLI UN ALTRO NOME."
- ✓ Registration form still displayed
- ✓ User not registered

## Browser Console Checks

### No JavaScript Errors
1. Open browser developer tools (F12)
2. Go to Console tab
3. Perform any test above

**Expected Result:**
- ✓ No red error messages in console
- ✓ Only info/log messages if any
- ✓ No "Uncaught" errors

### Module Loading
1. Open browser developer tools (F12)
2. Go to Network tab
3. Refresh page

**Expected Result:**
- ✓ auth.js loads successfully (status 200)
- ✓ No 404 errors for auth.js
- ✓ File is loaded as type "module"

## Code Quality Checks

### No Duplicate Code
**Objective:** Verify authentication logic is not duplicated

1. Open index.html in a text editor
2. Search for these patterns:
   - `function simpleHash`
   - `passwordHash =`
   - `localStorage.setItem('currentUser'`

**Expected Result:**
- ✓ No instances of `function simpleHash` in index.html
- ✓ No direct localStorage manipulation for currentUser in index.html
- ✓ All auth logic uses Auth module

### Module Separation
**Objective:** Verify auth.js is properly separated

1. Open auth.js in a text editor
2. Verify it contains:
   - `export const Auth`
   - `login` method
   - `register` method
   - `logout` method
   - `checkAuth` method

**Expected Result:**
- ✓ All methods are present
- ✓ Module is properly exported
- ✓ No dashboard-specific code in auth.js

## Multi-Device Test (Optional)

### Cross-Device Login
**Objective:** Verify data persistence across devices

1. Login on Device A (or Browser A)
2. Add some data (habits, workout, etc.)
3. Logout from Device A
4. Login on Device B (or Browser B) with same credentials

**Expected Result:**
- ✓ Data is synchronized
- ✓ Same user data visible on both devices

## Test Results Summary

After completing all tests, fill out this summary:

- [ ] Test 1: Login with Existing User - PASSED / FAILED
- [ ] Test 2: Login with Professional User - PASSED / FAILED
- [ ] Test 3: Register New User - PASSED / FAILED
- [ ] Test 4: Invalid Login - PASSED / FAILED
- [ ] Test 5: Logout - PASSED / FAILED
- [ ] Test 6: Session Persistence - PASSED / FAILED
- [ ] Test 7: Auth Module Test Page - PASSED / FAILED
- [ ] Test 8: Duplicate Registration - PASSED / FAILED
- [ ] No JavaScript Errors - PASSED / FAILED
- [ ] Module Loading - PASSED / FAILED
- [ ] No Duplicate Code - PASSED / FAILED
- [ ] Module Separation - PASSED / FAILED

## Troubleshooting

### Issue: auth.js not found (404)
**Solution:** Ensure auth.js is in the same directory as index.html

### Issue: "Uncaught SyntaxError: Cannot use import statement outside a module"
**Solution:** Verify that the script tag has `type="module"` attribute

### Issue: Login not working
**Solution:** 
1. Check browser console for errors
2. Verify data.json exists and contains test users
3. Verify PHP server is running

### Issue: Data not persisting
**Solution:**
1. Check file permissions on data.json
2. Verify API endpoint is accessible (api.php)
3. Check browser console for API errors

## Notes
- All tests should be performed with an empty browser cache for accurate results
- Test data is defined in TEST_SETUP.md
- The authentication module (auth.js) can now be reused in other pages if needed
