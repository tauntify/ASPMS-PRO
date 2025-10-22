# Changelog

All notable changes to the ARKA Services Project Management application.

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
- **Storage implementation**: Confirmed using PostgreSQL via Drizzle ORM with DatabaseStorage (not in-memory storage)
- **Username queries**: All username lookups now use case-insensitive comparison

### Technical Details

#### Deployment Configuration
- Health check responds with 200 OK immediately for requests without cookies
- Health check middleware executes before all other middleware
- Server uses Promise chain pattern for stable process lifecycle
- Production start command: `npm run start` executes `node dist/index.js`

#### Database Schema
- All tables and relationships remain unchanged
- Username lookup optimized with case-insensitive SQL comparison
- Session store uses PostgreSQL in production, MemoryStore in development

### Migration Notes

**For Production Deployment:**
1. Ensure `SESSION_SECRET` environment variable is set
2. Ensure `DATABASE_URL` environment variable is set
3. Use `npm run start` to launch the production server
4. Health checks will pass immediately at root endpoint
5. Database seeding happens automatically on first startup

**No Breaking Changes**
- All existing data remains intact
- Existing user credentials work with any case variation
- API endpoints remain unchanged

---

## Default Credentials

**Principle User:**
- Username: `ZARA` (case-insensitive: zara, Zara, etc.)
- Password: `saroshahsanto`

**Procurement User:**
- Username: `procurement`
- Password: `procurement123`

**Security Notice:** Change default passwords after first login.

---

## Known Issues

None at this time. Application is stable and ready for production deployment.

---

## Support

For issues or questions, refer to `replit.md` for system architecture and configuration details.
