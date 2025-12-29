// server/src/models/campaignModel.js
// Supabase version - Campaign model functions

const { db } = require('../utils/dbConnect');

/**
 * Create a new campaign
 * @param {Object} campaignData - Campaign data
 * @returns {Object} Created campaign
 */
exports.createCampaign = async (campaignData) => {
    try {
        const { data, error } = await db
            .from('campaigns')
            .insert({
                company_id: campaignData.company_id,
                name: campaignData.name,
                description: campaignData.description || '',
                subject: campaignData.subject,
                preview_text: campaignData.preview_text || '',
                from_name: campaignData.from_name,
                from_email: campaignData.from_email,
                reply_to: campaignData.reply_to || '',
                html_content: campaignData.html_content,
                text_content: campaignData.text_content || '',
                list_id: campaignData.list_id,
                status: campaignData.status || 'draft',
                scheduled_at: campaignData.scheduled_at || null,
                total_recipients: campaignData.total_recipients || 0,
                created_by: campaignData.created_by
            })
            .select()
            .single();

        if (error) throw error;

        return { ...data, _id: data.id };
    } catch (error) {
        throw error;
    }
};

/**
 * Get all campaigns for a company
 * @param {string} company_id - Company ID
 * @param {Object} options - Query options
 * @returns {Object} Campaigns and total count
 */
exports.getAllCampaigns = async (company_id, options = {}) => {
    try {
        const { limit = 50, skip = 0, status = null } = options;

        let query = db
            .from('campaigns')
            .select(`
                *,
                list:lists(*),
                creator:accounts(id, first_name, last_name, email)
            `, { count: 'exact' })
            .eq('company_id', company_id);

        if (status) {
            query = query.eq('status', status);
        }

        const { data: campaigns, error, count } = await query
            .order('created_at', { ascending: false })
            .range(skip, skip + limit - 1);

        if (error) throw error;

        // Transform to match existing API response
        const transformedCampaigns = (campaigns || []).map(campaign => ({
            ...campaign,
            _id: campaign.id,
            list_id: campaign.list ? { ...campaign.list, _id: campaign.list.id } : null,
            created_by: campaign.creator ? {
                ...campaign.creator,
                _id: campaign.creator.id,
                firstName: campaign.creator.first_name,
                lastName: campaign.creator.last_name
            } : null
        }));

        return {
            campaigns: transformedCampaigns,
            total: count || 0
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get campaign by ID
 * @param {string} campaignId - Campaign UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Campaign or null
 */
exports.getCampaignById = async (campaignId, company_id) => {
    try {
        const { data, error } = await db
            .from('campaigns')
            .select(`
                *,
                list:lists(*),
                creator:accounts(id, first_name, last_name, email)
            `)
            .eq('id', campaignId)
            .eq('company_id', company_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        if (!data) return null;

        return {
            ...data,
            _id: data.id,
            list_id: data.list ? { ...data.list, _id: data.list.id } : null,
            created_by: data.creator ? {
                ...data.creator,
                _id: data.creator.id,
                firstName: data.creator.first_name,
                lastName: data.creator.last_name
            } : null
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Update campaign
 * @param {string} campaignId - Campaign UUID
 * @param {string} company_id - Company ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated campaign or null
 */
exports.updateCampaign = async (campaignId, company_id, updateData) => {
    try {
        // Build update object (only include fields that are present)
        const updateObj = {};
        const allowedFields = [
            'name', 'description', 'subject', 'preview_text',
            'from_name', 'from_email', 'reply_to',
            'html_content', 'text_content', 'list_id',
            'status', 'scheduled_at', 'total_recipients'
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updateObj[field] = updateData[field];
            }
        }

        // updated_at will be set by trigger
        const { data, error } = await db
            .from('campaigns')
            .update(updateObj)
            .eq('id', campaignId)
            .eq('company_id', company_id)
            .select(`
                *,
                list:lists(*)
            `)
            .single();

        if (error) throw error;

        if (!data) return null;

        return {
            ...data,
            _id: data.id,
            list_id: data.list ? { ...data.list, _id: data.list.id } : null
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Delete campaign (only drafts)
 * @param {string} campaignId - Campaign UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Deleted campaign or null
 */
exports.deleteCampaign = async (campaignId, company_id) => {
    try {
        const { data, error } = await db
            .from('campaigns')
            .delete()
            .eq('id', campaignId)
            .eq('company_id', company_id)
            .eq('status', 'draft')
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data ? { ...data, _id: data.id } : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Schedule campaign
 * @param {string} campaignId - Campaign UUID
 * @param {string} company_id - Company ID
 * @param {Date|string} scheduledAt - Scheduled date/time
 * @returns {Object|null} Updated campaign or null
 */
exports.scheduleCampaign = async (campaignId, company_id, scheduledAt) => {
    try {
        const { data, error } = await db
            .from('campaigns')
            .update({
                status: 'scheduled',
                scheduled_at: new Date(scheduledAt).toISOString()
            })
            .eq('id', campaignId)
            .eq('company_id', company_id)
            .eq('status', 'draft')
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data ? { ...data, _id: data.id } : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Update campaign status
 * @param {string} campaignId - Campaign UUID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 * @returns {Object|null} Updated campaign or null
 */
exports.updateCampaignStatus = async (campaignId, status, additionalData = {}) => {
    try {
        const updateObj = {
            status,
            ...additionalData
        };

        if (status === 'sent') {
            updateObj.sent_at = new Date().toISOString();
        }

        const { data, error } = await db
            .from('campaigns')
            .update(updateObj)
            .eq('id', campaignId)
            .select()
            .single();

        if (error) throw error;

        return data ? { ...data, _id: data.id } : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Update campaign statistics
 * @param {string} campaignId - Campaign UUID
 * @param {Object} stats - Stats to increment
 * @returns {Object|null} Updated campaign or null
 */
exports.updateCampaignStats = async (campaignId, stats) => {
    try {
        // First get current stats
        const { data: current, error: fetchError } = await db
            .from('campaigns')
            .select('sent_count, delivered_count, opened_count, clicked_count, bounced_count, failed_count')
            .eq('id', campaignId)
            .single();

        if (fetchError) throw fetchError;

        // Calculate new stats
        const updateObj = {};
        for (const [key, increment] of Object.entries(stats)) {
            updateObj[key] = (current[key] || 0) + increment;
        }

        const { data, error } = await db
            .from('campaigns')
            .update(updateObj)
            .eq('id', campaignId)
            .select()
            .single();

        if (error) throw error;

        return data ? { ...data, _id: data.id } : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Get campaigns ready to send
 * @returns {Array} Campaigns ready to send
 */
exports.getCampaignsToSend = async () => {
    try {
        const { data, error } = await db
            .from('campaigns')
            .select(`
                *,
                list:lists(*)
            `)
            .eq('status', 'scheduled')
            .lte('scheduled_at', new Date().toISOString());

        if (error) throw error;

        return (data || []).map(campaign => ({
            ...campaign,
            _id: campaign.id,
            list_id: campaign.list ? { ...campaign.list, _id: campaign.list.id } : null
        }));
    } catch (error) {
        throw error;
    }
};

/**
 * Get campaign statistics
 * @param {string} campaignId - Campaign UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Campaign with calculated stats or null
 */
exports.getCampaignStats = async (campaignId, company_id) => {
    try {
        const { data: campaign, error } = await db
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .eq('company_id', company_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        if (!campaign) return null;

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
            _id: campaign.id,
            openRate: `${openRate}%`,
            clickRate: `${clickRate}%`,
            deliveryRate: `${deliveryRate}%`
        };
    } catch (error) {
        throw error;
    }
};
