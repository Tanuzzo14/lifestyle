# Memberstack Integration Documentation - LIFEGROWTH PWA

## Overview

This document describes the Memberstack integration implemented in the LIFEGROWTH PWA. The integration provides subscription management with a 6-month free trial period while maintaining the existing local authentication system.

## Implementation Details

### 1. Memberstack Script Integration

The Memberstack DOM library is imported in `index.html`:

```javascript
import memberstackDOM from 'https://unpkg.com/@memberstack/dom/dist/memberstack.js';

const memberstack = memberstackDOM.init({
  publicKey: 'pk_6cd853f955f1da7adc05',
});
```

### 2. Subscription Plans

The following subscription plans are configured:

```javascript
const SUBSCRIPTION_PLANS = {
  FREE_TRIAL_6M: 'free-trial-6m',      // Not used - trial handled in code
  PRO_MONTHLY: 'pro-monthly',           // PRO plan - monthly billing
  PRO_SEMESTER: 'pro-6m',               // PRO plan - 6 month billing
  PRO_YEARLY: 'pro-yearly',             // PRO plan - yearly billing
  USER_MONTHLY: 'user-monthly',         // User plan - monthly billing
  USER_SEMESTER: 'user-6m',             // User plan - 6 month billing
  USER_YEARLY: 'user-yearly',           // User plan - yearly billing
};
```

### 3. Free Trial Implementation

**Duration**: 180 days (6 months)

**Calculation Method**:
```javascript
const FREE_TRIAL_DAYS = 180;

// Trial is calculated from Memberstack member creation date
const createdAt = new Date(info.createdAt);
const trialEndsAt = new Date(createdAt);
trialEndsAt.setDate(trialEndsAt.getDate() + FREE_TRIAL_DAYS);

const isInTrial = new Date() <= trialEndsAt;
```

**Benefits**:
- No need for a dedicated trial plan in Memberstack
- Automatically calculated based on user creation date
- Works independently of subscription status

### 4. Subscription State Management

The subscription state tracks:

```javascript
let subscription = {
  isLoggedWithMemberstack: false,  // Whether user is authenticated with Memberstack
  isActive: false,                  // Whether user has an active paid subscription
  isInTrial: false,                 // Whether user is in the 6-month trial period
  currentPlans: [],                 // Array of active plan IDs
  trialEndsAt: null,                // ISO timestamp when trial expires
};
```

### 5. Access Control

**Function**: `userCanUseApp()`

Users can access the app if:
- They have an active subscription (`isActive = true`), OR
- They are within the trial period (`isInTrial = true`)

```javascript
function userCanUseApp() {
  return subscription.isActive || subscription.isInTrial;
}
```

### 6. Feature Guarding

Premium features (AI plan generation) are protected with the `guardFeature()` wrapper:

```javascript
function guardFeature(fn) {
  return async (...args) => {
    if (!userCanUseApp()) {
      renderCourtesyPage();
      displayError("ABBONAMENTO SCADUTO - RINNOVA PER CONTINUARE");
      return;
    }
    return await fn(...args);
  };
}
```

**Protected Functions**:
- `createAIWorkoutPlan` - AI workout plan generation
- `createAIDietPlan` - AI diet plan generation
- `createAIWorkoutPlanWizard` - Wizard-based AI workout plan
- `createAIDietPlanWizard` - Wizard-based AI diet plan

### 7. Courtesy Page

When a user's subscription/trial expires, they see a courtesy page with:
- Clear message about expired access
- Button to view pricing plans (opens Memberstack modal)
- Button to manage account (opens Memberstack modal)

```javascript
function renderCourtesyPage() {
  document.getElementById("app").innerHTML = `
    <div class="card mt-10 text-center">
      <h1>ABBONAMENTO SCADUTO</h1>
      <p>Il periodo gratuito è terminato...</p>
      <button data-ms-modal="pricing">VEDI I PIANI</button>
      <button data-ms-modal="account">GESTISCI ACCOUNT</button>
    </div>`;
}
```

### 8. Subscription Status Display

The summary dashboard shows subscription status:

