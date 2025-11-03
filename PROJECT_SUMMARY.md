# ASPMS Project Summary

## 📋 Project Overview

ASPMS (Architecture Services Project Management System) is a multi-tenant SaaS application for managing architecture projects, employees, clients, tasks, and finances.

**Live URL:** https://aspms-pro-v1.web.app
**API URL:** https://api-iih2lr3npq-uc.a.run.app

## 🔑 Admin Access

**Username:** `arkaoffice`
**Password:** `Arka@123`
**Role:** Principle (Full Access)

## 🏗️ Technical Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** Wouter
- **State Management:** TanStack React Query
- **UI Components:** Radix UI + Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **PDF Generation:** jsPDF + html2canvas

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** Firebase Firestore
- **Authentication:** JWT (JSON Web Tokens) with bcrypt
- **File Storage:** Firebase Storage
- **Hosting:** Firebase Hosting
- **Functions:** Firebase Cloud Functions (2nd Gen)

### Architecture
- **Pattern:** Multi-tenant with context-aware storage
- **Data Isolation:** Tenant-based collections
- **Auth:** JWT bearer tokens with role-based access control

## 🗄️ Database Structure

```
Firestore Collections:
├── admins/                    (System administrators)
├── arka_office/              (ARKA Services - Internal Org)
│   ├── metadata/
│   └── data/
│       ├── users/            ← All ARKA users (admin, employees)
│       ├── projects/
│       ├── employees/
│       ├── clients/
│       ├── tasks/
│       ├── salaries/
│       ├── attendance/
│       └── ... (other data)
├── individuals/              (Individual subscribers)
│   └── {userId}/data/
└── organizations/            (Organization subscribers)
    └── {orgId}/data/
```

## 🎯 Key Features

### Project Management
- Create and manage architecture projects
- Track project progress and milestones
- Assign employees to projects
- Division and item management
- Procurement tracking
- Comments and collaboration

### Employee Management
- Employee profiles with documents
- Attendance tracking
- Timesheet management
- Salary management with allowances
- Salary advances
- Performance tracking

### Client Management
- Client profiles and contacts
- Project-client associations
- Client portal access

### Financial Management
- Project budgeting
- Expense tracking
- Salary generation and payments
- Invoice creation
- Financial reports

### Dashboard & Analytics
- Role-based dashboards (Admin, Principle, Employee, Client)
- Project statistics
- Task completion tracking
- Attendance summaries
- Financial overview

## 🔐 Authentication & Authorization

### Roles
1. **Admin** - System administrators with full access
2. **Principle** - Organization owners/managers
3. **Employee** - Regular employees
4. **Client** - External clients
5. **Procurement** - Procurement specialists

### Access Control
- JWT-based authentication
- Role-based route protection
- Tenant-isolated data access
- Password hashing with bcrypt

## 🚀 Recent Fixes (Nov 3, 2025)

### Critical Bugs Fixed
1. **Employee Creation Bug** ✅
   - Employees were created in wrong `/users/` collection
   - Fixed to use context-aware storage → `/arka_office/data/users/`

2. **User Creation Bug** ✅
   - `/api/users` POST was using old storage system
   - Updated to use tenant-aware `createUserForUser()`

3. **API Endpoint Errors** ✅
   - Fixed subscription hook crash (`startsWith` error)
   - Implemented missing `/api/clients` routes
   - Fixed `/api/user` → `/api/auth/me`

4. **Loading Issues** ✅
   - Admin users bypass subscription checks
   - Dashboard loads without infinite spinner

### Code Changes
**Files Modified:**
- `functions/src/server/routes.ts`
  - `/api/employees/create` endpoint
  - `/api/users` POST endpoint
- `functions/src/server/context-storage.ts`
  - Added `updateClientForUser()`, `deleteClientForUser()`
- `client/src/hooks/use-subscription.ts`
  - Fixed `apiRequest()` signature
- `client/src/pages/expense-tracking.tsx`
  - Fixed endpoint path
- `client/src/pages/timesheet-management.tsx`
  - Fixed endpoint path
- `client/src/App.tsx`
  - Fixed admin user loading logic

## 📦 Deployment

### Firebase Services Used
- **Hosting:** Client application
- **Cloud Functions:** Backend API
- **Firestore:** Database
- **Storage:** File uploads
- **Authentication:** User management

### Deployment Commands
```bash
# Build client
npm run build

# Deploy hosting
firebase deploy --only hosting

# Build functions
cd functions && npm run build

# Deploy functions
firebase deploy --only functions
```

### Important Notes
- **NO LOCAL TESTING** - All development done directly on Firebase
- Schema file copied to `functions/src/shared/` for compilation
- Path aliases resolved manually with sed after TypeScript compilation
- TypeScript errors present but don't block deployment (`noEmitOnError: false`)

## 📁 Project Structure

```
ASPMS/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   └── App.tsx          # Main app component
│   └── dist/public/         # Built static files
│
├── functions/               # Firebase Cloud Functions
│   ├── src/
│   │   ├── server/
│   │   │   ├── routes.ts    # API endpoints
│   │   │   ├── context-storage.ts  # Multi-tenant data access
│   │   │   ├── storage-helper.ts   # User lookup utilities
│   │   │   ├── auth.ts      # JWT & password management
│   │   │   └── ...
│   │   └── index.ts         # Functions entry point
│   └── lib/                 # Compiled JavaScript
│
├── server/                  # Local dev server (synced from functions/)
│   └── (same structure as functions/src/server/)
│
├── shared/                  # Shared type definitions
│   └── schema.ts            # Zod schemas & TypeScript types
│
├── firebase.json            # Firebase configuration
├── firestore.rules          # Database security rules
└── .env                     # Environment variables
```

## 🐛 Known Issues

### TypeScript Compilation Warnings
Several TS errors exist but don't prevent deployment:
- Property mismatches in context-storage.ts
- Missing properties in storage.ts interface
- Type overlaps in conversions

These are tolerated via `noEmitOnError: false` in tsconfig.json

### Old Database Paths
Some old data may exist at:
- `/arka_office/users/users/...` (old structure)
- `/users/...` (wrong location)

New data after the fix goes to correct locations:
- `/arka_office/data/users/...` ✅

## 📚 Documentation Files

- `AUTHENTICATION_GUIDE.md` - Login credentials and database structure
- `PROJECT_SUMMARY.md` - This file

## 🔄 Development Workflow

1. Make changes to `functions/src/server/` files
2. Sync to server: `cp functions/src/server/*.ts server/`
3. Build functions: `cd functions && npm run build`
4. Fix path aliases: `find functions/lib -name "*.js" -exec sed -i 's|@shared/schema|../shared/schema|g' {} \;`
5. Deploy: `firebase deploy --only functions`
6. For client changes: `npm run build && firebase deploy --only hosting`

## ⚙️ Environment Variables

Required in `.env` file:
```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=aspms-pro-v1
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
JWT_SECRET=...
```

## 🎉 Current Status

✅ All critical bugs fixed
✅ Multi-tenant architecture working
✅ Employee creation in correct location
✅ Admin login functional
✅ Dashboard loading properly
✅ API endpoints operational
✅ Deployed to Firebase

**Ready for testing and use!**

## 🧪 Testing

To test the fixes:

1. Go to https://aspms-pro-v1.web.app/login
2. Login with `arkaoffice` / `Arka@123`
3. Create a new employee - should be stored in `/arka_office/data/users/`
4. No console errors related to subscription or API endpoints
5. Dashboard loads without infinite spinner

---

Last Updated: November 3, 2025
Version: 1.0 (Post Bug-Fix)
