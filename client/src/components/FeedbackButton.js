import React from 'react';
import { Loader2, Send, Sparkles, ArrowRight, Zap } from 'lucide-react';

const FeedbackButton = ({ loading, disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 px-6 rounded-lg text-white font-medium shadow-lg flex items-center justify-center transition-all duration-300 group
        ${disabled && !loading 
          ? 'bg-gray-400 cursor-not-allowed opacity-60' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0'}`}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="relative mr-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full animate-ping"></div>
          </div>
          <div>
            <span className="block font-bold">Analyzing...</span>
            <span className="text-xs text-blue-200">This may take a few moments</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          {disabled ? (
            <Send className="w-5 h-5 mr-2" />
          ) : (
            <div className="relative">
              <Sparkles className="w-7 h-7 mr-3" />
              <div className={`absolute inset-0 ${!disabled ? 'animate-ping-slow' : ''} opacity-50`}>
                <Sparkles className="w-7 h-7" />
              </div>
            </div>
          )}
          <span className="font-bold mr-1 text-lg">Generate Feedback</span>
          {!disabled && <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />}
        </div>
      )}
      
      <style jsx>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
};

export default FeedbackButton;
