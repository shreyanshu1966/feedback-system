import React from 'react';

const FeedbackDisplay = ({ feedback }) => {
  if (!feedback) return null;
  
  return (
    <div className="mt-6 p-4 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">
        Score: {feedback.score}%
      </h3>
      <p className="mb-4">{feedback.summary}</p>
      <h4 className="text-md font-semibold mb-2">Criteria Feedback:</h4>
      <ul className="list-disc pl-5 mb-4">
        {feedback.criteriaFeedback && feedback.criteriaFeedback.length > 0 ? (
          feedback.criteriaFeedback.map((item, index) => (
            <li key={index}>
              <strong>{item.criterion}:</strong> {item.score}% - {item.feedback}
            </li>
          ))
        ) : (
          <li>No criteria feedback available.</li>
        )}
      </ul>
      <h4 className="text-md font-semibold mb-2">Suggestions:</h4>
      <ul className="list-disc pl-5">
        {feedback.suggestions && feedback.suggestions.length > 0 ? (
          feedback.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))
        ) : (
          <li>No suggestions available.</li>
        )}
      </ul>
    </div>
  );
};

export default FeedbackDisplay;
