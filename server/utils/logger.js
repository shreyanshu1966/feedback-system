/**
 * Logging utility for the application
 */
const config = require('../config');

// Simple logger that could be replaced with Winston/Pino in production
class Logger {
  constructor(context = 'app') {
    this.context = context;
    this.level = config.logging.level;
  }

  // Log with timestamp and context
  _log(level, message, meta = {}) {
    if (this._shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const logObject = {
        timestamp,
        level,
        context: this.context,
        message,
        ...meta
      };

      if (config.logging.format === 'json') {
        console[level === 'error' ? 'error' : 'log'](JSON.stringify(logObject));
      } else {
        console[level === 'error' ? 'error' : 'log'](
          `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`,
          Object.keys(meta).length ? meta : ''
        );
      }
    }
  }

  // Check if the log level should be displayed
  _shouldLog(level) {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    return levels[level] <= levels[this.level];
  }

  // Log methods
  error(message, meta = {}) {
    this._log('error', message, meta);
  }

  warn(message, meta = {}) {
    this._log('warn', message, meta);
  }

  info(message, meta = {}) {
    this._log('info', message, meta);
  }

  debug(message, meta = {}) {
    this._log('debug', message, meta);
  }

  // Create a child logger with a specific context
  child(context) {
    return new Logger(`${this.context}:${context}`);
  }
}

module.exports = new Logger();
module.exports.Logger = Logger;
