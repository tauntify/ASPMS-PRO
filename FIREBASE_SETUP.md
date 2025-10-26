# Firebase Setup Guide for ASPMS

This guide will walk you through setting up Firebase for the ASPMS (ARKA Services Project Management System) application.

## Prerequisites

- A Google account
- Node.js and npm installed
- The ASPMS project cloned/downloaded

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "ASPMS" or "ARKA-Services")
4. Accept the Firebase terms and click **Continue**
5. (Optional) Enable Google Analytics if desired
6. Click **Create project** and wait for it to be created

## Step 2: Enable Firestore Database

1. In the Firebase Console, click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Select **Start in production mode** (we'll configure security rules later)
4. Choose a Firestore location (select the one closest to your users)
5. Click **Enable**

## Step 3: Enable Firebase Authentication

1. In the Firebase Console, click **Authentication** in the left sidebar
2. Click **Get started**
3. Click on the **Sign-in method** tab
4. Enable **Email/Password** authentication:
   - Click on **Email/Password**
   - Toggle the first switch to **Enable**
   - Click **Save**

## Step 4: Get Firebase Client Configuration

1. In the Firebase Console, click the **gear icon** (⚙️) next to Project Overview
2. Click **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "ASPMS Web")
6. Click **Register app**
7. Copy the `firebaseConfig` object values - you'll need these for your `.env` file

Example configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Get Firebase Admin SDK Configuration

1. In the Firebase Console, go to **Project settings** (gear icon)
2. Click on the **Service accounts** tab
3. Click **Generate new private key**
4. Click **Generate key** - a JSON file will be downloaded
5. Open the downloaded JSON file and copy its entire contents
6. You'll need to convert this JSON to a single-line string for the environment variable

**Converting JSON to single line:**
- Remove all line breaks and extra spaces
- The entire JSON should be on one line
- Example: `{"type":"service_account","project_id":"your-project",...}`

## Step 6: Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Fill in the Firebase configuration:

```env
# Firebase Admin SDK (from Step 5 - entire JSON as single line)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Firebase Client Configuration (from Step 4)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Step 7: Configure Firestore Security Rules

1. In the Firebase Console, go to **Firestore Database**
2. Click on the **Rules** tab
3. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user role from users collection
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Users collection - users can read their own data, principle can read all
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || getUserRole() == 'principle');
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Projects - all authenticated users can read, only principle can write
    match /projects/{projectId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Divisions - all authenticated users can read, only principle can write
    match /divisions/{divisionId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Items - all authenticated users can read, only principle can write
    match /items/{itemId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Employees - restricted access
    match /employees/{employeeId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Clients - restricted access
    match /clients/{clientId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Tasks - employees can read their own, principle can read/write all
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (getUserRole() == 'principle' || getUserRole() == 'employee');
    }
    
    // Procurement items - procurement and principle can access
    match /procurementItems/{itemId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (getUserRole() == 'principle' || getUserRole() == 'procurement');
    }
    
    // Salaries - employee can read their own, principle can read/write all
    match /salaries/{salaryId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Attendance - employees can write their own, read their own, principle can read/write all
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Employee documents
    match /employeeDocuments/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Project assignments
    match /projectAssignments/{assignmentId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
    
    // Comments
    match /comments/{commentId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Project financials - restricted to principle
    match /projectFinancials/{financialId} {
      allow read: if isAuthenticated() && getUserRole() == 'principle';
      allow write: if isAuthenticated() && getUserRole() == 'principle';
    }
  }
}
```

4. Click **Publish** to save the rules

## Step 8: Create Initial User Account

Since the app requires Firebase Authentication, you'll need to create users programmatically or through the Firebase Console:

### Option A: Through Firebase Console
1. Go to **Authentication** > **Users** tab
2. Click **Add user**
3. Enter email and password
4. After creating the user, note the **User UID**
5. Go to **Firestore Database**
6. Create a new document in the `users` collection:
   - Document ID: use the User UID from step 4
   - Fields:
     - `firebaseUid`: (string) the User UID
     - `username`: (string) e.g., "admin"
     - `fullName`: (string) e.g., "Administrator"
     - `role`: (string) "principle"
     - `isActive`: (boolean) true
     - `createdAt`: (timestamp) current date/time

### Option B: Programmatically (recommended)
You'll need to update the authentication flow in the app to create Firebase users and corresponding Firestore documents when users register.

## Step 9: Install Dependencies and Run

1. Install the project dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. The application should now be running at `http://localhost:5000`

## Step 10: Test the Setup

1. Open the application in your browser
2. Try logging in with the user credentials you created
3. Verify that data is being stored in Firestore (check the Firebase Console)

## Troubleshooting

### Error: "FIREBASE_SERVICE_ACCOUNT environment variable is not set"
- Make sure your `.env` file exists and contains the Firebase configuration
- Ensure the JSON is properly formatted as a single line
- Restart the development server after updating `.env`

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check that your `VITE_FIREBASE_API_KEY` is correct
- Make sure you copied it from the correct project in Firebase Console

### Error: "Missing or insufficient permissions"
- Check your Firestore security rules
- Ensure the user is properly authenticated
- Verify the user document in Firestore has the correct role

### Authentication not working
- Ensure Email/Password authentication is enabled in Firebase Console
- Check that the user exists in Firebase Authentication
- Verify the user has a corresponding document in the `users` collection

## Important Security Notes

1. **Never commit your `.env` file** - it contains sensitive credentials
2. The `.gitignore` file should include `.env`
3. For production, store environment variables securely (not in code)
4. Review and tighten Firestore security rules based on your specific needs
5. Enable Firebase App Check for additional security in production

## Next Steps

- Set up Firebase Storage if you need to store files (employee profile pictures, documents, etc.)
- Configure Firebase Hosting for production deployment
- Set up Firebase Cloud Functions for server-side operations if needed
- Enable Firebase Analytics for usage tracking
- Set up backup strategies for your Firestore data

## Support

For Firebase-specific issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
