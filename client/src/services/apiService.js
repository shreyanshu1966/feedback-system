import axios from 'axios';

// Define separate base URLs for different services from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const AI_DETECTOR_URL = process.env.REACT_APP_AI_DETECTOR_URL || 'http://localhost:5001';

/**
 * Generate feedback for a submitted file content
 * @param {string} fileContent - The text content to analyze
 * @param {string} subject - The subject of the assignment
 * @param {string} systemPrompt - The system prompt for the AI
 * @returns {Promise<Object>} The generated feedback
 */
const generateFeedback = async (fileContent, subject, systemPrompt) => {
  try {
    console.log('Sending request with:', {
      contentLength: fileContent?.length,
      subject,
      promptLength: systemPrompt?.length
    });
    
    // Send request to backend
    const response = await axios.post(`${API_BASE_URL}/generate-feedback`, {
      fileContent,
      subject,
      systemPrompt
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Feedback generation error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    throw new Error(`Error generating feedback: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Check server health
 * 
 * @returns {Promise<Object>} - Health status
 */
const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('Server health check failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Detect if content is AI generated
 * @param {string} text - The text content to analyze
 * @returns {Promise<Object>} The AI detection results
 */
const detectAiContent = async (text) => {
  try {
    const response = await axios.post(`${AI_DETECTOR_URL}/detect-ai`, {
      text
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('AI detection error:', error);
    throw error;
  }
};

export {
  generateFeedback,
  checkServerHealth,
  detectAiContent
};
