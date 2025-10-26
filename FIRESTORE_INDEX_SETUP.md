# Firestore Index Setup Instructions

## Problem
The application is showing 500 errors when accessing Salary and Attendance sections because Firestore composite indexes are missing.

## Solution - Automatic Index Creation

When you access the features in the browser, Firebase will automatically detect missing indexes and provide clickable links to create them.

### Step 1: Access the Application
1. Open your browser and go to http://localhost:5000
2. Login as Principle (admin user)

### Step 2: Trigger Index Creation
Navigate to each of these tabs to trigger index creation:

#### A. Salary Tab
1. Click on "Salary" tab in the principle dashboard
2. You'll see an error in the browser console (press F12 to open)
3. Look for error message containing: `The query requires an index. You can create it here:`
4. **Click the URL link** in the error message
5. Firebase Console will open with pre-filled index configuration
6. Click "Create Index" button
7. Wait 1-5 minutes for index to build

#### B. Attendance Tab (if you access attendance)
1. Navigate to attendance-related features
2. Repeat the same process as above
3. Click the link from error message to create the index

### Step 3: Required Indexes
The following indexes need to be created:

1. **salaries** collection:
   - Fields: `employeeId` (ASC), `month` (DESC)

2. **attendance** collection:
   - Fields: `employeeId` (ASC), `attendanceDate` (ASC)

3. **salaryAdvances** collection:
   - Fields: `employeeId` (ASC), `date` (DESC)

4. **salaryPayments** collection:
   - Fields: `salaryId` (ASC), `paymentDate` (DESC)

5. **employeeDocuments** collection:
   - Fields: `employeeId` (ASC), `createdAt` (ASC)

### Step 4: Manual Alternative
If you prefer to create indexes manually:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **aspms-pro**
3. Navigate to: **Firestore Database** → **Indexes** tab
4. Click "Create Index"
5. Add each index from the list above

## Alternative - Deploy via Firebase CLI

If you want to deploy all indexes at once using the CLI:

### Option 1: Using your Terminal (Outside Claude Code)
```bash
# Navigate to project directory
cd C:\Users\PC\Desktop\ASPMS-1\ASPMS

# Authenticate with Firebase
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Option 2: Using CI Token
```bash
# Generate a CI token (run this in your terminal)
firebase login:ci

# Then use the token to deploy
firebase deploy --only firestore:indexes --token YOUR_TOKEN_HERE
```

## Verification

After indexes are created:

1. Check index status in Firebase Console
2. Wait for all indexes to show "Enabled" status (green checkmark)
3. Refresh your application
4. Navigate to Salary tab - should load without errors
5. Check attendance features - should work correctly

## Current Status

✅ Index configuration file updated (`firestore.indexes.json`)
✅ Application code updated to use correct employee salary data
✅ Application running on port 5000
⏳ Indexes need to be created (automatic or manual)

## What Happens After Indexes are Created?

Once all indexes are built:
- ✅ Salary section will display employee monthly packages correctly
- ✅ Attendance marking and viewing will work
- ✅ Salary generation, advances, and payments will function
- ✅ All employee management features will be fully operational
