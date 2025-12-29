# TrackMate API Guide

**Last Updated:** October 18, 2025
**Version:** 1.0.0

> **IMPORTANT:** This is the single source of truth for all API endpoints.
> When adding new endpoints or features, update this file with:
> - New endpoint documentation with curl examples
> - Updated changelog at the bottom
> - New quick examples if applicable
>
> Keep examples simple and copy-paste ready!

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Profile & Event Tracking](#profile--event-tracking)
5. [Webhook Integration](#webhook-integration)
6. [Webhook Logs](#webhook-logs)
7. [Quick Examples](#quick-examples)

---

## Getting Started

### Base URLs
- **Development:** `http://localhost:8000`
- **Production:** Your production URL

### Authentication Types
- **JWT Bearer Token** - For dashboard/admin endpoints
- **API Key** - For webhook endpoints (`X-TrackMate-API-Key` header)

---

## Authentication

### Register New Account
```bash
POST /register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "company_name": "Acme Corp"
}

# Response
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login
```bash
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Response
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Get Current User (with API Key)
```bash
GET /auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN

# Response includes api_key for webhooks
{
  "status": "success",
  "user": {
    "_id": "...",
    "email": "john@example.com",
    "company_id": "TM-XXXXX",
    "api_key": "tm_live_...",
    "api_key_created_at": "2025-10-18T22:30:00.000Z"
  }
}
```

### Update Current User
```bash
PUT /auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "company_name": "New Company Name"
}
```

### Regenerate API Key
```bash
POST /auth/regenerate-api-key
Authorization: Bearer YOUR_ACCESS_TOKEN

# Response
{
  "success": true,
  "api_key": "tm_live_NEW_KEY_HERE"
}
```

### Refresh Access Token
```bash
POST /refreshtoken
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

---

## User Management

### Get All Profiles
```bash
GET /api/profile
Authorization: Bearer YOUR_ACCESS_TOKEN

# Response
{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "1234567890",
      "lastActive": "2025-10-18T22:45:00.000Z",
      "company_id": "TM-XXXXX",
      "events": [...] // Populated events
    }
  ]
}
```

### Get Profile by ID
```bash
GET /api/profile/:id
Authorization: Bearer YOUR_ACCESS_TOKEN

# Example: GET /api/profile/65f9a1b2c3d4e5f6g7h8i9j0
```

### Get New Profiles (for notifications)
```bash
GET /api/notifications/new-profiles?since=2025-10-18T00:00:00.000Z
Authorization: Bearer YOUR_ACCESS_TOKEN

# Response
{
  "status": "success",
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "New Customer",
      "email": "new@example.com",
      "createdAt": "2025-10-18T22:30:00.000Z"
    }
  ]
}
```

---

## Profile & Event Tracking

### Create Profile (Client-side tracking)
```bash
POST /api/profile
Content-Type: application/json

# No authentication required - called by tracking snippet
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "1234567890",
  "sessionId": "session_abc123",
  "company_id": "TM-XXXXX"
}
```

### Create Event (Client-side tracking)
```bash
POST /api/events
Content-Type: application/json

# No authentication required - called by tracking snippet
{
  "userId": "65f9a1b2c3d4e5f6g7h8i9j0", // or null
  "sessionId": "session_abc123",
  "eventType": "page_view",
  "eventData": {
    "address": "https://example.com/page",
    "productInfos": []
  },
  "company_id": "TM-XXXXX"
}
```

---

## Webhook Integration

### Send Webhook Event (Server-side)
```bash
POST /api/webhooks/events
Content-Type: application/json
X-TrackMate-API-Key: tm_live_YOUR_API_KEY

{
  "identifier": {
    "email": "customer@example.com",  // Required - for user binding
    "name": "Customer Name"            // Optional
  },
  "eventType": "purchase",             // Required
  "eventData": {                       // Optional
    "address": "https://shop.com/checkout/success",
    "productInfos": [
      {
        "name": "Product Name",
        "price": 99.99,
        "quantity": 1
      }
    ]
  },
  "timestamp": "2025-10-18T22:45:00.000Z"  // Optional - defaults to now
}

# Response
{
  "success": true,
  "message": "Webhook event processed successfully",
  "eventId": "...",
  "profileId": "...",
  "action": "created_new_profile" // or "updated_existing_profile"
}
```

**Supported Event Types:**
- `page_view` - User viewed a page
- `purchase` - User completed purchase
- `cart_abandoned` - User abandoned cart
- `form_submit` - User submitted form
- `custom` - Any custom event

**Email-based User Binding:**
- Events are automatically linked to profiles by email
- If profile doesn't exist, it's created automatically
- All events for the same email are grouped together

### Get Webhook Info
```bash
GET /api/webhooks/info
X-TrackMate-API-Key: tm_live_YOUR_API_KEY

# Response
{
  "success": true,
  "data": {
    "company_id": "TM-XXXXX",
    "account_email": "john@example.com",
    "webhook_endpoints": {...},
    "supported_event_types": [...]
  }
}
```

---

## Webhook Logs

### Get Webhook Logs
```bash
GET /api/webhooks/logs?page=1&limit=20&status_code=200
Authorization: Bearer YOUR_ACCESS_TOKEN

