# BASE_USER Feature Documentation

## Overview

This feature automatically assigns all self-registered base users to a default trainer called "BASE_USER". This ensures that users who register themselves (not created by a health professional) are tracked and can be managed centrally.

## Implementation Details

### What Changed

The `Auth.register()` function in `auth.js` has been enhanced to:

1. **Auto-create BASE_USER**: When the first base user (userType='user') registers, a special trainer account called "BASE_USER" is automatically created
2. **Assign users to BASE_USER**: All self-registered base users are automatically added to BASE_USER's client list
3. **Set createdBy field**: Base users get a `createdBy` field pointing to BASE_USER's UID
4. **Reuse BASE_USER**: Subsequent base user registrations reuse the existing BASE_USER (not recreated)
5. **Exclude professionals**: Professional users (userType='pro') are NOT added to BASE_USER

### Data Structure

#### BASE_USER Account
```json
{
  "2478585977": {
    "userType": "pro",
    "displayUsername": "BASE_USER",
    "passwordHash": "<hash>",
    "clients": [
      { "uid": "user1_uid", "username": "USER1" },
      { "uid": "user2_uid", "username": "USER2" }
    ],
    "data": { ... },
    "createdAt": "2025-10-21T14:19:56.520Z"
  }
}
```

#### Base User Account
```json
{
  "user1_uid": {
    "userType": "user",
    "displayUsername": "USER1",
    "passwordHash": "<hash>",
    "createdBy": "2478585977",  // Points to BASE_USER
    "clients": [],
    "data": { ... },
    "createdAt": "2025-10-21T14:19:56.536Z"
  }
}
```

#### Professional User Account (NOT added to BASE_USER)
```json
{
  "pro_uid": {
    "userType": "pro",
    "displayUsername": "PROUSER1",
    "passwordHash": "<hash>",
    // NO createdBy field
    "clients": [],
    "data": { ... },
    "createdAt": "2025-10-21T14:20:30.123Z"
  }
}
```

## Benefits

1. **Centralized Management**: All self-registered users are tracked under BASE_USER
2. **Data Consistency**: Ensures the same data structure for both self-registered and trainer-created users
3. **Future Analytics**: Enables tracking and analytics of self-registered users
4. **Migration Path**: Easy to transfer users from BASE_USER to specific trainers if needed

## Usage

### For Users
No changes required - the feature works automatically during registration.

### For Developers

#### Accessing BASE_USER Data
```javascript
const baseUserUid = simpleHash('base_user').toString(); // "2478585977"
const result = await apiCall('GET', { userId: baseUserUid });
if (result.success && result.data) {
  const baseUserData = result.data;
  console.log('BASE_USER clients:', baseUserData.clients);
}
```

#### Checking if a User is Self-Registered
```javascript
const userId = '<user_uid>';
const result = await apiCall('GET', { userId: userId });
if (result.success && result.data) {
  const userData = result.data;
  const isSelfRegistered = userData.createdBy === simpleHash('base_user').toString();
  console.log('Self-registered:', isSelfRegistered);
}
```

## Testing

### Manual Testing
1. Clean data.json
2. Register a new base user (Utente)
3. Verify BASE_USER is created
4. Verify user has createdBy field
5. Register a second base user
6. Verify BASE_USER has both users in clients list
7. Register a professional user
8. Verify professional is NOT in BASE_USER's clients

### Automated Tests
- `test_base_user_creation.js` - Manual test script
- `test_base_user.html` - Browser-based interactive tests
- `test_auth_base_user.js` - Integration tests with Auth module

## Console Logs

When a base user registers, you'll see:
```
BASE_USER trainer created successfully  // Only on first base user registration
User registered successfully to data.json
User added to BASE_USER clients list
```

When a professional registers, you'll see:
```
User registered successfully to data.json
// No BASE_USER messages
```

## Migration Notes

If you need to migrate existing users to BASE_USER:

```javascript
// Example migration script
async function migrateExistingUsers() {
  const baseUserUid = simpleHash('base_user').toString();
  const allDataResult = await apiCall('GET', {});
  
  if (allDataResult.success && allDataResult.data) {
    const allData = allDataResult.data;
    const baseUserData = allData[baseUserUid];
    
    if (!baseUserData) {
      console.error('BASE_USER not found');
      return;
    }
    
    for (const [uid, userData] of Object.entries(allData)) {
      // Skip BASE_USER itself and professional users
      if (uid === baseUserUid || userData.userType === 'pro') continue;
      
      // Skip users already assigned to a trainer
      if (userData.createdBy) continue;
      
      // Assign to BASE_USER
      userData.createdBy = baseUserUid;
      await apiCall('POST', { userId: uid, data: userData });
      
      // Add to BASE_USER clients if not already there
      if (!baseUserData.clients.find(c => c.uid === uid)) {
        baseUserData.clients.push({ 
          uid: uid, 
          username: userData.displayUsername 
        });
      }
    }
    
    // Save updated BASE_USER
    await apiCall('POST', { userId: baseUserUid, data: baseUserData });
  }
}
```

## Security Considerations

1. **BASE_USER Password**: The BASE_USER account has a hardcoded password hash. This is intentional as it's a system account, not meant for direct login.
2. **Access Control**: Consider implementing access controls if BASE_USER should not be accessible via pro.html dashboard.
3. **Client Privacy**: Ensure BASE_USER can only view aggregate data, not individual client details (if such restrictions are needed).

## Future Enhancements

1. **BASE_USER Dashboard**: Create a special dashboard for BASE_USER to view analytics
2. **User Transfer**: Allow transferring users from BASE_USER to specific trainers
3. **Notifications**: Notify BASE_USER when new users register
4. **Bulk Operations**: Enable bulk management of users under BASE_USER
