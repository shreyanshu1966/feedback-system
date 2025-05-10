const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

/**
 * Routes for feedback generation and management
 */

// Generate feedback route
router.post('/generate-feedback', feedbackController.generateFeedback);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Feedback API is running' });
});

// Version endpoint
router.get('/version', (req, res) => {
  res.status(200).json({ 
    version: '1.0.0',
    apiVersion: 'v1',
    description: 'Feedback generation API for educational content' 
  });
});

module.exports = router;
