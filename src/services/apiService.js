// API service for feedback generation

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Generate feedback from the server
 * 
 * @param {string} fileContent - The content of the file to analyze
 * @param {string} subject - The subject of the assignment
 * @param {string} systemPrompt - The prompt for the AI system
 * @returns {Promise<Object>} - Feedback data
 */
const generateFeedback = async (fileContent, subject, systemPrompt) => {
  try {
    const response = await fetch(`${API_URL}/generate-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileContent, subject, systemPrompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error generating feedback');
    }

    return await response.json();
  } catch (error) {
    console.error('Feedback generation error:', error);
    throw error;
  }
};

/**
 * Check server health
 * 
 * @returns {Promise<Object>} - Health status
 */
const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    
    if (!response.ok) {
      throw new Error('Server health check failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

export {
  generateFeedback,
  checkServerHealth
};
