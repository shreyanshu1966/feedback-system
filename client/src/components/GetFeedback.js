import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

const GetFeedback = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white flex flex-col items-center justify-center">
      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-8 max-w-lg text-center">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Get Feedback</h1>
        <p className="text-gray-600 mb-6">
          Upload your assignment and receive instant AI-powered feedback to improve your work.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Start Now
        </button>
      </div>
    </div>
  );
};

export default GetFeedback;