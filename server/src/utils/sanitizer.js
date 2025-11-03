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
 * Sanitize object by escaping all string values
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
exports.sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = validator.escape(value.trim());
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

  // Event type validation
  if (data.eventType) {
    if (typeof data.eventType !== 'string' || data.eventType.trim().length === 0) {
      errors.push('Event type is required');
    } else if (data.eventType.length > 50) {
      errors.push('Event type must be less than 50 characters');
    } else {
      sanitized.eventType = validator.escape(data.eventType.trim());
    }
  }

  // Event data object sanitization
  if (data.eventData) {
    sanitized.eventData = exports.sanitizeObject(data.eventData);
  }

  // Timestamp validation
  if (data.timestamp) {
    const date = new Date(data.timestamp);
    if (isNaN(date.getTime())) {
      errors.push('Invalid timestamp format');
    } else {
      sanitized.timestamp = date;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};
