import React, { useState, useEffect } from 'react';
import { setupPdfWorker } from '../services/documentService';
import { generateFeedback, checkServerHealth } from '../services/apiService';
import FeedbackForm from './FeedbackForm';
import FeedbackDisplay from './FeedbackDisplay';
import ErrorDisplay from './ErrorDisplay';
import DocumentProcessor from './DocumentProcessor';
import SubjectManager from './SubjectManager';
import AppHeader from './AppHeader';
import ClassroomIntegration from './ClassroomIntegration';

const FeedbackSystem = () => {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [showClassroomIntegration, setShowClassroomIntegration] = useState(false);

  // Get subjects and prompt generator
  const { subjects, generateSystemPrompt } = SubjectManager();
  
  // Get document processor
  const { processFile, processing } = DocumentProcessor({
    onFileProcessed: (selectedFile, content) => {
      setFile(selectedFile);
      setFileContent(content);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  // Set up PDF.js worker and check server health when component mounts
  useEffect(() => {
    setupPdfWorker();
    
    // Check if the server is running
    checkServerHealth()
      .then(() => setServerStatus('connected'))
      .catch(() => setServerStatus('disconnected'));
  }, []);
  
  const handleFileChange = async (event) => {
    setError('');
    setFeedback(null);
    setLoading(true);
    await processFile(event.target.files[0]);
    setLoading(false);
  };

  const handleClassroomFileSelected = async (classroomFile) => {
    setError('');
    setFeedback(null);
    setLoading(true);
    await processFile(classroomFile);
    setShowClassroomIntegration(false);
    setLoading(false);
  };

  const handleGenerateFeedback = async () => {
    if (!file || !subject || !fileContent) {
      setError('Please select both a file and subject.');
      return;
    }

    if (serverStatus === 'disconnected') {
      setError('Server is not available. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const systemPrompt = generateSystemPrompt(subject);
      const feedbackData = await generateFeedback(fileContent, subject, systemPrompt);
      setFeedback(feedbackData || { summary: 'No feedback available.', score: 0 });
    } catch (err) {
      setError('Error generating feedback. Please try again.');
      console.error('Feedback generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
    setError('');
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <AppHeader 
          title="Assignment Feedback System" 
          subtitle="Upload your assignment and get instant AI-powered feedback"
        />

        {serverStatus === 'disconnected' && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
            Warning: Unable to connect to feedback server. Some features may be unavailable.
          </div>
        )}

        <div className="mb-4">
          <button
            onClick={() => setShowClassroomIntegration(!showClassroomIntegration)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showClassroomIntegration ? 'Hide Classroom Integration' : 'Import from Google Classroom'}
          </button>
        </div>

        {showClassroomIntegration && (
          <ClassroomIntegration onFileSelected={handleClassroomFileSelected} />
        )}

        <FeedbackForm 
          file={file}
          onFileChange={handleFileChange}
          subject={subject}
          onSubjectChange={handleSubjectChange}
          onSubmit={handleGenerateFeedback}
          loading={loading || processing}
          subjects={subjects}
        />

        <ErrorDisplay error={error} />
        
        <FeedbackDisplay feedback={feedback} />
      </div>
    </div>
  );
};

export default FeedbackSystem;