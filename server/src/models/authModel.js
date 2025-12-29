// server/src/models/authModel.js
// Supabase version - Account model functions

const { db } = require('../utils/dbConnect');

/**
 * Find account by query conditions
 * @param {Object} query - Query conditions (e.g., { email: 'test@example.com' })
 * @returns {Object|null} Account object or null
 */
async function findOne(query) {
    let queryBuilder = db.from('accounts').select('*');

    // Build query from conditions
    for (const [key, value] of Object.entries(query)) {
        queryBuilder = queryBuilder.eq(key, value);
    }

    const { data, error } = await queryBuilder.single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return data ? { ...data, _id: data.id } : null;
}

/**
 * Find account by ID
 * @param {string} id - Account UUID
 * @returns {Object|null} Account object or null
 */
async function findById(id) {
    const { data, error } = await db
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return data ? { ...data, _id: data.id } : null;
}

/**
 * Create a new account
 * @param {Object} accountData - Account data
 * @returns {Object} Created account
 */
async function create(accountData) {
    const { data, error } = await db
        .from('accounts')
        .insert({
            auth_user_id: accountData.auth_user_id,
            first_name: accountData.firstName,
            last_name: accountData.lastName,
            email: accountData.email,
            company_name: accountData.company_name,
            company_id: accountData.company_id,
            api_key: accountData.api_key,
            api_key_created_at: accountData.api_key_created_at
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, _id: data.id };
}

/**
 * Update account by ID
 * @param {string} id - Account UUID
 * @param {Object} updateData - Data to update (can be raw object or { $set: {...} })
 * @param {Object} options - Options like { new: true, select: '...' }
 * @returns {Object|null} Updated account or null
 */
async function findByIdAndUpdate(id, updateData, options = {}) {
    // Handle Mongoose-style $set operator
    const data = updateData.$set || updateData;

    // Map field names from Mongoose style to Supabase style
    const mappedData = {};
    for (const [key, value] of Object.entries(data)) {
        if (key === 'firstName') mappedData.first_name = value;
        else if (key === 'lastName') mappedData.last_name = value;
        else mappedData[key] = value;
    }

    let query = db.from('accounts').update(mappedData).eq('id', id);

    // Handle field selection
    if (options.select) {
        // Convert Mongoose-style select string to Supabase format
        const selectFields = options.select
            .split(' ')
            .filter(f => !f.startsWith('-'))
            .map(f => {
                if (f === 'firstName') return 'first_name';
                if (f === 'lastName') return 'last_name';
                return f;
            })
            .join(', ') || '*';
        query = query.select(selectFields);
    } else {
        query = query.select('*');
    }

    const { data: result, error } = await query.single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return options.new !== false ? { ...result, _id: result.id } : null;
}

/**
 * Find account by API key
 * @param {string} apiKey - API key
 * @returns {Object|null} Account object or null
 */
async function findByApiKey(apiKey) {
    const { data, error } = await db
        .from('accounts')
        .select('*')
        .eq('api_key', apiKey)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return data ? { ...data, _id: data.id } : null;
}

// Export as both default and named exports for compatibility
module.exports = {
    findOne,
    findById,
    create,
    findByIdAndUpdate,
    findByApiKey
};

// Also export as default for code that does: const Account = require('./authModel')
module.exports.default = module.exports;
