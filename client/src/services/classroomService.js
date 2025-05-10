/* global google */
import { gapi } from 'gapi-script';

// API scopes required for Google Classroom integration
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];

// Get your client ID from environment variables
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Initialize the tokenClient for Google Identity Services
let tokenClient = null;

/**
 * Check if gapi is loaded
 */
const isGapiLoaded = () => {
  return !!window.gapi;
};

/**
 * Check if Google Identity Services is loaded
 */
const isGisLoaded = () => {
  return !!window.google?.accounts?.oauth2;
};

/**
 * Wait for both gapi and GIS to load with a timeout
 */
const waitForLibraries = (timeoutMs = 10000) => {
  return new Promise((resolve, reject) => {
    // Set a timeout to fail if libraries don't load
    const timeout = setTimeout(() => {
      clearInterval(checkLibraries);
      reject(new Error("Timeout waiting for Google APIs to load"));
    }, timeoutMs);

    const checkLibraries = setInterval(() => {
      if (isGapiLoaded() && isGisLoaded()) {
        clearInterval(checkLibraries);
        clearTimeout(timeout);
        resolve();
      }
    }, 100);
  });
};

// Keep track of initialization state
let initializationPromise = null;

/**
 * Initialize the Google API client
 */
export const initGoogleApi = async () => {
  try {
    // Only initialize once
    if (initializationPromise) {
      return await initializationPromise;
    }
    
    // Create and store the initialization promise
    initializationPromise = (async () => {
      try {
        console.log("Starting Google API initialization...");
        
        // Wait for libraries to be available
        await waitForLibraries();
        console.log("Google API libraries loaded");
        
        // Initialize gapi client
        await new Promise((resolve, reject) => {
          gapi.load('client', async () => {
            try {
              await gapi.client.init({
                discoveryDocs: [
                  'https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest',
                  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                ]
              });
              console.log("GAPI client initialized");
              resolve();
            } catch (error) {
              console.error("Error initializing GAPI client:", error);
              reject(error);
            }
          });
        });
        
        // Check for an existing token first
        const existingToken = sessionStorage.getItem('gapi-token');
        if (existingToken) {
          console.log("Found existing token, setting it");
          gapi.client.setToken({
            access_token: existingToken
          });
        }
        
        // Initialize Google Identity Services token client
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(' '),
          callback: () => {} // Handled separately
        });
        console.log("Token client initialized");
        
        // Create a custom event system for sign-in status
        const eventSystem = {
          callbacks: new Set(),
          currentStatus: !!sessionStorage.getItem('gapi-token'),
          
          emit(status) {
            if (this.currentStatus !== status) {
              this.currentStatus = status;
              this.callbacks.forEach(cb => cb(status));
            }
          },
          
          addListener(callback) {
            this.callbacks.add(callback);
            // Call it once immediately with current status
            callback(this.currentStatus);
            
            // Return a function to remove the listener
            return () => this.callbacks.delete(callback);
          }
        };
        
        // Return a custom auth object compatible with our existing code
        return {
          isSignedIn: {
            get: () => {
              // Check if we have a token in session storage
              return !!sessionStorage.getItem('gapi-token');
            },
            listen: (callback) => {
              // Use our custom event system instead
              return eventSystem.addListener(callback);
            }
          },
          signIn: async () => {
            return new Promise((resolve, reject) => {
              try {
                if (!tokenClient) {
                  reject(new Error("Token client not initialized"));
                  return;
                }
                
                tokenClient.callback = async (response) => {
                  if (response.error) {
                    reject(new Error(response.error));
                    return;
                  }
                  
                  // Store token in session storage
                  sessionStorage.setItem('gapi-token', response.access_token);
                  
                  // Set token for gapi client
                  gapi.client.setToken({
                    access_token: response.access_token
                  });
                  
                  console.log("Successfully signed in");
                  // Emit sign-in event
                  eventSystem.emit(true);
                  
                  resolve(response);
                };
                
                tokenClient.requestAccessToken();
              } catch (error) {
                console.error("Sign-in error:", error);
                reject(error);
              }
            });
          },
          signOut: async () => {
            try {
              // Clear token from session storage
              sessionStorage.removeItem('gapi-token');
              
              // Revoke token
              const token = gapi.client.getToken();
              if (token && token.access_token) {
                google.accounts.oauth2.revoke(token.access_token);
                gapi.client.setToken(null);
              }
              
              // Emit sign-out event
              eventSystem.emit(false);
              
              console.log("Successfully signed out");
            } catch (error) {
              console.error("Sign-out error:", error);
              throw error;
            }
          }
        };
      } catch (error) {
        console.error("Error in initialization process:", error);
        // Clear initialization promise so we can try again
        initializationPromise = null;
        throw error;
      }
    })();
    
    return await initializationPromise;
  } catch (error) {
    console.error("Error initializing Google API:", error);
    // Clear initialization promise so we can try again
    initializationPromise = null;
    throw error;
  }
};

// Check for existing token and set it for gapi client
export const checkExistingToken = async () => {
  const token = sessionStorage.getItem('gapi-token');
  if (token && gapi.client) {
    gapi.client.setToken({
      access_token: token
    });
    return true;
  }
  return false;
};

/**
 * Get the list of courses the user is enrolled in
 */
export const getCourses = async () => {
  try {
    // Additional debugging
    console.log("Fetching courses...");
    
    // Check for token directly
    const token = sessionStorage.getItem('gapi-token');
    if (!token) {
      console.error("No token found in session storage");
      throw new Error('Not signed in');
    }
    
    // Ensure token is set before making the request
    gapi.client.setToken({
      access_token: token
    });
    
    // Make the request
    const response = await gapi.client.classroom.courses.list({
      pageSize: 20,
      courseStates: ['ACTIVE']
    });
    
    console.log("Courses response:", response);
    return response.result.courses || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Get the list of assignments for a specific course
 * 
 * @param {string} courseId - The ID of the course
 */
export const getAssignments = async (courseId) => {
  try {
    const response = await gapi.client.classroom.courses.courseWork.list({
      courseId: courseId,
      orderBy: 'dueDate desc'
    });
    
    return response.result.courseWork || [];
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

/**
 * Get student submissions for a specific assignment
 * 
 * @param {string} courseId - The ID of the course
 * @param {string} courseWorkId - The ID of the assignment
 */
export const getSubmissions = async (courseId, courseWorkId) => {
  try {
    console.log(`Fetching submissions for course ${courseId}, assignment ${courseWorkId}`);
    
    // First, make the request without specifying fields to avoid errors
    const response = await gapi.client.classroom.courses.courseWork.studentSubmissions.list({
      courseId: courseId,
      courseWorkId: courseWorkId
    });
    
    console.log("Submissions response:", response);
    
    const submissions = response.result.studentSubmissions || [];
    console.log(`Found ${submissions.length} submissions`);
    
    return submissions;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

/**
 * Download a file from Google Drive
 * 
 * @param {string} fileId - The ID of the file in Google Drive
 */
export const downloadFile = async (fileId) => {
  try {
    // Get file metadata
    const metadataResponse = await gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'name,mimeType'
    });
    
    const metadata = metadataResponse.result;
    
    // Get file content as ArrayBuffer instead of using 'alt: media'
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('gapi-token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    // Get file as blob
    const blob = await response.blob();
    
    // Create a File object with explicit type
    return new File([blob], metadata.name, { 
      type: metadata.mimeType,
      lastModified: new Date().getTime() 
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};