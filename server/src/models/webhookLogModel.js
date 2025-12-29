// server/src/models/webhookLogModel.js
// Supabase version - Webhook Log model functions

const { db } = require('../utils/dbConnect');

/**
 * Create a new webhook log entry
 * @param {Object} logData - Log data
 * @returns {Object} Created log
 */
exports.createWebhookLog = async (logData) => {
    try {
        const { data, error } = await db
            .from('webhook_logs')
            .insert({
                company_id: logData.company_id,
                account_id: logData.account_id,
                endpoint: logData.endpoint,
                method: logData.method,
                status_code: logData.status_code,
                request_payload: logData.request_payload || null,
                response_payload: logData.response_payload || null,
                error_message: logData.error_message || null,
                ip_address: logData.ip_address || null,
                user_agent: logData.user_agent || null,
                processing_time_ms: logData.processing_time_ms || null
            })
            .select()
            .single();

        if (error) throw error;
        return { ...data, _id: data.id };
    } catch (error) {
        console.error('Error creating webhook log:', error);
        throw error;
    }
};

/**
 * Get webhook logs for a specific company
 * @param {string} company_id - Company ID
 * @param {Object} options - Query options
 * @returns {Object} Logs and pagination info
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

        let query = db
            .from('webhook_logs')
            .select('*', { count: 'exact' })
            .eq('company_id', company_id);

        // Filter by status code if provided
        if (status_code) {
            query = query.eq('status_code', status_code);
        }

        // Filter by date range if provided
        if (startDate) {
            query = query.gte('created_at', new Date(startDate).toISOString());
        }
        if (endDate) {
            query = query.lte('created_at', new Date(endDate).toISOString());
        }

        const { data: logs, error, count } = await query
            .order('created_at', { ascending: false })
            .range(skip, skip + limit - 1);

        if (error) throw error;

        const total = count || 0;

        return {
            logs: (logs || []).map(log => ({ ...log, _id: log.id })),
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
 * @param {string} company_id - Company ID
 * @param {number} days - Number of days to look back
 * @returns {Object} Statistics
 */
exports.getWebhookLogStats = async (company_id, days = 7) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Use the RPC function if available, otherwise do manual calculation
        const { data, error } = await db.rpc('get_webhook_stats', {
            p_company_id: company_id,
            p_days: days
        });

        if (error) {
            // Fallback to manual calculation if RPC function doesn't exist
            const { data: logs, error: logsError } = await db
                .from('webhook_logs')
                .select('status_code, processing_time_ms')
                .eq('company_id', company_id)
                .gte('created_at', startDate.toISOString());

            if (logsError) throw logsError;

            if (!logs || logs.length === 0) {
                return {
                    total_requests: 0,
                    successful_requests: 0,
                    failed_requests: 0,
                    avg_processing_time: 0,
                    success_rate: 0
                };
            }

            const totalRequests = logs.length;
            const successfulRequests = logs.filter(l => l.status_code < 400).length;
            const failedRequests = logs.filter(l => l.status_code >= 400).length;
            const processingTimes = logs.filter(l => l.processing_time_ms).map(l => l.processing_time_ms);
            const avgProcessingTime = processingTimes.length > 0
                ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
                : 0;

            return {
                total_requests: totalRequests,
                successful_requests: successfulRequests,
                failed_requests: failedRequests,
                avg_processing_time: Math.round(avgProcessingTime * 100) / 100,
                success_rate: Math.round((successfulRequests / totalRequests) * 10000) / 100
            };
        }

        return data?.[0] || {
            total_requests: 0,
            successful_requests: 0,
            failed_requests: 0,
            avg_processing_time: 0,
            success_rate: 0
        };
    } catch (error) {
        console.error('Error fetching webhook log stats:', error);
        throw error;
    }
};

/**
 * Delete old webhook logs (for cleanup)
 * @param {number} daysToKeep - Number of days to keep
 * @returns {number} Number of deleted logs
 */
exports.deleteOldWebhookLogs = async (daysToKeep = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const { data, error } = await db
            .from('webhook_logs')
            .delete()
            .lt('created_at', cutoffDate.toISOString())
            .select('id');

        if (error) throw error;
        return data?.length || 0;
    } catch (error) {
        console.error('Error deleting old webhook logs:', error);
        throw error;
    }
};

/**
 * Get single webhook log by ID
 * @param {string} id - Log ID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Log or null
 */
exports.getWebhookLogById = async (id, company_id) => {
    try {
        const { data, error } = await db
            .from('webhook_logs')
            .select('*')
            .eq('id', id)
            .eq('company_id', company_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data ? { ...data, _id: data.id } : null;
    } catch (error) {
        console.error('Error fetching webhook log by ID:', error);
        throw error;
    }
};
