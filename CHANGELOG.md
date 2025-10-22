# Changelog

All notable changes to the ARKA Services Project Management application.

---

## [1.1.0] - 2025-10-22

### Fixed

#### Critical Deployment Issues
- **Fixed server early exit bug**: Removed async IIFE wrapper that was causing the server to exit immediately after starting, preventing health checks from passing
- **Optimized health check endpoint**: Moved health check logic to the very first middleware, before session processing, ensuring immediate response to deployment platform health checks
- **Removed redundant /health endpoint**: Simplified to use only the root `/` endpoint for health checks
- **Fixed process lifecycle**: Changed to Promise chain pattern that keeps the server running naturally without manual promise blocking

#### Authentication & Security
- **Fixed case-sensitive login bug**: Implemented case-insensitive username lookup in database queries using SQL LOWER() function
  - Users can now login with "zara", "ZARA", or any case variation
  - Prevents login failures due to username case mismatch
- **Improved user experience**: Username authentication now accepts any case variation while maintaining security

#### Performance & Stability
- **Non-blocking database seeding**: Database seeding now runs asynchronously after server startup, preventing deployment timeouts
- **Updated dependencies**: Updated browserslist database to remove outdated warnings
- **Error handling**: Improved error handling to prevent server crashes on seeding failures

### Changed

#### Backend Architecture
- **Health check implementation**: Root endpoint now checks for absence of cookies to identify health check requests
- **Server initialization**: Simplified server startup process to prevent early exit and ensure stable deployments
- **Session middleware**: Health checks now bypass session middleware for faster response times

#### Database
- **Storage implementation**: Using PostgreSQL via Drizzle ORM with DatabaseStorage
- **Username queries**: All username lookups now use case-insensitive comparison

---

## [1.0.0] - Initial Release

### Added

#### Core Project Management
- **Project Management System**: Create, update, delete, and view unlimited projects
  - Project metadata including client name, project title, start date, and delivery date
  - Full CRUD operations for projects
  - Cascade deletion for related divisions and items
- **Division Management**: Organize projects into divisions with custom ordering
  - Create and manage divisions within projects
  - Reorder divisions with drag-and-drop or manual ordering
  - Each division contains multiple items
- **Item Management**: Track individual items with detailed specifications
  - Description, unit, quantity, rate fields
  - Priority levels: High, Mid, Low
  - Status tracking: Not Started, Purchased, In Installation Phase, Installed, Delivered
  - Automatic total cost calculation (quantity × rate)

#### Multi-Role Management System
- **Four User Roles with RBAC**:
  - **Principle**: Full administrative access to all features
    - Create/update/delete all resources
    - Manage users, employees, clients
    - Full financial visibility
    - Assign projects to team members
  - **Employee**: Limited access to assigned tasks and personal data
    - View assigned projects only
    - Manage personal tasks
    - View own salary and attendance records
    - Update task status
  - **Client**: Read-only access to assigned projects
    - View assigned projects, divisions, and items
    - View project progress and timelines
    - View procurement (with cost limitations)
    - View comments and financials
    - Cannot modify project data
  - **Procurement**: Specialized access for procurement management
    - Create/update/delete procurement items
    - View all projects
    - Manage purchase tracking

#### User & Employee Management
- **User Management** (Principle only):
  - Create user accounts with role assignment
  - Update user information and roles
  - Activate/deactivate user accounts
  - Secure password hashing with bcrypt
- **Employee Management**:
  - Employee profiles with ID card, WhatsApp, address
  - Joining date tracking
  - Profile picture support
  - Link employees to user accounts
  - Principle can view all employees, employees can view only their own data

#### Client Management
- **Client Profiles**:
  - Company information
  - Contact details (phone, email, address)
  - Link clients to user accounts
  - Project assignment tracking

