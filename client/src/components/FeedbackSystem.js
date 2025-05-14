import React, { useState, useEffect, useRef } from 'react';
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
import { 
  FileText, AlertCircle, CheckCircle, ArrowUp, 
  Loader2, Sparkles, Shield, BarChart, Download, Layers,
  RefreshCw, Zap, Bookmark, ExternalLink
} from 'lucide-react';

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
  const [activeFeedbackTab, setActiveFeedbackTab] = useState('feedbackTab'); // feedbackTab, analysisTab
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('indigo');
  
  // References for scroll functions
  const textAnalysisRef = useRef(null);
  const feedbackFormRef = useRef(null);

  const { subjects, generateSystemPrompt } = SubjectManager();
  const { processFile, processing } = DocumentProcessor({
    onFileProcessed: (selectedFile, content) => {
      setFile(selectedFile);
      setFileContent(content);
      // Clear previous feedback when a new file is uploaded
      setFeedback(null);
      setAiDetection(null);
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
    if (!event.target.files || event.target.files.length === 0) {
      setFile(null);
      setFileContent('');
      setFeedback(null);
      setError('');
      return;
    }
    
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
      
      // Scroll to the feedback section
      setTimeout(() => {
        feedbackFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      
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
  
  const scrollToTextAnalysis = () => {
    if (textAnalysisRef.current) {
      textAnalysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveFeedbackTab('analysisTab');
  };
  
  const scrollToFeedback = () => {
    feedbackFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveFeedbackTab('feedbackTab');
  };
  
  const handleDownloadFeedback = () => {
    if (!feedback) return;
    
    // Create feedback content
    const feedbackContent = `
FEEDBACK REPORT
==============
Score: ${feedback.score}%

Summary:
${feedback.summary}

Criteria Feedback:
${feedback.criteriaFeedback?.map(item => `- ${item.criterion}: ${item.score}% - ${item.feedback}`).join('\n') || 'None'}

Suggestions:
${feedback.suggestions?.map(item => `- ${item}`).join('\n') || 'None'}
    `.trim();
    
    // Create and download the file
    const blob = new Blob([feedbackContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${file.name.split('.')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
    // Theme color configurations
  const themes = {
    indigo: {
      primary: 'from-indigo-700 to-blue-600',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      accent: 'bg-indigo-100 text-indigo-700',
      gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500'
    },
    emerald: {
      primary: 'from-emerald-700 to-teal-600',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      accent: 'bg-emerald-100 text-emerald-700',
      gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500'
    },
    rose: {
      primary: 'from-rose-700 to-pink-600',
      button: 'bg-rose-600 hover:bg-rose-700',
      accent: 'bg-rose-100 text-rose-700',
      gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500'
    },
    amber: {
      primary: 'from-amber-700 to-orange-600',
      button: 'bg-amber-600 hover:bg-amber-700',
      accent: 'bg-amber-100 text-amber-700',
      gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500'
    },
    violet: {
      primary: 'from-violet-700 to-purple-600',
      button: 'bg-violet-600 hover:bg-violet-700',
      accent: 'bg-violet-100 text-violet-700',
      gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-500'
    }
  };
  
  const currentThemeClasses = themes[currentTheme];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
        <div className={`bg-gradient-to-r ${currentThemeClasses.primary} p-8 text-white relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <AppHeader
                title="Assignment Feedback System"
                subtitle="Upload your assignment and receive personalized AI-powered feedback"
              />
              
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 shadow-inner flex items-center"
                  aria-label="Theme settings"
                >
                  <Layers className="h-5 w-5 text-white mr-2" />
                  <span className="text-sm font-medium">Theme</span>
                </button>
                
                {showThemeSelector && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white border border-gray-200 animate-fadeIn z-10">
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700">Choose Theme</h4>
                      <p className="text-xs text-gray-500">Personalize your experience</p>
                    </div>
                    <div className="p-2">
                      <div className="space-y-1">
                        {Object.keys(themes).map(themeName => (
                          <button
                            key={themeName}
                            onClick={() => {
                              setCurrentTheme(themeName);
                              setShowThemeSelector(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center transition-all duration-200 ${
                              currentTheme === themeName ? 'bg-gray-100 shadow-sm' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${themes[themeName].primary} mr-3 shadow-sm`}></div>
                            <span className="capitalize font-medium">{themeName}</span>
                            {currentTheme === themeName && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        </div>
          <div className="p-8 space-y-8">
          {serverStatus === 'disconnected' && (
            <div className="p-4 bg-amber-100 text-amber-900 rounded-xl border border-amber-200 flex items-center shadow-sm animate-fadeIn">
              <AlertCircle className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0" />
              <div>
                <span className="text-sm font-semibold">Warning: Unable to connect to feedback server</span>
                <p className="text-xs text-amber-800 mt-1">Some features may be unavailable. Please try again later or contact support.</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <button
              onClick={() => setShowClassroomIntegration(!showClassroomIntegration)}
              className={`px-5 py-3 ${currentThemeClasses.button} text-white rounded-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl active:scale-95`}
            >
              <FileText className="h-5 w-5 mr-2" />
              {showClassroomIntegration ? 'Hide Classroom Integration' : 'Import from Google Classroom'}
            </button>
            
            <div className="flex items-center space-x-3">
              {serverStatus === 'connected' ? (
                <div className="flex items-center text-green-700 bg-green-100 px-4 py-2 rounded-lg text-sm shadow-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Server Connected</span>
                </div>
              ) : serverStatus === 'checking' ? (
                <div className="flex items-center text-blue-700 bg-blue-100 px-4 py-2 rounded-lg text-sm shadow-sm">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span className="font-medium">Checking connection...</span>
                </div>
              ) : (
                <div className="flex items-center text-red-700 bg-red-100 px-4 py-2 rounded-lg text-sm shadow-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Server Disconnected</span>
                </div>
              )}
              
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="font-medium">Documentation</span>
              </a>
            </div>
          </div>

          {showClassroomIntegration && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-inner animate-fadeInDown">
              <ClassroomIntegration onFileSelected={handleClassroomFileSelected} />
            </div>
          )}

          <div className="bg-white rounded-xl p-7 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300" ref={feedbackFormRef}>
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
            <div className="animate-fadeInDown">
              <ErrorDisplay error={error} />
            </div>
          )}          {aiDetectionLoading && (
            <div className="mt-4 p-5 bg-blue-50 rounded-xl flex items-center border border-blue-100 shadow-sm animate-pulse">
              <div className="relative mr-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-dashed"></div>
              </div>
              <div>
                <span className="text-blue-800 font-medium block">Analyzing content origin...</span>
                <span className="text-blue-600 text-sm">Checking for AI-generated content signatures</span>
              </div>
            </div>
          )}

          {(feedback || aiDetection) && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fadeInDown">
              {/* Tab navigation for feedback sections */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  className={`flex-1 py-4 px-5 font-medium flex items-center justify-center transition-all duration-200
                    ${activeFeedbackTab === 'feedbackTab' 
                      ? `${currentThemeClasses.accent} border-b-2 border-blue-600 shadow-inner` 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                  onClick={scrollToFeedback}
                >
                  <BarChart className="w-5 h-5 mr-2" />
                  <span>Feedback Report</span>
                </button>
                
                {fileContent && feedback?.criteriaFeedback && (
                  <button
                    className={`flex-1 py-4 px-5 font-medium flex items-center justify-center transition-all duration-200
                      ${activeFeedbackTab === 'analysisTab' 
                        ? `${currentThemeClasses.accent} border-b-2 border-blue-600 shadow-inner` 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                    onClick={scrollToTextAnalysis}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    <span>Text Analysis</span>
                  </button>
                )}
                
                {feedback && (
                  <button
                    className="py-4 px-5 font-medium flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                    onClick={handleDownloadFeedback}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    <span>Download Report</span>
                  </button>
                )}
              </div>
                {/* Feedback content */}
              <div className="p-6">
                {aiDetection && (
                  <div className="mb-5">
                    <AiDetectionDisplay aiDetection={aiDetection} />
                  </div>
                )}
                
                {feedback && (
                  <div className="animate-fadeIn">
                    <FeedbackDisplay feedback={feedback} aiDetection={aiDetection} onHighlight={setHighlightedSpan} />
                  </div>
                )}
              </div>
            </div>
          )}

          {fileContent && feedback?.criteriaFeedback && (
            <div ref={textAnalysisRef} className="mt-8 bg-white rounded-xl p-8 border border-gray-200 shadow-xl animate-fadeInDown">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-3 md:mb-0">
                  <div className={`w-10 h-10 rounded-full ${currentThemeClasses.accent} flex items-center justify-center mr-3`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`${currentThemeClasses.gradientText} font-bold`}>Text Analysis</span>
                    <p className="text-sm text-gray-500 font-normal">Review your document with highlighted feedback</p>
                  </div>
                </h3>
                
                <button
                  onClick={scrollToFeedback}
                  className={`px-4 py-2 ${currentThemeClasses.button} text-white rounded-lg flex items-center shadow-md hover:shadow-lg transition-all duration-200`}
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  <span className="text-sm">Return to Feedback</span>
                </button>
              </div>
              
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 shadow-inner">
                <HighlightedTextCanvas
                  text={fileContent}
                  feedbacks={feedback?.criteriaFeedback}
                  activeHighlight={highlightedSpan}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to top button */}
      {scrollToTop && (
        <button 
          onClick={scrollToTopHandler}
          className={`fixed bottom-8 right-8 ${currentThemeClasses.button} text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-50 animate-fadeIn`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}      <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FeedbackSystem;
