// server/src/models/profileTagModel.js
// Supabase version - ProfileTag model functions (junction table)

const { db } = require('../utils/dbConnect');

/**
 * Add tag to profile
 * @param {string} profileId - Profile UUID
 * @param {string} tagId - Tag UUID
 * @param {string} company_id - Company ID
 * @param {string} added_by - How the tag was added
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Created profile tag
 */
exports.addTagToProfile = async (profileId, tagId, company_id, added_by = 'manual', metadata = {}) => {
    try {
        const { data, error } = await db
            .from('profile_tags')
            .insert({
                profile_id: profileId,
                tag_id: tagId,
                company_id,
                added_by,
                metadata
            })
            .select()
            .single();

        if (error) {
            // Handle duplicate error - return existing
            if (error.code === '23505') {
                const { data: existing } = await db
                    .from('profile_tags')
                    .select('*')
                    .eq('profile_id', profileId)
                    .eq('tag_id', tagId)
                    .eq('company_id', company_id)
                    .single();
                return existing ? { ...existing, _id: existing.id } : null;
            }
            throw error;
        }

        return { ...data, _id: data.id };
    } catch (error) {
        throw error;
    }
};

/**
 * Remove tag from profile
 * @param {string} profileId - Profile UUID
 * @param {string} tagId - Tag UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Deleted profile tag or null
 */
