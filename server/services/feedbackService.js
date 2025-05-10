const Feedback = require('../models/Feedback');
const logger = require('../utils/logger');

// Logger for this module
const serviceLogger = logger.child('feedbackService');

// Extract JSON from response
exports.extractJSON = (text) => {
  try {
    // Remove markdown code blocks if present
    const jsonStr = text.replace(/```json\n|\n```/g, '').trim();
    
    serviceLogger.debug('Extracting JSON from text', { textLength: text.length });
    
    const parsedData = JSON.parse(jsonStr);
    
    // Add debug logging
    serviceLogger.debug('Parsed JSON data:', { 
      score: parsedData.score,
      hasScore: typeof parsedData.score === 'number'
    });
    
    // Create a feedback object from the parsed data
    return Feedback.fromJSON(parsedData);
  } catch (error) {
    serviceLogger.error('JSON extraction failed', { 
      error: error.message,
      textSample: text.substring(0, 100) + '...',
      parsedData: text // Add full response for debugging
    });
    
    throw new Error(`JSON parsing error: ${error.message}`);
  }
};

// Format feedback for response
exports.formatFeedback = (feedbackData) => {
  serviceLogger.debug('Formatting feedback', { 
    score: feedbackData.score
  });
  
  return {
    score: feedbackData.score,
    summary: feedbackData.summary,
    criteriaFeedback: feedbackData.criteriaFeedback,
    suggestions: feedbackData.suggestions
    // highlightSpan is now included in criteriaFeedback items if present
  };
};

// Process feedback data
exports.processFeedback = (feedbackData) => {
  serviceLogger.debug('Processing feedback', { 
    criteriaCount: feedbackData.criteriaFeedback?.length || 0,
    suggestionsCount: feedbackData.suggestions?.length || 0
  });
  
  // Add any additional processing here
  return feedbackData;
};
