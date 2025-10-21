# ARKA Services Project Management

## Overview

ARKA Services Project Management is a modern web application designed for architecture and interior design professionals to manage project budgets, track costs, and visualize financial data. The application features a futuristic cyberpunk-inspired UI with real-time analytics, allowing users to create divisions (categories), manage items with detailed cost breakdowns, and generate comprehensive project summaries with priority-based fund allocation tracking. All monetary values are displayed in PKR (Pakistani Rupees).

## User Preferences

Preferred communication style: Simple, everyday language.

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
- Division: id, name, order (for custom sorting)
- Item: id, divisionId, description, unit, quantity, rate, priority
- Computed fields: totalCost = quantity × rate
- ProjectSummary: aggregated costs by priority and division

**Export Functionality:**
- ExcelJS for generating Excel spreadsheets with formatted data
- jsPDF for PDF generation with custom styling
- html2canvas for JPEG image exports of dashboard visualizations
- All exports maintain priority colors and formatting

### State Management

**Client-Side State:**
- TanStack React Query for API data caching and synchronization
- Query invalidation on mutations for optimistic updates
- Local component state via React hooks for UI interactions
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