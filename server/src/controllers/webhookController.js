// server/src/controllers/webhookController.js
const mongoose = require('../utils/dbConnect');
const Profile = mongoose.model('Profile');
const Event = mongoose.model('Event');
const sanitizer = require('../utils/sanitizer');
const logger = require('../utils/logger');

/**
 * Handle incoming webhook events from customer servers
 * Binds events to users via email, sessionId, or userId
 */
exports.handleWebhookEvent = async (req, res) => {
  try {
    const { identifier, eventType, eventData, timestamp } = req.body;
    const company_id = req.webhook.company_id; // From verifyWebhookKey middleware

    // Validation
    if (!identifier || !eventType) {
      logger.logSecurity('webhook_validation_failed', {
        request_id: req.id,
        company_id: company_id,
        error: 'Missing identifier or eventType',
        ip: req.ip
      });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: identifier and eventType are required'
      });
    }

    // Sanitize identifier data
    let sanitizedEmail = null;
    let sanitizedName = null;
    let sanitizedPhone = null;
    let sanitizedSessionId = null;

    if (identifier.email) {
      sanitizedEmail = sanitizer.sanitizeEmail(identifier.email);
      if (!sanitizedEmail) {
        logger.logSecurity('webhook_invalid_email', {
          request_id: req.id,
          company_id: company_id,
          provided_email: identifier.email,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
    }

    if (identifier.name) {
      sanitizedName = sanitizer.sanitizeString(identifier.name);
    }

    if (identifier.phone) {
      sanitizedPhone = sanitizer.sanitizePhone(identifier.phone);
    }

    if (identifier.sessionId) {
      sanitizedSessionId = sanitizer.sanitizeString(identifier.sessionId);
    }

    // Sanitize eventType and eventData
    const sanitizedEventType = sanitizer.sanitizeString(eventType);
    const sanitizedEventData = eventData ? sanitizer.sanitizeObject(eventData) : {};

    // Step 1: Find or create profile based on identifier
    let profile = null;
    let sessionId = null;

    if (sanitizedEmail) {
      // Method 1: Email-based binding (RECOMMENDED)
      profile = await Profile.findOne({
        email: sanitizedEmail,
        company_id: company_id
      });

      if (!profile) {
        // Create new profile if doesn't exist
        profile = await Profile.create({
          email: sanitizedEmail,
          name: sanitizedName || 'Unknown',
          phone: sanitizedPhone || null,
          company_id: company_id,
          createdAt: new Date(),
          lastActive: new Date()
        });

        logger.logWebhook('profile_created_via_webhook', {
          request_id: req.id,
          company_id: company_id,
          profile_id: profile._id,
          email: sanitizedEmail
        });
      }

      sessionId = sanitizedSessionId || `webhook_${Date.now()}_email`;
    }
    else if (identifier.userId) {
      // Method 2: Direct profile ID binding
      const sanitizedUserId = sanitizer.sanitizeString(identifier.userId);
      profile = await Profile.findOne({
        _id: sanitizedUserId,
        company_id: company_id
      });

      if (!profile) {
        logger.logSecurity('webhook_profile_not_found', {
          request_id: req.id,
          company_id: company_id,
          user_id: sanitizedUserId,
          ip: req.ip
        });
        return res.status(404).json({
          success: false,
          error: 'Profile not found with provided userId'
        });
      }

      sessionId = sanitizedSessionId || `webhook_${Date.now()}_userid`;
    }
    else if (sanitizedSessionId) {
      // Method 3: Session ID binding (find user from existing session)
      const existingEvent = await Event.findOne({
        sessionId: sanitizedSessionId,
        company_id: company_id,
        userId: { $ne: null }
      });

      if (existingEvent && existingEvent.userId) {
        profile = await Profile.findById(existingEvent.userId);
        sessionId = sanitizedSessionId;
      } else {
        logger.logSecurity('webhook_session_not_found', {
          request_id: req.id,
          company_id: company_id,
          session_id: sanitizedSessionId,
          ip: req.ip
        });
        return res.status(400).json({
          success: false,
          error: 'No identified user found with this sessionId. User must identify first.'
        });
      }
    }
    else {
      return res.status(400).json({
        success: false,
        error: 'Identifier must include email, userId, or sessionId'
      });
    }

    if (!profile) {
      logger.logSecurity('webhook_user_identification_failed', {
        request_id: req.id,
        company_id: company_id,
        ip: req.ip
      });
      return res.status(404).json({
        success: false,
        error: 'Unable to identify user. Please provide valid identifier.'
      });
    }

    // Step 2: Create event linked to profile
    const eventPayload = {
      userId: profile._id,
      company_id: company_id,
      sessionId: sessionId,
      events: [{
        eventType: sanitizedEventType,
        eventData: sanitizedEventData,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }]
    };

    const eventResult = await Event.create(eventPayload);

    logger.logWebhook('webhook_event_processed', {
      request_id: req.id,
      company_id: company_id,
      profile_id: profile._id,
      event_id: eventResult._id,
      event_type: sanitizedEventType
    });

    // Step 3: Update profile lastActive
    profile.lastActive = new Date();
    await profile.save();

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Webhook event processed successfully',
      eventId: eventResult._id,
      profileId: profile._id,
      eventType: sanitizedEventType
    });

  } catch (error) {
    logger.error('Webhook event handling error', {
      request_id: req.id,
      company_id: req.webhook?.company_id,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

/**
 * Get webhook API key for authenticated user
 */
exports.getWebhookInfo = async (req, res) => {
  try {
    const company_id = req.webhook.company_id;
    const account_id = req.webhook.account_id;

    const Account = require('../models/authModel');
    const account = await Account.findById(account_id).select('api_key api_key_created_at company_id');

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    return res.status(200).json({
      success: true,
      api_key: account.api_key,
      api_key_created_at: account.api_key_created_at,
      company_id: account.company_id,
      webhook_endpoint: `${req.protocol}://${req.get('host')}/api/webhooks/events`
    });

  } catch (error) {
    logger.error('Get webhook info error', {
      request_id: req.id,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};
