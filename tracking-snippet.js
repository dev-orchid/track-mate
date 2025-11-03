/**
 * TrackMate - Client-Side Tracking Snippet
 *
 * This script should be embedded in your customer's website to track user behavior.
 *
 * Usage:
 * 1. Copy this script and replace 'YOUR_COMPANY_ID' with your actual company_id (e.g., TM-ABC123)
 * 2. Replace 'YOUR_API_URL' with your TrackMate API URL (e.g., https://api.trackmate.com)
 * 3. Add the script to your website's <head> or before closing </body> tag
 *
 * Example:
 * <script src="https://cdn.trackmate.com/trackmate.js"></script>
 * <script>
 *   TrackMate.init('TM-ABC123', 'https://api.trackmate.com');
 * </script>
 */

(function(window) {
  'use strict';

  // TrackMate Configuration
  var TrackMate = {
    companyId: null,
    apiUrl: null,
    sessionId: null,
    listId: null, // Optional: List ID for tracking source (Klaviyo-style)
    isInitialized: false,

    /**
     * Initialize TrackMate with your company ID and API URL
     * @param {string} companyId - Your unique company ID (e.g., TM-ABC123)
     * @param {string} apiUrl - TrackMate API URL (e.g., https://api.trackmate.com)
     * @param {object} options - Optional configuration { listId: 'LST-XXXXXX' }
     */
    init: function(companyId, apiUrl, options) {
      if (!companyId || !apiUrl) {
        console.error('TrackMate: companyId and apiUrl are required');
        return;
      }

      this.companyId = companyId;
      this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
      this.sessionId = this._getOrCreateSessionId();
      this.listId = (options && options.listId) || null; // Optional list ID
      this.isInitialized = true;

      console.log('TrackMate initialized:', {
        companyId: this.companyId,
        sessionId: this.sessionId,
        listId: this.listId
      });
    },

    /**
     * Get or create a session ID for this user
     * Session ID persists in localStorage for tracking anonymous users
     */
    _getOrCreateSessionId: function() {
      var sessionId = localStorage.getItem('tm_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tm_session_id', sessionId);
      }
      return sessionId;
    },

    /**
     * Track an event
     * @param {string} eventType - Type of event (e.g., 'page_view', 'click', 'purchase')
     * @param {object} eventData - Event data including address, productInfos, etc.
     */
    track: function(eventType, eventData) {
      if (!this.isInitialized) {
        console.error('TrackMate: Not initialized. Call TrackMate.init() first');
        return;
      }

      var payload = {
        company_id: this.companyId,
        sessionId: this.sessionId,
        events: [{
          eventType: eventType,
          eventData: eventData || {},
          timestamp: new Date().toISOString()
        }]
      };

      this._sendRequest('/api/events', payload);
    },

    /**
     * Identify a user (create profile)
     * @param {object} userData - User data including name, email, phone
     */
    identify: function(userData) {
      if (!this.isInitialized) {
        console.error('TrackMate: Not initialized. Call TrackMate.init() first');
        return;
      }

      if (!userData.name || !userData.email) {
        console.error('TrackMate: name and email are required for identify()');
        return;
      }

      var payload = {
        company_id: this.companyId,
        sessionId: this.sessionId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        source: 'form', // Mark as form submission
        list_id: this.listId // Include list_id if set during init
      };

      this._sendRequest('/api/profile', payload);
    },

    /**
     * Track a page view
     * @param {string} pageUrl - URL of the page
     * @param {string} pageTitle - Title of the page
     */
    trackPageView: function(pageUrl, pageTitle) {
      this.track('page_view', {
        address: pageUrl || window.location.href,
        title: pageTitle || document.title,
        productInfos: []
      });
    },

    /**
     * Track a product view
     * @param {object} product - Product object with productName, price, productId
     */
    trackProductView: function(product) {
      if (!product.productName || !product.productId) {
        console.error('TrackMate: productName and productId are required');
        return;
      }

      this.track('product_view', {
        address: window.location.href,
        productInfos: [{
          productName: product.productName,
          price: product.price || 0,
          productId: product.productId
        }]
      });
    },

    /**
     * Track a purchase
     * @param {array} products - Array of product objects
     * @param {number} totalAmount - Total purchase amount
     */
    trackPurchase: function(products, totalAmount) {
      if (!Array.isArray(products) || products.length === 0) {
        console.error('TrackMate: products array is required for purchase tracking');
        return;
      }

      this.track('purchase', {
        address: window.location.href,
        totalAmount: totalAmount,
        productInfos: products.map(function(p) {
          return {
            productName: p.productName || 'Unknown',
            price: p.price || 0,
            productId: p.productId || 'unknown'
          };
        })
      });
    },

    /**
     * Track a custom event
     * @param {string} eventName - Name of the custom event
     * @param {object} properties - Event properties
     */
    trackCustom: function(eventName, properties) {
      this.track(eventName, {
        address: window.location.href,
        properties: properties || {},
        productInfos: []
      });
    },

    /**
     * Send request to TrackMate API
     * @private
     */
    _sendRequest: function(endpoint, payload) {
      var url = this.apiUrl + endpoint;

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(function(response) {
        if (!response.ok) {
          console.error('TrackMate: Request failed', response.status);
        }
        return response.json();
      })
      .then(function(data) {
        console.log('TrackMate: Event tracked successfully', data);
      })
      .catch(function(error) {
        console.error('TrackMate: Error tracking event', error);
      });
    },

    /**
     * Clear session (for testing purposes)
     */
    clearSession: function() {
      localStorage.removeItem('tm_session_id');
      this.sessionId = this._getOrCreateSessionId();
      console.log('TrackMate: Session cleared. New session ID:', this.sessionId);
    }
  };

  // Auto-track page views if enabled
  TrackMate.autoTrackPageViews = function() {
    if (this.isInitialized) {
      this.trackPageView();
    }
  };

  // Expose TrackMate to global scope
  window.TrackMate = TrackMate;

})(window);

// Optional: Auto-track page views on load
// Uncomment the line below if you want automatic page view tracking
// window.addEventListener('load', function() { TrackMate.autoTrackPageViews(); });
