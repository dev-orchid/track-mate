// server/src/utils/sanitizer.js
const validator = require('validator');

/**
 * Sanitize user inputs to prevent XSS attacks
 * This utility provides functions to clean and validate user-provided data
 */

/**
 * Sanitize a string by escaping HTML entities
 * @param {string} str - Input string to sanitize
 * @returns {string} - Sanitized string
 */
exports.sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(str.trim());
};

/**
 * Sanitize and validate email
 * @param {string} email - Email to sanitize and validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
exports.sanitizeEmail = (email) => {
  if (typeof email !== 'string') return null;

  const normalized = validator.normalizeEmail(email.trim().toLowerCase());

  if (!normalized || !validator.isEmail(normalized)) {
    return null;
  }

  return normalized;
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string|null} - Sanitized phone or null if invalid
 */
exports.sanitizePhone = (phone) => {
  if (!phone) return null;
  if (typeof phone !== 'string') return null;

  // Remove all non-numeric characters except + at the start
  const cleaned = phone.trim().replace(/[^\d+]/g, '');

  // Basic validation: should have at least 10 digits
  const digitCount = cleaned.replace(/\+/g, '').length;
  if (digitCount < 10 || digitCount > 15) {
    return null;
  }

  return cleaned;
};

/**
 * Sanitize a URL - validate and clean without HTML escaping
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL or original if invalid
 */
exports.sanitizeUrl = (url) => {
  if (typeof url !== 'string') return url;

  const trimmed = url.trim();

  // Check if it's a valid URL
  if (validator.isURL(trimmed, { require_protocol: true })) {
    // Remove any potential javascript: or data: protocols for safety
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
      return '';
    }
    return trimmed;
  }

  // If it looks like a URL but missing protocol, try adding https://
  if (validator.isURL(trimmed, { require_protocol: false })) {
    const withProtocol = 'https://' + trimmed;
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
      return '';
    }
    return withProtocol;
  }

  // Not a URL, return escaped version
  return validator.escape(trimmed);
};

/**
 * Sanitize object by escaping string values, but preserve URLs
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
exports.sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};

  // Keys that typically contain URLs - don't HTML escape these
  const urlKeys = ['address', 'url', 'href', 'src', 'link', 'redirect', 'callback'];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        // Check if this key typically contains URLs or if value looks like a URL
        const isUrlKey = urlKeys.includes(key.toLowerCase());
        const looksLikeUrl = /^https?:\/\//i.test(value.trim());

        if (isUrlKey || looksLikeUrl) {
          sanitized[key] = exports.sanitizeUrl(value);
        } else {
          sanitized[key] = validator.escape(value.trim());
        }
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item =>
          typeof item === 'string' ? validator.escape(item.trim()) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = exports.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Validate and sanitize profile data
 * @param {object} data - Profile data to sanitize
 * @returns {object} - { isValid: boolean, sanitized: object, errors: array }
 */
exports.sanitizeProfileData = (data) => {
  const errors = [];
  const sanitized = {};

  // Name validation and sanitization
  if (data.name) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    } else if (data.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    } else {
      sanitized.name = validator.escape(data.name.trim());
    }
  }

  // Email validation and sanitization
  if (data.email) {
    const email = exports.sanitizeEmail(data.email);
    if (!email) {
      errors.push('Invalid email format');
    } else {
      sanitized.email = email;
    }
  }

  // Phone validation and sanitization
  if (data.phone) {
    const phone = exports.sanitizePhone(data.phone);
    if (!phone) {
      errors.push('Invalid phone number format');
    } else {
      sanitized.phone = phone;
    }
  }

  // Company ID validation (should be alphanumeric + hyphen)
  if (data.company_id) {
    if (typeof data.company_id === 'string' && /^TM-[A-Z0-9]+$/.test(data.company_id)) {
      sanitized.company_id = data.company_id;
    } else {
      errors.push('Invalid company ID format');
    }
  }

  // Session ID validation
  if (data.sessionId) {
    if (typeof data.sessionId === 'string' && data.sessionId.length > 0) {
      sanitized.sessionId = validator.escape(data.sessionId);
    }
  }

  // List ID validation (should be alphanumeric + hyphen, format: LST-XXXXXX)
  if (data.list_id) {
    if (typeof data.list_id === 'string' && /^LST-[A-Z0-9]+$/i.test(data.list_id)) {
      sanitized.list_id = data.list_id.toUpperCase();
    }
  }

  // Source validation (pixel, form, api, webhook)
  if (data.source) {
    const validSources = ['pixel', 'form', 'api', 'webhook'];
    if (validSources.includes(data.source)) {
      sanitized.source = data.source;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};

/**
 * Validate and sanitize event data
 * @param {object} data - Event data to sanitize
 * @returns {object} - { isValid: boolean, sanitized: object, errors: array }
 */
exports.sanitizeEventData = (data) => {
  const errors = [];
  const sanitized = {};

  // Company ID validation
  if (data.company_id) {
    if (typeof data.company_id === 'string' && /^TM-[A-Z0-9]+$/.test(data.company_id)) {
      sanitized.company_id = data.company_id;
    } else {
      errors.push('Invalid company ID format');
    }
  }

  // Session ID validation
  if (data.sessionId) {
    if (typeof data.sessionId === 'string' && data.sessionId.length > 0) {
      sanitized.sessionId = validator.escape(data.sessionId);
    }
  }

  // List ID validation (optional)
  if (data.list_id) {
    if (typeof data.list_id === 'string' && /^LST-[A-Z0-9]+$/.test(data.list_id)) {
      sanitized.list_id = data.list_id;
    } else {
      errors.push('Invalid list ID format');
    }
  }

  // Returning user validation (for returning visitors)
  if (data.returning_user && typeof data.returning_user === 'object') {
    const returningUser = {};

    // Validate and sanitize email
    if (data.returning_user.email) {
      const email = exports.sanitizeEmail(data.returning_user.email);
      if (email) {
        returningUser.email = email;
      }
    }

    // Sanitize name if provided
    if (data.returning_user.name) {
      returningUser.name = validator.escape(String(data.returning_user.name).trim());
    }

    // Sanitize phone if provided
    if (data.returning_user.phone) {
      const phone = exports.sanitizePhone(data.returning_user.phone);
      if (phone) {
        returningUser.phone = phone;
      }
    }

    // Only include if we have at least an email
    if (returningUser.email) {
      sanitized.returning_user = returningUser;
    }
  }

  // Events array validation
  if (data.events && Array.isArray(data.events)) {
    sanitized.events = data.events.map(event => {
      const sanitizedEvent = {};

      // Event type validation
      if (event.eventType) {
        if (typeof event.eventType !== 'string' || event.eventType.trim().length === 0) {
          errors.push('Event type is required');
        } else if (event.eventType.length > 50) {
          errors.push('Event type must be less than 50 characters');
        } else {
          sanitizedEvent.eventType = validator.escape(event.eventType.trim());
        }
      }

      // Event data object sanitization
      if (event.eventData) {
        sanitizedEvent.eventData = exports.sanitizeObject(event.eventData);
      }

      // Timestamp validation
      if (event.timestamp) {
        const date = new Date(event.timestamp);
        if (isNaN(date.getTime())) {
          errors.push('Invalid timestamp format');
        } else {
          sanitizedEvent.timestamp = date;
        }
      }

      return sanitizedEvent;
    });
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};
