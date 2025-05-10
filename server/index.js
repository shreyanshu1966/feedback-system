require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Environment validation
const validateEnvironment = () => {
  const apiKey = config.openai.apiKey;
  if (!apiKey || !apiKey.startsWith('ghp_')) {
    logger.error('Invalid GitHub PAT format. Must start with "ghp-"');
    process.exit(1);
  }
  
  return true;
};

// Initialize app
const initializeApp = () => {
  validateEnvironment();
  
  const app = express();
  const port = config.server.port;

  // Middleware
  app.use(cors(config.server.corsOptions));
  app.use(express.json({ limit: '10mb' }));  // Increased limit for larger documents
  app.use(requestLogger);
  
  // Routes
  app.use('/', feedbackRoutes);
  
  // Error handling
  app.use(errorHandler);
  app.use(notFoundHandler);
  
  return { app, port };
};

// Start server
const { app, port } = initializeApp();

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`, {
    port,
    env: config.server.environment
  });
});

// For testing purposes
module.exports = app;