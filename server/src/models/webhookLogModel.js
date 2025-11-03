// server/src/models/webhookLogModel.js
const mongoose = require('../utils/dbConnect');

const webhookLogSchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: true,
    index: true
  },
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  status_code: {
    type: Number,
    required: true
  },
  request_payload: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  response_payload: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  error_message: {
    type: String,
    default: null
  },
  ip_address: {
    type: String,
    default: null
  },
  user_agent: {
    type: String,
    default: null
  },
  processing_time_ms: {
    type: Number,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Compound indexes for efficient queries
webhookLogSchema.index({ company_id: 1, created_at: -1 }); // For getWebhookLogs with date sorting
webhookLogSchema.index({ account_id: 1, created_at: -1 }); // For account-specific queries
webhookLogSchema.index({ company_id: 1, status_code: 1, created_at: -1 }); // For filtering by status code
webhookLogSchema.index({ company_id: 1, endpoint: 1, created_at: -1 }); // For endpoint-specific queries

const WebhookLog = mongoose.models.WebhookLog || mongoose.model('WebhookLog', webhookLogSchema);

/**
 * Create a new webhook log entry
 */
exports.createWebhookLog = async (logData) => {
  try {
    const log = new WebhookLog(logData);
    return await log.save();
  } catch (error) {
    console.error('Error creating webhook log:', error);
    throw error;
  }
};

/**
 * Get webhook logs for a specific company
 */
exports.getWebhookLogs = async (company_id, options = {}) => {
  try {
    const {
      limit = 50,
      skip = 0,
      status_code = null,
      startDate = null,
      endDate = null
    } = options;

    const query = { company_id };

    // Filter by status code if provided
    if (status_code) {
      query.status_code = status_code;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) query.created_at.$gte = new Date(startDate);
      if (endDate) query.created_at.$lte = new Date(endDate);
    }

    const logs = await WebhookLog.find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await WebhookLog.countDocuments(query);

    return {
      logs,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    throw error;
  }
};

/**
 * Get webhook log statistics for a company
 */
exports.getWebhookLogStats = async (company_id, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await WebhookLog.aggregate([
      {
        $match: {
          company_id: company_id,
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total_requests: { $sum: 1 },
          successful_requests: {
            $sum: { $cond: [{ $lt: ['$status_code', 400] }, 1, 0] }
          },
          failed_requests: {
            $sum: { $cond: [{ $gte: ['$status_code', 400] }, 1, 0] }
          },
          avg_processing_time: { $avg: '$processing_time_ms' }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        avg_processing_time: 0
      };
    }

    return stats[0];
  } catch (error) {
    console.error('Error fetching webhook log stats:', error);
    throw error;
  }
};

/**
 * Delete old webhook logs (for cleanup)
 */
exports.deleteOldWebhookLogs = async (daysToKeep = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await WebhookLog.deleteMany({
      created_at: { $lt: cutoffDate }
    });

    return result.deletedCount;
  } catch (error) {
    console.error('Error deleting old webhook logs:', error);
    throw error;
  }
};

// Export the model (for use in webhookLogController)
exports.WebhookLog = WebhookLog;
