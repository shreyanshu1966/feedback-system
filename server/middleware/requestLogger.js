/**
 * Request logging middleware
 */
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    
    // Log response
    logger.info('Response sent', {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    
    return originalSend.call(this, body);
  };

  next();
};

module.exports = requestLogger;
