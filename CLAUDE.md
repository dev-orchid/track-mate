# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrackMate is a full-stack user tracking and analytics platform with a monorepo structure containing:
- **Server**: Express.js REST API with MongoDB (port 8000)
- **Client**: Next.js 15 admin dashboard with TypeScript and Tailwind CSS (port 3000)

## Development Commands

### Initial Setup
```bash
npm install                    # Install both client and server dependencies
npm run install-server         # Install server dependencies only
npm run install-client         # Install client dependencies only
```

### Running the Application
```bash
npm run watch                  # Run both server and client concurrently
npm run server                 # Run server only (nodemon watch mode)
npm run client                 # Run client only (Next.js dev mode)
```

### Server-Specific Commands
```bash
cd server
npm start                      # Run server with Node (production)
npm run watch                  # Run server with nodemon (development)
```

### Client-Specific Commands
```bash
cd client
npm run dev                    # Start Next.js development server
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run Next.js linting
```

### Testing
```bash
npm test                       # Run tests for both client and server
```

### Production Build & Deployment
```bash
npm run build                  # Build client for production
npm run build:client           # Build client only
npm run build:server           # Install server dependencies (no build step)
npm run vercel-build           # Vercel-specific build command
```

## Deployment

### Vercel Deployment (Recommended)

TrackMate is configured for easy deployment to Vercel with the following setup:

**Quick Start:**
- See [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) for 10-minute deployment guide
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment documentation

**Deployment Structure:**
- Root `vercel.json` configures Next.js client deployment
- `server/vercel.json` configures Express API as serverless functions
- `server/api/index.js` is the serverless-compatible Express handler

**Required Environment Variables:**

*Client (Vercel Project Settings):*
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://your-api.vercel.app`)

*Server (Vercel Project Settings):*
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT token secret
- `REFRESH_TOKEN_SECRET` - Refresh token secret
- `NODE_ENV` - Set to `production`

**Deployment Options:**
1. **Client Only**: Deploy Next.js to Vercel, host server elsewhere (Railway, Render, etc.)
2. **Full Stack**: Deploy both client and server as separate Vercel projects

## Architecture

### Authentication & Authorization
- JWT-based authentication with access tokens (59-minute expiration) and refresh tokens (1-hour expiration)
- Access tokens stored in localStorage and cookies, refresh tokens in localStorage and MongoDB
- `verifyToken` middleware (server/src/utils/verifyToken.js) validates Bearer tokens on protected routes
- Client uses axios instance (client/src/utils/axiosInstance.ts) to attach Bearer tokens from localStorage
- `AuthContext` provides authentication state management on the client
- `ProtectedRoute` component wraps all non-public pages (public pages: /login, /register)
- Activity tracking via mousemove/keydown events with 5-minute idle timeout before requiring re-authentication

### Data Models & Relationships
The application uses three primary MongoDB models:

1. **Account** (server/src/models/authModel.js)
   - User accounts with company association
   - Fields: firstName, lastName, email, company_name, company_id, password, refreshToken
   - Each account gets a unique company_id generated via nanoid (format: `TM-XXXXX`, 5-character alphanumeric)

2. **Profile** (server/src/models/profileModel.js)
   - End-user profiles being tracked
   - Fields: name, email, phone, lastActive
   - Virtual relationship to Events via userId

3. **Event** (server/src/models/eventsModel.js)
   - Tracking events for profiles
   - Fields: userId (ref to Profile), sessionId, events array
   - Events array contains: eventType, eventData (address, productInfos), timestamp
   - Initially created with null userId, linked to profile when profile is created

**Key Relationship Pattern**: Events are created with sessionId and null userId. When a Profile is created, all Events with matching sessionId get their userId updated to link them to that profile. This allows anonymous tracking before profile creation.

### API Routes

**Authentication Routes** (server/src/routes/authRouter.js):
- `POST /register` - User registration with company creation
- `POST /login` - Login and token generation
- `GET /auth/me` - Get current authenticated user
- `PUT /auth/me` - Update current user details
- `POST /refreshtoken` - Refresh access token

