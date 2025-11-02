# ASPMS - Architect Studio Project Management System

## Project Overview

**ASPMS** is a comprehensive web-based project management system designed specifically for architecture firms. It provides tools for managing projects, employees, clients, procurement, timesheets, expenses, and billing - all in one unified platform.

**Deployment**: 100% Firebase (Hosting + Cloud Functions)
**Tech Stack**: React + TypeScript + Express + Firestore

---

## Architecture

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.20
- **Routing**: Wouter 3.3.5
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: TanStack React Query 5.60.5
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js with Express 4.21.2
- **Database**: Google Cloud Firestore (NoSQL)
- **Authentication**: JWT + Firebase Authentication
- **Hosting**: Firebase Hosting + Cloud Functions

### Deployment Infrastructure
```
Firebase Project
├── Firebase Hosting (Frontend)
│   └── Serves built React app from /dist/public
├── Cloud Functions (Backend API)
│   └── Express server at /api/** routes
└── Firestore Database
    └── All application data
```

---

## Project Structure

```
ASPMS/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities and configuration
│   │   ├── pages/               # Page components
│   │   │   ├── login.tsx
│   │   │   ├── principle-dashboard.tsx
│   │   │   ├── employee-dashboard.tsx
│   │   │   ├── client-dashboard.tsx
│   │   │   ├── procurement-dashboard.tsx
│   │   │   ├── timesheet-management.tsx
│   │   │   ├── expense-tracking.tsx
│   │   │   └── billing-invoicing.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── server/                      # Backend Express application
│   ├── auth.ts                  # Authentication logic
│   ├── firebase.ts              # Firebase Admin SDK setup
│   ├── jwt.ts                   # JWT token handling
│   ├── routes.ts                # API routes
│   ├── routes-extensions.ts     # Extended API routes
│   ├── storage.ts               # File storage logic
│   ├── storage-extensions.ts    # Extended storage logic
│   ├── seed.ts                  # Database seeding
│   ├── seed-admin.ts            # Admin user seeding
│   ├── index.ts                 # Main server entry
│   └── vite.ts                  # Vite integration
├── functions/                   # Firebase Cloud Functions
│   ├── src/                     # Function source code
│   ├── lib/                     # Compiled JavaScript
│   └── package.json             # Function dependencies
├── shared/                      # Shared code between client/server
│   ├── schema.ts                # Data models and Zod schemas
│   └── schema-extensions.ts     # Extended schemas
├── dist/                        # Production build output
│   └── public/                  # Built frontend files
├── .firebase/                   # Firebase config and cache
├── firebase.json                # Firebase project configuration
├── firebase.rules               # Firestore security rules
├── firestore.indexes.json       # Firestore database indexes
├── .env                         # Environment variables (local)
├── .env.example                 # Environment variable template
├── .env.production              # Production environment variables
├── package.json                 # Root dependencies
├── vite.config.ts               # Vite build configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── PROJECT_SUMMARY.md           # This file
```

---

## Core Features

### 1. User Management & Authentication
- **Roles**: Principle, Employee, Client, Procurement
- **Auth**: JWT-based authentication with Firebase Auth integration
- **Users**: Create, manage, and assign roles to users
- **Employees**: Extended profiles with salary, designation, documents

### 2. Project Management
- **Projects**: Create and manage architecture projects
- **Divisions**: Organize projects into divisions
- **Items**: Track individual project items with BOQ (Bill of Quantities)
- **Assignments**: Assign employees and clients to projects
- **Status Tracking**: Monitor project progress and completion

### 3. Task Management
- **Task Types**: Design CAD, IFCs, 3D Rendering, Procurement, Site Visits
- **Task Status**: Done, In Progress, Undone
- **Assignment**: Assign tasks to employees
- **Due Dates**: Track task deadlines
- **Remarks**: Add notes and updates

### 4. Procurement Management
- **Items**: Track procurement items per project
- **Costs**: Project cost vs execution cost tracking
- **Purchase Tracking**: Bill numbers, purchased dates
- **Rental Details**: Track rental equipment
- **Notes**: Additional procurement information

### 5. Labor & Cost Tracking
- **Labor Types**: Daily Wage, Contract
- **Wage Rates**: Track worker wages
- **Contract Amounts**: Monitor contract costs
- **Date Ranges**: Start and end dates for labor

### 6. Timesheet Management
- **Attendance**: Daily attendance tracking
- **Employee Records**: Track presence/absence
- **Notes**: Add attendance remarks
- **Reports**: Generate attendance reports

