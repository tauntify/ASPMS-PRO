# ARKA Services Project Management

## Overview

ARKA Services Project Management is a modern web application designed for architecture and interior design professionals to manage multiple project budgets, track costs, and visualize financial data. The application features a futuristic cyberpunk-inspired UI with real-time analytics, allowing users to create unlimited projects, each containing divisions (categories) and items with detailed cost breakdowns. The system generates comprehensive project summaries with priority-based fund allocation tracking. All monetary values are displayed in PKR (Pakistani Rupees).

**Key Features:**
- **Multi-Project Management**: Create unlimited projects with complete data isolation
- **Division & Item Tracking**: Organize costs by divisions with detailed item breakdowns
- **Priority-Based Tracking**: High/Mid/Low priority classification for budget allocation
- **Real-time Analytics**: Interactive charts showing cost distribution and priority breakdowns
- **Export Capabilities**: Generate Excel, PDF, and JPEG exports for project reports
- **PKR Currency Precision**: Database-backed NUMERIC type ensures accurate calculations without floating-point errors

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 21, 2025 - Multi-Project System & Enhanced Export Implementation**
- Added complete project management system with unlimited projects support
- Each project maintains independent divisions and items with proper data isolation
- Implemented ProjectSelector component for creating, renaming, and deleting projects
- Database schema updated with projects table and proper cascade delete relationships
- Query system refactored to use query string parameters for proper project scoping
- All API endpoints (divisions, items, summary) now accept projectId query parameter
- Cache invalidation uses predicate functions to handle query variations
- End-to-end tested: project creation, data isolation, navigation, and CRUD operations

**Export System Enhancements:**
- Created professional ExportDashboard component (1920x1080) with cyberpunk design
- JPEG export now captures complete styled dashboard with all charts and data
- PDF export embeds the styled dashboard image for professional reports
- Export dashboard includes: project header, stats grid, priority pie chart, division bar chart, detailed table
- All exports use project name in filename: `{project-name}-{date}.{extension}`
- Consistent branding and styling across all export formats

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack React Query for server state management and caching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library with custom cyberpunk/sci-fi theming
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**Design System:**
- Dark-mode-first interface with cyberpunk aesthetic
- Custom color palette: deep blue-black backgrounds with neon cyan, purple, and orange accents
- Custom fonts: Orbitron (headings), Rajdhani (body text), Fira Code (numeric data)
- Priority-based color coding (High: neon red, Mid: amber, Low: green)
- Landscape-optimized layout for desktop use

**Data Visualization:**
- Recharts library for interactive charts and graphs
- Real-time updating pie charts for priority breakdown
- Bar charts for division-wise cost analysis
- Dynamic infographics that update as data changes

**Form Management:**
- React Hook Form for performant form handling
- Zod for schema validation with Drizzle integration
- Custom resolvers via @hookform/resolvers

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for the REST API
- Modular route registration pattern
- Request/response logging middleware
- JSON body parsing with raw body preservation for webhooks

**Data Storage Strategy:**
- In-memory storage implementation (MemStorage class) as primary data layer
- Storage interface (IStorage) defined for future database integration
- Drizzle ORM configured for PostgreSQL migration path
- Schema definitions shared between frontend and backend via TypeScript

**API Design:**
- RESTful endpoints for divisions and items CRUD operations
- GET /api/divisions - Fetch all divisions
- POST /api/divisions - Create new division
- PATCH /api/divisions/:id - Update division
- DELETE /api/divisions/:id - Delete division
- Similar pattern for /api/items endpoints
- GET /api/summary - Computed project summary with priority breakdown
- POST /api/export/[excel|pdf] - Generate export files

**Data Model:**
- Project: id (UUID), name, createdAt
- Division: id (UUID), projectId (FK), name, order (for custom sorting)
- Item: id (UUID), divisionId (FK), description, unit, quantity (NUMERIC), rate (NUMERIC), priority
- Computed fields: totalCost = quantity × rate
- ProjectSummary: aggregated costs by priority and division per project
- Database relationships: Projects → Divisions (cascade delete) → Items (cascade delete)

**Export Functionality:**
- **Excel Export**: ExcelJS generates spreadsheets with multiple sheets (Summary, Divisions, Items)
- **PDF Export**: html2canvas captures styled dashboard → jsPDF embeds image in landscape PDF
- **JPEG Export**: html2canvas captures 1920x1080 styled dashboard with complete project visualization
- **ExportDashboard Component**: Hidden off-screen render (left: -9999px) with:
  - Cyberpunk-themed header with project name and logo
  - Summary statistics grid (total cost, items, divisions)
  - Interactive charts (priority pie chart, division bar chart)
  - Complete items table with priority color coding
  - Professional footer with branding
- All exports maintain consistent priority colors and cyberpunk styling
- Filenames follow pattern: `{project-name}-{date}.{extension}`

### State Management

**Client-Side State:**
- TanStack React Query for API data caching and synchronization
- Query keys use query string format: `/api/divisions?projectId=${id}`
- Cache invalidation uses predicate functions to handle query parameter variations
- Query invalidation on mutations ensures UI stays synchronized across project switches
- Local component state via React hooks for UI interactions and project selection
- No global state management library required due to simple data flow

**Server-Side State:**
- In-memory Map structures for divisions and items
- Automatic ID generation using crypto.randomUUID()
- Order tracking for divisions to maintain user-defined sequence
- Real-time summary calculations on demand

### Development & Build

**Development Environment:**
- Vite HMR for instant feedback during development
- TypeScript strict mode enabled for type safety
- ESM module system throughout the stack
- Path aliases configured (@/, @shared/, @assets/)

**Build Process:**
- Vite builds the React frontend to dist/public
- esbuild bundles the Express server to dist/index.js
- Shared schema folder for type definitions used by both client and server
- Production-ready with environment-based configuration

**Code Quality:**
- TypeScript compilation checks via `npm run check`
- Consistent file structure with clear separation of concerns
- Component-based architecture with reusable UI elements

## External Dependencies

**Database (Configured but not yet connected):**
- Neon Serverless PostgreSQL driver (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries
- Connection string expected via DATABASE_URL environment variable
- Migration files configured to output to ./migrations directory

**UI Component Libraries:**
- Radix UI component primitives (accordion, dialog, dropdown, select, tabs, toast, tooltip, etc.)
- Recharts for data visualization
- Embla Carousel for potential carousel implementations
- Lucide React for consistent iconography

**Form & Validation:**
- React Hook Form for form state management
- Zod for runtime type validation
- @hookform/resolvers for validation integration

**Utilities:**
- clsx and tailwind-merge for className composition
- date-fns for date manipulation
- nanoid for unique ID generation (used in logging)

**Development Tools:**
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer for code mapping (development only)
- @replit/vite-plugin-dev-banner for development banner (development only)

**Export Libraries:**
- ExcelJS for Excel file generation
- jsPDF for PDF document creation
- html2canvas for screenshot/image exports

**Session Management (Configured):**
- connect-pg-simple for PostgreSQL session storage (when database is connected)
- Express session middleware ready for implementation