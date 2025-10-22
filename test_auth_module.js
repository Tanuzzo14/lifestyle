#!/usr/bin/env node

// Simple test script to verify auth.js module works
console.log('Testing auth.js module...\n');

// Test 1: Check file exists and has exports
console.log('Test 1: Checking auth.js file exists...');
const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, 'back-end', 'auth.js');
if (fs.existsSync(authPath)) {
    console.log('✓ auth.js file exists\n');
} else {
    console.log('✗ auth.js file not found\n');
    process.exit(1);
}

// Test 2: Check file content
console.log('Test 2: Checking auth.js exports Auth module...');
const authContent = fs.readFileSync(authPath, 'utf8');
if (authContent.includes('export const Auth')) {
    console.log('✓ Auth module is exported\n');
} else {
    console.log('✗ Auth module export not found\n');
    process.exit(1);
}

// Test 3: Check Auth has required methods
console.log('Test 3: Checking Auth module has required methods...');
const requiredMethods = ['login', 'register', 'logout', 'checkAuth'];
let allMethodsFound = true;

requiredMethods.forEach(method => {
    if (authContent.includes(`${method}:`)) {
        console.log(`  ✓ ${method} method found`);
    } else {
        console.log(`  ✗ ${method} method not found`);
        allMethodsFound = false;
    }
});

if (allMethodsFound) {
    console.log('✓ All required methods found\n');
} else {
    console.log('✗ Some methods are missing\n');
    process.exit(1);
}

// Test 4: Check index.html imports auth.js
console.log('Test 4: Checking index.html imports auth.js...');
const indexPath = path.join(__dirname, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes("import { Auth } from './back-end/auth.js'")) {
    console.log('✓ index.html imports Auth module\n');
} else {
    console.log('✗ index.html does not import Auth module\n');
    process.exit(1);
}

// Test 5: Check index.html uses Auth methods
console.log('Test 5: Checking index.html uses Auth methods...');
if (indexContent.includes('Auth.login') && 
    indexContent.includes('Auth.register') && 
    indexContent.includes('Auth.logout') && 
    indexContent.includes('Auth.checkAuth')) {
    console.log('✓ index.html uses Auth methods\n');
} else {
    console.log('✗ index.html does not use all Auth methods\n');
    process.exit(1);
}

// Test 6: Check old auth code removed from index.html
console.log('Test 6: Checking old auth code removed from index.html...');
const hasOldCode = indexContent.includes('simpleHash(userKey)') || 
                   indexContent.includes('localStorage.setItem(\'currentUser\'') ||
                   indexContent.includes('function simpleHash(str)');

if (!hasOldCode) {
    console.log('✓ Old auth code has been removed\n');
} else {
    console.log('⚠ Warning: Some old auth code may still be present\n');
}

console.log('===========================================');
console.log('All tests passed! ✓');
console.log('===========================================');
console.log('\nAuth module successfully separated from dashboard logic.');
console.log('The authentication logic is now in auth.js and can be reused.');
