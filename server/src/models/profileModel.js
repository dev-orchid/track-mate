// server/src/models/profileModel.js
// Supabase version - Profile model functions

const { db } = require('../utils/dbConnect');

/**
 * Get all profiles for a company (without events)
 * @param {string} company_id - Company ID
 * @returns {Array} Array of profiles
 */
exports.getAllProfile = async (company_id) => {
    try {
        const { data, error } = await db
            .from('profiles')
            .select('name, email, phone, company_id, last_active, created_at, source, list_id')
            .eq('company_id', company_id);

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error finding profiles:', err);
        return [];
    }
};

/**
 * Get all profiles with their events
 * @param {string} company_id - Company ID
 * @returns {Array} Array of profiles with events
 */
exports.getAllProfilesWithEvents = async (company_id) => {
    try {
        const { data: profiles, error } = await db
            .from('profiles')
            .select(`
                *,
                event_sessions (
                    id,
                    session_id,
                    events (
                        id,
                        event_type,
                        event_data,
                        timestamp
                    )
                )
            `)
            .eq('company_id', company_id);

        if (error) throw error;

        // Transform to match existing API response structure
        return (profiles || []).map(profile => ({
            _id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            company_id: profile.company_id,
            lastActive: profile.last_active,
            createdAt: profile.created_at,
            source: profile.source,
            list_id: profile.list_id,
            events: (profile.event_sessions || []).flatMap(session =>
                (session.events || []).map(event => ({
                    _id: event.id,
                    eventType: event.event_type,
                    eventData: event.event_data,
                    timestamp: event.timestamp,
                    sessionId: session.session_id
                }))
            )
        }));
    } catch (err) {
        console.error('Error fetching profiles with events:', err);
        return [];
    }
};

/**
 * Get single profile with events by ID
 * @param {string} id - Profile UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Profile with events or null
 */
exports.getProfileDataWithEvents = async (id, company_id) => {
    try {
        const { data: profile, error } = await db
            .from('profiles')
            .select(`
                *,
                event_sessions (
                    id,
                    session_id,
                    events (
                        id,
                        event_type,
                        event_data,
                        timestamp
                    )
                )
            `)
            .eq('id', id)
            .eq('company_id', company_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        // Transform to match existing API response structure
        return {
            _id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            company_id: profile.company_id,
            lastActive: profile.last_active,
            createdAt: profile.created_at,
            source: profile.source,
            list_id: profile.list_id,
            events: (profile.event_sessions || []).flatMap(session =>
                (session.events || []).map(event => ({
                    _id: event.id,
                    eventType: event.event_type,
                    eventData: event.event_data,
                    timestamp: event.timestamp,
                    sessionId: session.session_id
                }))
            )
        };
    } catch (err) {
        console.error('Error fetching profile with events by id:', err);
        throw err;
    }
};

/**
 * Create or update profile and link events
 * @param {Object} data - Profile data with sessionId
 * @returns {Object} Result object with status and response
 */
exports.profileCreation = async (data) => {
    try {
        // Check if profile already exists with this email and company_id
        const { data: existingProfile, error: findError } = await db
            .from('profiles')
            .select('*')
            .eq('email', data.email)
            .eq('company_id', data.company_id)
            .single();

        let profile;
        let isNewProfile = false;

        if (existingProfile && !findError) {
            // Profile exists - update lastActive
            const { data: updated, error: updateError } = await db
                .from('profiles')
                .update({ last_active: new Date().toISOString() })
                .eq('id', existingProfile.id)
                .select()
                .single();

            if (updateError) throw updateError;
            profile = { ...updated, _id: updated.id };
            console.log(`Profile already exists: ${data.email}, using existing profile`);
        } else {
            // Create new profile
            const { data: newProfile, error: createError } = await db
                .from('profiles')
                .insert({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    company_id: data.company_id,
                    source: data.source || 'api',
                    list_id: data.list_id || null
                })
                .select()
                .single();

            if (createError) throw createError;
            profile = { ...newProfile, _id: newProfile.id };
            isNewProfile = true;
        }

        // Link events to this profile
        const eventModel = require('./eventsModel');
        await eventModel.updateUserEvents(data.sessionId, profile.id, data.company_id);

        // If list_id is provided and this is a new profile, auto-assign list tags
        if (isNewProfile && data.list_id) {
            try {
                const listModel = require('./listModel');
                const list = await listModel.getListByListId(data.list_id, data.company_id);

                if (list && list.tags && list.tags.length > 0) {
                    const profileTagModel = require('./profileTagModel');
                    const tagIds = list.tags.map(tag => tag._id || tag.id || tag);

                    for (const tagId of tagIds) {
                        try {
                            await profileTagModel.addTagToProfile(
                                profile.id,
                                tagId,
                                data.company_id,
                                'form',
                                { source_list: data.list_id }
                            );
                        } catch (tagErr) {
                            console.log(`Tag ${tagId} already assigned to profile ${profile.id}`);
                        }
                    }
                    console.log(`Auto-assigned ${tagIds.length} tags from list ${data.list_id} to profile ${profile.id}`);
                }
            } catch (listErr) {
                console.error('Error auto-assigning list tags:', listErr);
            }
        }

        return {
            id: 1,
            status: 'Success',
            response: profile
        };
    } catch (err) {
        console.error('Error in profileCreation:', err);
        return { id: 2, status: 'Error', response: err };
    }
};

/**
 * Get new profiles created since a specific date
 * @param {string} company_id - Company ID
 * @param {Date} sinceDate - Date to check from
 * @returns {Array} Array of new profiles
 */
exports.getNewProfiles = async (company_id, sinceDate) => {
    try {
        const { data, error } = await db
            .from('profiles')
            .select('id, name, email, phone, created_at, last_active')
            .eq('company_id', company_id)
            .gte('created_at', sinceDate.toISOString())
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Map to expected format with _id
        return (data || []).map(p => ({
            _id: p.id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            createdAt: p.created_at,
            lastActive: p.last_active
        }));
    } catch (err) {
        console.error('Error fetching new profiles:', err);
        return [];
    }
};

/**
 * Find profile by email and company_id
 * @param {string} email - Profile email
 * @param {string} company_id - Company ID
 * @returns {Object|null} Profile or null
 */
exports.findByEmail = async (email, company_id) => {
    try {
        const { data, error } = await db
            .from('profiles')
            .select('*')
            .eq('email', email)
            .eq('company_id', company_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data ? { ...data, _id: data.id } : null;
    } catch (err) {
        console.error('Error finding profile by email:', err);
        return null;
    }
};

/**
 * Find profile by ID
 * @param {string} id - Profile UUID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Profile or null
 */
exports.findById = async (id, company_id) => {
    try {
        const { data, error } = await db
            .from('profiles')
            .select('*')
            .eq('id', id)
            .eq('company_id', company_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data ? { ...data, _id: data.id } : null;
    } catch (err) {
        console.error('Error finding profile by ID:', err);
        return null;
    }
};

/**
 * Update profile lastActive timestamp
 * @param {string} id - Profile UUID
 * @returns {Object|null} Updated profile or null
 */
exports.updateLastActive = async (id) => {
    try {
        const { data, error } = await db
            .from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data ? { ...data, _id: data.id } : null;
    } catch (err) {
        console.error('Error updating lastActive:', err);
        return null;
    }
};