exports.removeTagFromProfile = async (profileId, tagId, company_id) => {
    try {
        const { data, error } = await db
            .from('profile_tags')
            .delete()
            .eq('profile_id', profileId)
            .eq('tag_id', tagId)
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
 * Get all tags for a profile
 * @param {string} profileId - Profile UUID
 * @param {string} company_id - Company ID
 * @returns {Array} Profile tags with tag details
 */
exports.getProfileTags = async (profileId, company_id) => {
    try {
        const { data, error } = await db
            .from('profile_tags')
            .select(`
                *,
                tag:tags(*)
            `)
            .eq('profile_id', profileId)
            .eq('company_id', company_id);

        if (error) throw error;

        // Transform to match existing format (tag_id populated)
        return (data || []).map(pt => ({
            ...pt,
            _id: pt.id,
            tag_id: pt.tag ? { ...pt.tag, _id: pt.tag.id } : null
        }));
    } catch (error) {
        throw error;
    }
};

/**
 * Get all profiles with a specific tag
 * @param {string} tagId - Tag UUID
 * @param {string} company_id - Company ID
 * @param {Object} options - Query options
 * @returns {Object} Profiles and total count
 */
exports.getProfilesByTag = async (tagId, company_id, options = {}) => {
    try {
        const { limit = 50, skip = 0 } = options;

        // Get profile IDs with this tag
        const { data: profileTags, error, count } = await db
            .from('profile_tags')
            .select(`
                *,
                profile:profiles(*)
            `, { count: 'exact' })
            .eq('tag_id', tagId)
            .eq('company_id', company_id)
            .range(skip, skip + limit - 1);

        if (error) throw error;

        const profiles = (profileTags || [])
            .map(pt => pt.profile)
            .filter(p => p !== null)
            .map(p => ({ ...p, _id: p.id }));

        return {
            profiles,
            total: count || 0
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get profiles by multiple tags with AND/OR logic
 * @param {Array} tagIds - Array of tag UUIDs
 * @param {string} company_id - Company ID
 * @param {string} logic - 'any' (OR) or 'all' (AND)
 * @param {Object} options - Query options
 * @returns {Object} Profiles and total count
 */
exports.getProfilesByTags = async (tagIds, company_id, logic = 'any', options = {}) => {
    try {
        const { limit = 50, skip = 0 } = options;

        if (logic === 'all') {
            // AND logic - use RPC function or manual query
            const { data, error } = await db.rpc('get_profiles_with_all_tags', {
                p_tag_ids: tagIds,
                p_company_id: company_id,
                p_tag_count: tagIds.length
            });

            if (error) {
                // Fallback to manual query if RPC doesn't exist
                const { data: profileTags, error: ptError } = await db
                    .from('profile_tags')
                    .select('profile_id')
                    .eq('company_id', company_id)
                    .in('tag_id', tagIds);

                if (ptError) throw ptError;

                // Count occurrences of each profile_id
                const profileCounts = {};
                for (const pt of profileTags || []) {
                    profileCounts[pt.profile_id] = (profileCounts[pt.profile_id] || 0) + 1;
                }

                // Filter profiles that have ALL tags
                const profileIds = Object.entries(profileCounts)
                    .filter(([, count]) => count === tagIds.length)
                    .map(([id]) => id);

                if (profileIds.length === 0) {
                    return { profiles: [], total: 0 };
                }

                const { data: profiles, error: pError } = await db
                    .from('profiles')
                    .select('*')
                    .eq('company_id', company_id)
                    .in('id', profileIds)
                    .range(skip, skip + limit - 1);

                if (pError) throw pError;

                return {
                    profiles: (profiles || []).map(p => ({ ...p, _id: p.id })),
                    total: profileIds.length
                };
            }

            return {
                profiles: (data || []).map(p => ({ ...p, _id: p.id })),
                total: data?.length || 0
            };
        } else {
            // OR logic - profile must have ANY of the tags
            const { data: profileTags, error } = await db
                .from('profile_tags')
                .select('profile_id')
                .eq('company_id', company_id)
                .in('tag_id', tagIds);

            if (error) throw error;

            // Get unique profile IDs
            const profileIds = [...new Set((profileTags || []).map(pt => pt.profile_id))];

            if (profileIds.length === 0) {
                return { profiles: [], total: 0 };
            }

            const { data: profiles, error: pError } = await db
                .from('profiles')
                .select('*')
                .eq('company_id', company_id)
                .in('id', profileIds)
                .range(skip, skip + limit - 1);

            if (pError) throw pError;

            return {
                profiles: (profiles || []).map(p => ({ ...p, _id: p.id })),
                total: profileIds.length
            };
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Bulk add tags to multiple profiles
 * @param {Array} profileIds - Array of profile UUIDs
 * @param {Array} tagIds - Array of tag UUIDs
 * @param {string} company_id - Company ID
 * @param {string} added_by - How the tags were added
 * @returns {Object} Insert result
 */
exports.bulkAddTags = async (profileIds, tagIds, company_id, added_by = 'manual') => {
    try {
        const inserts = [];

        for (const profileId of profileIds) {
            for (const tagId of tagIds) {
                inserts.push({
                    profile_id: profileId,
                    tag_id: tagId,
                    company_id,
                    added_by
                });
            }
        }

        // Use upsert to handle duplicates
        const { data, error } = await db
            .from('profile_tags')
            .upsert(inserts, {
                onConflict: 'profile_id,tag_id,company_id',
                ignoreDuplicates: true
            })
            .select();

        if (error) throw error;

        return {
            insertedCount: data?.length || 0,
            modifiedCount: 0
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Remove all tags from a profile
 * @param {string} profileId - Profile UUID
 * @param {string} company_id - Company ID
 * @returns {Object} Delete result
 */
exports.removeAllTagsFromProfile = async (profileId, company_id) => {
    try {
        const { data, error } = await db
            .from('profile_tags')
            .delete()
            .eq('profile_id', profileId)
            .eq('company_id', company_id)
            .select('id');

        if (error) throw error;

        return { deletedCount: data?.length || 0 };
    } catch (error) {
        throw error;
    }
};

/**
 * Count profiles with a specific tag
 * @param {string} tagId - Tag UUID
 * @param {string} company_id - Company ID
 * @returns {number} Count
 */
exports.countProfilesWithTag = async (tagId, company_id) => {
    try {
        const { count, error } = await db
            .from('profile_tags')
            .select('*', { count: 'exact', head: true })
            .eq('tag_id', tagId)
            .eq('company_id', company_id);

        if (error) throw error;

        return count || 0;
    } catch (error) {
        throw error;
    }
};
