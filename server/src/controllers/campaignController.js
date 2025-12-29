// server/src/controllers/campaignController.js
const campaignModel = require('../models/campaignModel');
const listModel = require('../models/listModel');
const sanitizer = require('../utils/sanitizer');
const logger = require('../utils/logger');

/**
 * Create a new campaign
 */
exports.createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      subject,
      preview_text,
      from_name,
      from_email,
      reply_to,
      html_content,
      text_content,
      list_id
    } = req.body;

    const company_id = req.user.company_id;
    const created_by = req.user.userId;

    // Validate required fields
    if (!name || !subject || !from_name || !from_email || !html_content || !list_id) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, subject, from_name, from_email, html_content, list_id'
      });
    }

    // Verify list exists and belongs to company
    const list = await listModel.getListById(list_id, company_id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Sanitize inputs - use sanitizeName for names/descriptions to preserve apostrophes
    const campaignData = {
      company_id,
      created_by,
      name: sanitizer.sanitizeName(name),
      description: description ? sanitizer.sanitizeName(description) : '',
      subject: sanitizer.sanitizeName(subject),
      preview_text: preview_text ? sanitizer.sanitizeName(preview_text) : '',
      from_name: sanitizer.sanitizeName(from_name),
      from_email: sanitizer.sanitizeEmail(from_email),
      reply_to: reply_to ? sanitizer.sanitizeEmail(reply_to) : '',
      html_content,
      text_content: text_content || '',
      list_id,
      total_recipients: list.profile_count || 0
    };

    if (!campaignData.from_email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid from_email format'
      });
    }

    const campaign = await campaignModel.createCampaign(campaignData);

    logger.logRequest(req, {
      action: 'campaign_created',
      campaign_id: campaign._id,
      campaign_name: campaign.name,
      list_id: list_id
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error) {
    logger.error('Create campaign error', {
      request_id: req.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all campaigns
 */
exports.getAllCampaigns = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { limit, skip, status } = req.query;

    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      status: status || null
    };

    const { campaigns, total } = await campaignModel.getAllCampaigns(company_id, options);

    res.json({
      success: true,
      campaigns,
      total,
      page: Math.floor(options.skip / options.limit) + 1,
      totalPages: Math.ceil(total / options.limit)
    });
  } catch (error) {
    logger.error('Get all campaigns error', {
      request_id: req.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get campaign by ID
 */
exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    const campaign = await campaignModel.getCampaignById(id, company_id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    logger.error('Get campaign by ID error', {
      request_id: req.id,
      campaign_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update campaign
 */
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    // Only allow updating draft campaigns
    const existingCampaign = await campaignModel.getCampaignById(id, company_id);
    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (existingCampaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft campaigns can be updated'
      });
    }

    const updateData = {};
    const {
      name,
      description,
      subject,
      preview_text,
      from_name,
      from_email,
      reply_to,
      html_content,
      text_content
    } = req.body;

    if (name) updateData.name = sanitizer.sanitizeName(name);
    if (description !== undefined) updateData.description = sanitizer.sanitizeName(description);
    if (subject) updateData.subject = sanitizer.sanitizeName(subject);
    if (preview_text !== undefined) updateData.preview_text = sanitizer.sanitizeName(preview_text);
    if (from_name) updateData.from_name = sanitizer.sanitizeName(from_name);
    if (from_email) {
      const sanitizedEmail = sanitizer.sanitizeEmail(from_email);
      if (!sanitizedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Invalid from_email format'
        });
      }
      updateData.from_email = sanitizedEmail;
    }
    if (reply_to !== undefined) {
      const sanitizedReply = sanitizer.sanitizeEmail(reply_to);
      updateData.reply_to = sanitizedReply || '';
    }
    if (html_content) updateData.html_content = html_content;
    if (text_content !== undefined) updateData.text_content = text_content;

    const campaign = await campaignModel.updateCampaign(id, company_id, updateData);

    logger.logRequest(req, {
      action: 'campaign_updated',
      campaign_id: campaign._id
    });

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign
    });
  } catch (error) {
    logger.error('Update campaign error', {
      request_id: req.id,
      campaign_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete campaign
 */
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    const campaign = await campaignModel.deleteCampaign(id, company_id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or cannot be deleted (only draft campaigns can be deleted)'
      });
    }

    logger.logRequest(req, {
      action: 'campaign_deleted',
      campaign_id: id
    });

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Delete campaign error', {
      request_id: req.id,
      campaign_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Schedule or send campaign
 */
exports.sendCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduled_at } = req.body; // ISO date string or "now"
    const company_id = req.user.company_id;

    const campaign = await campaignModel.getCampaignById(id, company_id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft campaigns can be sent'
      });
    }

    // Determine send time
    let sendTime;
    if (scheduled_at === 'now' || !scheduled_at) {
      sendTime = new Date();
    } else {
      sendTime = new Date(scheduled_at);
      if (sendTime < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled time must be in the future'
        });
      }
    }

    // Update campaign status
    const updatedCampaign = await campaignModel.scheduleCampaign(id, company_id, sendTime);

    logger.logRequest(req, {
      action: 'campaign_scheduled',
      campaign_id: id,
      scheduled_at: sendTime
    });

    // If sending now, trigger the send job
    if (scheduled_at === 'now' || !scheduled_at) {
      // Import the campaign processor
      const { processCampaign } = require('../utils/campaignProcessor');

      // Process campaign asynchronously (don't await)
      processCampaign(updatedCampaign._id).catch(error => {
        logger.error('Campaign processing error', {
          campaign_id: id,
          error: error.message
        });
      });

      res.json({
        success: true,
        message: 'Campaign is being sent',
        campaign: updatedCampaign
      });
    } else {
      res.json({
        success: true,
        message: `Campaign scheduled for ${sendTime.toISOString()}`,
        campaign: updatedCampaign
      });
    }
  } catch (error) {
    logger.error('Send campaign error', {
      request_id: req.id,
      campaign_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get campaign statistics
 */
exports.getCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    const stats = await campaignModel.getCampaignStats(id, company_id);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Get campaign stats error', {
      request_id: req.id,
      campaign_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
