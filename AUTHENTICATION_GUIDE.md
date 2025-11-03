# ASPMS Authentication Guide

## 🔐 Admin Account Credentials

### ARKA Office Admin
- **Username:** `arkaoffice`
- **Password:** `Arka@123`
- **Role:** `principle`
- **Database Location:** `/arka_office/data/users/arka_admin_001`

This account has:
- Full access to ARKA Office data
- No subscription requirements
- Unlimited resources

## 🗄️ Database Structure

### Current Multi-Tenant Architecture

```
Firestore Database:
│
├── admins/                              (System administrators)
│   └── {adminId}
│
├── arka_office/                         (ARKA Services - Internal)
│   ├── metadata/
│   │   ├── requiresSubscription: false
│   │   └── hasUnlimitedAccess: true
│   └── data/
│       ├── users/                       ✅ ALL ARKA users go here
│       │   ├── arka_admin_001/          (arkaoffice - principle)
│       │   └── {employeeId}/            (employees created)
│       ├── projects/
│       ├── employees/
│       ├── clients/
│       ├── tasks/
│       ├── salaries/
│       ├── attendance/
│       └── ... (other collections)
│
├── individuals/                         (Individual subscribers)
│   └── {userId}/
│       └── data/
│           ├── projects/
│           └── ...
│
└── organizations/                       (Organization subscribers)
    └── {orgId}/
        └── data/
            ├── users/
            ├── projects/
            └── ...
```

## ✅ Recent Fixes Applied (Nov 3, 2025)

### 1. Fixed Employee Creation
**Problem:** Employees were being created in wrong `/users/` collection instead of `/arka_office/data/users/`

**Solution:** Updated `/api/employees/create` endpoint to use context-aware storage:
- Changed from `storage.createUser()` to `createUserForUser(req.user!, ...)`
- Changed from `storage.createEmployee()` to `createEmployeeForUser(req.user!, ...)`
- Now employees are correctly created in `/arka_office/data/users/`

### 2. Fixed Client/User Creation
**Problem:** `/api/users` POST was using old storage system

**Solution:** Updated to use `createUserForUser()` for context-aware creation

### 3. Fixed API Errors
- Fixed subscription hook crash (`startsWith` error)
- Implemented missing `/api/clients` routes (GET, POST, PATCH, DELETE)
- Fixed wrong `/api/user` endpoints → changed to `/api/auth/me`

### 4. Fixed Loading Issues
- Admin users now bypass subscription loading checks
- Dashboard loads immediately without infinite spinner

## 🚀 How to Login

1. Go to: https://aspms-pro-v1.web.app/login
2. Enter credentials:
   - Username: `arkaoffice`
   - Password: `Arka@123`
3. You should see the Principle Dashboard

## 🔧 Creating New Employees

When logged in as `arkaoffice`, creating a new employee will:
1. Create user account in `/arka_office/data/users/{newUserId}`
2. Create employee profile in `/arka_office/data/employees/{employeeId}`
3. Employee can login with their credentials
4. Employee data is isolated within ARKA Office tenant

## ⚠️ Common Issues

### "Invalid username or password"
- Make sure you're using `arkaoffice` (not `arkaservices` or `arka_admin_001`)
- Password is case-sensitive: `Arka@123`
- Password is hashed with bcrypt in database

### Employees in Wrong Location
- OLD BEHAVIOR: Created in `/users/` (WRONG)
- NEW BEHAVIOR: Created in `/arka_office/data/users/` (CORRECT)
- After the fix, all new employees will be in correct location

### Database Shows Multiple User Locations
If you see:
- `/arka_office/data/users/arka_admin_001` ✅ CORRECT
- `/arka_office/users/users/...` ❌ OLD/WRONG
- `/users/...` ❌ OLD/WRONG

The old locations are from before the fix. New data will be in correct locations.

## 📝 Deployed Changes

All fixes have been deployed to:
- **Firebase Functions:** https://api-iih2lr3npq-uc.a.run.app
- **Firebase Hosting:** https://aspms-pro-v1.web.app

No local testing - all work done directly on Firebase hosting as per your requirement.