**During Trial**:
- Status: "PROVA GRATUITA (X GIORNI RIMANENTI)"
- Color: Gold
- Button: "VEDI I PIANI"

**Active Subscription**:
- Status: "ABBONAMENTO ATTIVO"
- Color: Green
- Button: "GESTISCI ABBONAMENTO"

**Expired**:
- Status: "PROVA SCADUTA - ABBONAMENTO NECESSARIO"
- Color: Red
- Button: "ATTIVA ABBONAMENTO"

### 9. Integration Points

The `fetchMemberstackStatus()` function is called at:
1. **Page Load**: In `checkAuth()` after user authentication
2. **Login**: After successful local authentication
3. **Registration**: After new user account creation

This ensures subscription status is always current.

## Privacy & Data Protection

### What is NOT Stored in data.json

✅ **No email addresses** - Emails remain in Memberstack only
✅ **No real names** - Only pseudonymous usernames
✅ **No payment information** - Handled entirely by Memberstack
✅ **No Memberstack subscription data** - Fetched in real-time only

### What IS Stored in data.json

- `uid`: Hash-based user identifier
- `displayUsername`: Pseudonymous username (UPPERCASE)
- `passwordHash`: Minimal hash for local authentication
- `userType`: 'user' or 'pro'
- `createdBy`: UID of trainer (for BASE_USER tracking)
- `data`: User's workout, diet, measurements (non-sensitive health data)
- `sleepStartTimestamp`: Sleep tracking timestamp

### Data Flow

```
User → Memberstack Authentication → Subscription Status Fetch
                                            ↓
                              Check: isActive || isInTrial
                                            ↓
                                    Allow/Deny Access
                                            ↓
                              Save ONLY app data to data.json
                              (NO Memberstack data saved)
```

## Memberstack Dashboard Configuration

### Step 1: Add Domains

In Memberstack Dashboard → Sites:
- Add `http://localhost` (for local development)
- Add `http://localhost:3000` (if using port 3000)
- Add your production domain (e.g., `https://lifegrowth.it`)

### Step 2: Create Subscription Plans

Create the following plans in Memberstack with these exact IDs:

**PRO Plans** (for professionals):
- Plan Name: "PRO Monthly"
  - Plan ID: `pro-monthly`
  - Billing: Monthly
  
- Plan Name: "PRO Semester"
  - Plan ID: `pro-6m`
  - Billing: Every 6 months
  
- Plan Name: "PRO Yearly"
  - Plan ID: `pro-yearly`
  - Billing: Yearly

**USER Plans** (for regular users):
- Plan Name: "User Monthly"
  - Plan ID: `user-monthly`
  - Billing: Monthly
  
- Plan Name: "User Semester"
  - Plan ID: `user-6m`
  - Billing: Every 6 months
  
- Plan Name: "User Yearly"
  - Plan ID: `user-yearly`
  - Billing: Yearly

### Step 3: Trial Configuration

**Note**: You do NOT need to create a separate trial plan in Memberstack. The 6-month trial is automatically calculated in the application code based on the user's Memberstack account creation date.

### Step 4: Modal Configuration

The app uses Memberstack's built-in modals:
- `data-ms-modal="pricing"` - Opens pricing page
- `data-ms-modal="account"` - Opens account management

These work automatically once Memberstack is configured.

## Testing the Integration

### Test Scenario 1: New User (Trial Period)

1. User registers in the app
2. User is automatically in trial period (180 days)
3. Summary dashboard shows: "PROVA GRATUITA (X GIORNI RIMANENTI)"
4. User can access all AI features
5. No Memberstack data is saved to data.json

### Test Scenario 2: Active Subscriber

1. User has active subscription in Memberstack
2. App fetches status and sets `isActive = true`
3. Summary dashboard shows: "ABBONAMENTO ATTIVO"
4. User can access all features
5. No Memberstack data is saved to data.json

### Test Scenario 3: Expired Trial

1. User's 180-day trial has expired
2. User has no active Memberstack subscription
3. When user tries to use AI features:
   - Courtesy page is displayed
   - Error message: "ABBONAMENTO SCADUTO - RINNOVA PER CONTINUARE"
   - Buttons shown: "VEDI I PIANI" and "GESTISCI ACCOUNT"

