# Webhook Integration - Visual Flow Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CUSTOMER'S ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐                    ┌──────────────────┐    │
│  │  User Browser  │                    │  Customer Server │    │
│  │                │                    │                  │    │
│  │  TrackMate.js  │                    │  Your Backend    │    │
│  │  (Client SDK)  │                    │  (Node/PHP/etc)  │    │
│  └────────┬───────┘                    └────────┬─────────┘    │
│           │                                     │               │
│           │ Client Events                       │ Server Events │
│           │ (page_view,                         │ (payment,     │
│           │  add_to_cart)                       │  fulfillment) │
│           │                                     │               │
└───────────┼─────────────────────────────────────┼───────────────┘
            │                                     │
            │ POST /api/events                    │ POST /api/webhooks/events
            │ {sessionId, company_id}             │ {email, company_id, api_key}
            │                                     │
            ▼                                     ▼
┌───────────────────────────────────────────────────────────────┐
│                     TRACKMATE SERVER                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │   Event API      │              │  Webhook API     │     │
│  │  (Unprotected)   │              │  (API Key Auth)  │     │
│  └────────┬─────────┘              └────────┬─────────┘     │
│           │                                  │               │
│           │ 1. Store event                   │ 2. Find profile│
│           │    with sessionId                │    by email   │
│           │    userId: null                  │               │
│           │                                  │ 3. Link event │
│           ▼                                  ▼    to userId  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            MongoDB Database                         │    │
│  │                                                     │    │
│  │  ┌──────────────┐         ┌───────────────────┐  │    │
│  │  │   Profiles   │◄────────│      Events       │  │    │
│  │  │              │  userId │                   │  │    │
│  │  │ _id          │         │ userId (ref)      │  │    │
│  │  │ email   ←────┼─────────│ sessionId         │  │    │
│  │  │ company_id   │   Link  │ company_id        │  │    │
│  │  └──────────────┘   by    │ events: [...]     │  │    │
│  │                    email   └───────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Binding Flow

### Step 1: Anonymous User (Client-Side)

```
Browser
  │
  │ TrackMate.init('TM-ABC', 'https://api.trackmate.com')
  │ sessionId = "session_123abc"
  │
  ▼
┌─────────────────────────────────────┐
│  TrackMate.trackPageView()          │
│                                     │
│  POST /api/events                   │
│  {                                  │
│    company_id: "TM-ABC",            │
│    sessionId: "session_123abc",     │
│    events: [{                       │
│      eventType: "page_view",        │
│      eventData: { address: "..." } │
│    }]                               │
│  }                                  │
└───────────────┬─────────────────────┘
                │
                ▼
        ┌───────────────┐
        │  MongoDB      │
        │               │
        │  Event Doc    │
        │  userId: null │ ← Not linked yet
        │  sessionId    │
        └───────────────┘
```

### Step 2: User Identifies (Client-Side)

```
Browser
  │
  │ User registers/logs in
  │
  ▼
┌─────────────────────────────────────┐
│  TrackMate.identify({               │
│    name: "John",                    │
│    email: "john@example.com"        │
│  })                                 │
│                                     │
│  POST /api/profile                  │
│  {                                  │
│    company_id: "TM-ABC",            │
│    sessionId: "session_123abc",     │
│    email: "john@example.com"        │
│  }                                  │
└───────────────┬─────────────────────┘
                │
                ▼
        ┌───────────────────────────────┐
        │  1. Create Profile            │
        │     _id: "671234..."          │
        │     email: "john@example.com" │
        │                               │
        │  2. Update ALL events with    │
        │     sessionId "session_123abc"│
        │     Set userId: "671234..."   │
        └───────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │  MongoDB      │
        │               │
        │  Event Doc    │
        │  userId: "671234..." │ ← NOW LINKED!
        │  sessionId    │
        └───────────────┘
```

### Step 3: Server-Side Event (Webhook)