# Query Parameters:
# - page (default: 1)
# - limit (default: 50, max: 100)
# - status_code (optional: 200, 400, 500, etc.)
# - startDate (optional: ISO date string)
# - endDate (optional: ISO date string)

# Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "endpoint": "/api/webhooks/events",
      "method": "POST",
      "status_code": 200,
      "processing_time_ms": 125,
      "ip_address": "::1",
      "created_at": "2025-10-18T22:45:30.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "totalPages": 8,
    "limit": 20
  }
}
```

### Get Webhook Statistics
```bash
GET /api/webhooks/logs/stats?days=7
Authorization: Bearer YOUR_ACCESS_TOKEN

# Response
{
  "success": true,
  "data": {
    "total_requests": 150,
    "successful_requests": 145,
    "failed_requests": 5,
    "avg_processing_time": 127.5
  },
  "period": "Last 7 days"
}
```

### Get Single Webhook Log
```bash
GET /api/webhooks/logs/:id
Authorization: Bearer YOUR_ACCESS_TOKEN

# Example: GET /api/webhooks/logs/65f9a1b2c3d4e5f6g7h8i9j0
```

---

## Quick Examples

### Complete Flow: Register → Get API Key → Send Webhook

```bash
# 1. Register
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"pass123","company_name":"Acme"}'

# Save the accessToken from response

# 2. Get API Key
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Copy the api_key from response

# 3. Send Webhook Event
curl -X POST http://localhost:8000/api/webhooks/events \
  -H "Content-Type: application/json" \
  -H "X-TrackMate-API-Key: tm_live_YOUR_API_KEY" \
  -d '{
    "identifier": {"email": "customer@example.com"},
    "eventType": "purchase",
    "eventData": {"address": "/checkout"}
  }'

# 4. View logs at: http://localhost:3000/webhook-logs
```

### E-commerce Integration Example

```bash
# When user completes checkout on your backend:

curl -X POST http://localhost:8000/api/webhooks/events \
  -H "Content-Type: application/json" \
  -H "X-TrackMate-API-Key: tm_live_YOUR_API_KEY" \
  -d '{
    "identifier": {
      "email": "customer@shop.com",
      "name": "Jane Smith"
    },
    "eventType": "purchase",
    "eventData": {
      "address": "https://shop.com/order/12345",
      "productInfos": [
        {"name": "Laptop", "price": 999.99, "quantity": 1},
        {"name": "Mouse", "price": 29.99, "quantity": 2}
      ]
    }
  }'
```

---

## Rate Limits

### Webhook Endpoints
- **100 requests per 15 minutes** per IP address
- **10 failed auth attempts per 15 minutes** per IP

### General API Endpoints
- **500 requests per 15 minutes** per IP address

### Rate Limit Headers
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1698507600
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Too many requests...",
  "retryAfter": 1698507600,
  "limit": 100,
  "remaining": 0
}
```

---

## Error Responses

### Common Error Codes

**400 Bad Request**
```json
{
  "success": false,
  "error": "Missing required field: eventType"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Webhook log not found"
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "error": "Too many requests...",
  "retryAfter": 1698507600
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to process webhook event"
}
```

---

## Dashboard URLs

### Public Pages (No Auth Required)
- `/login` - Login page
- `/register` - Registration page

### Protected Pages (Auth Required)
- `/` - Dashboard home
- `/profile` - All profiles list
- `/profiles/:id` - Single profile details
- `/webhook-logs` - Webhook logs dashboard
- `/account-details` - Current account info
- `/settings/account/personal` - Account settings (API key here)

---

## Getting Your API Key

### From Dashboard:
1. Login to http://localhost:3000/login
2. Click **"Settings"** in sidebar
3. Scroll to **"API Key for Webhooks"** section
4. Click eye icon to reveal
5. Click copy button

### From API:
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  | grep api_key
```

---

## Important Notes

### Security
- ✅ Never expose API keys in client-side code
- ✅ Use HTTPS in production
- ✅ Rotate API keys regularly (use regenerate button)
- ✅ Store API keys in environment variables
- ✅ Monitor webhook logs for suspicious activity

### Best Practices
- ✅ Use email-based binding for consistent user tracking
- ✅ Include meaningful event data (addresses, product info)
- ✅ Handle webhook errors gracefully
- ✅ Monitor rate limits
- ✅ Use descriptive event types

### Data Isolation
- ✅ All data is isolated by `company_id`
- ✅ Users can only see their own company's data
- ✅ API keys are tied to specific companies
- ✅ No cross-company data leakage

---

## Changelog

### v1.0.0 (October 18, 2025)
- Initial API implementation
- JWT authentication
- Profile & event tracking
- Webhook integration with email-based binding
- API key management UI
- Rate limiting (3-tier)
- Webhook logs system with stats
- Real-time notifications for new profiles

---

## Need Help?

- **Documentation:** See `WEBHOOK_INTEGRATION_DESIGN.md` for detailed webhook specs
- **Examples:** See `WEBHOOK_USER_BINDING_EXAMPLE.md` for real-world scenarios
- **Codebase Guide:** See `CLAUDE.md` for project structure

---

**Pro Tip:** Bookmark this file - it's your single source of truth for all API operations!
