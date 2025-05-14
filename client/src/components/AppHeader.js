import React from 'react';
import { Sparkles } from 'lucide-react';

const AppHeader = ({ title, subtitle }) => {
  return (
    <div>
      <div className="mb-2 flex items-center">
        <h2 className="text-3xl font-bold mr-2">{title}</h2>
        <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
      </div>
      {subtitle && (
        <div className="flex items-center">
          <p className="text-white text-opacity-90 max-w-lg">{subtitle}</p>
          <div className="ml-3 px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
            Powered by AI
          </div>
        </div>
      )}
    </div>
  );
};

export default AppHeader;
