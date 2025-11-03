// server/src/models/campaignModel.js
const mongoose = require('../utils/dbConnect');

const campaignSchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },

  // Email Content
  subject: {
    type: String,
    required: true
  },
  preview_text: {
    type: String,
    default: ''
  },
  from_name: {
    type: String,
    required: true
  },
  from_email: {
    type: String,
    required: true
  },
  reply_to: {
    type: String,
    default: ''
  },
  html_content: {
    type: String,
    required: true
  },
  text_content: {
    type: String,
    default: ''
  },

  // Target List
  list_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },

  // Status and Scheduling
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'paused'],
    default: 'draft'
  },
  scheduled_at: {
    type: Date,
    default: null
  },
  sent_at: {
    type: Date,
    default: null
  },

  // Statistics
  total_recipients: {
    type: Number,
    default: 0
  },
  sent_count: {
    type: Number,
    default: 0
  },
  delivered_count: {
    type: Number,
    default: 0
  },
  opened_count: {
    type: Number,
    default: 0
  },
  clicked_count: {
    type: Number,
    default: 0
  },
  bounced_count: {
    type: Number,
    default: 0
  },
  failed_count: {
    type: Number,
    default: 0
  },

  // Error tracking
  last_error: {
    type: String,
    default: null
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Indexes
campaignSchema.index({ company_id: 1, created_at: -1 });
campaignSchema.index({ company_id: 1, status: 1 });
campaignSchema.index({ list_id: 1, company_id: 1 });
campaignSchema.index({ scheduled_at: 1, status: 1 }); // For job scheduling

const Campaign = mongoose.model('Campaign', campaignSchema);

/**
 * Create a new campaign
 */
exports.createCampaign = async (campaignData) => {
  try {
    const campaign = new Campaign(campaignData);
    return await campaign.save();
  } catch (error) {
    throw error;
  }
};

/**
 * Get all campaigns for a company
 */
exports.getAllCampaigns = async (company_id, options = {}) => {
  try {
    const { limit = 50, skip = 0, status = null } = options;

    const query = { company_id };

    if (status) {
      query.status = status;
    }

    const campaigns = await Campaign.find(query)
      .populate('list_id')
      .populate('created_by', 'firstName lastName email')
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Campaign.countDocuments(query);

    return { campaigns, total };
  } catch (error) {
    throw error;
  }
};

/**
 * Get campaign by ID
 */
exports.getCampaignById = async (campaignId, company_id) => {
  try {
    return await Campaign.findOne({ _id: campaignId, company_id })
      .populate('list_id')
      .populate('created_by', 'firstName lastName email')
      .lean();
  } catch (error) {
    throw error;
  }
};

/**
 * Update campaign
 */
exports.updateCampaign = async (campaignId, company_id, updateData) => {
  try {
    updateData.updated_at = new Date();
    return await Campaign.findOneAndUpdate(
      { _id: campaignId, company_id },
      { $set: updateData },
      { new: true }
    ).populate('list_id');
  } catch (error) {
    throw error;
  }
};

/**
 * Delete campaign
 */
exports.deleteCampaign = async (campaignId, company_id) => {
  try {
    // Only allow deletion of draft campaigns
    return await Campaign.findOneAndDelete({
      _id: campaignId,
      company_id,
      status: 'draft'
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Schedule campaign
 */
exports.scheduleCampaign = async (campaignId, company_id, scheduledAt) => {
  try {
    return await Campaign.findOneAndUpdate(
      { _id: campaignId, company_id, status: 'draft' },
      {
        $set: {
          status: 'scheduled',
          scheduled_at: scheduledAt,
          updated_at: new Date()
        }
      },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Update campaign status
 */
exports.updateCampaignStatus = async (campaignId, status, additionalData = {}) => {
  try {
    const updateData = {
      status,
      updated_at: new Date(),
      ...additionalData
    };

    if (status === 'sent') {
      updateData.sent_at = new Date();
    }

    return await Campaign.findByIdAndUpdate(
      campaignId,
      { $set: updateData },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Update campaign statistics
 */
exports.updateCampaignStats = async (campaignId, stats) => {
  try {
    return await Campaign.findByIdAndUpdate(
      campaignId,
      {
        $inc: stats,
        $set: { updated_at: new Date() }
      },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get campaigns ready to send
 * (Status: scheduled, scheduled_at <= now)
 */
exports.getCampaignsToSend = async () => {
  try {
    return await Campaign.find({
      status: 'scheduled',
      scheduled_at: { $lte: new Date() }
    })
      .populate('list_id')
      .lean();
  } catch (error) {
    throw error;
  }
};

/**
 * Get campaign statistics
 */
exports.getCampaignStats = async (campaignId, company_id) => {
  try {
    const campaign = await Campaign.findOne({ _id: campaignId, company_id }).lean();

    if (!campaign) {
      return null;
    }

    const openRate = campaign.sent_count > 0
      ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(2)
      : 0;

    const clickRate = campaign.sent_count > 0
      ? ((campaign.clicked_count / campaign.sent_count) * 100).toFixed(2)
      : 0;

    const deliveryRate = campaign.total_recipients > 0
      ? ((campaign.delivered_count / campaign.total_recipients) * 100).toFixed(2)
      : 0;

    return {
      ...campaign,
      openRate: `${openRate}%`,
      clickRate: `${clickRate}%`,
      deliveryRate: `${deliveryRate}%`
    };
  } catch (error) {
    throw error;
  }
};

// Export the model
exports.Campaign = Campaign;
