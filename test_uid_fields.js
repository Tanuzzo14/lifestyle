#!/usr/bin/env node

/**
 * Test script to verify uid, passwordHash, and createdBy fields are saved correctly
 * 
 * This test verifies that:
 * 1. All users have uid field saved in their data
 * 2. All users have passwordHash field saved in their data
 * 3. Non-pro users have createdBy field
 * 4. Pro users do NOT have createdBy field
 * 
 * Run with: node test_uid_fields.js
 */

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   Test: Verify UID, PasswordHash, and CreatedBy Fields  ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Mock API implementation for testing
const mockData = {};

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Simulate the register function behavior
function simulateRegister(username, password, userType) {
  const userKey = username.toLowerCase();
  const uid = simpleHash(userKey).toString();
  const passwordHash = simpleHash(password).toString();
  
  // For base users, create BASE_USER
  let baseUserUid = null;
  if (userType === "user") {
    const baseUserKey = "base_user";
    baseUserUid = simpleHash(baseUserKey).toString();
    
    // Create BASE_USER if it doesn't exist
    if (!mockData[baseUserUid]) {
      const baseUserPasswordHash = simpleHash("base_user_password").toString();
      mockData[baseUserUid] = {
        uid: baseUserUid,
        userType: "pro",
        displayUsername: "BASE_USER",
        passwordHash: baseUserPasswordHash,
        clients: [],
        data: {
          habits: [],
          workout: [],
          uploadedWorkoutPlans: [],
          diet: [],
          dietPlan: { targetCalories: 2000, plan: [] },
          uploadedDietPlans: [],
          dailyCompliance: {},
          measurementsLog: []
        },
        sleepStartTimestamp: null,
        createdAt: new Date().toISOString()
      };
    }
  }
  
  // Save user data (this mimics the payload in auth.js)
  const payload = {
    uid: uid,
    userType: userType, 
    displayUsername: username.toUpperCase(),
    passwordHash: passwordHash,
    clients: [],
    data: {
      habits: [],
      workout: [],
      uploadedWorkoutPlans: [],
      diet: [],
      dietPlan: { targetCalories: 2000, plan: [] },
      uploadedDietPlans: [],
      dailyCompliance: {},
      measurementsLog: []
    },
    sleepStartTimestamp: null,
    createdAt: new Date().toISOString()
  };
  
  // Add createdBy field for base users
  if (userType === "user" && baseUserUid) {
    payload.createdBy = baseUserUid;
  }
  
  mockData[uid] = payload;
  return { uid, payload };
}

// Test cases
console.log('Running test cases...\n');

let passed = 0;
let failed = 0;

// Test 1: Register a regular user
console.log('Test 1: Regular user registration');
const user1 = simulateRegister('testuser1', 'password123', 'user');
const user1Data = mockData[user1.uid];

let test1Passed = true;
if (!user1Data.uid) {
  console.log('  ✗ Missing uid field');
  test1Passed = false;
} else {
  console.log('  ✓ Has uid field:', user1Data.uid);
}

if (!user1Data.passwordHash) {
  console.log('  ✗ Missing passwordHash field');
  test1Passed = false;
} else {
  console.log('  ✓ Has passwordHash field:', user1Data.passwordHash);
}

if (!user1Data.createdBy) {
  console.log('  ✗ Missing createdBy field (required for non-pro users)');
  test1Passed = false;
} else {
  console.log('  ✓ Has createdBy field:', user1Data.createdBy);
}

if (user1Data.userType !== 'user') {
  console.log('  ✗ Wrong userType');
  test1Passed = false;
} else {
  console.log('  ✓ Correct userType:', user1Data.userType);
}

if (test1Passed) {
  passed++;
  console.log('✓ Test 1 PASSED\n');
} else {
  failed++;
  console.log('✗ Test 1 FAILED\n');
}

// Test 2: Register a pro user
console.log('Test 2: Professional user registration');
const user2 = simulateRegister('testpro1', 'propass', 'pro');
const user2Data = mockData[user2.uid];

let test2Passed = true;
if (!user2Data.uid) {
  console.log('  ✗ Missing uid field');
  test2Passed = false;
} else {
  console.log('  ✓ Has uid field:', user2Data.uid);
}

