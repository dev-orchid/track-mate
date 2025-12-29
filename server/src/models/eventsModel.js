// server/src/models/eventsModel.js
// Supabase version - Event model functions
// Events are split into event_sessions and events tables

const { db } = require('../utils/dbConnect');

/**
 * Get all events for a company with profile info
 * @param {string} company_id - Company ID
 * @returns {Array} Array of event sessions with events
 */
exports.getAllEvent = async (company_id) => {
    try {
        const { data, error } = await db
            .from('event_sessions')
            .select(`
                *,
                profile:profiles(*),
                events(*)
            `)
            .eq('company_id', company_id);

        if (error) throw error;

        // Transform to match existing API response structure
        return (data || []).map(session => ({
            _id: session.id,
            userId: session.profile ? { ...session.profile, _id: session.profile.id } : null,
            company_id: session.company_id,
            sessionId: session.session_id,
            list_id: session.list_id,
            events: (session.events || []).map(event => ({
                _id: event.id,
                eventType: event.event_type,
                eventData: event.event_data,
                timestamp: event.timestamp
            }))
        }));
    } catch (err) {
        console.error('Error finding events:', err);
        return [];
    }
};

/**
 * Create a new event session with events
 * @param {Object} eventData - Event data including sessionId, company_id, events array
 * @returns {Object} Result object with status and response
 */
exports.eventCreation = async (eventData) => {
    try {
        // Create event session first
        const { data: session, error: sessionError } = await db
            .from('event_sessions')
            .insert({
                profile_id: eventData.userId || null,
                company_id: eventData.company_id,
                session_id: eventData.sessionId,
                list_id: eventData.list_id || null
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        // Insert individual events
        const eventsToInsert = (eventData.events || []).map(event => ({
            event_session_id: session.id,
            event_type: event.eventType,
            event_data: event.eventData || {},
            timestamp: event.timestamp || new Date().toISOString()
        }));

        let events = [];
        if (eventsToInsert.length > 0) {
            const { data: insertedEvents, error: eventsError } = await db
                .from('events')
                .insert(eventsToInsert)
                .select();

            if (eventsError) throw eventsError;
            events = insertedEvents || [];
        }

        // Transform response to match expected structure
        const response = {
            _id: session.id,
            userId: session.profile_id,
            company_id: session.company_id,
            sessionId: session.session_id,
            list_id: session.list_id,
            events: events.map(e => ({
                _id: e.id,
                eventType: e.event_type,
                eventData: e.event_data,
                timestamp: e.timestamp
            }))
        };

        return {
            id: 1,
            status: 'ok',
            response
        };
    } catch (err) {
        console.log('Error on Event creation:', err);
        return { id: 2, status: 'Error', response: err };
    }
};

/**
 * Update event sessions to link to profile after profile creation
 * @param {string} sessionId - Session ID
 * @param {string} userId - Profile UUID
 * @param {string} company_id - Company ID
 */
exports.updateUserEvents = async (sessionId, userId, company_id) => {
    try {
        const { data, error } = await db
            .from('event_sessions')
            .update({ profile_id: userId })
            .eq('session_id', sessionId)
            .eq('company_id', company_id)
            .is('profile_id', null);

        if (error) throw error;
        console.log(`Updated ${sessionId}--${userId} events.`);
    } catch (error) {
        console.error('Error updating events:', error);
    }
};

/**
 * Find event session by session ID and company ID
 * @param {string} sessionId - Session ID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Event session or null
 */
exports.findBySessionId = async (sessionId, company_id) => {
    try {
        const { data, error } = await db
            .from('event_sessions')
            .select(`
                *,
                events(*)
            `)
            .eq('session_id', sessionId)
            .eq('company_id', company_id)
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data ? {
            _id: data.id,
            userId: data.profile_id,
            company_id: data.company_id,
            sessionId: data.session_id,
            list_id: data.list_id,
            events: (data.events || []).map(e => ({
                _id: e.id,
                eventType: e.event_type,
                eventData: e.event_data,
                timestamp: e.timestamp
            }))
        } : null;
    } catch (err) {
        console.error('Error finding event session:', err);
        return null;
    }
};

/**
 * Find event session with a linked profile by session ID
 * Used for webhook binding to existing sessions
 * @param {string} sessionId - Session ID
 * @param {string} company_id - Company ID
 * @returns {Object|null} Event session with profile or null
 */
exports.findSessionWithProfile = async (sessionId, company_id) => {
    try {
        const { data, error } = await db
            .from('event_sessions')
            .select('*, profile:profiles(*)')
            .eq('session_id', sessionId)
            .eq('company_id', company_id)
            .not('profile_id', 'is', null)
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data ? {
            _id: data.id,
            userId: data.profile ? { ...data.profile, _id: data.profile.id } : null,
            sessionId: data.session_id,
            company_id: data.company_id
        } : null;
    } catch (err) {
        console.error('Error finding session with profile:', err);
        return null;
    }
};

/**
 * Add events to an existing session
 * @param {string} sessionId - Event session UUID
 * @param {Array} events - Array of event objects
 * @returns {Array} Inserted events
 */
exports.addEventsToSession = async (sessionId, events) => {
    try {
        const eventsToInsert = events.map(event => ({
            event_session_id: sessionId,
            event_type: event.eventType,
            event_data: event.eventData || {},
            timestamp: event.timestamp || new Date().toISOString()
        }));

        const { data, error } = await db
            .from('events')
            .insert(eventsToInsert)
            .select();

        if (error) throw error;

        return (data || []).map(e => ({
            _id: e.id,
            eventType: e.event_type,
            eventData: e.event_data,
            timestamp: e.timestamp
        }));
    } catch (err) {
        console.error('Error adding events to session:', err);
        return [];
    }
};
