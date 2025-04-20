require('dotenv').config();
const express = require('express');
const cors = require('cors');
const trackingRoutes = require('./routes/trackingRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());
app.use(cors({origin:'http://localhost:3000'}));
// Use custom logger middleware (optional)
// const logger = require('./middleware/logger');
// app.use(logger);

// Set up tracking API routes
app.use('/', trackingRoutes);

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
