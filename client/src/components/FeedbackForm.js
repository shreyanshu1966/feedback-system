import React, { useState } from 'react';
import FileUploader from './FileUploader';
import SubjectSelector from './SubjectSelector';
import FeedbackButton from './FeedbackButton';
import { CheckCircle, HelpCircle, BookOpen, Clock, Sparkles } from 'lucide-react';

const FeedbackForm = ({ 
  file, 
  onFileChange, 
  subject, 
  onSubjectChange, 
  onSubmit, 
  loading, 
  subjects 
}) => {  // Determine the current step
  const steps = [
    { 
      id: 'upload', 
      label: 'Upload Assignment', 
      description: 'Add your document to analyze',
      completed: !!file,
      icon: BookOpen
    },
    { 
      id: 'subject', 
      label: 'Select Subject', 
      description: 'Choose the assignment category',
      completed: !!subject,
      icon: Clock
    },
    { 
      id: 'generate', 
      label: 'Generate Feedback', 
      description: 'Get detailed assessment',
      completed: false,
      icon: Sparkles
    }
  ];

  // Determine active step
  const getActiveStep = () => {
    if (!file) return 0;
    if (!subject) return 1;
    return 2;
  };
  
  const activeStep = getActiveStep();
  const [hoverStep, setHoverStep] = useState(null);
  return (
    <div className="space-y-6">
      {/* Progress indicators with tooltips */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 relative">
          {/* Progress bar background */}
          <div className="absolute left-0 right-0 h-1.5 bg-gray-200 top-1/2 transform -translate-y-1/2 z-0 rounded-full"></div>
          
          {/* Progress bar fill */}
          <div 
            className="absolute left-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 top-1/2 transform -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
            style={{ 
              width: `${file ? (subject ? '100%' : '50%') : '0%'}`
            }}
          ></div>
          
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className="z-10 relative group"
              onMouseEnter={() => setHoverStep(idx)}
              onMouseLeave={() => setHoverStep(null)}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 transform
                ${step.completed 
                  ? 'bg-green-100 text-green-700 scale-110 shadow-md' 
                  : idx === activeStep
                    ? 'bg-blue-100 text-blue-700 scale-110 shadow-md ring-4 ring-blue-50' 
                    : hoverStep === idx 
                      ? 'bg-gray-100 text-gray-600 scale-105' 
                      : 'bg-gray-100 text-gray-400'}`}
              >
                {step.completed ? (
                  <CheckCircle className="w-7 h-7" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
                
                {/* Enhanced tooltip on hover */}
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 transition-all duration-300 pointer-events-none
                  ${hoverStep === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm whitespace-nowrap max-w-xs">
                    <p className="font-medium text-base mb-1">{step.label}</p>
                    <p className="text-gray-300">{step.description}</p>
                    <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2"></div>
                  </div>
                </div>
              </div>
              <span className={`block text-sm mt-2 font-medium text-center transition-colors duration-300
                ${step.completed 
                  ? 'text-green-700' 
                  : idx === activeStep
                    ? 'text-blue-700' 
                    : hoverStep === idx
                      ? 'text-gray-700'
                      : 'text-gray-500'}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>      <div className={`bg-white p-6 rounded-xl border transition-all duration-500 shadow-sm
        ${activeStep === 0 
          ? 'border-blue-200 ring-2 ring-blue-50 transform scale-102' 
          : file ? 'border-green-200' : 'border-gray-200'}`}
      >
        <FileUploader 
          onFileChange={onFileChange} 
          file={file} 
        />
        
        {!file && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start text-sm text-blue-800 animate-fadeIn">
            <HelpCircle className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Start by uploading your assignment</p>
              <p className="text-blue-600">You can drag and drop your file or browse to select it from your computer.</p>
            </div>
          </div>
        )}
      </div>
      
      <div className={`bg-white p-6 rounded-xl border transition-all duration-500
        ${activeStep === 1 
          ? 'border-blue-200 shadow-md ring-2 ring-blue-50 transform scale-102' 
          : !file 
            ? 'border-gray-200 opacity-75 shadow-sm cursor-not-allowed' 
            : subject
              ? 'border-green-200 shadow-sm'
              : 'border-gray-200 shadow-sm'}`}
      >
        <SubjectSelector 
          subjects={subjects}
          value={subject}
          onChange={onSubjectChange}
          disabled={!file}
        />
        
        {file && !subject && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start text-sm text-blue-800 animate-fadeIn">
            <HelpCircle className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Select a subject for your assignment</p>
              <p className="text-blue-600">The feedback will be tailored based on the subject you choose.</p>
            </div>
          </div>
        )}
      </div>
        <div className={`pt-6 transition-all duration-500 ${activeStep === 2 ? 'transform scale-105' : ''}`}>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-md">
          <div className="flex items-start mb-4">
            <Sparkles className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-lg text-gray-800">Ready to generate feedback?</h3>
              <p className="text-gray-600 mt-1">Our AI will analyze your document and provide detailed assessment.</p>
            </div>
          </div>
          
          <FeedbackButton
            onClick={onSubmit}
            loading={loading}
            disabled={loading || !file || !subject}
          />
          
          {file && subject && !loading && (
            <div className="mt-3 text-xs text-blue-600 flex justify-center items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>Analysis takes approximately 15-30 seconds</span>
            </div>
          )}
        </div>
      </div>
        <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;
