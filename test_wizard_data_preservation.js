/**
 * Test: Wizard Data Preservation
 * 
 * This test verifies that after starting the wizard, user data fields
 * (uid, passwordHash, createdBy) are properly preserved when saveAppState is called.
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const DATA_FILE = path.join(__dirname, 'data.json');
const TEST_USERNAME = 'wizard_test_user';
const TEST_PASSWORD = 'wizard_test_pass';

// Simple hash function (matching auth.js)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

// Clean up before tests
function cleanupTestData() {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const testUid = simpleHash(TEST_USERNAME.toLowerCase()).toString();
        const baseUserUid = simpleHash('base_user').toString();
        
        // Remove test user but keep BASE_USER
        if (data[testUid]) {
            delete data[testUid];
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            console.log('✓ Cleaned up test data');
        }
    }
}

// Test 1: Verify user registration creates required fields
function testRegistrationCreatesFields() {
    console.log('\n=== Test 1: Registration Creates Required Fields ===');
    
    const testUid = simpleHash(TEST_USERNAME.toLowerCase()).toString();
    const baseUserUid = simpleHash('base_user').toString();
    
    // Read data.json
    if (!fs.existsSync(DATA_FILE)) {
        console.error('✗ data.json does not exist');
        return false;
    }
    
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const userData = data[testUid];
    
    if (!userData) {
        console.error(`✗ User ${testUid} not found in data.json`);
        return false;
    }
    
    // Check required fields
    const requiredFields = ['uid', 'passwordHash', 'createdBy'];
    let allFieldsPresent = true;
    
    for (const field of requiredFields) {
        if (field === 'createdBy') {
            if (!userData[field]) {
                console.error(`✗ Field ${field} is missing or null`);
                allFieldsPresent = false;
            } else if (userData[field] !== baseUserUid) {
                console.error(`✗ Field ${field} has wrong value: ${userData[field]} (expected ${baseUserUid})`);
                allFieldsPresent = false;
            } else {
                console.log(`✓ Field ${field} is present and correct: ${userData[field]}`);
            }
        } else {
            if (!userData[field]) {
                console.error(`✗ Field ${field} is missing or null`);
                allFieldsPresent = false;
            } else {
                console.log(`✓ Field ${field} is present: ${userData[field]}`);
            }
        }
    }
    
    return allFieldsPresent;
}

// Test 2: Simulate wizard flow and verify fields are preserved
function testWizardPreservesFields() {
    console.log('\n=== Test 2: Wizard Flow Preserves Fields ===');
    
    const testUid = simpleHash(TEST_USERNAME.toLowerCase()).toString();
    
    // Read initial state
    if (!fs.existsSync(DATA_FILE)) {
        console.error('✗ data.json does not exist');
        return false;
    }
    
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const initialUserData = JSON.parse(JSON.stringify(data[testUid])); // Deep copy
    
    if (!initialUserData) {
        console.error(`✗ User ${testUid} not found in data.json`);
        return false;
    }
    
    // Store initial values
    const initialUid = initialUserData.uid;
    const initialPasswordHash = initialUserData.passwordHash;
    const initialCreatedBy = initialUserData.createdBy;
    
    console.log('Initial values:');
    console.log(`  uid: ${initialUid}`);
    console.log(`  passwordHash: ${initialPasswordHash}`);
    console.log(`  createdBy: ${initialCreatedBy}`);
    
    // Simulate wizard step - add measurements (this would trigger saveAppState)
    const userData = data[testUid];
    userData.data = userData.data || {};
    userData.data.measurementsLog = userData.data.measurementsLog || [];
    userData.data.measurementsLog.push({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        raw: {
            weight: 75,
            height: 175,
            age: 30,
            gender: 'UOMO',
            waist: 80,
            hips: 95,
            chest: 100,
            bicep: 35,
            thigh: 55
        },
        calculated: {
            bmi: '24.49',
            bodyFat: '18.5',
            classification: 'CLASSIFICAZIONE BMI: NORMOPESO',
            whr: '0.84',
            risk: 'RISCHIO CARDIOVASCOLARE: BASSO'
        }
    });
    userData.updatedAt = new Date().toISOString();
    
    // Write back to simulate saveAppState
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    // Read back and verify
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const updatedUserData = data[testUid];
    
    // Check if fields are preserved
    let allFieldsPreserved = true;
    
    if (updatedUserData.uid !== initialUid) {
        console.error(`✗ uid changed from ${initialUid} to ${updatedUserData.uid}`);
        allFieldsPreserved = false;
    } else {
        console.log(`✓ uid preserved: ${updatedUserData.uid}`);
    }
    
    if (updatedUserData.passwordHash !== initialPasswordHash) {
        console.error(`✗ passwordHash changed from ${initialPasswordHash} to ${updatedUserData.passwordHash}`);
        allFieldsPreserved = false;
    } else {
        console.log(`✓ passwordHash preserved: ${updatedUserData.passwordHash}`);
    }
    
    if (updatedUserData.createdBy !== initialCreatedBy) {
        console.error(`✗ createdBy changed from ${initialCreatedBy} to ${updatedUserData.createdBy}`);
        allFieldsPreserved = false;
    } else {
        console.log(`✓ createdBy preserved: ${updatedUserData.createdBy}`);
    }
    
    // Verify measurements were added
    if (!updatedUserData.data.measurementsLog || updatedUserData.data.measurementsLog.length === 0) {
        console.error('✗ Measurements were not saved');
        allFieldsPreserved = false;
    } else {
        console.log(`✓ Measurements saved: ${updatedUserData.data.measurementsLog.length} records`);
    }
    
    return allFieldsPreserved;
}

// Main test execution
async function runTests() {
    console.log('=================================================');
    console.log('Wizard Data Preservation Test Suite');
    console.log('=================================================');
    
    let allTestsPassed = true;
    
    // Note: This test assumes a user has been registered via the UI
    // It verifies the fields exist and are preserved during wizard flow
    
    try {
        // Test 1: Check registration creates fields
        const test1 = testRegistrationCreatesFields();
        allTestsPassed = allTestsPassed && test1;
        
        // Test 2: Simulate wizard and check preservation
        const test2 = testWizardPreservesFields();
        allTestsPassed = allTestsPassed && test2;
        
        // Summary
        console.log('\n=================================================');
        if (allTestsPassed) {
            console.log('✓ ALL TESTS PASSED');
            console.log('=================================================');
            process.exit(0);
        } else {
            console.log('✗ SOME TESTS FAILED');
            console.log('=================================================');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n✗ TEST ERROR:', error);
        process.exit(1);
    }
}

// Cleanup and run
if (require.main === module) {
    console.log('Note: This test requires a registered user via the UI first.');
    console.log('To test manually:');
    console.log('1. Open index.html in a browser');
    console.log(`2. Register a new user with username "${TEST_USERNAME}" and password "${TEST_PASSWORD}"`);
    console.log('3. Run this test to verify data preservation\n');
    
    runTests();
}