#### Task Management
- **Task System**:
  - Task types: Design CAD, IFCs, 3D Rendering, Procurement, Site Visits
  - Task statuses: Done, Undone, In Progress
  - Assign tasks to employees
  - Link tasks to projects
  - Employees see only their assigned tasks
  - Clients can view tasks for their projects

#### Procurement Tracking
- **Procurement Items**:
  - Track items with project cost and execution cost
  - Purchase status tracking
  - Bill number and rental details
  - Quantity and unit specifications
  - Purchase date and purchaser tracking
  - Client role sees project cost only (execution cost hidden)
  - Principle and Procurement roles have full access

#### Salary & Attendance
- **Salary Management** (Principle only):
  - Monthly salary tracking per employee
  - Components: Basic salary, incentives, medical allowance
  - Deductions: Tax, other deductions
  - Net salary calculation
  - Payment status and payment date tracking
  - Employees can view their own salary history
- **Attendance Tracking**:
  - Daily attendance records
  - Monthly attendance filtering
  - Attendance date tracking
  - Employees can view their own attendance

#### Project Assignments
- **Assignment System**:
  - Assign projects to employees and clients
  - Track assignment history
  - Record who made the assignment
  - Filter projects by user assignments
  - Role-based project visibility

#### Comments & Project Financials
- **Comment System**:
  - Add comments to projects
  - Timestamp tracking
  - Author information
  - View comment history per project
- **Project Financials**:
  - Track project-level financial data
  - Budget and cost management
  - Client-specific financial visibility

#### Real-time Analytics
- **Project Summary Dashboard**:
  - Total project cost calculation
  - Priority-based cost breakdown (High, Mid, Low)
  - Division-wise cost analysis
  - Status-based item tracking
  - Overall progress percentage
  - Item and division counts
- **Data Visualization**:
  - Recharts integration for interactive charts
  - Pie charts for cost distribution
  - Bar charts for division breakdown
  - Priority-based visualizations
  - Status progress tracking

#### Progress Tracking
- **Weighted Progress System**:
  - Status-based progress calculation:
    - Not Started: 0%
    - Purchased: 25%
    - In Installation Phase: 50%
    - Installed: 75%
    - Delivered: 100%
  - Division-wise progress bars
  - Overall project progress percentage
  - Real-time progress updates

#### Export Functionality
- **Three Professional Export Templates**:
  1. **Standard Template**: 
     - Cyberpunk-themed dashboard (1920×1080)
     - Gradient backgrounds with neon accents
     - Summary statistics grid
     - Interactive charts
     - Custom fonts (Orbitron, Rajdhani, Fira Code)
  2. **BOQ (Bill of Quantities)**:
     - Clean, professional layout
     - Division-wise item tables
     - Detailed quantity and rate information
     - Total cost calculations
     - Print-ready format
  3. **Progress Report**:
     - Comprehensive project overview
     - Client information section
     - Project timeline (start date, delivery date)
     - Overall progress visualization
     - Division-wise progress bars
     - Status breakdown
     - Item completion statistics

- **Multiple Export Formats**:
  - **Excel (.xlsx)**: 
    - Separate sheets for Summary, Divisions, and Items
    - Formatted columns with proper headers
    - Currency formatting for PKR
    - Created with ExcelJS library
  - **PDF**:
    - Multi-page support
    - Professional layout
    - Summary and division breakdown
    - Generated with jsPDF
  - **JPEG**:
    - Client-side rendering with html2canvas
    - High-quality 1920×1080 images
    - Three template options

#### Authentication & Security
- **Secure Authentication**:
  - Session-based authentication with express-session
  - Bcrypt password hashing (10 salt rounds)
  - HTTP-only session cookies
  - 7-day session expiration
  - PostgreSQL session store in production (connect-pg-simple)
  - MemoryStore fallback for development
  - Automatic session persistence across server restarts
