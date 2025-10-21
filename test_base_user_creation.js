// Test script for BASE_USER functionality
const API_URL = 'http://localhost:8000/api.php';

async function apiCall(method, params = {}) {
  try {
    const options = {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (method === 'GET') {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}?${query}`, options);
      const result = await response.json();
      return result;
    } else {
      options.body = JSON.stringify(params);
      const response = await fetch(API_URL, options);
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

async function testBaseUserCreation() {
  console.log('\n===== Testing BASE_USER Creation =====\n');
  
  // Cleanup any existing test data first
  console.log('1. Cleaning up existing test data...');
  const testUsername1 = 'testbaseuser1';
  const testUsername2 = 'testbaseuser2';
  const baseUserUid = simpleHash('base_user').toString();
  const testUser1Uid = simpleHash(testUsername1).toString();
  const testUser2Uid = simpleHash(testUsername2).toString();
  
  await apiCall('DELETE', { userId: testUser1Uid });
  await apiCall('DELETE', { userId: testUser2Uid });
  await apiCall('DELETE', { userId: baseUserUid });
  console.log('   ✓ Cleanup complete\n');
  
  // Test 1: Register first base user
  console.log('2. Registering first base user...');
  const user1Data = {
    userType: 'user',
    displayUsername: testUsername1.toUpperCase(),
    passwordHash: simpleHash('password123').toString(),
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
    createdBy: baseUserUid,
    createdAt: new Date().toISOString()
  };
  
  // Simulate the registration logic manually
  // First, create BASE_USER
  const baseUserData = {
    userType: 'pro',
    displayUsername: 'BASE_USER',
    passwordHash: simpleHash('base_user_password').toString(),
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
  
  const baseUserResult = await apiCall('POST', { userId: baseUserUid, data: baseUserData });
  if (!baseUserResult.success) {
    console.log('   ✗ Failed to create BASE_USER');
    return;
  }
  console.log('   ✓ BASE_USER created');
  
  // Save user
  const user1Result = await apiCall('POST', { userId: testUser1Uid, data: user1Data });
  if (!user1Result.success) {
    console.log('   ✗ Failed to create user1');
    return;
  }
  console.log('   ✓ User1 created');
  
  // Add user to BASE_USER clients
  baseUserData.clients.push({ uid: testUser1Uid, username: testUsername1.toUpperCase() });
  await apiCall('POST', { userId: baseUserUid, data: baseUserData });
  console.log('   ✓ User1 added to BASE_USER clients\n');
  
  // Test 2: Verify BASE_USER exists
  console.log('3. Verifying BASE_USER exists...');
  const baseUserCheck = await apiCall('GET', { userId: baseUserUid });
  if (baseUserCheck.success && baseUserCheck.data) {
    console.log('   ✓ BASE_USER found');
    console.log('   - Type:', baseUserCheck.data.userType);
    console.log('   - Clients count:', baseUserCheck.data.clients?.length || 0);
  } else {
    console.log('   ✗ BASE_USER not found');
    return;
  }
  console.log();
  
  // Test 3: Verify user has createdBy field
  console.log('4. Verifying user has createdBy field...');
  const user1Check = await apiCall('GET', { userId: testUser1Uid });
  if (user1Check.success && user1Check.data) {
    if (user1Check.data.createdBy === baseUserUid) {
      console.log('   ✓ User has correct createdBy field:', user1Check.data.createdBy);
    } else {
      console.log('   ✗ User createdBy field incorrect:', user1Check.data.createdBy);
    }
  } else {
    console.log('   ✗ User not found');
  }
  console.log();
  
  // Test 4: Verify user is in BASE_USER clients
  console.log('5. Verifying user is in BASE_USER clients list...');
  const baseUserData2 = baseUserCheck.data;
  const userInClients = baseUserData2.clients?.find(c => c.uid === testUser1Uid);
  if (userInClients) {
    console.log('   ✓ User found in BASE_USER clients:', userInClients);
  } else {
    console.log('   ✗ User not found in BASE_USER clients');
    console.log('   - Current clients:', baseUserData2.clients);
  }
  console.log();
  
  // Test 5: Register second user
  console.log('6. Registering second base user...');
  const user2Data = {
    userType: 'user',
    displayUsername: testUsername2.toUpperCase(),
    passwordHash: simpleHash('password456').toString(),
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
    createdBy: baseUserUid,
    createdAt: new Date().toISOString()
  };
  
  const user2Result = await apiCall('POST', { userId: testUser2Uid, data: user2Data });
  if (!user2Result.success) {
    console.log('   ✗ Failed to create user2');
    return;
  }
  console.log('   ✓ User2 created');
  
  // Add user2 to BASE_USER clients
  baseUserData2.clients.push({ uid: testUser2Uid, username: testUsername2.toUpperCase() });
  await apiCall('POST', { userId: baseUserUid, data: baseUserData2 });
  console.log('   ✓ User2 added to BASE_USER clients\n');
  
  // Test 6: Verify BASE_USER has both users
  console.log('7. Verifying BASE_USER has both users...');
  const finalCheck = await apiCall('GET', { userId: baseUserUid });
  if (finalCheck.success && finalCheck.data) {
    const clientsCount = finalCheck.data.clients?.length || 0;
    console.log('   ✓ BASE_USER clients count:', clientsCount);
    if (clientsCount === 2) {
      console.log('   ✓ Both users added successfully');
      console.log('   - Clients:', finalCheck.data.clients);
    } else {
      console.log('   ✗ Expected 2 clients, got', clientsCount);
    }
  }
  console.log();
  
  console.log('===== All Tests Completed =====\n');
  console.log('Note: Test data left in data.json for manual inspection.');
  console.log('You can clean up by running the cleanup test or deleting data.json\n');
}

// Run tests
testBaseUserCreation().catch(console.error);
