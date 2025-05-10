import React from 'react';
import FileUploader from './FileUploader';
import SubjectSelector from './SubjectSelector';
import FeedbackButton from './FeedbackButton';

const FeedbackForm = ({ 
  file, 
  onFileChange, 
  subject, 
  onSubjectChange, 
  onSubmit, 
  loading, 
  subjects 
}) => {
  return (
    <div className="space-y-4">
      <FileUploader 
        onFileChange={onFileChange} 
        file={file} 
      />
      
      <SubjectSelector 
        subjects={subjects}
        value={subject}
        onChange={onSubjectChange}
      />
      
      <FeedbackButton
        onClick={onSubmit}
        loading={loading}
        disabled={loading || !file || !subject}
      />
    </div>
  );
};

export default FeedbackForm;