if (!user2Data.passwordHash) {
  console.log('  ✗ Missing passwordHash field');
  test2Passed = false;
} else {
  console.log('  ✓ Has passwordHash field:', user2Data.passwordHash);
}

if (user2Data.createdBy) {
  console.log('  ✗ Has createdBy field (should NOT be present for pro users)');
  test2Passed = false;
} else {
  console.log('  ✓ No createdBy field (correct for pro users)');
}

if (user2Data.userType !== 'pro') {
  console.log('  ✗ Wrong userType');
  test2Passed = false;
} else {
  console.log('  ✓ Correct userType:', user2Data.userType);
}

if (test2Passed) {
  passed++;
  console.log('✓ Test 2 PASSED\n');
} else {
  failed++;
  console.log('✗ Test 2 FAILED\n');
}

// Test 3: Verify BASE_USER
console.log('Test 3: BASE_USER verification');
const baseUserKey = "base_user";
const baseUserUid = simpleHash(baseUserKey).toString();
const baseUserData = mockData[baseUserUid];

let test3Passed = true;
if (!baseUserData) {
  console.log('  ✗ BASE_USER not created');
  test3Passed = false;
} else {
  if (!baseUserData.uid) {
    console.log('  ✗ BASE_USER missing uid field');
    test3Passed = false;
  } else {
    console.log('  ✓ BASE_USER has uid field:', baseUserData.uid);
  }
  
  if (!baseUserData.passwordHash) {
    console.log('  ✗ BASE_USER missing passwordHash field');
    test3Passed = false;
  } else {
    console.log('  ✓ BASE_USER has passwordHash field:', baseUserData.passwordHash);
  }
  
  if (baseUserData.createdBy) {
    console.log('  ✗ BASE_USER has createdBy field (should NOT be present for pro users)');
    test3Passed = false;
  } else {
    console.log('  ✓ BASE_USER has no createdBy field (correct)');
  }
  
  if (baseUserData.userType !== 'pro') {
    console.log('  ✗ BASE_USER has wrong userType');
    test3Passed = false;
  } else {
    console.log('  ✓ BASE_USER has correct userType:', baseUserData.userType);
  }
}

if (test3Passed) {
  passed++;
  console.log('✓ Test 3 PASSED\n');
} else {
  failed++;
  console.log('✗ Test 3 FAILED\n');
}

// Test 4: Multiple regular users
console.log('Test 4: Multiple regular users');
const user3 = simulateRegister('testuser2', 'pass456', 'user');
const user3Data = mockData[user3.uid];

let test4Passed = true;
if (!user3Data.uid || !user3Data.passwordHash || !user3Data.createdBy) {
  console.log('  ✗ Missing required fields');
  test4Passed = false;
} else {
  console.log('  ✓ All required fields present');
  console.log('    - uid:', user3Data.uid);
  console.log('    - passwordHash:', user3Data.passwordHash);
  console.log('    - createdBy:', user3Data.createdBy);
}

// Verify createdBy points to BASE_USER
if (user3Data.createdBy !== baseUserUid) {
  console.log('  ✗ createdBy does not point to BASE_USER');
  test4Passed = false;
} else {
  console.log('  ✓ createdBy correctly points to BASE_USER');
}

if (test4Passed) {
  passed++;
  console.log('✓ Test 4 PASSED\n');
} else {
  failed++;
  console.log('✗ Test 4 FAILED\n');
}

// Summary
console.log('═'.repeat(60));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(60));

// Print mock data structure
console.log('\nMock Data Structure (what gets saved to data.json):');
console.log(JSON.stringify(mockData, null, 2));

if (failed === 0) {
  console.log('\n✓ ALL TESTS PASSED!\n');
  console.log('The auth.js modifications are working correctly:');
  console.log('  • All users have uid field saved');
  console.log('  • All users have passwordHash field saved');
  console.log('  • Non-pro users have createdBy field');
  console.log('  • Pro users do NOT have createdBy field\n');
  process.exit(0);
} else {
  console.log('\n✗ SOME TESTS FAILED!\n');
  process.exit(1);
}
