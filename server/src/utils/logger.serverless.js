// server/src/utils/logger.serverless.js
// Serverless-compatible logger (console only, no file writes)
const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance with console transport only (works in serverless)
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'trackmate-api' },
  transports: [
    // Console only for serverless (Vercel captures this)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
          }
          return msg;
        })
      )
    })
  ]
});

/**
 * Log API request
 * @param {object} req - Express request object
 * @param {object} meta - Additional metadata
 */
logger.logRequest = function(req, meta = {}) {
  this.info('API Request', {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    requestId: req.id,
    ...meta
  });
};

/**
 * Log API response
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
logger.logResponse = function(req, res, duration) {
  const level = res.statusCode >= 400 ? 'warn' : 'info';
  this.log(level, 'API Response', {
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    requestId: req.id
  });
};

/**
 * Log webhook event
 * @param {string} action - Action performed
 * @param {object} meta - Metadata
 */
logger.logWebhook = function(action, meta = {}) {
  this.info('Webhook Event', {
    action,
    ...meta
  });
};

/**
 * Log authentication event
 * @param {string} action - Action performed (login, register, etc)
 * @param {object} meta - Metadata
 */
logger.logAuth = function(action, meta = {}) {
  this.info('Auth Event', {
    action,
    ...meta
  });
};

/**
 * Log database operation
 * @param {string} operation - Operation performed
 * @param {object} meta - Metadata
 */
logger.logDatabase = function(operation, meta = {}) {
  this.info('Database Operation', {
    operation,
    ...meta
  });
};

/**
 * Log security event
 * @param {string} event - Security event
 * @param {object} meta - Metadata
 */
logger.logSecurity = function(event, meta = {}) {
  this.warn('Security Event', {
    event,
    ...meta
  });
};

module.exports = logger;
