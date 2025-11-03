// Serverless environment - use console logging only
const express = require('express');
const cors = require('cors');
const mongoSanitizeMiddleware = require('../src/middleware/mongoSanitize');
const trackingRoutes = require('../src/routes/trackingRoutes');
const authRoutes = require('../src/routes/authRouter');
const marketingRoutes = require('../src/routes/marketingRoutes');
const logger = require('../src/utils/logger.serverless');
const { connectDB } = require('../src/utils/dbConnect');

const app = express();

// Validate environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  logger.error('Missing required environment variables', {
    missing_vars: missingVars
  });
  console.error('Missing required environment variables:', missingVars.join(', '));
}

// Middleware to parse JSON (must come before mongo-sanitize)
app.use(express.json());

// CORS configuration - allow requests from dashboard and tracking snippets
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'https://track-mate-pi.vercel.app',
  'null'
];

// If CORS_ORIGIN env var is set, add it
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Security: Sanitize user input to prevent NoSQL injection
app.use(mongoSanitizeMiddleware);

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
