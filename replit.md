# ARKA Services Project Management

## Overview

ARKA Services Project Management is a web application for architecture and interior design professionals. It enables managing multiple project budgets, tracking costs, and visualizing financial data with a futuristic cyberpunk-inspired UI. Key capabilities include creating unlimited projects with divisions and items, priority-based fund allocation, real-time analytics, and comprehensive export options (Excel, PDF, JPEG). All monetary values are handled in PKR. The project's ambition is to provide a robust, secure, and intuitive platform for financial project oversight in the design industry.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React 18 with TypeScript and Vite. It features a dark-mode-first cyberpunk aesthetic with custom fonts (Orbitron, Rajdhani, Fira Code) and a specific color palette. UI components are built with Radix UI primitives and shadcn/ui, styled using Tailwind CSS and Class Variance Authority. Data visualization is handled by Recharts, providing interactive charts for cost distribution and priority breakdowns. Form management utilizes React Hook Form and Zod for validation. TanStack React Query manages server state and caching.

### Backend Architecture

The backend is an Express.js application written in TypeScript, following a modular RESTful API design. It uses PostgreSQL via Drizzle ORM with DatabaseStorage implementation. The API supports CRUD operations for projects, divisions, and items, with endpoints for fetching summaries and generating exports. A robust multi-role security system is implemented with bcrypt hashing, `requireAuth` middleware, and comprehensive role-based access control (RBAC) covering data isolation for Principle, Employee, Client, and Procurement roles. Username authentication is case-insensitive for better user experience.

### Data Model

The core data model includes `Project` (id, name), `Division` (projectId, name, order), and `Item` (divisionId, description, unit, quantity, rate, priority). Relationships are set up for cascade deletion.

### Export Functionality

The application offers three professional export templates:
- **Standard**: A cyberpunk-themed dashboard visualization (1920x1080).
- **BOQ (Bill of Quantities)**: A clean, professional layout with division-wise tables and totals.
- **Progress Report**: A comprehensive report including client info, timeline, overall progress, and division-wise progress bars.
All templates support JPEG, PDF, and Excel formats. Progress calculation is based on item status weights.

## Recent Updates (October 2025)

### Employee Management System
- **Atomic Employee Creation**: New `/api/employees/create` endpoint creates both user account and employee profile in a single transaction with rollback support. This prevents orphaned user accounts if employee creation fails.
- **Required Employee Fields**: Enhanced employee creation form with mandatory fields:
  - ID Card Number
  - WhatsApp Number
  - Home Address
  - Joining Date
  - Profile Picture (file upload with preview, optional)
- **Document Management**: Employees can view and download employment documents (Appointment Letter, Joining Letter, Resignation Letter) from their dashboard.
- **Enhanced Salary Slips**: Professional PDF generation with ARKA branding, arka.pk website reference, and proper formatting with earnings, deductions, and net salary sections.

### Security & Data Integrity
- Role-based access control ensures employees can only view their own documents
- Form validation enforces all required fields before submission
- Transaction-based employee creation prevents partial data states

## External Dependencies

**Database (Configured for future use):**
- Neon Serverless PostgreSQL driver
- Drizzle ORM

**UI Component Libraries:**
- Radix UI
- Recharts
- Embla Carousel
- Lucide React (icons)

**Form & Validation:**
- React Hook Form
- Zod
- @hookform/resolvers

**Utilities:**
- clsx, tailwind-merge
- date-fns
- nanoid

**Export Libraries:**
- ExcelJS
- jsPDF
- html2canvas

**Session Management:**
- connect-pg-simple with PostgreSQL (production)
- MemoryStore fallback (development only)

## Deployment Configuration

**Health Checks:**
- Root `/` endpoint responds with 200 OK immediately for requests without cookies
- Health check middleware placed before all other middleware (including session)
- Optimized for deployment platform health checks (no blocking operations)
- Normal browser requests with cookies proceed to full application

**Session Store (Production):**
- Uses connect-pg-simple with PostgreSQL for Autoscale deployments
- Sessions persisted in database (works across multiple instances)
- Auto-creates `session` table on first deployment
- Falls back to MemoryStore in development

**Database Seeding:**
- **REMOVED from server startup** to prevent blocking health checks
- Must be run manually as a one-time setup: `tsx server/seed.ts`
- **IMPORTANT**: Run in workspace BEFORE publishing (no shell access in deployed apps)
- Since dev and prod share the same database, seeding once persists to both environments
- Existence checks prevent duplicate user errors
- Default users created: 
  - ZARA (principle) - password: saroshahsanto
  - procurement (procurement) - password: procurement123
- Safe for production (idempotent - can be run multiple times)

**Process Management:**
- Server uses Promise chain pattern instead of async IIFE to prevent early exit
- Server.listen() keeps Node.js process alive naturally
- Error handling for server errors without terminating process
- Stable process lifecycle for production deployments

**Port Configuration (CRITICAL for Publishing):**
- Application requires EXACTLY ONE external port for Autoscale deployments
- Correct configuration: localPort 5000 → externalPort 80
- Multiple external ports cause 5xx errors during deployment
- If deployment fails with 5xx errors, verify .replit file has only one [[ports]] entry
- See CHANGELOG.md for detailed port configuration fix instructions

**Publishing Readiness:**
- ✅ Build process verified and working
- ✅ Health checks optimized
- ✅ Session store configured for production
- ✅ Database seeding is non-blocking
- ✅ Application tested and working
- ⚠️ Manual fix required: Edit .replit file to remove extra ports (see CHANGELOG.md)