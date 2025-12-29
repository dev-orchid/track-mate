# Webhook User Binding - Visual Example

## Real-World Scenario: E-commerce Purchase

Let's track a complete user journey from website visit to order fulfillment.

---

## Timeline with Data Flow

### **10:00 AM - User Visits Website (Client-Side)**

```javascript
// Website loads TrackMate script
TrackMate.init('TM-SHOP99', 'https://api.trackmate.com');

// Auto-track page view
TrackMate.trackPageView();
```

**What Happens:**
1. TrackMate generates `sessionId: "session_1729260000_abc123"`
2. Stores in browser localStorage
3. Sends event to TrackMate API

**Database State:**
```javascript
// Event Document Created
{
  _id: ObjectId("event1"),
  company_id: "TM-SHOP99",
  sessionId: "session_1729260000_abc123",
  userId: null, // ← Not identified yet!
  events: [
    {
      eventType: "page_view",
      eventData: {
        address: "https://shop.com/homepage"
      },
      timestamp: "2025-10-18T10:00:00Z"
    }
  ]
}

// Profile: NONE (user anonymous)
```

---

### **10:05 AM - User Adds Item to Cart (Client-Side)**

```javascript
// User clicks "Add to Cart"
TrackMate.track('add_to_cart', {
  address: window.location.href,
  productInfos: [{
    productId: "PROD-001",
    productName: "Wireless Headphones",
    price: 79.99
  }]
});
```

**Database State:**
```javascript
// Same Event Document Updated
{
  _id: ObjectId("event1"),
  company_id: "TM-SHOP99",
  sessionId: "session_1729260000_abc123",
  userId: null, // ← Still anonymous
  events: [
    { eventType: "page_view", ... },
    {
      eventType: "add_to_cart",
      eventData: {
        address: "https://shop.com/product/headphones",
        productInfos: [{ productId: "PROD-001", productName: "Wireless Headphones", price: 79.99 }]
      },
      timestamp: "2025-10-18T10:05:00Z"
    }
  ]
}

// Profile: NONE (still anonymous)
```

---

### **10:08 AM - User Creates Account (Client-Side)**

```javascript
// User registers on website
// Your frontend form submits to your API
fetch('https://shop.com/api/register', {
  method: 'POST',
  body: JSON.stringify({
    name: "Sarah Johnson",
    email: "sarah@example.com",
    password: "***"
  })
});

// After registration success, identify in TrackMate
TrackMate.identify({
  name: "Sarah Johnson",
  email: "sarah@example.com"
});
```

**What Happens:**
1. TrackMate sends identify request to `/api/profile`
2. Profile created with email
3. **ALL events** with matching `sessionId` get linked to new profile!

**Database State:**
```javascript
// Profile Created
{
  _id: ObjectId("671234567890abcdef123456"),
  name: "Sarah Johnson",
  email: "sarah@example.com",
  company_id: "TM-SHOP99",
  createdAt: "2025-10-18T10:08:00Z",
  lastActive: "2025-10-18T10:08:00Z"
}

// Event Document Updated
{
  _id: ObjectId("event1"),
  company_id: "TM-SHOP99",
  sessionId: "session_1729260000_abc123",
  userId: ObjectId("671234567890abcdef123456"), // ← NOW LINKED!
  events: [
    { eventType: "page_view", ... },
    { eventType: "add_to_cart", ... }
  ]
}
```

**🔗 BINDING POINT #1**: All previous anonymous events now linked to `sarah@example.com`!

---

### **10:10 AM - User Starts Checkout (Client-Side)**

```javascript
// User clicks "Proceed to Checkout"
TrackMate.track('checkout_started', {
  address: window.location.href,
  productInfos: [{ productId: "PROD-001", productName: "Wireless Headphones", price: 79.99 }]
});
```

**Database State:**
```javascript
// Event added to existing document (now has userId)
{
  _id: ObjectId("event1"),
  userId: ObjectId("671234567890abcdef123456"), // ← Linked from start
  sessionId: "session_1729260000_abc123",
  company_id: "TM-SHOP99",
  events: [
    { eventType: "page_view", ... },
    { eventType: "add_to_cart", ... },
    { eventType: "checkout_started", timestamp: "2025-10-18T10:10:00Z" }
  ]
}
```

---

### **10:12 AM - Payment Submitted (Hybrid: Client → Server)**

