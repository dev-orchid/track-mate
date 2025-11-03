# TrackMate Tracking Guide

## Overview

TrackMate provides both **client-side** and **server-side** tracking solutions for your customers. This guide explains how to integrate TrackMate tracking into your customer's websites and applications.

---

## Table of Contents

1. [Getting Your Company ID](#getting-your-company-id)
2. [Client-Side Tracking (JavaScript Snippet)](#client-side-tracking-javascript-snippet)
3. [Server-Side Tracking (Postback URLs)](#server-side-tracking-postback-urls)
4. [API Endpoints](#api-endpoints)
5. [Data Privacy & Security](#data-privacy--security)

---

## Getting Your Company ID

After registering on TrackMate, you'll receive a unique **Company ID** in the format `TM-XXXXX`. You can find this ID in your account settings at `/account-details`.

**Example:** `TM-A1B2C`

---

## Client-Side Tracking (JavaScript Snippet)

### Installation

Add the TrackMate tracking snippet to your website by including it in the `<head>` section or before the closing `</body>` tag:

```html
<!-- Include TrackMate SDK -->
<script src="https://yourcdn.com/trackmate.js"></script>

<!-- Initialize TrackMate -->
<script>
  TrackMate.init('TM-XXXXX', 'http://localhost:8000');
</script>
```

Replace:
- `TM-XXXXX` with your actual Company ID
- `http://localhost:8000` with your TrackMate API URL

---

### Basic Usage

#### 1. Initialize TrackMate

```javascript
TrackMate.init('TM-A1B2C', 'http://localhost:8000');
```

This must be called before any tracking functions.

---

#### 2. Track Page Views

Automatically track when users visit pages:

```javascript
// Track current page
TrackMate.trackPageView();

// Track specific page
TrackMate.trackPageView('https://example.com/products', 'Products Page');
```

**Auto-tracking:** Enable automatic page view tracking on every page load:

```javascript
window.addEventListener('load', function() {
  TrackMate.autoTrackPageViews();
});
```

---

#### 3. Identify Users

When a user signs up or logs in, identify them:

```javascript
TrackMate.identify({
  name: 'John Doe',
  email: 'john@example.com',
  phone: 1234567890  // optional
});
```

This creates a profile and links all previous anonymous events (tracked via sessionId) to this user.

---

#### 4. Track Product Views

Track when users view products:

```javascript
TrackMate.trackProductView({
  productName: 'Wireless Headphones',
  productId: 'WH-1000XM4',
  price: 349.99
});
```

---

#### 5. Track Purchases

Track completed purchases:

```javascript
TrackMate.trackPurchase([
  {
    productName: 'Wireless Headphones',
    productId: 'WH-1000XM4',
    price: 349.99
  },
  {
    productName: 'USB-C Cable',
    productId: 'USBC-001',
    price: 12.99
  }
], 362.98); // Total amount
```

---

#### 6. Track Custom Events

Track any custom event:

```javascript
TrackMate.trackCustom('button_click', {
  buttonName: 'Subscribe',
  location: 'homepage_hero'
});

TrackMate.trackCustom('video_played', {
  videoId: 'intro-2024',
  duration: 120
});
```

---

#### 7. Generic Event Tracking

For advanced use cases, use the generic `track()` method:

```javascript
TrackMate.track('custom_event_name', {
  address: 'https://example.com/checkout',
  productInfos: [
    {
      productName: 'Product A',
      price: 99.99,
      productId: 'PROD-001'
    }
  ],
  customField: 'custom value'
});
```

---

### Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Store</title>
  <script src="https://yourcdn.com/trackmate.js"></script>
  <script>
    // Initialize TrackMate
    TrackMate.init('TM-A1B2C', 'http://localhost:8000');

    // Auto-track page views
    window.addEventListener('load', function() {
      TrackMate.trackPageView();
    });
  </script>
</head>
<body>
  <h1>Welcome to My Store</h1>

  <!-- Product Card -->
  <div class="product" onclick="trackProduct()">
    <h2>Wireless Headphones</h2>
    <p>$349.99</p>
  </div>

  <!-- Sign Up Form -->
  <form id="signupForm" onsubmit="handleSignup(event)">
    <input type="text" id="name" placeholder="Name" required>
    <input type="email" id="email" placeholder="Email" required>
    <input type="tel" id="phone" placeholder="Phone">
    <button type="submit">Sign Up</button>
  </form>

  <script>
    function trackProduct() {
      TrackMate.trackProductView({
        productName: 'Wireless Headphones',
        productId: 'WH-1000XM4',
        price: 349.99
      });
    }

    function handleSignup(event) {
      event.preventDefault();

      TrackMate.identify({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
      });

      alert('Thank you for signing up!');
    }
  </script>
</body>
</html>
```

---

## Server-Side Tracking (Postback URLs)

For events that happen on your server (e.g., successful payments, subscription renewals), use server-side tracking via HTTP POST requests.

### Endpoint

```
POST http://localhost:8000/api/events
```

### Request Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "company_id": "TM-A1B2C",
  "sessionId": "session_123456789",
  "events": [
    {
      "eventType": "payment_success",
      "eventData": {
        "address": "https://example.com/checkout",
        "productInfos": [
          {
            "productName": "Premium Subscription",
            "price": 29.99,
            "productId": "SUB-PREMIUM"
          }
        ],
        "transactionId": "txn_abc123",
        "currency": "USD"
      },
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Example: Node.js

```javascript
const axios = require('axios');

async function trackServerEvent(companyId, sessionId, eventType, eventData) {
  try {
    const response = await axios.post('http://localhost:8000/api/events', {
      company_id: companyId,
      sessionId: sessionId,
      events: [{
        eventType: eventType,
        eventData: eventData,
        timestamp: new Date().toISOString()
      }]
    });

    console.log('Event tracked:', response.data);
  } catch (error) {
    console.error('Error tracking event:', error.message);
  }
}

// Usage
trackServerEvent('TM-A1B2C', 'session_123456789', 'payment_success', {
  address: 'https://example.com/checkout',
  productInfos: [{
    productName: 'Premium Subscription',
    price: 29.99,
    productId: 'SUB-PREMIUM'
  }],
  transactionId: 'txn_abc123'
});
```

### Example: PHP

```php
<?php
function trackServerEvent($companyId, $sessionId, $eventType, $eventData) {
    $url = 'http://localhost:8000/api/events';

    $payload = [
        'company_id' => $companyId,
        'sessionId' => $sessionId,
        'events' => [[
            'eventType' => $eventType,
            'eventData' => $eventData,
            'timestamp' => date('c')
        ]]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

// Usage
trackServerEvent('TM-A1B2C', 'session_123456789', 'payment_success', [
    'address' => 'https://example.com/checkout',
    'productInfos' => [[
        'productName' => 'Premium Subscription',
        'price' => 29.99,
        'productId' => 'SUB-PREMIUM'
    ]],
    'transactionId' => 'txn_abc123'
]);
?>
```

### Example: Python

```python
import requests
from datetime import datetime

def track_server_event(company_id, session_id, event_type, event_data):
    url = 'http://localhost:8000/api/events'

    payload = {
        'company_id': company_id,
        'sessionId': session_id,
        'events': [{
            'eventType': event_type,
            'eventData': event_data,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }]
    }

    response = requests.post(url, json=payload)
    return response.json()

# Usage
track_server_event('TM-A1B2C', 'session_123456789', 'payment_success', {
    'address': 'https://example.com/checkout',
    'productInfos': [{
        'productName': 'Premium Subscription',
        'price': 29.99,
        'productId': 'SUB-PREMIUM'
    }],
    'transactionId': 'txn_abc123'
})
```

---

## API Endpoints

### Create Profile (Identify User)

**Endpoint:** `POST /api/profile`

**Body:**
```json
{
  "company_id": "TM-A1B2C",
  "sessionId": "session_123456789",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": 1234567890
}
```

**Response:**
```json
{
  "status": "Success",
  "response": {
    "id": 1,
    "status": "Success",
    "response": {
      "_id": "65a1b2c3d4e5f6789",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": 1234567890,
      "company_id": "TM-A1B2C"
    }
  }
}
```

---

### Track Event

**Endpoint:** `POST /api/events`

**Body:**
```json
{
  "company_id": "TM-A1B2C",
  "sessionId": "session_123456789",
  "events": [
    {
      "eventType": "page_view",
      "eventData": {
        "address": "https://example.com/products",
        "productInfos": []
      },
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "status": "ok",
    "response": { ... }
  }
}
```

---

## Data Privacy & Security

### Company-Level Data Isolation

TrackMate ensures complete data isolation between companies:

- ✅ Each company can only access their own profiles and events
- ✅ All API endpoints filter data by `company_id`
- ✅ JWT tokens include `company_id` for authentication
- ✅ Database queries are scoped to the logged-in company

### Session Management

- **SessionId:** Tracks anonymous users before they identify themselves
- **Profile Linking:** When `identify()` is called, all events with the same sessionId are linked to the user profile
- **Persistence:** SessionId is stored in localStorage for consistent tracking across page loads

### Best Practices

1. **Never expose your Company ID publicly** in a way that could be exploited
2. **Use HTTPS** in production to encrypt data in transit
3. **Implement Content Security Policy (CSP)** to prevent XSS attacks
4. **Comply with GDPR/CCPA** by providing opt-out mechanisms for users
5. **Server-side tracking** is more secure for sensitive events (payments, etc.)

---

## Troubleshooting

### Events not appearing in dashboard

1. Check that `company_id` is correct
2. Verify API URL is reachable
3. Open browser console to check for errors
4. Ensure TrackMate is initialized before tracking

### Profile not linking to events

1. Ensure the same `sessionId` is used for events before calling `identify()`
2. Check that `company_id` matches between events and profile

### Cross-origin errors

If you see CORS errors, ensure your TrackMate API has proper CORS headers configured.

---

## Support

For additional help or questions:
- Email: support@trackmate.com
- Documentation: https://docs.trackmate.com
- GitHub: https://github.com/trackmate

---

**Version:** 1.0.0
**Last Updated:** January 2025
