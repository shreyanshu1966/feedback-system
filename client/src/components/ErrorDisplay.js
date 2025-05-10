import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
      <AlertCircle className="w-5 h-5 inline mr-2" />
      {error}
    </div>
  );
};

export default ErrorDisplay;