### Test Scenario 4: Offline/No Memberstack Connection

1. If Memberstack cannot be reached
2. Existing subscription state is maintained
3. Error is logged but app continues to function
4. User sees last known subscription status

## Compatibility

### With Existing Local Authentication

✅ **Fully Compatible** - The Memberstack integration works as an additional layer on top of the existing local authentication system.

- Users still log in with username/password
- Local authentication remains unchanged
- Memberstack only manages subscription status
- No breaking changes to existing functionality

### Future Migration Path

If you want to fully migrate to Memberstack authentication in the future:
1. Remove `passwordHash` from data.json
2. Use Memberstack member IDs as `uid`
3. Use Memberstack login forms
4. Remove local authentication code

But this is optional - the current hybrid approach works perfectly.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        LIFEGROWTH PWA                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────┐      ┌──────────────────────┐       │
│  │ Local Auth System  │      │ Memberstack Layer    │       │
│  │                    │      │                      │       │
│  │ • Username/Pass    │      │ • Subscription Mgmt  │       │
│  │ • User Data        │◄─────┤ • Trial Calculation  │       │
│  │ • App State        │      │ • Feature Guarding   │       │
│  └────────────────────┘      └──────────────────────┘       │
│           │                            │                      │
│           ▼                            ▼                      │
│  ┌─────────────────────────────────────────────┐            │
│  │         Combined Access Control              │            │
│  │  isAuthenticated && (isActive || isInTrial)  │            │
│  └─────────────────────────────────────────────┘            │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                      Data Storage                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  data.json:                  Memberstack:                    │
│  • uid                       • email                         │
│  • displayUsername           • payment info                  │
│  • passwordHash              • subscription plans            │
│  • workout/diet data         • billing history              │
│  • measurements              • member metadata               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Issue: "Subscription status not updating"

**Solution**: Check browser console for Memberstack errors. Ensure:
- PublicKey is correct
- Domain is whitelisted in Memberstack
- User is logged into Memberstack

### Issue: "Trial shows as expired immediately"

**Solution**: The trial is calculated from Memberstack `createdAt` date. Check:
- User has a Memberstack account
- `fetchMemberstackStatus()` is being called
- Browser console for any errors

### Issue: "Modals not opening"

**Solution**: Memberstack modals require:
- Memberstack DOM script to be loaded
- Correct `data-ms-modal` attributes
- User to be on a whitelisted domain

### Issue: "User sees courtesy page but has active subscription"

**Solution**: 
- Check if `fetchMemberstackStatus()` completed successfully
- Verify plan IDs match exactly between code and Memberstack
- Check subscription status in Memberstack dashboard

## Code Maintenance

### Adding New Protected Features

To protect a new feature:

```javascript
// Define the feature function
async function myNewFeature() {
  // feature logic
}

// In window.app, wrap it with guardFeature
window.app = {
  myNewFeature: guardFeature(myNewFeature)
};
```

### Updating Trial Duration

To change the trial period:

```javascript
// Change this constant (in days)
const FREE_TRIAL_DAYS = 180; // Change to desired number
```

### Adding New Subscription Plans

1. Add to `SUBSCRIPTION_PLANS` constant:
```javascript
const SUBSCRIPTION_PLANS = {
  // ... existing plans
  NEW_PLAN: 'new-plan-id',
};
```

2. Create matching plan in Memberstack dashboard with ID `new-plan-id`

## Summary

The Memberstack integration successfully:
- ✅ Adds subscription management to LIFEGROWTH PWA
- ✅ Implements 6-month free trial (180 days)
- ✅ Protects AI features with subscription checks
- ✅ Displays subscription status to users
- ✅ Provides upgrade paths via Memberstack modals
- ✅ Maintains privacy (no sensitive data in data.json)
- ✅ Remains compatible with existing local authentication
- ✅ Follows all requirements from the problem statement

The implementation is production-ready and requires only Memberstack dashboard configuration to be fully operational.
