// server/src/utils/rateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for webhook endpoints
 * Limits requests to 100 per 15 minutes per IP address
 */
const webhookRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful requests from verified API keys
  skip: (req) => {
    // Only apply rate limiting if request doesn't have valid webhook auth
    return req.webhook && req.webhook.company_id;
  },
  // Use default keyGenerator (handles IPv6 properly)
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP address. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining
    });
  }
});

/**
 * More strict rate limiter for failed authentication attempts
 * Limits failed auth attempts to 10 per 15 minutes per IP
 */
const webhookAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 failed attempts per windowMs
  message: {
    success: false,
    error: 'Too many failed authentication attempts. Please verify your API key.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
  // Use default keyGenerator (handles IPv6 properly)
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many failed authentication attempts. Please verify your API key and try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * General API rate limiter
 * Limits requests to 500 per 15 minutes per IP
 */
const generalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: {
    success: false,
    error: 'Too many API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for internal routes
    return req.path.includes('/health') || req.path.includes('/ping');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

module.exports = {
  webhookRateLimiter,
  webhookAuthRateLimiter,
  generalApiRateLimiter
};
