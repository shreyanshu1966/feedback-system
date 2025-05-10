/**
 * Application configuration
 */

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    corsOptions: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  
  // OpenAI configuration via GitHub AI
  openai: {
    apiKey: process.env.GITHUB_TOKEN,
    baseUrl: process.env.OPENAI_BASE_URL || "https://models.github.ai/inference",
    model: process.env.OPENAI_MODEL || "openai/gpt-4o",
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "1000"),
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  }
};

module.exports = config;
