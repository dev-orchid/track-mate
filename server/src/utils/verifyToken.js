// server/src/utils/verifyToken.js
// Supabase Auth token verification middleware

const { supabaseAdmin } = require('./supabaseClient');
const { db } = require('./dbConnect');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer token"

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access Denied. No token provided.'
        });
    }

    try {
        // Verify the JWT with Supabase Auth
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        // Get account data including company_id
        const { data: account, error: accountError } = await db
            .from('accounts')
            .select('id, company_id, email, first_name, last_name')
            .eq('auth_user_id', user.id)
            .single();

        if (accountError || !account) {
            return res.status(403).json({
                success: false,
                message: 'Account not found.'
            });
        }

        // Attach user info to request (matching previous structure)
        req.user = {
            userId: account.id,
            email: account.email,
            company_id: account.company_id,
            auth_user_id: user.id,
            firstName: account.first_name,
            lastName: account.last_name
        };

        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = verifyToken;