### 7. Payroll Management
- **Salary Components**: Basic, TA, MA, Food Allowance
- **Deductions**: Advance, Absent, Other deductions
- **Salary Advances**: Track and deduct advances
- **Payment History**: Record salary payments
- **Hold Salary**: Option to hold employee salaries
- **Scheduled Payments**: Set salary payment dates

### 8. Document Management
- **Templates**: Appointment, Joining, Resignation letters
- **Generation**: Auto-generate documents from templates
- **Storage**: Firebase Storage integration
- **Tracking**: Document creation and update timestamps

### 9. Financial Management
- **Project Financials**: Contract value, amount received
- **Work Completed**: Track project completion percentage
- **Archive**: Archive completed projects
- **Reports**: Generate financial reports

### 10. Comments & Collaboration
- **Project Comments**: Add comments to projects
- **User Tracking**: Track who commented
- **Timestamps**: Comment creation dates

---

## Data Models

### Core Collections

#### Users
- `id`, `firebaseUid`, `username`, `password`, `role`, `fullName`, `isActive`, `createdAt`

#### Employees (extends Users)
- `id`, `userId`, `idCard`, `whatsapp`, `homeAddress`, `joiningDate`, `profilePicture`
- `designation`, `basicSalary`, `travelingAllowance`, `medicalAllowance`, `foodAllowance`
- `salaryDate`, `isSalaryHeld`, `createdAt`

#### Clients (extends Users)
- `id`, `userId`, `company`, `contactNumber`, `email`, `address`, `createdAt`

#### Projects
- `id`, `name`, `clientName`, `projectTitle`, `startDate`, `deliveryDate`, `createdAt`

#### Divisions
- `id`, `projectId`, `name`, `order`, `createdAt`

#### Items
- `id`, `divisionId`, `description`, `unit`, `quantity`, `rate`, `priority`, `status`, `createdAt`

#### Tasks
- `id`, `projectId`, `employeeId`, `taskType`, `description`, `status`, `remarks`
- `dueDate`, `assignedBy`, `createdAt`, `updatedAt`

#### Procurement Items
- `id`, `projectId`, `itemName`, `projectCost`, `executionCost`, `isPurchased`
- `billNumber`, `rentalDetails`, `quantity`, `unit`, `notes`, `purchasedBy`, `purchasedDate`, `createdAt`

#### Labor Costs
- `id`, `projectId`, `laborType`, `wageRate`, `numberOfWorkers`, `contractAmount`
- `description`, `startDate`, `endDate`, `createdAt`

#### Attendance
- `id`, `employeeId`, `attendanceDate`, `isPresent`, `notes`, `createdAt`

#### Salaries
- `id`, `employeeId`, `month`, `basicSalary`, `travelingAllowance`, `medicalAllowance`, `foodAllowance`
- `totalEarnings`, `advancePaid`, `absentDeductions`, `otherDeductions`, `totalDeductions`
- `netSalary`, `paidAmount`, `remainingAmount`, `isPaid`, `isHeld`, `paidDate`, `salaryDate`
- `attendanceDays`, `totalWorkingDays`, `createdAt`, `updatedAt`

#### Salary Advances
- `id`, `employeeId`, `salaryId`, `amount`, `date`, `reason`, `paidBy`, `createdAt`

#### Salary Payments
- `id`, `salaryId`, `amount`, `paymentDate`, `paymentMethod`, `notes`, `paidBy`, `createdAt`

#### Project Financials
- `id`, `projectId`, `contractValue`, `amountReceived`, `workCompleted`
- `isArchived`, `archivedDate`, `createdAt`, `updatedAt`

#### Comments
- `id`, `projectId`, `userId`, `comment`, `createdAt`

---

## User Roles & Permissions

### Principle (Admin)
- Full access to all features
- Manage all projects, employees, clients
- View all dashboards and reports
- Approve expenses and manage billing
- Assign roles and permissions

### Employee
- View assigned projects
- Update task status
- Submit timesheets
- View own salary information
- Add project comments

### Client
- View assigned projects
- Track project progress
- View project financials
- Add comments to projects

### Procurement
- Manage procurement items
- Track purchase orders
- Update item status
- Manage labor costs
- View project expenses

---

## API Routes

All API routes are served at `/api/**` and handled by Firebase Cloud Functions.

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Divisions
- `GET /api/divisions` - List divisions
- `POST /api/divisions` - Create division
- `PATCH /api/divisions/:id` - Update division
- `DELETE /api/divisions/:id` - Delete division

