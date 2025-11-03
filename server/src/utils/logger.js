// server/src/utils/logger.js
const winston = require('winston');
const path = require('path');

// Check if we're in serverless environment
const isServerless = !!(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.FUNCTION_NAME
);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create transports array
const transports = [];

// Only add file transports if NOT in serverless environment
if (!isServerless) {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'trackmate-api' },
  transports: transports
});

// Always add console in serverless, or in non-production environments
if (isServerless || process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
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
  }));
}

/**
 * Log API request
 * @param {object} req - Express request object
 * @param {object} meta - Additional metadata
 */
logger.logRequest = function(req, meta = {}) {
  this.info('API Request', {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
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
