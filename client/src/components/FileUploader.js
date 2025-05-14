import React, { useState, useRef, useEffect } from 'react';
import { FileUp, X, CheckCircle, FileText, Image, FileCode } from 'lucide-react';

const FileUploader = ({ onFileChange, file }) => {
  const [dragActive, setDragActive] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const inputRef = useRef(null);
  
  // Simulated progress animation when file is being processed
  useEffect(() => {
    if (dragActive) {
      const interval = setInterval(() => {
        setDragProgress(prev => {
          if (prev < 95) return prev + 5;
          return prev;
        });
      }, 100);
      
      return () => {
        clearInterval(interval);
        setDragProgress(0);
      };
    }
  }, [dragActive]);
  
  // Prevents default behavior for dragover/drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle the drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Create a synthetic event for onFileChange
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      };
      onFileChange(syntheticEvent);
    }
  };
  
  // Trigger file input click
  const handleButtonClick = () => {
    inputRef.current.click();
  };
  
  // Clear the selected file
  const handleClearFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // Create a synthetic event with empty files
    onFileChange({ target: { files: [] } });
  };
  
  // Get the file icon based on file type
  const getFileIcon = () => {
    if (!file) return null;
    
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
      return <Image className="w-5 h-5 mr-2 text-indigo-500" />;
    } else if (['pdf'].includes(fileType)) {
      return <FileText className="w-5 h-5 mr-2 text-red-500" />;
    } else if (['txt', 'doc', 'docx'].includes(fileType)) {
      return <FileText className="w-5 h-5 mr-2 text-blue-500" />;
    } else {
      return <FileCode className="w-5 h-5 mr-2 text-gray-500" />;
    }
  };

  return (      <div className="space-y-2">
      <label className="block text-sm font-medium mb-2">Upload Assignment</label>
        {!file ? (
        <div 
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ease-in-out flex flex-col items-center justify-center
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 shadow-inner scale-105' 
              : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {dragActive && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-80 flex items-center justify-center rounded-lg z-10">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center mb-2 animate-pulse">
                  <FileUp className="w-8 h-8 text-blue-600" />
                </div>
                <p className="font-medium text-blue-700">Release to Upload File</p>
                {dragProgress > 0 && (
                  <div className="w-48 h-2 bg-blue-200 rounded-full mt-3 mx-auto overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-200 rounded-full" 
                      style={{ width: `${dragProgress}%` }} 
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-md">
            <FileUp className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-center mb-2 font-medium text-lg">Drag and drop your file here</p>
          <p className="text-center text-sm text-gray-500 mb-5">Support for PDF, TXT, and image files</p>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={handleButtonClick}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all hover:shadow-md active:scale-95 flex items-center justify-center"
              type="button"
            >
              <FileUp className="w-5 h-5 mr-2" />
              Browse Files
            </button>
            
            <button 
              onClick={() => window.open('https://docs.google.com/document/create', '_blank')}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center"
              type="button"
            >
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              Create Document
            </button>
          </div>
          
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onFileChange}
            accept=".pdf,.txt,.png,.jpg,.jpeg,.doc,.docx"
          />
        </div>) : (
        <div className="border rounded-lg p-5 bg-white shadow-sm flex items-center justify-between group animate-fadeIn transform transition-all hover:shadow-md hover:border-blue-200">
          <div className="flex items-center w-full">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 shadow-sm">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                {getFileIcon()}
                <span className="font-medium text-gray-800">{file.name}</span>
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{file.type || 'document'}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-3">{(file.size / 1024).toFixed(2)} KB</span>
                <span>Ready for feedback</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
                <div className="bg-green-500 h-1 rounded-full w-full transition-all duration-700"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={handleButtonClick}
              className="p-2 text-xs rounded-md bg-gray-100 text-gray-700 mr-2 hover:bg-gray-200 transition-colors"
              aria-label="Change file"
              title="Change file"
            >
              Change
            </button>
            <button 
              onClick={handleClearFile}
              className="p-1.5 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FileUploader;
