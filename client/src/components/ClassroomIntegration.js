import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import { initGoogleApi, getCourses, getAssignments, getSubmissions, downloadFile } from '../services/classroomService';

const ClassroomIntegration = ({ onFileSelected, onMultipleFilesSelected }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auth, setAuth] = useState(null);
  const [initAttempts, setInitAttempts] = useState(0);

  // Initialize Google API
  useEffect(() => {
    let isMounted = true;
    let listener = null;
    
    const setupGoogleApi = async () => {
      try {
        setError(''); // Clear any previous errors
        setLoading(true);
        
        console.log("Initializing Google API...");
        const authInstance = await initGoogleApi();
        
        if (!isMounted) return;
        
        console.log("Setting auth instance");
        setAuth(authInstance);
        
        // Listen for sign-in state changes
        listener = authInstance.isSignedIn.listen(updateSigninStatus);
        
        // Set the initial status
        updateSigninStatus(authInstance.isSignedIn.get());
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        setLoading(false);
        setError('Error initializing Google API: ' + (error.message || 'Unknown error'));
        console.error('Google API initialization error:', error);
      }
    };
    
    setupGoogleApi();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (listener) {
        listener(); // Clear the listener
      }
    };
  }, [initAttempts]); // Add initAttempts dependency to allow manual retries

  // Update sign-in status
  const updateSigninStatus = (isSignedIn) => {
    console.log("Sign-in status updated:", isSignedIn);
    
    // Check if status is changing from not signed in to signed in
    const wasSignedIn = isSignedIn;
    
    setIsSignedIn(isSignedIn);
    
    if (isSignedIn) {
      // Always load courses when signed in
      loadCourses();
    } else {
      // Clear data when signed out
      setCourses([]);
      setAssignments([]);
      setSubmissions([]);
    }
  };

  // Retry initialization
  const handleRetryInit = () => {
    setInitAttempts(prev => prev + 1);
  };

  // Sign in
  const handleSignIn = async () => {
    if (!auth) {
      setError('Google API not initialized. Please try again.');
      return;
    }
    
    try {
      setLoading(true);
      console.log("Attempting to sign in...");
      await auth.signIn();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Sign-in error: ' + (error.message || 'Unknown error'));
      console.error('Sign-in error:', error);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    if (!auth) {
      setError('Google API not initialized. Please refresh the page.');
      return;
    }
    
    try {
      setLoading(true);
      await auth.signOut();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Sign-out error: ' + (error.message || 'Unknown error'));
      console.error('Sign-out error:', error);
    }
  };

  // Load courses
  const loadCourses = async () => {
    try {
      setLoading(true);
      const courseList = await getCourses();
      setCourses(courseList);
      setLoading(false);
    } catch (error) {
      setError('Error loading courses: ' + error.message);
      setLoading(false);
    }
  };

  // Handle course selection
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setSelectedAssignment('');
    setSubmissions([]);
    
    if (courseId) {
      try {
        setLoading(true);
        const assignmentList = await getAssignments(courseId);
        setAssignments(assignmentList);
        setLoading(false);
      } catch (error) {
        setError('Error loading assignments: ' + error.message);
        setLoading(false);
      }
    } else {
      setAssignments([]);
    }
  };

  // Reset selection state when assignment changes
  const handleAssignmentChange = async (e) => {
    const assignmentId = e.target.value;
    setSelectedAssignment(assignmentId);
    setSubmissions([]); // Clear existing submissions
    setSelectedSubmissions({}); // Clear selections
    setSelectAll(false);
    
    if (assignmentId && selectedCourse) {
      try {
        setLoading(true);
        setError(''); // Clear any previous errors
        
        const submissionList = await getSubmissions(selectedCourse, assignmentId);
        
        if (submissionList && submissionList.length > 0) {
          setSubmissions(submissionList);
          console.log(`Successfully loaded ${submissionList.length} submissions`);
        } else {
          console.log('No submissions found for this assignment');
        }
        
        setLoading(false);
      } catch (error) {
        setError('Error loading submissions: ' + (error.message || 'Unknown error'));
        console.error('Failed to load submissions:', error);
        setLoading(false);
      }
    } else {
      setSubmissions([]);
    }
  };

  // Download a submission file
  const handleDownloadSubmission = async (submission) => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log("Processing submission:", submission);
      
      // Helper function to handle file download and processing
      const downloadAndProcess = async (fileId, fileName) => {
        try {
          // Download the file 
          const file = await downloadFile(fileId);
          
          console.log(`Successfully downloaded file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
          
          // Add a marker that this file came from Google Classroom
          const fileWithSource = new File(
            [await file.arrayBuffer()],
            `drive-${file.name}`, // Add 'drive-' prefix to identify classroom files
            { type: file.type }
          );
          
          // Pass the prepared file to the parent component
          onFileSelected(fileWithSource);
        } catch (error) {
          throw new Error(`Error downloading file: ${error.message}`);
        }
      };
      
      // Check for different attachment types
      if (submission.assignmentSubmission && submission.assignmentSubmission.attachments) {
        const attachments = submission.assignmentSubmission.attachments;
        
        if (attachments.length > 0) {
          const attachment = attachments[0];
          
          if (attachment.driveFile) {
            await downloadAndProcess(attachment.driveFile.id, attachment.driveFile.title || "classroom-file");
          } else if (attachment.link) {
            throw new Error('Link attachments are not supported. Please download the file manually and upload it.');
          } else {
            throw new Error(`Unsupported attachment type: ${Object.keys(attachment).join(', ')}`);
          }
        } else if (submission.assignmentSubmission.text) {
          // Handle text submission
          const textContent = submission.assignmentSubmission.text;
          const blob = new Blob([textContent], { type: 'text/plain' });
          const file = new File([blob], `submission_${submission.id}.txt`, { type: 'text/plain' });
          
          onFileSelected(file);
        } else {
          throw new Error('No attachments or text found in this submission');
        }
      } else {
        throw new Error('This submission does not contain attachments or text content.');
      }
      
      setLoading(false);
    } catch (error) {
      setError('Error downloading submission: ' + error.message);
      console.error('Submission download error:', error, 'Submission data:', submission);
      setLoading(false);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    // Create a new selection state with all submissions selected/deselected
    const newSelections = {};
    submissions.forEach(submission => {
      // Only allow selection if the submission has an attachment
      const hasAttachment = hasValidAttachment(submission);
      if (hasAttachment) {
        newSelections[submission.id] = checked;
      }
    });
    
    setSelectedSubmissions(newSelections);
  };
  
  // Handle individual submission selection
  const handleSelectSubmission = (submissionId, hasAttachment) => (e) => {
    if (!hasAttachment) return; // Don't allow selection if no attachment
    
    const checked = e.target.checked;
    setSelectedSubmissions(prev => ({
      ...prev,
      [submissionId]: checked
    }));
    
    // Update select all status
    const allSelected = submissions.every(submission => {
      const hasAttach = hasValidAttachment(submission);
      return !hasAttach || (submission.id === submissionId ? checked : !!selectedSubmissions[submission.id]);
    });
    
    setSelectAll(allSelected);
  };
  
  // Helper function to check if a submission has a valid attachment
  const hasValidAttachment = (submission) => {
    if (!submission || !submission.assignmentSubmission) return false;
    
    if (submission.assignmentSubmission.attachments && 
        submission.assignmentSubmission.attachments.length > 0) {
      return true;
    } else if (submission.assignmentSubmission.text) {
      return true;
    }
    
    return false;
  };
    // Process all selected submissions
  const handleProcessSelectedSubmissions = async () => {
    const selectedIds = Object.entries(selectedSubmissions)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);
      
    if (selectedIds.length === 0) {
      setError('Please select at least one submission to process.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Collect all selected submissions
      const selectedSubmissionData = submissions.filter(
        submission => selectedIds.includes(submission.id)
      );
      
      console.log(`Processing ${selectedIds.length} selected submissions`);
      
      // Download and process all selected submissions
      const processedFiles = [];
      
      // Helper function to handle file download and processing
      const downloadAndAddToArray = async (fileId, fileName, submission) => {
        try {
          // Download the file 
          const file = await downloadFile(fileId);
          
          // Create a file with metadata
          const fileWithMeta = new File(
            [await file.arrayBuffer()],
            `${submission.userId}_${file.name || fileName}`,
            { type: file.type }
          );
          
          // Add metadata to the file
          fileWithMeta.userId = submission.userId;
          fileWithMeta.submissionId = submission.id;
          
          processedFiles.push(fileWithMeta);
          return true;
        } catch (error) {
          console.error(`Error downloading file for submission ${submission.id}:`, error);
          return false;
        }
      };
      
      // Process each submission
      for (const submission of selectedSubmissionData) {
        try {
          if (submission.assignmentSubmission && submission.assignmentSubmission.attachments) {
            const attachments = submission.assignmentSubmission.attachments;
            
            if (attachments.length > 0) {
              const attachment = attachments[0];
              
              if (attachment.driveFile) {
                await downloadAndAddToArray(
                  attachment.driveFile.id, 
                  attachment.driveFile.title || `submission_${submission.id}`,
                  submission
                );
              }
            } else if (submission.assignmentSubmission.text) {
              // Handle text submission
              const textContent = submission.assignmentSubmission.text;
              const blob = new Blob([textContent], { type: 'text/plain' });
              const file = new File([blob], `${submission.userId}_submission_${submission.id}.txt`, { type: 'text/plain' });
              
              // Add metadata
              file.userId = submission.userId;
              file.submissionId = submission.id;
              
              processedFiles.push(file);
            }
          } else if (submission.assignmentSubmission && submission.assignmentSubmission.text) {
            // Handle text submission directly
            const textContent = submission.assignmentSubmission.text;
            const blob = new Blob([textContent], { type: 'text/plain' });
            const file = new File([blob], `${submission.userId}_submission_${submission.id}.txt`, { type: 'text/plain' });
            
            // Add metadata
            file.userId = submission.userId;
            file.submissionId = submission.id;
            
            processedFiles.push(file);
          }
        } catch (err) {
          console.error(`Error processing submission ${submission.id}:`, err);
          // Continue with other submissions
        }
      }
      
      setLoading(false);
      
      if (processedFiles.length === 0) {
        setError('Failed to process any of the selected submissions.');
        return;
      }
      
      console.log(`Successfully processed ${processedFiles.length} files`);
      
      // Pass the processed files to the parent component
      if (onMultipleFilesSelected && processedFiles.length > 1) {
        onMultipleFilesSelected(processedFiles);
      } else if (processedFiles.length > 0) {
        // If multiple files handler not provided or only one file, use single file handler
        onFileSelected(processedFiles[0]);
      }
    } catch (error) {
      setLoading(false);
      setError('Error processing submissions: ' + (error.message || 'Unknown error'));
      console.error('Batch submission processing error:', error);
    }
  };

  // Debug function for submissions
  const handleDebugSubmission = (submission) => {
    console.log("Full submission object:", submission);
    
    if (submission.assignmentSubmission) {
      console.log("Assignment submission:", submission.assignmentSubmission);
    }
    
    if (submission.attachments) {
      console.log("Attachments:", submission.attachments);
    }
    
    // Show submission details in UI
    setError(`Debugging submission: ID=${submission.id}. 
      Check the console for full details. 
      State: ${submission.state}. 
      Has attachments: ${!!(submission.attachments && submission.attachments.length)}.
      Has assignment submission: ${!!submission.assignmentSubmission}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Google Classroom Integration</h3>
      
      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={handleRetryInit}
            className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
          >
            Retry Connection
          </button>
        </div>
      )}
      
      {!isSignedIn ? (
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading || !auth}
        >
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Signed in successfully</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Select Course</label>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="w-full p-2 border rounded-lg"
              disabled={loading}
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedCourse && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Assignment</label>
              <select
                value={selectedAssignment}
                onChange={handleAssignmentChange}
                className="w-full p-2 border rounded-lg"
                disabled={loading}
              >
                <option value="">Choose an assignment...</option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>
          )}
            {selectedAssignment && submissions.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Student Submissions ({submissions.length})</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="mr-2"
                  />
                  <label htmlFor="selectAll" className="text-sm">Select All Valid Submissions</label>
                  <button
                    onClick={handleProcessSelectedSubmissions}
                    className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    disabled={loading || Object.keys(selectedSubmissions).filter(id => selectedSubmissions[id]).length === 0}
                  >
                    <span className="mr-1">Process Selected</span>
                    <span className="bg-blue-500 px-2 py-0.5 rounded-full text-xs ml-1">
                      {Object.keys(selectedSubmissions).filter(id => selectedSubmissions[id]).length}
                    </span>
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-3">
                <ul className="divide-y">
                  {submissions.map((submission) => {
                    // Determine submission type for display
                    let submissionType = "Unknown";
                    let hasAttachment = false;
                    
                    if (submission.assignmentSubmission) {
                      if (submission.assignmentSubmission.attachments && 
                          submission.assignmentSubmission.attachments.length > 0) {
                        const attachment = submission.assignmentSubmission.attachments[0];
                        hasAttachment = true;
                        if (attachment.driveFile) {
                          submissionType = "File";
                        } else if (attachment.link) {
                          submissionType = "Link";
                        } else if (attachment.youtubeVideo) {
                          submissionType = "YouTube";
                        }
                      } else if (submission.assignmentSubmission.text) {
                        submissionType = "Text";
                        hasAttachment = true;
                      }
                    }
                    
                    return (
                      <li key={submission.id} className="py-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <input
                              type="checkbox"
                              checked={!!selectedSubmissions[submission.id]}
                              onChange={handleSelectSubmission(submission.id, hasAttachment)}
                              disabled={!hasAttachment}
                              className="mr-2"
                            />
                            <span>Submission from {submission.userId}</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded ${
                              hasAttachment ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {submissionType} {!hasAttachment && '(No attachment)'}
                            </span>
                          </div>
                          <div>
                            <button
                              onClick={() => handleDebugSubmission(submission)}
                              className="px-3 py-1 mr-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              Debug
                            </button>
                            <button
                              onClick={() => handleDownloadSubmission(submission)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                              disabled={loading || !hasAttachment}
                            >
                              Use This
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{Object.keys(selectedSubmissions).filter(id => selectedSubmissions[id]).length}</span> of {submissions.length} submissions selected
                </div>
                <button
                  onClick={handleProcessSelectedSubmissions}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={loading || Object.keys(selectedSubmissions).filter(id => selectedSubmissions[id]).length === 0}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    <span>Process All Selected Submissions</span>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassroomIntegration;