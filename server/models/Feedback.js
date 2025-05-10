// Feedback model representing the structure of feedback objects
class Feedback {
  constructor({ score, summary, criteriaFeedback, suggestions }) {
    this.score = score;
    this.summary = summary;
    this.criteriaFeedback = criteriaFeedback || [];
    this.suggestions = suggestions || [];
  }

  // Validate feedback data
  static validate(data) {
    if (typeof data.score !== 'number') {
      throw new Error(`Score must be a number, received: ${typeof data.score}`);
    }

    if (!data.summary || typeof data.summary !== 'string') {
      throw new Error('Summary is required and must be a string');
    }

    // Allow 0 as a valid score
    return true;
  }

  // Create a Feedback object from JSON data
  static fromJSON(data) {
    try {
      this.validate(data);
      return new Feedback(data);
    } catch (error) {
      throw new Error(`Invalid feedback data: ${error.message}`);
    }
  }
}

module.exports = Feedback;
