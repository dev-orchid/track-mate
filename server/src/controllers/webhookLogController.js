// server/src/controllers/webhookLogController.js
const webhookLogModel = require('../models/webhookLogModel');

/**
 * Get webhook logs for the authenticated company
 * GET /api/webhooks/logs
 */
exports.getWebhookLogs = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    // Extract query parameters
    const {
      page = 1,
      limit = 50,
      status_code = null,
      startDate = null,
      endDate = null
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      skip: skip,
      status_code: status_code ? parseInt(status_code) : null,
      startDate,
      endDate
    };

    const result = await webhookLogModel.getWebhookLogs(company_id, options);

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webhook logs'
    });
  }
};

/**
 * Get webhook log statistics
 * GET /api/webhooks/logs/stats
 */
exports.getWebhookLogStats = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { days = 7 } = req.query;

    const stats = await webhookLogModel.getWebhookLogStats(company_id, parseInt(days));

    res.json({
      success: true,
      data: stats,
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error('Error fetching webhook log stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webhook log statistics'
    });
  }
};

/**
 * Get a single webhook log by ID
 * GET /api/webhooks/logs/:id
 */
exports.getWebhookLogById = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    const { WebhookLog } = require('../models/webhookLogModel');
    const log = await WebhookLog.findOne({
      _id: id,
      company_id: company_id
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Webhook log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error fetching webhook log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webhook log'
    });
  }
};
