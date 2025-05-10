import React from 'react';
import { Loader2, Send } from 'lucide-react';

const FeedbackButton = ({ loading, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Send className="w-5 h-5 mr-2" />
          Generate Feedback
        </>
      )}
    </button>
  );
};

export default FeedbackButton;