```
Customer's Server
  │
  │ Payment processed
  │ User email: "john@example.com"
  │
  ▼
┌─────────────────────────────────────────┐
│  POST /api/webhooks/events              │
│  Headers: {                             │
│    X-TrackMate-API-Key: "tm_live_..."  │
│  }                                      │
│  Body: {                                │
│    company_id: "TM-ABC",                │
│    identifier: {                        │
│      email: "john@example.com" ←────┐  │
│    },                                │  │
│    eventType: "payment_processed",   │  │
│    eventData: { amount: 99.99 }      │  │
│  }                                   │  │
└─────────────────┬────────────────────┘  │
                  │                        │
                  ▼                        │
        ┌─────────────────────────────────┼──┐
        │  Webhook Handler                │  │
        │                                 │  │
        │  1. Verify API key              │  │
        │  2. Find profile by email ──────┘  │
        │     Profile.findOne({              │
        │       email: "john@example.com",   │
        │       company_id: "TM-ABC"         │
        │     })                             │
        │  3. Found: _id "671234..."         │
        │  4. Create event with userId       │
        └────────────┬───────────────────────┘
                     │
                     ▼
            ┌────────────────────┐
            │  MongoDB           │
            │                    │
            │  NEW Event Doc     │
            │  userId: "671234..."│ ← SAME USER!
            │  sessionId: webhook │
            │  events: [payment]  │
            └────────────────────┘
```

## Complete User Timeline

```
Profile: john@example.com (ID: 671234...)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLIENT EVENTS (Browser)          SERVER EVENTS (Webhooks)
─────────────────────            ───────────────────────

10:00 │ page_view
      │ sessionId: session_123
      │ userId: null
      │
10:05 │ add_to_cart
      │ sessionId: session_123
      │ userId: null
      │
10:08 │ identify()
      │ ↓ Creates Profile
      │ ↓ Links all events
      │ userId: 671234...
      │
10:10 │ checkout_started                           10:12 │ payment_processed
      │ userId: 671234...  ──────────────────────────────┤ userId: 671234...
      │                          (Linked by email)       │ source: webhook
      │                                                   │
      │                                            10:15 │ order_shipped
      │                          (Linked by email)       │ userId: 671234...
      │                                                   │ source: webhook
      │                                                   │
      │                                            10:16 │ email_sent
      │                          (Linked by email)       │ userId: 671234...
      │                                                   │ source: webhook

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Result: 7 events, all linked to john@example.com profile
```

## Three Binding Methods Comparison

### Method 1: Email Binding ✨ (Most Common)

```
Client:  identify({ email: "user@example.com" })
           ↓
         Profile created with email
           ↓
Server:  webhook({ identifier: { email: "user@example.com" }})
           ↓
         Find profile by email
           ↓
         Link event to profile._id

✅ Works after user identifies
✅ Simple and reliable
✅ No extra storage needed
⚠️  Requires user to identify first
```

### Method 2: Session ID Binding

```
Client:  sessionId = "session_abc123"
           ↓
         Pass to your server (cookie/API)
           ↓
Server:  webhook({ identifier: { sessionId: "session_abc123" }})
           ↓
         Find event with this sessionId
           ↓
         Get userId from that event
           ↓
         Link new event to same userId

✅ Works for anonymous users
✅ No identification needed
⚠️  Must pass sessionId to server
⚠️  Extra database lookup
```

### Method 3: Direct Profile ID Binding

```
Client:  identify({ email: "user@example.com" })
           ↓
         Response: { profileId: "671234..." }
           ↓
         Store in your database
           ↓
Server:  Read from your DB: user.trackmate_profile_id
           ↓
         webhook({ identifier: { userId: "671234..." }})
           ↓
         Direct link, no lookup needed

✅ Fastest (no database query)
✅ Most reliable
⚠️  Must store profile ID
⚠️  Extra integration step
```

## Security Flow

```
Customer Server
      │
      │ Has API Key: "tm_live_secret123"
      │ Stored in: process.env.TRACKMATE_API_KEY
      │
      ▼
POST /api/webhooks/events
Headers: {
  "X-TrackMate-API-Key": "tm_live_secret123"
}
      │
      ▼
┌─────────────────────────────────┐
│  Webhook Middleware             │
│                                 │
│  1. Extract API key from header │
│  2. Query DB:                   │
│     Account.findOne({           │
│       api_key: "tm_live_..."    │
│     })                          │
│  3. Verify company_id matches   │
│  4. Attach to req.company_id    │
│                                 │
│  ✅ Authorized                  │
│  ❌ 401 Unauthorized            │
└─────────────────────────────────┘
```

## Summary

```
┌────────────────────────────────────────────────────┐
│             WEBHOOK INTEGRATION                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  ✅ Track server-side events                      │
│  ✅ Link to client-side events                    │
│  ✅ Unified user profile                          │
│  ✅ Complete customer journey                     │
│  ✅ Secure API key authentication                 │
│  ✅ Multi-tenant isolation                        │
│                                                    │
│  Binding Methods:                                 │
│  1. Email (recommended)                           │
│  2. Session ID (anonymous)                        │
│  3. Profile ID (fastest)                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

The key insight: **Email is the bridge** that connects client and server events to the same user profile!