```javascript
// FRONTEND: User submits payment form
fetch('https://shop.com/api/checkout', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer user_session_token'
  },
  body: JSON.stringify({
    paymentMethod: 'card',
    amount: 79.99
  })
});
```

```javascript
// BACKEND (Your Server): Checkout API endpoint
app.post('/api/checkout', async (req, res) => {
  // Get user from session token
  const user = await authenticateUser(req.headers.authorization);
  // user.email = "sarah@example.com"

  // Process payment with Stripe
  const payment = await stripe.charges.create({
    amount: 7999, // cents
    currency: 'usd',
    customer: user.stripeCustomerId,
    description: 'Order for Wireless Headphones'
  });

  if (payment.status === 'succeeded') {
    // ✅ PAYMENT SUCCESS

    // Track server-side event via Webhook
    await fetch('https://api.trackmate.com/api/webhooks/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TrackMate-API-Key': process.env.TRACKMATE_API_KEY
      },
      body: JSON.stringify({
        company_id: 'TM-SHOP99',
        identifier: {
          email: 'sarah@example.com' // ← KEY: Same email!
        },
        eventType: 'payment_processed',
        eventData: {
          orderId: payment.id,
          amount: 79.99,
          currency: 'USD',
          paymentMethod: 'card',
          productInfos: [{
            productId: "PROD-001",
            productName: "Wireless Headphones",
            price: 79.99
          }]
        }
      })
    });

    res.json({ success: true, orderId: payment.id });
  }
});
```

**What Happens in TrackMate Webhook:**
1. Receives webhook POST request
2. Extracts `email: "sarah@example.com"`
3. **Searches for Profile** with matching email + company_id
4. **Finds existing profile** (created at 10:08 AM)
5. Creates new event linked to that profile's `_id`

**Database State:**
```javascript
// NEW Event Document Created (server-side event)
{
  _id: ObjectId("event2"),
  userId: ObjectId("671234567890abcdef123456"), // ← SAME USER!
  company_id: "TM-SHOP99",
  sessionId: "webhook_1729260720_srv123", // New session (server-initiated)
  events: [
    {
      eventType: "payment_processed",
      eventData: {
        orderId: "ch_abc123stripe",
        amount: 79.99,
        currency: "USD",
        paymentMethod: "card",
        productInfos: [...]
      },
      timestamp: "2025-10-18T10:12:00Z"
    }
  ]
}
```

**🔗 BINDING POINT #2**: Server event linked to same profile via email match!

---

### **10:15 AM - Order Fulfillment (Server-Side Background Job)**

```javascript
// BACKEND: Fulfillment system processes order
// (This runs as a background job, separate from user's browser)

async function fulfillOrder(orderId) {
  const order = await db.orders.findOne({ id: orderId });
  // order.userEmail = "sarah@example.com"

  // Ship the product
  const shipping = await shippo.createShipment({
    address: order.shippingAddress,
    items: order.items
  });

  // Update order status
  await db.orders.update(orderId, {
    status: 'shipped',
    trackingNumber: shipping.trackingNumber
  });

  // Track fulfillment event in TrackMate
  await fetch('https://api.trackmate.com/api/webhooks/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TrackMate-API-Key': process.env.TRACKMATE_API_KEY
    },
    body: JSON.stringify({
      company_id: 'TM-SHOP99',
      identifier: {
        email: order.userEmail // "sarah@example.com"
      },
      eventType: 'order_shipped',
      eventData: {
        orderId: orderId,
        trackingNumber: shipping.trackingNumber,
        carrier: 'USPS',
        estimatedDelivery: '2025-10-20'
      }
    })
  });
}
```

**Database State:**
```javascript
// Event document updated (server event appended)
{
  _id: ObjectId("event2"),
  userId: ObjectId("671234567890abcdef123456"), // ← SAME USER!
  sessionId: "webhook_1729260720_srv123",
  company_id: "TM-SHOP99",
  events: [
    { eventType: "payment_processed", timestamp: "2025-10-18T10:12:00Z" },
    {
      eventType: "order_shipped",
      eventData: {
        orderId: "ch_abc123stripe",
        trackingNumber: "USPS12345",
        carrier: "USPS",
        estimatedDelivery: "2025-10-20"
      },
      timestamp: "2025-10-18T10:15:00Z"
    }
  ]
}
```

**🔗 BINDING POINT #3**: Background job event also linked via email!

---

### **10:16 AM - Email Notification (Server-Side - SendGrid Webhook)**

```javascript
// SENDGRID WEBHOOK: Email delivery confirmation
// SendGrid calls YOUR webhook when email is delivered

app.post('/webhooks/sendgrid', async (req, res) => {
  const { email, event, sg_event_id } = req.body;
  // email = "sarah@example.com"
  // event = "delivered"

  if (event === 'delivered') {
    // Track email delivery in TrackMate
    await fetch('https://api.trackmate.com/api/webhooks/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TrackMate-API-Key': process.env.TRACKMATE_API_KEY
      },
      body: JSON.stringify({
        company_id: 'TM-SHOP99',
        identifier: {
          email: email // "sarah@example.com"
        },
        eventType: 'email_delivered',
        eventData: {
          emailType: 'order_confirmation',
          provider: 'SendGrid',
          eventId: sg_event_id
        }
      })
    });
  }

  res.json({ success: true });
});
```

**🔗 BINDING POINT #4**: Third-party service event also linked via email!

---

## Final User Profile View

### **Sarah Johnson's Complete Timeline**

```
Profile: Sarah Johnson (sarah@example.com)
ID: 671234567890abcdef123456
Company: TM-SHOP99

┌─────────────────────────────────────────────────────┐
│ CLIENT-SIDE EVENTS (Browser - session_172926...)   │
├─────────────────────────────────────────────────────┤
│ 10:00  page_view           Homepage                 │
│ 10:05  add_to_cart         Wireless Headphones      │
│ 10:08  user_registered     Account created          │
│ 10:10  checkout_started    Cart: $79.99             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SERVER-SIDE EVENTS (Webhooks - webhook_17292...)   │
├─────────────────────────────────────────────────────┤
│ 10:12  payment_processed   Stripe - $79.99         │
│ 10:15  order_shipped       USPS - Track: 12345     │
│ 10:16  email_delivered     Order confirmation      │
└─────────────────────────────────────────────────────┘

Total Revenue: $79.99
Total Events: 7
Sessions: 2 (1 client, 1 server)
Last Active: 10:16 AM
```

---

## How Binding Works: The Magic Explained

### Method 1: Email Binding (Used in Example Above)

```
Client Side (10:08):
├─ TrackMate.identify({ email: "sarah@example.com" })
├─ Profile created with email
└─ Profile._id: "671234..."

Server Side (10:12):
├─ Webhook receives: { identifier: { email: "sarah@example.com" } }
├─ Query: Profile.findOne({ email: "sarah@example.com", company_id: "TM-SHOP99" })
├─ Found: Profile._id "671234..."
└─ Event created with userId: "671234..."

Result: ✅ Client and server events linked to SAME profile!
```

### Method 2: Session ID Binding (Alternative)

```
Client Side:
├─ sessionId generated: "session_1729260000_abc123"
├─ Pass to your server (cookie, API call, etc.)
└─ Your server knows: user session = "session_1729260000_abc123"

Server Side:
├─ Webhook receives: { identifier: { sessionId: "session_1729260000_abc123" } }
├─ Query: Event.findOne({ sessionId: "...", userId: { $ne: null } })
├─ Found event with userId: "671234..."
└─ New event created with same userId

Result: ✅ Linked via session even if user hasn't identified yet!
```

### Method 3: Direct Profile ID (Alternative)

```
Client Side:
├─ TrackMate.identify({ email: "sarah@example.com" })
├─ Response: { profileId: "671234..." }
└─ Store in your database: user.trackmate_id = "671234..."

Server Side:
├─ Your user table has: { email: "sarah@...", trackmate_id: "671234..." }
├─ Webhook sends: { identifier: { userId: "671234..." } }
└─ Event created with userId: "671234..."

Result: ✅ Direct binding, no lookup needed!
```

---

## Key Takeaways

1. **Client events** use `sessionId` for anonymous tracking
2. **Profile creation** (identify) links all `sessionId` events to `userId`
3. **Server webhooks** use email/sessionId/userId to find existing profile
4. **All events** (client + server) end up on same profile timeline
5. **Email is the glue** that binds client and server tracking together

This creates a **unified view** of the customer journey across all touchpoints! 🎯
