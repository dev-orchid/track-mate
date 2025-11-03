const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer token"

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Ensure company_id is present in the token
        if (!decoded.company_id) {
            return res.status(403).json({ success: false, message: 'Invalid token: missing company_id.' });
        }
        req.user = decoded; // attach decoded user info (userId, email, company_id) to req
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = verifyToken;
