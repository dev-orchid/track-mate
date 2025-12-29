// server/src/utils/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

// Service client - bypasses RLS, used for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Anon client - respects RLS, used with user's access token
const supabaseAnon = supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

module.exports = {
    supabaseAdmin,
    supabaseAnon,
    supabaseUrl,
    supabaseAnonKey
};
