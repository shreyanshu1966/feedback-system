import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertTriangle, Award, Star, Lightbulb, ArrowRight, Share, Download, ThumbsUp, ThumbsDown, MessageCircle, ChevronRight, BarChart, CheckCircle } from 'lucide-react';

const FeedbackDisplay = ({ feedback, aiDetection, onHighlight }) => {
  const [activeTab, setActiveTab] = useState('summary'); // summary, criteria, suggestions
  const [expandedItems, setExpandedItems] = useState({});
  const [feedbackHelpful, setFeedbackHelpful] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    if (feedbackHelpful !== null) {
      setShowThankYou(true);
      const timer = setTimeout(() => {
        setShowThankYou(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackHelpful]);
  
  if (!feedback) return null;
  
  // Add AI warning if detected
  const aiWarning = aiDetection?.is_ai_generated ? (
    <div className="mb-6 p-5 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start shadow-md animate-pulse-slow">
      <div className="bg-yellow-100 rounded-full p-2 mr-4 shadow-inner">
        <AlertTriangle className="w-7 h-7 text-yellow-600 flex-shrink-0" />
      </div>
      <div>
        <h4 className="font-semibold text-yellow-800 mb-2 text-lg">AI Content Detected</h4>
        <p className="text-yellow-700">
          This submission appears to be AI-generated. Consider checking your policies 
          on AI-assisted work.
        </p>        <div className="mt-3 text-sm bg-white bg-opacity-50 py-2 px-3 rounded-lg inline-flex items-center">
          AI detection confidence: <strong className="ml-1">{Math.round(aiDetection.ai_probability)}%</strong>
        </div>
      </div>
    </div>
  ) : null;

  // Handle highlight click
  const handleHighlight = (span) => {
    if (onHighlight) onHighlight(span);
  };
  
  // Toggle expanded state for criteria items
  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Toggle to expand all criteria
  const toggleExpandAll = () => {
    const allKeys = feedback.criteriaFeedback.map((_, index) => index);
    
    // Check if all are expanded
    const allExpanded = allKeys.every(key => expandedItems[key]);
    
    if (allExpanded) {
      // Collapse all
      setExpandedItems({});
    } else {
      // Expand all
      const newExpanded = {};
      allKeys.forEach(key => {
        newExpanded[key] = true;
      });
      setExpandedItems(newExpanded);
    }
  };
  
  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get score background
  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 50) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };
  
  // Get score icon
  const getScoreIcon = (score) => {
    if (score >= 80) return <Award className="w-5 h-5 text-green-600" />;
    if (score >= 50) return <Star className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };
  
  // Handle feedback rating
  const handleFeedbackRating = (isHelpful) => {
    setFeedbackHelpful(isHelpful);
  };
  
  // Handle comment submission
  const handleCommentSubmit = () => {
    if (commentText) {
      // Here you would normally send this to your backend
      console.log("Feedback comment:", commentText);
      setShowCommentForm(false);
      setCommentText('');
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
    }
  };
  return (
    <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden shadow-lg bg-white animate-fadeIn">
      {/* Header with score */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-1.5 mr-3 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              Feedback Report
            </h3>
            <div className="flex gap-3">
              <button className="p-2.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-300 shadow-inner">
                <Share className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-300 shadow-inner">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-indigo-200" />
              <span className="text-sm text-indigo-100 font-medium">Overall Assessment</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1.5 rounded-lg">
                Final Score
              </div>
              <div className="bg-white text-indigo-700 font-bold text-lg rounded-full h-14 w-14 flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-300">
                {feedback.score}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3"></div>
      </div>
      
      <div className="p-6">
        {aiWarning}
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`pb-3 px-5 font-medium flex items-center transition-all duration-200
              ${activeTab === 'summary' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('summary')}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 shadow-sm transition-colors duration-200
              ${activeTab === 'summary' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              <span className="text-xs font-bold">1</span>
            </div>
            <div>
              <span>Summary</span>
              <p className="text-xs text-gray-400 mt-0.5">Overall assessment</p>
            </div>
          </button>
          <button 
            className={`pb-3 px-5 font-medium flex items-center transition-all duration-200
              ${activeTab === 'criteria' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('criteria')}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 shadow-sm transition-colors duration-200
              ${activeTab === 'criteria' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              <span className="text-xs font-bold">2</span>
            </div>
            <div>
              <span>Detailed Feedback</span>
              <p className="text-xs text-gray-400 mt-0.5">By criteria</p>
            </div>
          </button>
          <button 
            className={`pb-3 px-5 font-medium flex items-center transition-all duration-200
              ${activeTab === 'suggestions' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('suggestions')}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 shadow-sm transition-colors duration-200
              ${activeTab === 'suggestions' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              <span className="text-xs font-bold">3</span>
            </div>
            <div>
              <span>Suggestions</span>
              <p className="text-xs text-gray-400 mt-0.5">For improvement</p>
            </div>
          </button>
        </div>
        
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="prose prose-indigo max-w-none">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl text-gray-800 leading-relaxed border border-gray-100 mb-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-blue-500" />
                Overall Assessment
              </h4>
              <p className="whitespace-pre-line">{feedback.summary}</p>
            </div>
            
            {/* Score breakdown */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-3 text-blue-800">Score Breakdown</h4>
              <div className="space-y-3">
                {feedback.criteriaFeedback?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full ${getScoreBg(item.score)} flex items-center justify-center mr-2`}>
                        <span className={`font-bold text-xs ${getScoreColor(item.score)}`}>{item.score}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.criterion}</span>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.score >= 80 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setActiveTab('criteria')} 
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                See detailed feedback <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Criteria Tab */}
        {activeTab === 'criteria' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Criteria Assessment
              </h4>
              <button 
                onClick={toggleExpandAll}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                {Object.keys(expandedItems).length === feedback.criteriaFeedback.length ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
            
            {feedback.criteriaFeedback && feedback.criteriaFeedback.length > 0 ? (
              <div className="space-y-4">
                {feedback.criteriaFeedback.map((item, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors
                        ${expandedItems[index] ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${getScoreBg(item.score)} flex items-center justify-center mr-3 shadow-sm`}>
                          <span className={`font-bold text-lg ${getScoreColor(item.score)}`}>{item.score}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">{item.criterion}</span>
                          {!expandedItems[index] && (
                            <p className="text-xs text-gray-500 mt-0.5 max-w-md truncate">{item.feedback}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {item.highlightSpan && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHighlight(item);
                            }}
                            className="text-xs mr-3 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Highlight Text
                          </button>
                        )}
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-500 transition-transform duration-300 
                            ${expandedItems[index] ? 'transform rotate-180' : ''}`} 
                        />
                      </div>
                    </div>
                    
                    {expandedItems[index] && (
                      <div className="p-4 bg-white border-t border-gray-100">
                        <p className="text-gray-700 mb-4 whitespace-pre-line">{item.feedback}</p>
                        
                        {item.highlightSpan && (
                          <button 
                            onClick={() => handleHighlight(item)}
                            className="text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                          >
                            <span>View in document</span>
                            <ChevronRight className="ml-1 w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 italic">No criteria feedback available.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
              Improvement Suggestions
            </h4>
            {feedback.suggestions && feedback.suggestions.length > 0 ? (
              <div className="space-y-4">
                {feedback.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                    <div className="flex">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium mr-4 shadow-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-gray-800 whitespace-pre-line">{suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 italic">No suggestions available for this submission.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Feedback on feedback */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Was this feedback helpful?</h5>
              <p className="text-xs text-gray-500">Your response helps us improve our feedback quality</p>
            </div>
            
            <div className="flex space-x-3">
              {showThankYou ? (
                <div className="text-green-600 bg-green-50 px-4 py-2 rounded-lg animate-fadeIn flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Thank you for your feedback!</span>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => handleFeedbackRating(true)}
                    className={`px-4 py-2 rounded-lg flex items-center transition-colors
                      ${feedbackHelpful === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    <span className="text-sm">Helpful</span>
                  </button>
                  
                  <button 
                    onClick={() => handleFeedbackRating(false)}
                    className={`px-4 py-2 rounded-lg flex items-center transition-colors
                      ${feedbackHelpful === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    <span className="text-sm">Not Helpful</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Comment</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Comment form */}
          {showCommentForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-slideUp">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Leave a comment about this feedback</h5>
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="What did you like or dislike about this feedback?"
              ></textarea>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setShowCommentForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim()}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors
                    ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FeedbackDisplay;
