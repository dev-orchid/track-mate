// server/src/utils/dbConnect.js
// Supabase database connection - replaces MongoDB/Mongoose

const { supabaseAdmin, supabaseAnon } = require('./supabaseClient');

// Export the admin client as the default database connection
// This bypasses RLS for server-side operations
const db = supabaseAdmin;

// Verify connection by making a test query
async function connectDB() {
    try {
        // Simple health check query
        const { error } = await db.from('accounts').select('id').limit(1);

        // If table doesn't exist yet (first run), that's okay
        if (error && !error.message.includes('does not exist')) {
            throw error;
        }

        console.log('Connected to Supabase');
    } catch (err) {
        console.error('Error connecting to Supabase:', err.message);
        throw err;
    }
}

module.exports = {
    db,                  // Main database client (use this for queries)
    supabaseAdmin,       // Admin client (bypasses RLS)
    supabaseAnon,        // Anon client (respects RLS)
    connectDB            // Connection verification function
};
