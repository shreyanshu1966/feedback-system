import React from 'react';
import { FileUp } from 'lucide-react';

const FileUploader = ({ onFileChange, file }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Upload Assignment</label>
      <div className="flex items-center">
        <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100">
          <FileUp className="w-5 h-5 mr-2" />
          <span>Choose File</span>
          <input
            type="file"
            className="hidden"
            onChange={onFileChange}
            accept=".pdf,.txt,.png,.jpg,.jpeg"
          />
        </label>
        {file && <span className="ml-3 text-sm">{file.name}</span>}
      </div>
    </div>
  );
};

export default FileUploader;
