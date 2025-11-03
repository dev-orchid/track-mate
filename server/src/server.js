require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitizeMiddleware = require('./middleware/mongoSanitize');
const trackingRoutes = require('./routes/trackingRoutes');
const authRoutes = require('./routes/authRouter');
const marketingRoutes = require('./routes/marketingRoutes');
const { addRequestId, logRequestResponse, morganLogger } = require('./middleware/requestLogger');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 8000;

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
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

// Middleware to parse JSON (must come before mongo-sanitize)
app.use(express.json());

// CORS configuration - allow requests from dashboard and tracking snippets
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'null'], // 'null' allows file:// for testing
  credentials: true
}));

// Security: Sanitize user input to prevent NoSQL injection
// Must come after express.json() to sanitize parsed body
// Using custom middleware for Express 5 compatibility
app.use(mongoSanitizeMiddleware);

// Logging middleware
app.use(logRequestResponse);
app.use(morganLogger);
const { connectDB } = require('./utils/dbConnect');
(async () => {
  try {
    await connectDB();               // connect once
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


