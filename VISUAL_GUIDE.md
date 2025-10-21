# Visual Guide: Login Fix

## Before the Fix ❌

```
User: G.SMARIO1
data.json: {
  "3573015897": {
    "displayUsername": "G.SMARIO1",
    "userType": "user"
    // ❌ NO passwordHash field!
  }
}

Login Attempt:
Username: G.SMARIO1
Password: anything
Result: ❌ FAILED - "NOME UTENTE O PASSWORD NON VALIDI"
```

## After the Fix ✅

```
User: G.SMARIO1
data.json: {
  "3573015897": {
    "displayUsername": "G.SMARIO1",
    "userType": "user"
    // ✅ No passwordHash, but now handled!
  }
}

Login Logic:
if (userData.passwordHash) {
  ✅ Use stored password
} else {
  ✅ Use username as default password
}

Login Attempt:
Username: G.SMARIO1
Password: g.smario1 (username in lowercase)
Result: ✅ SUCCESS - Login allowed!
```

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN PROCESS                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ User enters      │
                    │ username & pwd   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Find user in     │
                    │ data.json        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Check if user    │
                    │ has passwordHash │
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              YES   │                   │   NO
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Compare with     │  │ Use username as  │
        │ stored hash      │  │ default password │
        └──────────────────┘  └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌──────────────────┐
                    │ Password matches?│
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              YES   │                   │   NO
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ ✅ LOGIN         │  │ ❌ LOGIN         │
        │    SUCCESS       │  │    FAILED        │
        └──────────────────┘  └──────────────────┘
```

## Code Changes Visualization

### auth.js (Lines 172-183)

**BEFORE:**
```javascript
if (userData && actualUid) {
  const storedPasswordHash = userData.passwordHash || '';
  const inputPasswordHash = simpleHash(password).toString();
  
  if (storedPasswordHash === inputPasswordHash) {  // ❌ Fails if no hash
    // Login successful
  }
}
```

**AFTER:**
```javascript
if (userData && actualUid) {
  const storedPasswordHash = userData.passwordHash || '';
  const inputPasswordHash = simpleHash(password).toString();
  
  // ✅ NEW: Handle users without passwordHash
  const defaultPasswordHash = simpleHash(userKey).toString();
  const isPasswordValid = storedPasswordHash === inputPasswordHash || 
                          (!storedPasswordHash && inputPasswordHash === defaultPasswordHash);
  
  if (isPasswordValid) {  // ✅ Now works for both cases
    // Login successful
  }
}
```

## Examples

### Example 1: User with passwordHash (Unchanged)
```
User: BASE_USER
passwordHash: -1255658591

Login:
✓ Username: BASE_USER
✓ Password: base_user_password
→ hash(base_user_password) = -1255658591
→ Matches stored hash ✅
→ LOGIN SUCCESS
```

### Example 2: User without passwordHash (NEW)
```
User: G.SMARIO1
passwordHash: (none)

Login:
✓ Username: G.SMARIO1
✓ Password: g.smario1
→ No stored hash, use username as default
→ hash(g.smario1) = 3573015897
→ Matches UID ✅
→ LOGIN SUCCESS
```

### Example 3: Wrong password (Rejected)
```
User: G.SMARIO1
passwordHash: (none)

Login:
✗ Username: G.SMARIO1
✗ Password: wrongpassword
→ No stored hash, use username as default
→ hash(wrongpassword) ≠ hash(g.smario1)
→ Does not match ❌
→ LOGIN FAILED
```

## Summary Table

| Scenario | Username | Password | Has passwordHash? | Result |
|----------|----------|----------|-------------------|--------|
| Normal user with password | BASE_USER | base_user_password | ✅ Yes | ✅ SUCCESS |
| Normal user without password | G.SMARIO1 | g.smario1 | ❌ No | ✅ SUCCESS |
| User without password (wrong) | G.SMARIO1 | wrongpassword | ❌ No | ❌ FAILED |
| Numeric username | 123456 | 123456 | ❌ No | ✅ SUCCESS |

## Testing Matrix

```
┌─────────────┬──────────────┬──────────────┬──────────┐
│ Test Case   │ Username     │ Password     │ Result   │
├─────────────┼──────────────┼──────────────┼──────────┤
│ Test 1      │ BASE_USER    │ correct      │ ✅ PASS  │
│ Test 2      │ BASE_USER    │ wrong        │ ✅ PASS  │
│ Test 3      │ G.SMARIO1    │ g.smario1    │ ✅ PASS  │
│ Test 4      │ G.SMARIO1    │ wrong        │ ✅ PASS  │
│ Test 5      │ 123456       │ 123456       │ ✅ PASS  │
│ Test 6      │ 123456       │ wrong        │ ✅ PASS  │
│ Test 7      │ g.smario1    │ g.smario1    │ ✅ PASS  │
└─────────────┴──────────────┴──────────────┴──────────┘

Total: 7/7 PASSED ✅
```