**Tracking Routes** (server/src/routes/trackingRoutes.js) - all require `verifyToken` except where noted:
- `GET /api/getData` - Get all tracking data
- `POST /api/profile` - Create new profile (unprotected - for tracking snippet)
- `GET /api/profile` - Get all profiles with their events
- `GET /api/profile/:id` - Get specific profile by ID with events
- `GET /api/profile-events` - Get profiles with events
- `POST /api/events` - Create new event (unprotected - for tracking snippet)
- `GET /api/notifications/new-profiles` - Get new profiles for notifications

**Webhook Routes** (server/src/routes/trackingRoutes.js) - require API key authentication:
- `POST /api/webhooks/events` - Send webhook event (requires X-TrackMate-API-Key header)
- `GET /api/webhooks/info` - Get webhook configuration

**Webhook Logs Routes** (server/src/routes/trackingRoutes.js) - require `verifyToken`:
- `GET /api/webhooks/logs` - Get paginated webhook logs with filters
- `GET /api/webhooks/logs/stats` - Get webhook statistics (success rate, avg time)
- `GET /api/webhooks/logs/:id` - Get single webhook log by ID

**API Key Management** (server/src/routes/authRouter.js):
- `POST /auth/regenerate-api-key` - Regenerate API key for webhooks

**For complete API documentation, see API_GUIDE.md**

### Client Architecture
- **Next.js Pages Router** structure (not App Router)
- Pages in `client/src/pages/`:
  - `/` - Dashboard (index.tsx)
  - `/login` - Login page
  - `/register` - Registration page
  - `/profile` - All profiles list
  - `/profiles/[id]` - Individual profile details
  - `/webhook-logs` - Webhook logs dashboard (NEW)
  - `/account-details` - Current user account
  - `/settings/account/personal` - Account settings with API key management (NEW)
- Custom hooks pattern (in `client/src/hooks/`):
  - `useProfile` - Fetch profiles data
  - `useEvents` - Fetch events data
  - `useProfileDetails` - Fetch individual profile details
  - `useAccountDetails` - Fetch current account info (includes API key)
  - `useAccountUpdate` - Handle account updates
  - `useNotifications` - Fetch new profile notifications (NEW)
  - `useWebhookLogs` - Fetch webhook logs and stats (NEW)
- Axios instance with automatic token injection
- Protected routes enforced via `_app.tsx` wrapper

### Database Connection
- Single MongoDB connection established on server startup (server/src/utils/dbConnect.js)
- Connection reuse pattern with `isConnected` flag to prevent multiple connections
- Requires `MONGODB_URI` environment variable in server/.env

### Environment Variables

**Server** (server/.env):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for access token signing
- `REFRESH_TOKEN_SECRET` - Secret for refresh token signing
- `PORT` - Server port (default: 8000)

**Client**:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Code Patterns

### Event-Profile Linking Flow
1. Events are created with `sessionId` and `userId: null`
2. When profile is created via `POST /api/profile`:
   - Profile is saved to get `_id`
   - `updateUserEvents(sessionId, userId)` called in eventsModel
   - All events with matching sessionId get userId updated
3. Profile virtual populates events for querying

### Token Refresh Pattern
- Server issues both access token (59-minute expiration) and refresh token (1-hour expiration, stored in DB)
- Client stores tokens in localStorage (primary) and cookies
- `ProtectedRoute` component handles token validation and refresh logic:
  - Checks token expiration on 5-second interval (throttled to 3 seconds)
  - Tracks user activity via mousemove and keydown events
  - Automatically refreshes token if expired and user active within 5 minutes
  - Redirects to /login if token refresh fails or user inactive
- Token refresh via `POST /refreshtoken` endpoint validates refresh token against DB

### Model Exports Pattern
Server models export functions (not Mongoose models directly):
- `getAllProfile()`, `getAllEvent()`, etc. - Query functions
- `profileCreation()`, `eventCreation()` - Insert operations
- Controllers call these model functions rather than using Mongoose directly

### Webhook Integration Pattern (NEW - October 2025)
**Server-side event tracking for backend operations:**

1. **API Key Authentication:**
   - Each account gets a unique API key (`tm_live_...`) generated on registration
   - Stored in Account model with creation timestamp
   - Used via `X-TrackMate-API-Key` header for webhook endpoints
   - Middleware: `verifyWebhookKey` validates key and attaches company_id