- **Role-Based Access Control (RBAC)**:
  - Route-level access control with requireAuth middleware
  - Role-based permissions with requireRole middleware
  - Data isolation: users only see their assigned projects/data
  - Secure password-free responses (passwords never sent to client)
  - Active/inactive user status checking

#### Cyberpunk-Inspired UI
- **Visual Design**:
  - Dark mode-first design
  - Neon color palette (cyan #00d9ff, purple #7b2ff7)
  - High-contrast interface
  - Custom fonts: Orbitron (headings), Rajdhani (body), Fira Code (monospace)
  - Gradient backgrounds and borders
  - Glow effects and shadows
- **UI Component System**:
  - Radix UI primitives for accessibility
  - shadcn/ui component library
  - Tailwind CSS for styling
  - Class Variance Authority for variants
  - Responsive layouts
  - Information-dense design

#### Frontend Architecture
- **Modern React Stack**:
  - React 18 with TypeScript
  - Vite for fast development and building
  - Wouter for client-side routing
  - TanStack React Query for server state management
  - React Hook Form with Zod validation
  - Framer Motion for animations
- **Form Management**:
  - shadcn Form components
  - React Hook Form integration
  - Zod schema validation
  - Custom validation rules
  - Error handling and display

#### Backend Architecture
- **Express.js Server**:
  - TypeScript-based REST API
  - Modular route organization
  - Request/response logging
  - Error handling middleware
  - JSON body parsing
- **Database Integration**:
  - PostgreSQL via Neon Serverless
  - Drizzle ORM for type-safe queries
  - Schema-first design
  - Migration support with drizzle-kit
  - Connection pooling
  - Environment-based configuration

#### Data Model
- **Comprehensive Schema**:
  - Projects with metadata and relationships
  - Divisions with ordering
  - Items with priority and status
  - Users with role-based access
  - Employees with profile information
  - Clients with company details
  - Tasks with type and status
  - Procurement items with cost tracking
  - Salaries with detailed breakdowns
  - Attendance records
  - Project assignments
  - Comments
  - Project financials
  - All tables use UUID primary keys
  - Cascade deletion for data integrity
  - Timestamp tracking (createdAt, updatedAt)

#### Deployment Configuration
- **Production-Ready Setup**:
  - Environment-based configuration
  - Session store with PostgreSQL
  - Health check endpoints
  - Non-blocking database seeding
  - Automatic table creation
  - Port configuration (default: 5000)
  - Host binding (0.0.0.0 for public access)
- **Default Users**:
  - Principle: ZARA / saroshahsanto
  - Procurement: procurement / procurement123

---

## Default Credentials

**Principle User:**
- Username: `ZARA` (case-insensitive: zara, Zara, etc.)
- Password: `saroshahsanto`

**Procurement User:**
- Username: `procurement` (case-insensitive)
- Password: `procurement123`

**Security Notice:** Change default passwords after first login in production environments.

---

## Technical Stack

### Frontend
- React 18.3.1
- TypeScript 5.6.3
- Vite 5.4.20
- TanStack React Query 5.60.5
- React Hook Form 7.55.0
- Zod 3.24.2
- Wouter 3.3.5
- Recharts 2.15.2
- Radix UI components
- Tailwind CSS 3.4.17
- Framer Motion 11.13.1

### Backend
- Node.js with Express 4.21.2
- TypeScript 5.6.3
- PostgreSQL (Neon Serverless)
- Drizzle ORM 0.39.1
- bcrypt 6.0.0
- express-session 1.18.1
- connect-pg-simple 10.0.0

### Export Libraries
- ExcelJS 4.4.0
- jsPDF 3.0.3
- html2canvas 1.4.1

---

## Currency

All monetary values are handled in **Pakistani Rupees (PKR)**.

---

## Known Issues

None at this time. Application is stable and ready for production deployment.

---

## Support

For detailed system architecture and configuration, refer to `replit.md`.

For questions or issues, contact the ARKA Services development team.

---

**Website:** [https://arka.pk](https://arka.pk)
