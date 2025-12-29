// server/src/models/tagModel.js
// Supabase version - Tag model functions

const { db } = require('../utils/dbConnect');

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @returns {Object} Created tag
 */
exports.createTag = async (tagData) => {
    try {
        const { data, error } = await db
            .from('tags')
            .insert({
                name: tagData.name,
                company_id: tagData.company_id,
                color: tagData.color || '#3B82F6',
                description: tagData.description || '',
                profile_count: tagData.profile_count || 0,
                created_by: tagData.created_by
            })
            .select()
            .single();

        if (error) throw error;
        return { ...data, _id: data.id };
    } catch (error) {
        // Handle duplicate error
        if (error.code === '23505') {
            const duplicateError = new Error('Tag with this name already exists');
            duplicateError.code = 11000;
            throw duplicateError;
        }
        throw error;
    }
};

/**
 * Get all tags for a company
 * @param {string} company_id - Company ID
 * @param {Object} options - Query options
 * @returns {Object} Tags and total count
 */
exports.getAllTags = async (company_id, options = {}) => {
    try {
        const { limit = 100, skip = 0, search = '' } = options;

        let query = db
            .from('tags')
            .select('*', { count: 'exact' })
            .eq('company_id', company_id);

        // Search by name (case-insensitive)
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data: tags, error, count } = await query
            .order('created_at', { ascending: false })
            .range(skip, skip + limit - 1);

        if (error) throw error;

        return {
            tags: (tags || []).map(tag => ({ ...tag, _id: tag.id })),
            total: count || 0
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get tag by ID
 * @param {string} tagId - Tag UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Tag or null
 */
exports.getTagById = async (tagId, company_id) => {
    try {
        const { data, error } = await db
            .from('tags')
            .select('*')
            .eq('id', tagId)
            .eq('company_id', company_id)
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
 * Update tag
 * @param {string} tagId - Tag UUID
 * @param {string} company_id - Company ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated tag or null
 */
exports.updateTag = async (tagId, company_id, updateData) => {
    try {
        // updated_at will be set automatically by trigger
        const { data, error } = await db
            .from('tags')
            .update({
                name: updateData.name,
                color: updateData.color,
                description: updateData.description
            })
            .eq('id', tagId)
            .eq('company_id', company_id)
            .select()
            .single();

        if (error) throw error;
        return data ? { ...data, _id: data.id } : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete tag
 * @param {string} tagId - Tag UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Deleted tag or null
 */
exports.deleteTag = async (tagId, company_id) => {
    try {
        const { data, error } = await db
            .from('tags')
            .delete()
            .eq('id', tagId)
            .eq('company_id', company_id)
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
 * Increment or decrement profile count
 * @param {string} tagId - Tag UUID
 * @param {number} increment - Amount to increment (can be negative)
 * @returns {Object|null} Updated tag or null
 */
exports.incrementProfileCount = async (tagId, increment = 1) => {
    try {
        // First get current count
        const { data: tag, error: fetchError } = await db
            .from('tags')
            .select('profile_count')
            .eq('id', tagId)
            .single();

        if (fetchError) throw fetchError;

        const newCount = Math.max(0, (tag?.profile_count || 0) + increment);

        const { data, error } = await db
            .from('tags')
            .update({ profile_count: newCount })
            .eq('id', tagId)
            .select()
            .single();

        if (error) throw error;
        return data ? { ...data, _id: data.id } : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Update profile count to actual count
 * @param {string} tagId - Tag UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Updated tag or null
 */
exports.updateProfileCount = async (tagId, company_id) => {
    try {
        // Count actual profiles with this tag
        const { count, error: countError } = await db
            .from('profile_tags')
            .select('*', { count: 'exact', head: true })
            .eq('tag_id', tagId)
            .eq('company_id', company_id);

        if (countError) throw countError;

        const { data, error } = await db
            .from('tags')
            .update({ profile_count: count || 0 })
            .eq('id', tagId)
            .eq('company_id', company_id)
            .select()
            .single();

        if (error) throw error;
        return data ? { ...data, _id: data.id } : null;
    } catch (error) {
        throw error;
    }
};
