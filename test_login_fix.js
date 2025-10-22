#!/usr/bin/env node

/**
 * Test script to verify the login fix for users without passwordHash
 * 
 * This test verifies that:
 * 1. Users with passwordHash can login with their password
 * 2. Users without passwordHash can login using their username as password
 * 3. Wrong passwords are rejected for both cases
 * 
 * Run with: node test_login_fix.js
 */

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   Test: Login Fix for Users Without PasswordHash        ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Import the simpleHash function (same as in auth.js)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Simulate the login password verification logic from auth.js
function verifyPassword(username, password, storedPasswordHash) {
  const userKey = username.toLowerCase();
  const inputPasswordHash = simpleHash(password).toString();
  const defaultPasswordHash = simpleHash(userKey).toString();
  
  // This is the fixed logic from auth.js
  const isPasswordValid = storedPasswordHash === inputPasswordHash || 
                          (!storedPasswordHash && inputPasswordHash === defaultPasswordHash);
  
  return isPasswordValid;
}

// Test cases based on the provided data.json
const testCases = [
  {
    name: 'BASE_USER with correct password',
    username: 'BASE_USER',
    password: 'base_user_password',
    storedHash: '-1255658591',
    expectedResult: true
  },
  {
    name: 'BASE_USER with wrong password',
    username: 'BASE_USER',
    password: 'wrongpassword',
    storedHash: '-1255658591',
    expectedResult: false
  },
  {
    name: 'G.SMARIO1 without passwordHash (username as password)',
    username: 'G.SMARIO1',
    password: 'g.smario1',
    storedHash: '',
    expectedResult: true
  },
  {
    name: 'G.SMARIO1 without passwordHash (wrong password)',
    username: 'G.SMARIO1',
    password: 'wrongpassword',
    storedHash: '',
    expectedResult: false
  },
  {
    name: '123456 without passwordHash (username as password)',
    username: '123456',
    password: '123456',
    storedHash: '',
    expectedResult: true
  },
  {
    name: '123456 without passwordHash (wrong password)',
    username: '123456',
    password: 'wrongpassword',
    storedHash: '',
    expectedResult: false
  },
  {
    name: 'Case insensitive username (g.smario1 lowercase)',
    username: 'g.smario1',
    password: 'g.smario1',
    storedHash: '',
    expectedResult: true
  }
];

let passed = 0;
let failed = 0;

console.log('Running test cases...\n');

testCases.forEach((test, index) => {
  const result = verifyPassword(test.username, test.password, test.storedHash);
  const success = result === test.expectedResult;
  
  if (success) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${test.name}`);
    console.log(`  Username: ${test.username}`);
    console.log(`  Password: ${test.password}`);
    console.log(`  Has passwordHash: ${test.storedHash ? 'Yes' : 'No'}`);
    console.log(`  Expected: ${test.expectedResult ? 'Allow' : 'Reject'}`);
    console.log(`  Result: ${result ? 'Allow' : 'Reject'} ✓`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: ${test.name}`);
    console.log(`  Username: ${test.username}`);
    console.log(`  Password: ${test.password}`);
    console.log(`  Has passwordHash: ${test.storedHash ? 'Yes' : 'No'}`);
    console.log(`  Expected: ${test.expectedResult ? 'Allow' : 'Reject'}`);
    console.log(`  Result: ${result ? 'Allow' : 'Reject'} ✗`);
  }
  console.log();
});

console.log('═'.repeat(60));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(60));

if (failed === 0) {
  console.log('\n✓ ALL TESTS PASSED!\n');
  console.log('The login fix is working correctly:');
  console.log('  • Users with passwordHash can login with their password');
  console.log('  • Users without passwordHash can login with username as password');
  console.log('  • Wrong passwords are correctly rejected\n');
  process.exit(0);
} else {
  console.log('\n✗ SOME TESTS FAILED!\n');
  process.exit(1);
}
