# ARKA Services Project Management

## Overview

ARKA Services Project Management is a web application for architecture and interior design professionals. It enables managing multiple project budgets, tracking costs, and visualizing financial data with a futuristic cyberpunk-inspired UI. Key capabilities include creating unlimited projects with divisions and items, priority-based fund allocation, real-time analytics, and comprehensive export options (Excel, PDF, JPEG). All monetary values are handled in PKR. The project's ambition is to provide a robust, secure, and intuitive platform for financial project oversight in the design industry.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React 18 with TypeScript and Vite. It features a dark-mode-first cyberpunk aesthetic with custom fonts (Orbitron, Rajdhani, Fira Code) and a specific color palette. UI components are built with Radix UI primitives and shadcn/ui, styled using Tailwind CSS and Class Variance Authority. Data visualization is handled by Recharts, providing interactive charts for cost distribution and priority breakdowns. Form management utilizes React Hook Form and Zod for validation. TanStack React Query manages server state and caching.

### Backend Architecture

The backend is an Express.js application written in TypeScript, following a modular RESTful API design. It currently uses an in-memory storage (MemStorage) with an interface defined for future PostgreSQL integration via Drizzle ORM. The API supports CRUD operations for projects, divisions, and items, with endpoints for fetching summaries and generating exports. A robust multi-role security system is implemented with bcrypt hashing, `requireAuth` middleware, and comprehensive role-based access control (RBAC) covering data isolation for Principle, Employee, Client, and Procurement roles.

### Data Model

The core data model includes `Project` (id, name), `Division` (projectId, name, order), and `Item` (divisionId, description, unit, quantity, rate, priority). Relationships are set up for cascade deletion.

### Export Functionality

The application offers three professional export templates:
- **Standard**: A cyberpunk-themed dashboard visualization (1920x1080).
- **BOQ (Bill of Quantities)**: A clean, professional layout with division-wise tables and totals.
- **Progress Report**: A comprehensive report including client info, timeline, overall progress, and division-wise progress bars.
All templates support JPEG, PDF, and Excel formats. Progress calculation is based on item status weights.

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
- `/health` endpoint returns 200 OK immediately
- Root `/` endpoint has intelligent health check detection:
  - GET requests with no cookies and no/health/check user-agent get instant "OK" response
  - Normal browser requests get full application (based on cookie presence)
  - Bypasses all middleware for deployment platform health checks
- No blocking operations on health check endpoints

**Session Store (Production):**
- Uses connect-pg-simple with PostgreSQL for Autoscale deployments
- Sessions persisted in database (works across multiple instances)
- Auto-creates `session` table on first deployment
- Falls back to MemoryStore in development

**Database Seeding:**
- Runs asynchronously AFTER server starts listening
- Non-blocking for health checks (prevents deployment timeouts)
- Failures are non-fatal (won't crash production)
- Existence checks prevent duplicate user errors
- Default users created: ZARA (principle), procurement (procurement)

**Process Management:**
- Server startup wrapped in async IIFE with awaited Promise that never resolves
- Promise stays pending indefinitely to keep process alive
- Prevents Node.js from exiting after startup completes
- Server stays alive to handle requests indefinitely
- Error handling for server errors without terminating process