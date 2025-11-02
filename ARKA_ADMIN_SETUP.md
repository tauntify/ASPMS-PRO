# ARKA SERVICES Admin Account Setup

## Overview
This document outlines the setup for the special ARKA SERVICES office admin account that bypasses all subscription requirements.

## Account Details

**Email:** admin@arka.pk
**Password:** ArkaServices2025! *(Change after first login)*
**Username:** arkaservices
**Role:** admin
**Special Flag:** isArkaAdmin: true

## How to Create This Account

### Option 1: Firebase Console (Recommended)

1. Go to Firebase Console: https://console.firebase.google.com/project/aspms-pro-v1
2. Navigate to Authentication → Users
3. Click "Add User"
   - Email: admin@arka.pk
   - Password: ArkaServices2025!
   - Click "Add User"
4. Copy the generated UID
5. Go to Firestore Database → users collection
6. Create a new document with the UID as the document ID
7. Add the following fields:

```javascript
{
  id: "<UID from step 4>",
  username: "arkaservices",
  email: "admin@arka.pk",
  password: "<bcrypt hashed password>",
  role: "admin",
  firstName: "ARKA",
  lastName: "SERVICES",
  phone: "+92-300-0000000",
  dateOfBirth: Timestamp (Jan 1, 1990),
  address: "ARKA Services Office",
  city: "Lahore",
  country: "Pakistan",
  isActive: true,
  createdAt: Timestamp (current time),
  updatedAt: Timestamp (current time),
  isArkaAdmin: true,  // IMPORTANT: Special flag
  // NO subscriptionId field - this is intentional
}
```

### Option 2: Using the Script (When Service Account Key is Available)

1. Download the service account key from Firebase Console
2. Save it as `serviceAccountKey.json` in the project root
3. Run: `npx tsx scripts/create-arka-admin.ts`

## Important Notes

- **NO subscriptionId**: This account should NOT have a subscriptionId field
- **isArkaAdmin flag**: Must be set to true
- **Role**: Must be "admin"
- **Bypasses subscription checks**: The App.tsx already has logic to bypass subscription checks for admin role users (line 54)

## Updated Pricing Plans

All pricing plans have been updated as follows:

### Individual Plan
- **Price:** $10/month
- **Projects:** Up to 5
- **Employees:** 0 (single user only)
- **User Accounts:** 1

### Custom Plan
- **Base Price:** $50/month (includes 5 employees, 10 projects, 5 user accounts)
- **Additional:** $10/employee, $5/project
- **Max Employees:** Flexible (base 5)
- **Max Projects:** Flexible (base 10)
- **User Accounts:** 5

### Organization Plan
- **Price:** $300/month
- **Employees:** Up to 30
- **Projects:** Up to 50
- **User Accounts:** Unlimited

## Files Modified

1. `client/src/pages/pricing-new.tsx` - Updated all plan pricing and limits
2. `server/subscription-utils.ts` - Updated SUBSCRIPTION_CONFIG
3. `functions/src/server/subscription-utils.ts` - Synced configuration
4. `client/src/App.tsx` - Already has admin bypass logic

## Deployment Status

✓ All pricing changes deployed to: https://aspms-pro-v1.web.app
✓ Subscription utilities synced to Cloud Functions
✓ FAQ section updated with new pricing

## Security Reminder

**IMPORTANT:** Change the default password immediately after first login!
