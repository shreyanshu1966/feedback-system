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
  
  // For multiple submissions
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [multipleFeedback, setMultipleFeedback] = useState({});
  const [multipleAiDetection, setMultipleAiDetection] = useState({});
  const [activeSubmissionIndex, setActiveSubmissionIndex] = useState(0);
  const [processingMode, setProcessingMode] = useState('single'); // 'single' or 'batch'
  const [batchProgress, setBatchProgress] = useState(0);
  
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
    setProcessingMode('single');
    setMultipleFiles([]);
    setMultipleFeedback({});
    setMultipleAiDetection({});
    setLoading(true);
    await processFile(classroomFile);
    setShowClassroomIntegration(false);
    setLoading(false);
  };

  const handleMultipleClassroomFilesSelected = async (classroomFiles) => {
    if (!classroomFiles || classroomFiles.length === 0) {
      setError('No valid files were selected.');
      return;
    }
    
    setError('');
    setFeedback(null);
    setProcessingMode('batch');
    setMultipleFiles(classroomFiles);
    setMultipleFeedback({});
    setMultipleAiDetection({});
    setActiveSubmissionIndex(0);
    setBatchProgress(0);
    
    // Process the first file to show initially
    if (classroomFiles.length > 0) {
      setLoading(true);
      await processFile(classroomFiles[0]);
      setLoading(false);
    }
    
    setShowClassroomIntegration(false);
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
  
  const handleProcessAllSubmissions = async () => {
    if (multipleFiles.length === 0) {
      setError('No files to process');
      return;
    }

    if (Object.keys(multipleFeedback).length === multipleFiles.length) {
      // Already processed all files
      return;
    }

    if (!subject) {
      setError('Please select a subject before processing all submissions.');
      return;
    }

    setLoading(true);
    setError('');

    let processedCount = 0;
    const totalFiles = multipleFiles.length;
    const newMultipleFeedback = { ...multipleFeedback };
    const newMultipleAiDetection = { ...multipleAiDetection };

    for (let i = 0; i < totalFiles; i++) {
      const currentFile = multipleFiles[i];
      const fileId = currentFile.submissionId || i;
      
      // Skip already processed files
      if (newMultipleFeedback[fileId]) {
        processedCount++;
        continue;
      }

      try {
        // Process the file to extract text
        setBatchProgress(Math.round((processedCount / totalFiles) * 100));
        await processFile(currentFile);
        
        // Generate system prompt
        const systemPrompt = generateSystemPrompt(subject);
        
        // Process in parallel - generate feedback and AI detection
        const [feedbackData, aiDetectionResult] = await Promise.all([
          generateFeedback(fileContent, subject, systemPrompt),
          detectAiContent(fileContent)
        ]);
        
        // Store results
        newMultipleFeedback[fileId] = feedbackData;
        newMultipleAiDetection[fileId] = aiDetectionResult;
        
        // Update progress
        processedCount++;
        setBatchProgress(Math.round((processedCount / totalFiles) * 100));
      } catch (err) {
        console.error(`Error processing file ${currentFile.name}:`, err);
        // Continue with other files
      }
    }

    // Update state with all results
    setMultipleFeedback(newMultipleFeedback);
    setMultipleAiDetection(newMultipleAiDetection);
    
    // Display the active submission's feedback
    const activeFileId = multipleFiles[activeSubmissionIndex]?.submissionId || activeSubmissionIndex;
    setFeedback(newMultipleFeedback[activeFileId] || null);
    setAiDetection(newMultipleAiDetection[activeFileId] || null);
    
    setLoading(false);
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
          </div>          {showClassroomIntegration && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-inner animate-fadeInDown">
              <ClassroomIntegration 
                onFileSelected={handleClassroomFileSelected} 
                onMultipleFilesSelected={handleMultipleClassroomFilesSelected}
              />
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
                  {processingMode === 'batch' && multipleFiles.length > 0 && (
            <div className="mt-5 bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Batch Processing</h3>
                <div className="text-sm text-gray-600">
                  {Object.keys(multipleFeedback).length} of {multipleFiles.length} submissions processed
                </div>
              </div>
              
              <div className="relative w-full h-2 bg-gray-200 rounded-full mb-4">
                <div 
                  className={`absolute top-0 left-0 h-full ${currentThemeClasses.button} rounded-full transition-all duration-500`}
                  style={{ width: `${(Object.keys(multipleFeedback).length / multipleFiles.length) * 100}%` }}
                ></div>
              </div>

              {/* Batch Options */}
              <div className="mb-5 flex flex-wrap gap-3">
                <button 
                  onClick={handleProcessAllSubmissions}
                  disabled={loading || Object.keys(multipleFeedback).length === multipleFiles.length}
                  className={`px-4 py-2 ${currentThemeClasses.button} text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      <span>Process All Submissions</span>
                    </>
                  )}
                </button>
                
                {Object.keys(multipleFeedback).length > 0 && (
                  <button 
                    onClick={() => {
                      // Export all feedback as a CSV file
                      const csvContent = [
                        // Headers
                        ['Student ID', 'Filename', 'Score', 'AI Detection Score', 'Summary'],
                        // Data
                        ...multipleFiles.map((file, index) => {
                          const fileId = file.submissionId || index;
                          const feedbackItem = multipleFeedback[fileId];
                          const aiItem = multipleAiDetection[fileId];
                          return [
                            file.userId || 'Unknown',
                            file.name,
                            feedbackItem ? feedbackItem.score + '%' : 'N/A',
                            aiItem ? Math.round(aiItem.probability * 100) + '%' : 'N/A',
                            feedbackItem ? feedbackItem.summary.substring(0, 100) + '...' : 'Not processed'
                          ];
                        })
                      ]
                      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                      .join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'all_feedback_results.csv';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    <span>Export All Results (CSV)</span>
                  </button>
                )}
              </div>
              
              {/* Submissions Grid with Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {multipleFiles.map((file, index) => {
                  const fileId = file.submissionId || index;
                  const feedbackData = multipleFeedback[fileId];
                  const aiData = multipleAiDetection[fileId];
                  const isProcessed = !!feedbackData;
                  
                  return (
                    <div 
                      key={fileId}
                      onClick={() => {
                        setActiveSubmissionIndex(index);
                        processFile(multipleFiles[index]);
                        
                        // Set the current feedback and AI detection when clicking on a submission
                        if (feedbackData) {
                          setFeedback(feedbackData);
                          setAiDetection(aiData || null);
                        }
                      }}
                      className={`p-4 rounded-lg border ${
                        index === activeSubmissionIndex 
                          ? `border-2 ${currentThemeClasses.accent} shadow-md` 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } cursor-pointer transition-all`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="truncate max-w-[70%]">
                          <div className="font-medium truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {file.userId ? `Student ID: ${file.userId}` : 'Unknown Student'}
                          </div>
                        </div>
                        
                        {isProcessed && (
                          <div className={`px-3 py-1.5 text-sm rounded-full ${currentThemeClasses.accent} font-semibold`}>
                            {feedbackData.score}%
                          </div>
                        )}
                      </div>
                      
                      {isProcessed ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Feedback Status:</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Processed ✓
                            </span>
                          </div>
                          
                          {aiData && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">AI Detection:</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                aiData.probability > 0.7 
                                  ? 'bg-red-100 text-red-800' 
                                  : aiData.probability > 0.4
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {Math.round(aiData.probability * 100)}%
                              </span>
                            </div>
                          )}
                          
                          {/* Mini summary */}
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-700 line-clamp-2">
                              {feedbackData.summary.substring(0, 80)}...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            Pending
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* All Submissions Summary - shown when we have processed multiple submissions */}
              {Object.keys(multipleFeedback).length > 1 && (
                <div className="mt-8 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold mb-4">Class Summary</h4>
                  
                  {/* Average score */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h5 className="text-sm font-medium text-gray-600 mb-1">Average Score</h5>
                      <div className="text-2xl font-bold">
                        {Math.round(
                          Object.values(multipleFeedback)
                            .reduce((acc, item) => acc + item.score, 0) / 
                            Object.keys(multipleFeedback).length
                        )}%
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h5 className="text-sm font-medium text-gray-600 mb-1">AI Detection Risk</h5>
                      <div className="text-2xl font-bold">
                        {Math.round(
                          Object.values(multipleAiDetection)
                            .reduce((acc, item) => acc + (item ? item.probability * 100 : 0), 0) / 
                            Object.keys(multipleAiDetection).length
                        )}%
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h5 className="text-sm font-medium text-gray-600 mb-1">Submissions Processed</h5>
                      <div className="text-2xl font-bold">
                        {Object.keys(multipleFeedback).length} / {multipleFiles.length}
                      </div>
                    </div>
                  </div>
                  
                  {/* Score distribution visualization */}
                  <div className="mb-5">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Score Distribution</h5>
                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden flex">
                      {/* Count submissions in grade ranges and visualize */}
                      {(() => {
                        const ranges = {
                          '90-100': { count: 0, color: 'bg-green-500' },
                          '80-89': { count: 0, color: 'bg-green-400' },
                          '70-79': { count: 0, color: 'bg-yellow-400' },
                          '60-69': { count: 0, color: 'bg-orange-400' },
                          '0-59': { count: 0, color: 'bg-red-500' }
                        };
                        
                        Object.values(multipleFeedback).forEach(fb => {
                          if (fb.score >= 90) ranges['90-100'].count++;
                          else if (fb.score >= 80) ranges['80-89'].count++;
                          else if (fb.score >= 70) ranges['70-79'].count++;
                          else if (fb.score >= 60) ranges['60-69'].count++;
                          else ranges['0-59'].count++;
                        });
                        
                        const total = Object.keys(multipleFeedback).length;
                        
                        return Object.entries(ranges).map(([range, { count, color }]) => {
                          const percentage = (count / total) * 100;
                          return percentage > 0 ? (
                            <div 
                              key={range}
                              className={`${color} h-full`} 
                              style={{ width: `${percentage}%` }}
                              title={`${range}%: ${count} submissions`}
                            />
                          ) : null;
                        });
                      })()}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>Score Distribution</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              )}
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
    </div>  );
};

export default FeedbackSystem;
