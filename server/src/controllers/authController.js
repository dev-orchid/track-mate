// controllers/authController.js
// Supabase Auth version

const { supabaseAdmin } = require('../utils/supabaseClient');
const { db } = require('../utils/dbConnect');
const authAccount = require('../models/authModel');
const { generateCompanyId } = require('../utils/generateCompanyId');
const generateApiKey = require('../utils/generateApiKey');
const logger = require('../utils/logger');

// 1. User Registration
exports.userRegisteration = async (req, res) => {
    const { firstName, lastName, email, company_name, password } = req.body;

    if (!firstName || !lastName || !email || !password || !company_name) {
        return res
            .status(400)
            .json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Check if account already exists
        const existingAccount = await authAccount.findOne({ email });
        if (existingAccount) {
            return res
                .status(400)
                .json({ success: false, message: 'Account already exists' });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true // Auto-confirm for now
        });

        if (authError) {
            logger.error('Supabase Auth error', {
                request_id: req.id,
                email: email,
                error: authError.message
            });
            return res
                .status(400)
                .json({ success: false, message: authError.message });
        }

        // Generate company_id and api_key
        const company_id = generateCompanyId();
        const api_key = generateApiKey();

        // Create account record in accounts table
        await authAccount.create({
            auth_user_id: authData.user.id,
            firstName,
            lastName,
            email,
            company_name,
            company_id,
            api_key,
            api_key_created_at: new Date().toISOString()
        });

        logger.info('Account registered successfully', {
            request_id: req.id,
            email: email,
            company_id: company_id
        });

        return res
            .status(201)
            .json({ success: true, message: 'Account registered successfully' });
    } catch (error) {
        logger.error('Registration error', {
            request_id: req.id,
            email: email,
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Authenticate Login & Issue Tokens
exports.authenticateLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid email or password' });
        }

        // Get account data
        const account = await authAccount.findOne({ auth_user_id: authData.user.id });

        if (!account) {
            return res
                .status(400)
                .json({ success: false, message: 'Account not found' });
        }

        // Remove sensitive fields from response
        const { api_key, auth_user_id, ...safeAccount } = account;

        logger.logAuth('login_success', {
            request_id: req.id,
            user_id: account._id,
            email: account.email,
            company_id: account.company_id
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            user: safeAccount
        });
    } catch (error) {
        logger.error('Login error', {
            request_id: req.id,
            email: email,
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Current User
exports.getCurrentUser = async (req, res) => {
    // req.user is populated by verifyToken middleware
    try {
        const { data: account, error } = await db
            .from('accounts')
            .select('id, first_name, last_name, email, company_name, company_id, api_key, api_key_created_at, created_at, updated_at')
            .eq('id', req.user.userId)
            .single();

        if (error || !account) {
            return res
                .status(404)
                .json({ success: false, message: 'User not found' });
        }

        // Map to expected format
        const user = {
            _id: account.id,
            firstName: account.first_name,
            lastName: account.last_name,
            email: account.email,
            company_name: account.company_name,
            company_id: account.company_id,
            api_key: account.api_key,
            api_key_created_at: account.api_key_created_at,
            createdAt: account.created_at,
            updatedAt: account.updated_at
        };

        return res.status(200).json({ success: true, user });
    } catch (err) {
        logger.error('getCurrentUser error', {
            request_id: req.id,
            error: err.message,
            stack: err.stack
        });
        return res
            .status(500)
            .json({ success: false, message: 'Server error' });
    }
};

// 4. Refresh Access Token
exports.refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res
            .status(401)
            .json({ success: false, message: 'No refresh token provided' });
    }

    try {
        const { data, error } = await supabaseAdmin.auth.refreshSession({
            refresh_token: refreshToken
        });

        if (error || !data.session) {
            return res
                .status(403)
                .json({ success: false, message: 'Invalid or expired refresh token' });
        }

        logger.logAuth('token_refresh_success', {
            request_id: req.id,
            user_id: data.user?.id
        });

        return res.status(200).json({
            success: true,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token
        });
    } catch (err) {
        logger.error('Refresh token error', {
            request_id: req.id,
            error: err.message,
            stack: err.stack
        });
        return res
            .status(403)
            .json({ success: false, message: 'Invalid or expired refresh token' });
    }
};

// 5. Update Account Details
exports.updateCurrentUser = async (req, res) => {
    const { firstName, lastName, email, company_name } = req.body;
    const updates = {};

    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (company_name) updates.company_name = company_name;

    // Email update requires Supabase Auth update
    if (email && email !== req.user.email) {
        try {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(
                req.user.auth_user_id,
                { email }
            );
            if (error) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Failed to update email' });
            }
            updates.email = email;
        } catch (err) {
            return res
                .status(400)
                .json({ success: false, message: 'Failed to update email' });
        }
    }

    try {
        const { data: updatedAccount, error } = await db
            .from('accounts')
            .update(updates)
            .eq('id', req.user.userId)
            .select('id, first_name, last_name, email, company_name, company_id, created_at, updated_at')
            .single();

        if (error) throw error;

        // Map to expected format
        const user = {
            _id: updatedAccount.id,
            firstName: updatedAccount.first_name,
            lastName: updatedAccount.last_name,
            email: updatedAccount.email,
            company_name: updatedAccount.company_name,
            company_id: updatedAccount.company_id,
            createdAt: updatedAccount.created_at,
            updatedAt: updatedAccount.updated_at
        };

        logger.logAuth('user_update_success', {
            request_id: req.id,
            user_id: req.user.userId,
            updated_fields: Object.keys(updates)
        });

        res.json({ success: true, user });
    } catch (err) {
        logger.error('Update error', {
            request_id: req.id,
            user_id: req.user.userId,
            error: err.message,
            stack: err.stack
        });
        res.status(500).json({ success: false, message: err.message });
    }
};

// 6. Regenerate API Key
exports.regenerateApiKey = async (req, res) => {
    try {
        const newApiKey = generateApiKey();

        const { data: updatedAccount, error } = await db
            .from('accounts')
            .update({
                api_key: newApiKey,
                api_key_created_at: new Date().toISOString()
            })
            .eq('id', req.user.userId)
            .select('api_key, api_key_created_at')
            .single();

        if (error) throw error;

        logger.logAuth('api_key_regenerated', {
            request_id: req.id,
            user_id: req.user.userId,
            company_id: req.user.company_id
        });

        res.json({
            success: true,
            message: 'API key regenerated successfully',
            api_key: updatedAccount.api_key,
            api_key_created_at: updatedAccount.api_key_created_at
        });
    } catch (err) {
        logger.error('API key regeneration error', {
            request_id: req.id,
            user_id: req.user.userId,
            error: err.message,
            stack: err.stack
        });
        res.status(500).json({ success: false, message: err.message });
    }
};
