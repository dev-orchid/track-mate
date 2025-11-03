// server/src/utils/verifyWebhookKey.js
const Account = require('../models/authModel');

/**
 * Middleware to verify webhook API key
 * Checks X-TrackMate-API-Key header and validates against database
 */
const verifyWebhookKey = async (req, res, next) => {
  try {
    // Extract API key from header
    const apiKey = req.headers['x-trackmate-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required. Please provide X-TrackMate-API-Key header.'
      });
    }

    // Validate API key format
    if (!apiKey.startsWith('tm_live_') && !apiKey.startsWith('tm_test_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key format. Key must start with tm_live_ or tm_test_'
      });
    }

    // Find account by API key
    const account = await Account.findOne({ api_key: apiKey });

    if (!account) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key. Please check your credentials.'
      });
    }

    // Attach account info to request for use in controller
    req.webhook = {
      company_id: account.company_id,
      account_id: account._id,
      email: account.email
    };

    next();
  } catch (error) {
    console.error('Webhook authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

module.exports = verifyWebhookKey;
