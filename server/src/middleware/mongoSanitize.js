// Custom NoSQL injection sanitization middleware for Express 5 compatibility
const logger = require('../utils/logger');

/**
 * Recursively sanitize an object by removing MongoDB operators
 * @param {*} payload - The object to sanitize
 * @returns {*} Sanitized object
 */
function sanitizeObject(payload) {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(item => sanitizeObject(item));
  }

  if (typeof payload === 'object' && payload.constructor === Object) {
    const sanitized = {};
    for (const key in payload) {
      // Remove keys that start with $ or contain .
      if (key.startsWith('$') || key.includes('.')) {
        logger.logSecurity('nosql_injection_attempt_blocked', {
          key: key,
          message: 'MongoDB operator removed from payload'
        });
        continue; // Skip this key
      }
      sanitized[key] = sanitizeObject(payload[key]);
    }
    return sanitized;
  }

  return payload;
}

/**
 * Express middleware to sanitize req.body, req.query, and req.params
 */
module.exports = function mongoSanitizeMiddleware(req, res, next) {
  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitizeObject(req.query);
      // Replace query object properties without reassigning
      Object.keys(req.query).forEach(key => delete req.query[key]);
      Object.assign(req.query, sanitizedQuery);
    }

    if (req.params && typeof req.params === 'object') {
      const sanitizedParams = sanitizeObject(req.params);
      Object.keys(req.params).forEach(key => delete req.params[key]);
      Object.assign(req.params, sanitizedParams);
    }

    next();
  } catch (error) {
    logger.error('MongoDB sanitization middleware error', {
      request_id: req.id,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};