### Items
- `GET /api/items` - List items
- `POST /api/items` - Create item
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `PATCH /api/employees/:id` - Update employee

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Procurement
- `GET /api/procurement` - List procurement items
- `POST /api/procurement` - Create procurement item
- `PATCH /api/procurement/:id` - Update procurement item
- `DELETE /api/procurement/:id` - Delete procurement item

### Labor
- `GET /api/labor` - List labor costs
- `POST /api/labor` - Create labor cost
- `PATCH /api/labor/:id` - Update labor cost
- `DELETE /api/labor/:id` - Delete labor cost

### Attendance
- `GET /api/attendance` - List attendance
- `POST /api/attendance` - Create attendance
- `PATCH /api/attendance/:id` - Update attendance

### Salaries
- `GET /api/salaries` - List salaries
- `POST /api/salaries` - Create salary
- `PATCH /api/salaries/:id` - Update salary
- `GET /api/salaries/advances` - List salary advances
- `POST /api/salaries/advances` - Create salary advance
- `POST /api/salaries/payments` - Record salary payment

### Financials
- `GET /api/financials` - List project financials
- `POST /api/financials` - Create financial record
- `PATCH /api/financials/:id` - Update financials

### Comments
- `GET /api/comments` - List comments
- `POST /api/comments` - Create comment

---

## Environment Configuration

### Development (.env)
```env
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-secret-key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Frontend (Vite)
VITE_API_URL=
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Production (.env.production)
- Use Firebase Environment Variables
- Set secrets via: `firebase functions:secrets:set SECRET_NAME`

---

## Development Workflow

### Setup
```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

### Build
```bash
# Build frontend and backend
npm run build
```

### Deploy
```bash
# Deploy to Firebase
firebase deploy

# Deploy hosting only
firebase deploy --only hosting

# Deploy functions only
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

---

## Key Dependencies

### Frontend
- **React 18.3.1** - UI framework
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Express 4.21.2** - Web framework
- **Firebase Admin 12.0.0** - Firebase server SDK
- **Firestore** - NoSQL database
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **ExcelJS** - Excel file generation
- **jsPDF** - PDF generation

### Build Tools
- **Vite 5.4.20** - Frontend build tool
- **TypeScript 5.6.3** - Type safety
- **esbuild 0.25.0** - Backend bundling
- **tsx 4.20.5** - TypeScript execution

---

## Database Schema

### Firestore Collections
```
/users
/employees
/clients
/projects
/divisions
/items
/projectAssignments
/tasks
/procurementItems
/laborCosts
/attendance
/employeeDocuments
/salaries
/salaryAdvances
/salaryPayments
/projectFinancials
/comments
```

### Security Rules
- Authenticated users only
- Role-based access control
- Field-level validation
- Timestamp enforcement

---

## Development Notes

### Authentication Flow
1. User submits credentials via login page
2. Server validates against Firestore users collection
3. JWT token generated and returned to client
4. Token stored in httpOnly cookie
5. Subsequent requests include token for authentication
6. Server validates token and extracts user info

### API Integration
- Frontend uses TanStack Query for API calls
- Base URL configured via VITE_API_URL
- All requests include credentials for cookie-based auth
- Error handling and retry logic built-in

### State Management
- Server state: TanStack Query
- Form state: React Hook Form
- UI state: React useState/useContext
- No global state library needed

---

## Roadmap & TODOs

### Current Status
- All core features implemented
- Firebase deployment working
- JWT authentication active
- All dashboards functional

### Future Enhancements
- [ ] Email notifications
- [ ] SMS alerts for salary payments
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Document version control
- [ ] Project templates
- [ ] Automated backups
- [ ] Integration with accounting software
- [ ] Multi-currency support
- [ ] Multi-language support

---

## Support & Maintenance

### Monitoring
- Firebase Console for function logs
- Firestore usage metrics
- Authentication logs
- Error tracking in Cloud Functions

### Backup Strategy
- Firestore automatic backups
- Export collections regularly
- Store credentials securely
- Document restore procedures

### Updates
- Keep dependencies up to date
- Monitor security advisories
- Test updates in development first
- Deploy during low-traffic periods

---

## Contact & Credits

**Project**: ASPMS - Architect Studio Project Management System
**Version**: 1.0.0
**License**: MIT
**Deployment**: Firebase (Hosting + Cloud Functions)
**Database**: Google Cloud Firestore

---

Last Updated: November 2, 2025
