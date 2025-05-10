/**
 * Error handling middleware
 */
const logger = require('../utils/logger');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Request error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ 
    error: 'Error generating feedback',
    details: err.message 
  });
};

// 404 handler middleware
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', { 
    path: req.path, 
    method: req.method 
  });
  
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
