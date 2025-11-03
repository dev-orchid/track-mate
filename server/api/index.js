require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitizeMiddleware = require('../src/middleware/mongoSanitize');
const trackingRoutes = require('../src/routes/trackingRoutes');
const authRoutes = require('../src/routes/authRouter');
const marketingRoutes = require('../src/routes/marketingRoutes');
const { addRequestId, logRequestResponse, morganLogger } = require('../src/middleware/requestLogger');
const logger = require('../src/utils/logger');
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

// Request tracking middleware (must be first to assign req.id)
app.use(addRequestId);

// Middleware to parse JSON (must come before mongo-sanitize)
app.use(express.json());

// CORS configuration - allow requests from dashboard and tracking snippets
app.use(cors({
  origin: true, // Allow all origins in serverless environment - configure in Vercel
  credentials: true
}));

// Security: Sanitize user input to prevent NoSQL injection
app.use(mongoSanitizeMiddleware);

// Logging middleware
app.use(logRequestResponse);
app.use(morganLogger);

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

// Export the Express app for Vercel serverless
module.exports = app;
