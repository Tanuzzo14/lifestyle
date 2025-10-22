// Integration test for BASE_USER functionality using auth.js
import { Auth } from './back-end/auth.js';

const API_URL = 'http://localhost:8000/back-end/api.php';

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

async function testAuthBaseUser() {
  console.log('\n===== Testing BASE_USER with Auth.register =====\n');
  
  // Cleanup
  console.log('1. Cleaning up existing test data...');
  const testUsername1 = 'authtest1_' + Date.now();
  const testUsername2 = 'authtest2_' + Date.now();
  const baseUserUid = simpleHash('base_user').toString();
  const testUser1Uid = simpleHash(testUsername1.toLowerCase()).toString();
  const testUser2Uid = simpleHash(testUsername2.toLowerCase()).toString();
  
  await apiCall('DELETE', { userId: testUser1Uid });
  await apiCall('DELETE', { userId: testUser2Uid });
  await apiCall('DELETE', { userId: baseUserUid });
  console.log('   ✓ Cleanup complete\n');
  
  // Test 1: Register first user using Auth.register
  console.log('2. Registering first user via Auth.register...');
  const messages = [];
  const displayError = (msg) => {
    messages.push(msg);
    console.log('   Message:', msg);
  };
  
  const user1 = await Auth.register(testUsername1, 'password123', 'user', displayError);
  
  if (user1) {
    console.log('   ✓ User1 registered successfully');
    console.log('   - UID:', user1.uid);
    console.log('   - Username:', user1.username);
    console.log('   - Type:', user1.userType);
  } else {
    console.log('   ✗ User1 registration failed');
    return;
  }
  console.log();
  
  // Small delay to ensure data is saved
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 2: Verify BASE_USER was created
  console.log('3. Verifying BASE_USER was created...');
  const baseUserCheck = await apiCall('GET', { userId: baseUserUid });
  if (baseUserCheck.success && baseUserCheck.data) {
    console.log('   ✓ BASE_USER exists');
    console.log('   - Type:', baseUserCheck.data.userType);
    console.log('   - Display name:', baseUserCheck.data.displayUsername);
    console.log('   - Clients count:', baseUserCheck.data.clients?.length || 0);
  } else {
    console.log('   ✗ BASE_USER not found');
    console.log('   Response:', baseUserCheck);
    return;
  }
  console.log();
  
  // Test 3: Verify user has createdBy field
  console.log('4. Verifying user has createdBy field...');
  const user1Check = await apiCall('GET', { userId: user1.uid });
  if (user1Check.success && user1Check.data) {
    if (user1Check.data.createdBy === baseUserUid) {
      console.log('   ✓ User has correct createdBy field');
    } else {
      console.log('   ✗ User createdBy field incorrect');
      console.log('   - Expected:', baseUserUid);
      console.log('   - Got:', user1Check.data.createdBy);
    }
  } else {
    console.log('   ✗ User not found');
  }
  console.log();
  
  // Test 4: Verify user is in BASE_USER clients
  console.log('5. Verifying user is in BASE_USER clients...');
  const baseUserData = baseUserCheck.data;
  const userInClients = baseUserData.clients?.find(c => c.uid === user1.uid);
  if (userInClients) {
    console.log('   ✓ User found in BASE_USER clients');
    console.log('   - Client entry:', userInClients);
  } else {
    console.log('   ✗ User not found in BASE_USER clients');
    console.log('   - Current clients:', baseUserData.clients);
  }
  console.log();
  
  // Test 5: Register second user
  console.log('6. Registering second user via Auth.register...');
  const user2 = await Auth.register(testUsername2, 'password456', 'user', displayError);
  
  if (user2) {
    console.log('   ✓ User2 registered successfully');
    console.log('   - UID:', user2.uid);
    console.log('   - Username:', user2.username);
  } else {
    console.log('   ✗ User2 registration failed');
    return;
  }
  console.log();
  
  // Small delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 6: Verify BASE_USER has both users
  console.log('7. Verifying BASE_USER has both users...');
  const finalCheck = await apiCall('GET', { userId: baseUserUid });
  if (finalCheck.success && finalCheck.data) {
    const clientsCount = finalCheck.data.clients?.length || 0;
    console.log('   ✓ BASE_USER clients count:', clientsCount);
    if (clientsCount === 2) {
      console.log('   ✓ Both users added successfully');
      finalCheck.data.clients.forEach(client => {
        console.log('     -', client.username, '(uid:', client.uid + ')');
      });
    } else {
      console.log('   ⚠ Expected 2 clients, got', clientsCount);
      console.log('   - Clients:', finalCheck.data.clients);
    }
  }
  console.log();
  
  // Test 7: Test login for base user
  console.log('8. Testing login for base user...');
  const loginResult = await Auth.login(testUsername1, 'password123', displayError);
  if (loginResult) {
    console.log('   ✓ Login successful');
    console.log('   - Username:', loginResult.username);
    console.log('   - UID:', loginResult.uid);
  } else {
    console.log('   ✗ Login failed');
  }
  console.log();
  
  // Test 8: Register a pro user (should NOT be added to BASE_USER)
  console.log('9. Registering a professional user...');
  const proUsername = 'protest_' + Date.now();
  const proUser = await Auth.register(proUsername, 'propass', 'pro', displayError);
  
  if (proUser) {
    console.log('   ✓ Pro user registered');
    
    // Check if pro user has createdBy field (should not)
    const proCheck = await apiCall('GET', { userId: proUser.uid });
    if (proCheck.success && proCheck.data) {
      if (!proCheck.data.createdBy) {
        console.log('   ✓ Pro user correctly has no createdBy field');
      } else {
        console.log('   ✗ Pro user should not have createdBy field');
      }
    }
    
    // Clean up pro user
    await apiCall('DELETE', { userId: proUser.uid });
  }
  console.log();
  
  console.log('===== All Integration Tests Completed =====\n');
  
  // Cleanup
  console.log('Cleaning up test data...');
  await apiCall('DELETE', { userId: testUser1Uid });
  await apiCall('DELETE', { userId: testUser2Uid });
  await apiCall('DELETE', { userId: baseUserUid });
  console.log('✓ Cleanup complete\n');
}

// Run tests
testAuthBaseUser().catch(console.error);
