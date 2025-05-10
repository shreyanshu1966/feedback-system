const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');
const feedbackService = require('../services/feedbackService');

// Logger for this module
const controllerLogger = logger.child('feedbackController');

// Configure OpenAI client
const client = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseUrl
});

// Generate feedback controller
exports.generateFeedback = async (req, res, next) => {
  const { fileContent, subject, systemPrompt } = req.body;

  // Validate request data
  if (!fileContent || !subject || !systemPrompt) {
    controllerLogger.warn('Missing required fields', { subject });
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'Missing required fields: fileContent, subject, or systemPrompt' 
    });
  }

  controllerLogger.info('Generating feedback', { subject, contentLength: fileContent.length });

  try {
    // Generate feedback using LLM
    const feedbackResponse = await generateFeedbackWithLLM(fileContent, systemPrompt);
    
    // Process feedback data
    const feedbackData = feedbackService.extractJSON(feedbackResponse);
    const processedFeedback = feedbackService.processFeedback(feedbackData);
    
    // Format and send response
    const formattedFeedback = feedbackService.formatFeedback(processedFeedback);
    
    controllerLogger.info('Feedback generated successfully', { 
      subject, 
      score: formattedFeedback.score 
    });
    
    res.json(formattedFeedback);
  } catch (error) {
    controllerLogger.error('Error generating feedback', { 
      subject, 
      error: error.message,
      stack: error.stack
    });
    
    next(error);
  }
};

// Helper function to generate feedback with OpenAI
async function generateFeedbackWithLLM(fileContent, systemPrompt) {
  const feedbackResponse = await client.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: `${systemPrompt} Important: Return only valid JSON without markdown code blocks.` 
      },
      { role: "user", content: fileContent }
    ],
    model: config.openai.model,
    temperature: config.openai.temperature,
    max_tokens: config.openai.maxTokens
  });

  const responseContent = feedbackResponse.choices[0].message.content;
  controllerLogger.debug('Raw LLM response received', { 
    contentLength: responseContent.length
  });
  
  return responseContent;
}