2. **Email-Based User Binding:**
   - Webhook events include `identifier.email` field
   - System finds or creates Profile by email automatically
   - All events for same email are linked to same profile
   - Enables unified user journey across client-side and server-side tracking

3. **Webhook Logging:**
   - Middleware: `webhookLogger` automatically logs all webhook requests
   - Captures: request/response payload, status code, processing time, IP address
   - Model: `WebhookLog` stores logs with company_id isolation
   - Dashboard: `/webhook-logs` page shows logs with filters and statistics

4. **Rate Limiting:**
   - General API: 500 requests per 15 minutes
   - Webhooks: 100 requests per 15 minutes
   - Failed Auth: 10 attempts per 15 minutes
   - Uses `express-rate-limit` with proper IPv6 handling

5. **Notification System:**
   - Polls `/api/notifications/new-profiles` every 30 seconds
   - Shows bell icon with badge count in header
   - Dropdown displays new profiles with links
   - localStorage tracks last check timestamp

6. **Security & Input Sanitization (Added: October 19, 2025):**
   - Utility: `server/src/utils/sanitizer.js` - XSS prevention via validator library
   - Functions: sanitizeString, sanitizeEmail, sanitizePhone, sanitizeObject
   - Validation: sanitizeProfileData, sanitizeEventData with error reporting
   - Middleware: `server/src/middleware/mongoSanitize.js` - Custom NoSQL injection prevention (Express 5 compatible)
   - Removes MongoDB operators ($where, $ne, etc.) and dangerous keys (containing .)
   - Applied in: profileController, eventsController, webhookController
   - Logs security events (failed validations, injection attempts blocked)

7. **Logging & Monitoring (Added: October 19, 2025):**
   - System: Winston-based structured logging (`server/src/utils/logger.js`)
   - Log Files: `server/logs/combined.log`, `server/logs/error.log` (5MB rotation)
   - Log Levels: error, warn, info, debug (configurable via LOG_LEVEL env var)
   - Custom Methods: logRequest, logResponse, logWebhook, logAuth, logDatabase, logSecurity
   - Request Tracking: UUID-based request IDs (X-Request-ID header)
   - Middleware: `server/src/middleware/requestLogger.js` (auto request/response logging)
   - Morgan Integration: HTTP access logs with Apache combined format
   - Applied to: All controllers (replaced console.log/error)

8. **Database Optimization (Added: October 19, 2025):**
   - **Profile Model** Indexes:
     - `{ email: 1, company_id: 1 }` (unique) - User lookup
     - `{ company_id: 1, createdAt: -1 }` - New profiles query
     - `{ company_id: 1, lastActive: -1 }` - Activity sorting
   - **Event Model** Indexes:
     - `{ sessionId: 1, company_id: 1 }` - Session-based queries
     - `{ userId: 1, company_id: 1 }` - Profile event population
     - `{ company_id: 1, 'events.timestamp': -1 }` - Time-based queries
     - `{ sessionId: 1, company_id: 1, userId: 1 }` - Webhook binding
   - **WebhookLog Model** Indexes:
     - `{ company_id: 1, created_at: -1 }` - Log retrieval with date sorting
     - `{ account_id: 1, created_at: -1 }` - Account-specific queries
     - `{ company_id: 1, status_code: 1, created_at: -1 }` - Status filtering
     - `{ company_id: 1, endpoint: 1, created_at: -1 }` - Endpoint queries

**For webhook testing and examples, see API_GUIDE.md**

## Important Notes

- Server and client have separate node_modules and package.json files
- Not using npm workspaces, lerna, or yarn workspaces - manual dependency management
- TypeScript used only in client, server is JavaScript
- Bootstrap 5.3.6 included in root dependencies (used for admin styling - SB Admin 2 template)
- Custom CSS in client/src/styles/: sb-admin-2.css, layout.css, globals.css
- Some backup files exist (e.g., event_bkpModel.js, ProfileDetails_bkp.tsx)
- Register page (register.tsx) uses hardcoded `http://localhost:8000` instead of axiosInstance
