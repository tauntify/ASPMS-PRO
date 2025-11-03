# ASPMS Troubleshooting Guide

## Current Issues & Solutions

### ✅ RESOLVED: 401 Unauthorized Errors
**Issue:** API calls were failing with 401 Unauthorized
**Solution:** Firebase Hosting has been redeployed with proper API rewrites
**Status:** FIXED - API calls should now be routed correctly

---

## How to Test & Verify

### 1. Clear Browser Cache & Reload
```
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use: Ctrl+Shift+Delete → Clear cached images and files
```

### 2. Check Authentication
```
1. Go to: https://aspms-pro-v1.web.app
2. Log in with your credentials
3. Open DevTools → Application → Local Storage
4. Verify "auth_token" exists
5. Token should be in format: xxx.yyy.zzz (3 parts separated by dots)
```

### 3. Test Project Creation
```
1. Login as Principle/Admin
2. Go to Principle Dashboard
3. Click "Create Project"
4. Fill in the form
5. Click Submit
6. Check browser console (F12) for any errors
```

### 4. Test Client Assignment
```
1. Login as Principle/Admin
2. Create a client first (if not exists)
3. Go to Projects
4. Select a project
5. Click "Assign Client"
6. Select client from dropdown
7. Click Assign
```

### 5. Test Task Assignment
```
1. Login as Principle/Admin
2. Go to Tasks section
3. Click "Assign Task"
4. Fill in:
   - Select Employee
   - Select Project
   - Task Type
   - Description (optional)
5. Click Assign
```

---

## Common Errors & Fixes

### Error: "Cannot read properties of undefined (reading 'trim')"
**Cause:** A field is undefined when it should have a value
**Fix:**
1. Check the browser console for the full stack trace
2. The error is likely in a form field validation
3. Make sure required fields have default values

**If error persists:**
- Clear browser cache
- Hard reload (Ctrl+Shift+R)
- Log out and log back in

### Error: "401 Unauthorized"
**Cause:** Authentication token missing or invalid
**Fix:**
1. Clear browser storage: DevTools → Application → Clear site data
2. Log out
3. Log in again
4. Check that auth_token is in localStorage

### Error: "Network Error" or "Failed to fetch"
**Cause:** API endpoint not reachable
**Fix:**
1. Verify you're on https://aspms-pro-v1.web.app (not localhost)
2. Check browser console for actual error
3. Verify internet connection
4. Try opening: https://aspms-pro-v1.web.app/api/health
   - Should return: `{"status":"ok",...}`

---

## Debugging Steps

### 1. Check API Health
Open this URL in browser:
```
https://aspms-pro-v1.web.app/api/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T...",
  "firebase": "connected",
  "firestore": "operational",
  "hosting": "Firebase Cloud Functions",
  "version": "2.0.0"
}
```

### 2. Check Authentication Token
```javascript
// Open browser console and run:
console.log(localStorage.getItem('auth_token'));

// Should output a JWT token like:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ...

// If it's null or undefined, you need to log in again
```

### 3. Check API Calls
```javascript
// Open browser console and watch network tab
// Look for requests to /api/*
// Check:
// - Request URL (should be https://aspms-pro-v1.web.app/api/...)
// - Request Headers (should include: Authorization: Bearer ...)
// - Response Status (should be 200, not 401)
```

### 4. Test a Simple API Call
```javascript
// Open browser console and run:
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Should log: {status: 'ok', ...}
```

---

## Known Issues & Workarounds

### Issue: Email field required for client creation
**Status:** By design
**Workaround:** Email is optional in the schema, but forms may require it
**Solution:** Update frontend forms to match optional fields

### Issue: Firebase Hosting API rewrites
**Status:** FIXED ✅
**Details:** Firebase Hosting now properly rewrites /api/** to Cloud Functions

### Issue: Multi-tab authentication
**Status:** Known behavior
**Workaround:** If you have multiple tabs open, log out from all tabs and log in again from one tab

---

## Architecture Lifecycle Features

### New Project Fields (Available Now)
When creating a project, you can now set:
- **Project Type:** design-only, renovation, new-build, construction, consultancy
- **Sub Type:** residential, office, retail, hospital, etc.
- **Area:** with units (sqm, sqft, kanal, yard)
- **Fee Model:** lumpSum, perUnit, percentage, hybrid
- **Scopes:** concept, schematic, detailed, BOQ, etc.
- **Site Type:** on-site, arka-office, virtual

### Available API Endpoints
All these endpoints are now live:
```
GET    /api/projects/:id/meetings       - Get meetings for project
POST   /api/projects/:id/meetings       - Create meeting
PATCH  /api/projects/:id/meetings/:id   - Update meeting
POST   /api/projects/:id/meetings/:id/lock - Lock meeting

GET    /api/projects/:id/milestones     - Get milestones
POST   /api/projects/:id/milestones     - Create milestone
PATCH  /api/projects/:id/milestones/:id - Update milestone

GET    /api/approvals                   - Get all approvals
GET    /api/projects/:id/approvals      - Get project approvals
POST   /api/projects/:id/approvals      - Create approval request
PATCH  /api/projects/:id/approvals/:id  - Update approval (client response)

GET    /api/notifications               - Get client notifications
GET    /api/projects/:id/financials     - Calculate project financials
GET    /api/projects/:id/summary        - Get project summary
```

---

## Quick Fixes

### "I can't create a project"
1. Make sure you're logged in as Principle or Admin
2. Check browser console for errors
3. Try clearing cache and reloading
4. Verify all required fields are filled

### "I can't assign a client"
1. Make sure you've created a client first
2. Check that client has userId field
3. Verify you're on the correct project
4. Check browser console for validation errors

### "I can't assign a task to an employee"
1. Verify the employee exists in the system
2. Check that project exists
3. Make sure task type is selected
4. Check browser console for errors

---

## Contact & Support

If issues persist after trying all troubleshooting steps:

1. **Check Browser Console (F12)**
   - Look for red error messages
   - Copy the full error stack trace

2. **Check Network Tab**
   - Filter by "api"
   - Look for failed requests (red)
   - Click on failed request → Preview/Response to see error

3. **Check Firebase Console**
   - https://console.firebase.google.com/project/aspms-pro-v1
   - Functions → Logs
   - Look for errors in function execution

---

## System Status

- ✅ **Backend API:** Deployed and operational
- ✅ **Firestore:** Configured with indexes and security rules
- ✅ **Authentication:** Working (JWT-based)
- ✅ **Hosting:** Deployed with API rewrites
- ✅ **Functions:** Compiled and deployed
- ✅ **Architecture Lifecycle:** All features available

**Last Updated:** November 4, 2025
**Version:** 2.0.0 (Architecture Lifecycle Release)
