require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const trackingRoutes = require('./routes/trackingRoutes');
const authRoutes = require('./routes/authRouter');
const marketingRoutes = require('./routes/marketingRoutes');
const { addRequestId, logRequestResponse, morganLogger } = require('./middleware/requestLogger');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 8000;

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    logger.error('Missing required environment variables', {
        missing_vars: missingVars
    });
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
}

// Request tracking middleware (must be first to assign req.id)
app.use(addRequestId);

// Middleware to parse JSON
app.use(express.json());

// CORS configuration - allow requests from dashboard and tracking snippets
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'https://track-mate-pi.vercel.app',
    'null' // 'null' allows file:// for testing
];

// If CORS_ORIGIN env var is set, add it to allowed origins
if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or matches Vercel pattern
        if (allowedOrigins.indexOf(origin) !== -1 || /\.vercel\.app$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Logging middleware
app.use(logRequestResponse);
app.use(morganLogger);

// Serve tracking pixel script with permissive CORS (must work on any site)
app.get('/tm.js', cors(), (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.sendFile(path.join(__dirname, '../public/tm.js'));
});

// Initialize server
const { connectDB } = require('./utils/dbConnect');
(async () => {
    try {
        await connectDB(); // Verify Supabase connection
        logger.info('Database connected successfully');

        // Set up API routes
        app.use(authRoutes);
        app.use('/', trackingRoutes);
        app.use('/api', marketingRoutes);

        app.listen(port, () => {
            const message = `Backend server running on port ${port}`;
            logger.info(message, { port });
            console.log(message);
        });
    } catch (error) {
        logger.error('Server startup failed', {
            error: error.message,
            stack: error.stack
        });
        console.error('Server startup failed:', error);
        process.exit(1);
    }
})();
