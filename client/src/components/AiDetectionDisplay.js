import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

const AiDetectionDisplay = ({ aiDetection }) => {
  if (!aiDetection) return null;
  
  const { ai_probability, human_probability, is_ai_generated } = aiDetection;
  
  return (
    <div className={`mt-4 p-3 rounded-lg border ${
      is_ai_generated ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start">
        {is_ai_generated ? (
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        ) : (
          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <h3 className="text-md font-semibold">
            {is_ai_generated 
              ? 'AI-Generated Content Detected' 
              : 'Content Likely Human-Written'}
          </h3>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div className="text-sm">
              <div className="font-medium">AI Probability:</div>
              <div className="mt-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${ai_probability}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">{ai_probability}%</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Human Probability:</div>
              <div className="mt-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${human_probability}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">{human_probability}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDetectionDisplay;