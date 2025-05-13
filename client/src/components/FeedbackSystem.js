import React, { useState, useEffect } from 'react';
import { setupPdfWorker } from '../services/documentService';
import { generateFeedback, checkServerHealth, detectAiContent } from '../services/apiService';
import FeedbackForm from './FeedbackForm';
import FeedbackDisplay from './FeedbackDisplay';
import ErrorDisplay from './ErrorDisplay';
import DocumentProcessor from './DocumentProcessor';
import SubjectManager from './SubjectManager';
import AppHeader from './AppHeader';
import ClassroomIntegration from './ClassroomIntegration';
import AiDetectionDisplay from './AiDetectionDisplay';
import HighlightedTextCanvas from './HighlightedTextCanvas';
import { FileText, AlertCircle, CheckCircle, ArrowUp } from 'lucide-react';

const FeedbackSystem = () => {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [showClassroomIntegration, setShowClassroomIntegration] = useState(false);
  const [aiDetection, setAiDetection] = useState(null);
  const [aiDetectionLoading, setAiDetectionLoading] = useState(false);
  const [highlightedSpan, setHighlightedSpan] = useState(null);
  const [scrollToTop, setScrollToTop] = useState(false);

  const { subjects, generateSystemPrompt } = SubjectManager();
  const { processFile, processing } = DocumentProcessor({
    onFileProcessed: (selectedFile, content) => {
      setFile(selectedFile);
      setFileContent(content);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  useEffect(() => {
    setupPdfWorker();
    checkServerHealth()
      .then(() => setServerStatus('connected'))
      .catch(() => setServerStatus('disconnected'));
    
    const handleScroll = () => {
      setScrollToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    setAiDetection(null);

    try {
      setAiDetectionLoading(true);
      const aiDetectionPromise = detectAiContent(fileContent);

      const systemPrompt = generateSystemPrompt(subject);
      const feedbackData = await generateFeedback(fileContent, subject, systemPrompt);
      setFeedback(feedbackData || { summary: 'No feedback available.', score: 0 });

      const aiResult = await aiDetectionPromise;
      setAiDetection(aiResult);
    } catch (err) {
      if (err.message.includes('AI detection')) {
        console.error('AI detection error:', err);
      } else {
        setError('Error generating feedback. Please try again.');
        console.error('Feedback generation error:', err);
      }
    } finally {
      setLoading(false);
      setAiDetectionLoading(false);
    }
  };

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
    setError('');
    setFeedback(null);
  };

  const scrollToTopHandler = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-6 text-white">
          <AppHeader
            title="Assignment Feedback System"
            subtitle="Upload your assignment and get instant AI-powered feedback"
          />
        </div>
        
        <div className="p-8 space-y-8">
          {serverStatus === 'disconnected' && (
            <div className="p-4 bg-amber-100 text-amber-900 rounded-xl border border-amber-200 flex items-center shadow-sm">
              <AlertCircle className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0" />
              <span className="text-sm font-semibold">Warning: Unable to connect to feedback server. Some features may be unavailable.</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <button
              onClick={() => setShowClassroomIntegration(!showClassroomIntegration)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center shadow-lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              {showClassroomIntegration ? 'Hide Classroom Integration' : 'Import from Google Classroom'}
            </button>
            
            {serverStatus === 'connected' && (
              <div className="flex items-center text-green-700 bg-green-100 px-3 py-1.5 rounded-lg text-sm shadow-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Server Connected</span>
              </div>
            )}
          </div>

          {showClassroomIntegration && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 shadow-inner">
              <ClassroomIntegration onFileSelected={handleClassroomFileSelected} />
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <FeedbackForm
              file={file}
              onFileChange={handleFileChange}
              subject={subject}
              onSubjectChange={handleSubjectChange}
              onSubmit={handleGenerateFeedback}
              loading={loading || processing}
              subjects={subjects}
            />
          </div>

          {error && (
            <div className="animate-fade-in">
              <ErrorDisplay error={error} />
            </div>
          )}

          {aiDetectionLoading && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl flex items-center border border-blue-100 shadow-sm animate-pulse">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
              <span className="text-blue-800 font-medium">Analyzing content origin...</span>
            </div>
          )}

          {aiDetection && (
            <div className="animate-fade-in">
              <AiDetectionDisplay aiDetection={aiDetection} />
            </div>
          )}

          {feedback && (
            <div className="animate-fade-in">
              <FeedbackDisplay feedback={feedback} onHighlight={setHighlightedSpan} />
            </div>
          )}

          {fileContent && feedback?.criteriaFeedback && (
            <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-md animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Text Analysis</h3>
              <HighlightedTextCanvas
                text={fileContent}
                feedbacks={feedback?.criteriaFeedback}
                activeHighlight={highlightedSpan}
              />
            </div>
          )}
        </div>
      </div>

      {/* Scroll to top button */}
      {scrollToTop && (
        <button 
          onClick={scrollToTopHandler}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-3 rounded-full shadow-xl hover:bg-indigo-700 transition-colors duration-200 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default FeedbackSystem;
