// server/src/middleware/requestLogger.js
const morgan = require('morgan');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Add request ID to all requests for tracing
 */
exports.addRequestId = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Log request/response with timing
 */
exports.logRequestResponse = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.logRequest(req);

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logResponse(req, res, duration);
  });

  next();
};

/**
 * Morgan HTTP request logger
 * Logs in Apache combined format
 */
exports.morganLogger = morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  },
  // Skip logging for health check endpoints
  skip: (req) => {
    return req.url === '/health' || req.url === '/ping';
  }
});

/**
 * Morgan for development (short format, colored)
 */
exports.morganDevLogger = morgan('dev', {
  skip: (req) => {
    return req.url === '/health' || req.url === '/ping';
  }
});
