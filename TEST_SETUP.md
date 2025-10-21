# Test Setup Guide

## Test Users

For testing the authentication system, you can use these test accounts:

### Trainer Account (Professional)
- **Username**: `mario`
- **Password**: `mario`
- **UID**: `103666436` (hash-based)
- **Type**: Professional (pro)
- **Clients**: 1 client (TANO)

### Client Account (Created by Trainer)
- **Username**: `tano`
- **Password**: `tano123`
- **UID**: `client_1761051185673_6008` (trainer-generated)
- **Type**: User
- **Created by**: MARIO (103666436)
- **Workout Plan**: 2 exercises for LUNEDÌ

## Testing Instructions

1. **Test Client Login (Trainer-Created User)**:
   - Navigate to `index.html`
   - Login with username: `tano`, password: `tano123`
   - Should successfully access dashboard with workout plan visible

2. **Test Trainer Login**:
   - Navigate to `index.html`
   - Login with username: `mario`, password: `mario`
   - Should redirect to `pro.html` (professional dashboard)
   - Should see TANO in the client list

## Creating Test Data

To create test data from scratch, use this JSON structure in `data.json`:

```json
{
    "103666436": {
        "userType": "pro",
        "displayUsername": "MARIO",
        "passwordHash": "103666436",
        "uid": "103666436",
        "clients": [
            {
                "uid": "client_1761051185673_6008",
                "username": "TANO"
            }
        ],
        "data": {
            "habits": [],
            "workout": [],
            "uploadedWorkoutPlans": [],
            "diet": [],
            "dietPlan": {
                "targetCalories": 2000,
                "plan": []
            },
            "uploadedDietPlans": [],
            "dailyCompliance": {},
            "measurementsLog": []
        },
        "sleepStartTimestamp": null,
        "createdAt": "2025-10-21T12:49:04.691Z"
    },
    "client_1761051185673_6008": {
        "userType": "user",
        "displayUsername": "TANO",
        "passwordHash": "2753182340",
        "uid": "client_1761051185673_6008",
        "data": {
            "habits": [],
            "workout": [
                {
                    "id": 1761051409166.5063,
                    "day": "LUNEDÌ",
                    "exercise": "LEG PRESS (MACCHINA)",
                    "sets": 3,
                    "reps": 5,
                    "load": "N/D"
                },
                {
                    "id": 1761051409166.0129,
                    "day": "LUNEDÌ",
                    "exercise": "HIP THRUST (BILANCIERE O MACCH.)",
                    "sets": 3,
                    "reps": 5,
                    "load": "N/D"
                }
            ],
            "uploadedWorkoutPlans": [],
            "diet": [],
            "dietPlan": {
                "targetCalories": 2000,
                "plan": []
            },
            "uploadedDietPlans": [],
            "dailyCompliance": {},
            "measurementsLog": []
        },
        "sleepStartTimestamp": null,
        "createdBy": "103666436",
        "createdAt": "2025-10-21T12:53:05.673Z"
    }
}
```

## Password Hash Generation

Password hashes are generated using the `simpleHash()` function:

```javascript
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}
```

Examples:
- `simpleHash('mario')` = `103666436`
- `simpleHash('tano123')` = `2753182340`
