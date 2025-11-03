// server/src/utils/webhookLogger.js
const { createWebhookLog } = require('../models/webhookLogModel');

/**
 * Middleware to log webhook requests
 * Should be used after verifyWebhookKey middleware
 */
const webhookLogger = (req, res, next) => {
  const startTime = Date.now();

  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);

  // Override res.json to capture response data
  res.json = function(data) {
    const processingTime = Date.now() - startTime;

    // Log the webhook request asynchronously (don't wait for it)
    const logData = {
      company_id: req.webhook?.company_id || 'unknown',
      account_id: req.webhook?.account_id || null,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      status_code: res.statusCode,
      request_payload: {
        headers: {
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        },
        body: req.body || null
      },
      response_payload: data,
      error_message: data.error || null,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent'] || null,
      processing_time_ms: processingTime
    };

    // Log asynchronously
    createWebhookLog(logData).catch(err => {
      console.error('Failed to create webhook log:', err);
    });

    // Call original res.json
    return originalJson(data);
  };

  next();
};

module.exports = webhookLogger;
