# UID Field Fix - Documentation

## Problem Statement

Previously, the following fields were not being saved inside the user data objects for all users:
- `uid` - User ID
- `passwordHash` - Password hash (was already being saved, but documented here for completeness)
- `createdBy` - ID of the creator (for non-pro users only)

This caused issues where users couldn't login because the required fields weren't properly stored in data.json.

## Changes Made

### Modified: auth.js

#### 1. Register Function - User Payload (Line 327-328)
**Added `uid` field to the user data payload:**
```javascript
const payload = {
  uid: uid,  // ← ADDED
  userType: userType, 
  displayUsername: user.username,
  passwordHash: passwordHash,
  // ... rest of fields
};
```

#### 2. BASE_USER Creation (Line 297-298)
**Added `uid` field to BASE_USER data:**
```javascript
baseUserData = {
  uid: baseUserUid,  // ← ADDED
  userType: "pro",
  displayUsername: "BASE_USER",
  passwordHash: baseUserPasswordHash,
  // ... rest of fields
};
```

## Verification

### Fields Now Saved for All Users:

#### For Regular Users (userType: "user"):
- ✓ `uid` - Unique user identifier
- ✓ `passwordHash` - Hashed password
- ✓ `createdBy` - ID of BASE_USER (automatic trainer assignment)
- ✓ `userType` - "user"
- ✓ `displayUsername` - Display name
- ✓ All other standard fields

#### For Professional Users (userType: "pro"):
- ✓ `uid` - Unique user identifier
- ✓ `passwordHash` - Hashed password
- ✓ `userType` - "pro"
- ✓ `displayUsername` - Display name
- ✓ All other standard fields
- ✗ `createdBy` - NOT included (correct, as pro users are not created by others)

#### For BASE_USER (special trainer account):
- ✓ `uid` - Unique identifier
- ✓ `passwordHash` - Hashed password
- ✓ `userType` - "pro"
- ✓ `displayUsername` - "BASE_USER"
- ✓ All other standard fields
- ✗ `createdBy` - NOT included (correct, as BASE_USER is a pro account)

## Data Structure Example

After these changes, data saved to data.json looks like this:

```json
{
  "2478585977": {
    "uid": "2478585977",
    "userType": "pro",
    "displayUsername": "BASE_USER",
    "passwordHash": "-1255658591",
    "clients": [],
    "data": { ... },
    "sleepStartTimestamp": null,
    "createdAt": "2025-10-24T07:40:08.534Z"
  },
  "3135132788": {
    "uid": "3135132788",
    "userType": "user",
    "displayUsername": "TESTUSER1",
    "passwordHash": "-2891236937",
    "createdBy": "2478585977",
    "clients": [],
    "data": { ... },
    "sleepStartTimestamp": null,
    "createdAt": "2025-10-24T07:40:08.534Z"
  }
}
```

## Testing

### Tests Run:
1. ✓ `test_login_fix.js` - All 7 tests passed
2. ✓ `test_uid_fields.js` - All 4 tests passed (new test)
3. ✓ Syntax validation passed
4. ✓ CodeQL security scan passed (0 vulnerabilities)

### Test Coverage:
- User registration with all required fields
- Pro user registration (no createdBy field)
- BASE_USER creation with uid field
- Multiple user registrations
- Login functionality maintained
- Password validation working correctly

## Impact

### What Changed:
- All users now have `uid` field saved in their data object
- This ensures consistency in the data structure
- Login functionality remains fully operational

### What Didn't Change:
- `passwordHash` was already being saved correctly (no change needed)
- `createdBy` was already being saved for non-pro users (no change needed)
- Login logic remains unchanged
- Password verification remains unchanged
- All existing functionality preserved

## Backwards Compatibility

Existing users without the `uid` field in their data will continue to work because:
1. The login function uses the userId key in data.json, not the uid field inside the data
2. The uid field is now saved for new registrations
3. Old data structures remain functional

However, for consistency, existing users will have the uid field added when they:
- Re-register (not recommended)
- Or when an admin updates their data

## Conclusion

The changes ensure that all users have the required fields (`uid`, `passwordHash`, and `createdBy` for non-pro users) saved correctly in data.json. This maintains data consistency and ensures all users can login successfully.
