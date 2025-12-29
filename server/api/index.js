// Serverless environment - use console logging only
// Supabase version
const express = require('express');
const cors = require('cors');
const path = require('path');
const trackingRoutes = require('../src/routes/trackingRoutes');
const authRoutes = require('../src/routes/authRouter');
const marketingRoutes = require('../src/routes/marketingRoutes');
const logger = require('../src/utils/logger.serverless');
const { connectDB } = require('../src/utils/dbConnect');

const app = express();

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  logger.error('Missing required environment variables', {
    missing_vars: missingVars
  });
  console.error('Missing required environment variables:', missingVars.join(', '));
}

// Middleware to parse JSON
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'https://track-mate-pi.vercel.app',
  'https://track-mate-chi.vercel.app',
  'null'
];

// If CORS_ORIGIN env var is set, add it
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

// Public tracking endpoints that allow any origin (for pixel/snippet use)
const publicTrackingPaths = ['/api/events', '/api/profile'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, etc.)
    if (!origin) return callback(null, true);

    // Allow any origin for public tracking endpoints
    // This is checked in the preflight handling below
    callback(null, true);
  },
  credentials: true
}));

// Override CORS for non-tracking endpoints to restrict origins
app.use((req, res, next) => {
  const isPublicTracking = publicTrackingPaths.some(p => req.path === p || req.path.startsWith(p + '/'));
  const origin = req.headers.origin;

  // For non-tracking endpoints, enforce origin restrictions
  if (!isPublicTracking && origin) {
    const isAllowed = allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin);
    if (!isAllowed) {
      return res.status(403).json({ success: false, message: 'Not allowed by CORS' });
    }
  }
  next();
});

// Initialize database connection
let dbConnected = false;
const initDB = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed', {
        error: error.message,
        stack: error.stack
      });
      console.error('Database connection failed:', error);
    }
  }
};

// Ensure DB connection before handling requests
app.use(async (req, res, next) => {
  await initDB();
  next();
});

// Serve tracking pixel script with permissive CORS
app.get('/tm.js', cors(), (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(__dirname, '../public/tm.js'));
});

// Set up API routes
app.use(authRoutes);
app.use('/', trackingRoutes);
app.use('/api', marketingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Export the Express app for Vercel serverless
module.exports = app;
