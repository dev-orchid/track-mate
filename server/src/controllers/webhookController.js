// server/src/controllers/webhookController.js
// Supabase version
const profileModel = require('../models/profileModel');
const eventsModel = require('../models/eventsModel');
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
      profile = await profileModel.findByEmail(sanitizedEmail, company_id);

      if (!profile) {
        // Create new profile if doesn't exist
        const profileResult = await profileModel.profileCreation({
          email: sanitizedEmail,
          name: sanitizedName || 'Unknown',
          phone: sanitizedPhone || null,
          company_id: company_id,
          source: 'webhook',
          sessionId: sanitizedSessionId || `webhook_${Date.now()}_email`
        });

        if (profileResult.id === 1 && profileResult.response) {
          profile = profileResult.response;
        }

        logger.logWebhook('profile_created_via_webhook', {
          request_id: req.id,
          company_id: company_id,
          profile_id: profile?._id || profile?.id,
          email: sanitizedEmail
        });
      }

      sessionId = sanitizedSessionId || `webhook_${Date.now()}_email`;
    }
    else if (identifier.userId) {
      // Method 2: Direct profile ID binding
      const sanitizedUserId = sanitizer.sanitizeString(identifier.userId);
      profile = await profileModel.findById(sanitizedUserId, company_id);

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
      const existingSession = await eventsModel.findSessionWithProfile(sanitizedSessionId, company_id);

      if (existingSession && existingSession.userId) {
        profile = existingSession.userId; // Profile is populated
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

    const profileId = profile._id || profile.id;

    // Step 2: Create event linked to profile
    const eventPayload = {
      userId: profileId,
      company_id: company_id,
      sessionId: sessionId,
      events: [{
        eventType: sanitizedEventType,
        eventData: sanitizedEventData,
        timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
      }]
    };

    const eventResult = await eventsModel.eventCreation(eventPayload);

    logger.logWebhook('webhook_event_processed', {
      request_id: req.id,
      company_id: company_id,
      profile_id: profileId,
      event_id: eventResult.response?._id || eventResult.response?.id,
      event_type: sanitizedEventType
    });

    // Step 3: Update profile lastActive
    await profileModel.updateLastActive(profileId);

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Webhook event processed successfully',
      eventId: eventResult.response?._id || eventResult.response?.id,
      profileId: profileId,
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
    const account = await Account.findById(account_id);

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
