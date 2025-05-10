import React, { useState, useEffect } from 'react';
import { AlertCircle, FileUp, Loader2, Send } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

const FeedbackSystem = () => {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState('');

  // Define subjects array with "Math," "English," and "Coding"
  const subjects = [
    { id: 'math', name: 'Math', criteria: ['Approach', 'Calculation', 'Presentation'] },
    { id: 'english', name: 'English', criteria: ['Grammar', 'Content', 'Creativity'] },
    { id: 'coding', name: 'Coding', criteria: ['Logic', 'Efficiency', 'Readability'] },
  ];

  // Generate system prompt based on selected subject
  const generateSystemPrompt = (subject) => {
    const subjectInfo = subjects.find((s) => s.id === subject);
    return `You are an expert ${subjectInfo.name} instructor who provides detailed feedback. 
    Evaluate submissions based on these criteria: ${subjectInfo.criteria.join(', ')}. 
    Provide specific, actionable feedback and suggestions for improvement.
    Format your response as valid JSON with the following structure:
    {
      "score": (overall percentage score),
      "summary": (brief overall assessment),
      "criteriaFeedback": [
        {
          "criterion": (criterion name),
          "score": (percentage score),
          "feedback": (specific feedback for this criterion)
        }
      ],
      "suggestions": [(array of specific improvement suggestions)]
    }`;
  };

  // Set up PDF.js worker when component mounts
  useEffect(() => {
    const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  }, []);

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = '';

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Render the page to the canvas
        await page.render(renderContext).promise;

        // Convert the canvas to an image and pass it to OCR
        const imageData = canvas.toDataURL('image/png');
        const ocrResult = await performOCR(imageData);

        // Append the OCR result to the extracted text
        extractedText += ocrResult + ' ';
      }

      // Return the combined text after processing all pages
      return extractedText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  };

  const performOCR = async (imageData) => {
    try {
      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: (m) => console.log(m), // Logs progress
      });
      console.log('OCR Result:', result.data.text); // Log the extracted text
      return result.data.text.trim();
    } catch (error) {
      console.error('OCR Error:', error);
      return 'Error performing OCR.';
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!['application/pdf', 'text/plain', 'image/png', 'image/jpeg'].includes(selectedFile.type)) {
      setError('Unsupported file type. Please upload a PDF, text, or image file.');
      return;
    }

    setLoading(true);
    setError('');
    setFeedback(null);

    try {
      if (selectedFile.type === 'application/pdf') {
        const typedText = await extractTextFromPDF(selectedFile);
        setFileContent(typedText || 'No text could be extracted.');
      } else {
        const ocrText = await performOCR(selectedFile);
        setFileContent(ocrText || 'No text could be extracted.');
      }

      setFile(selectedFile);
    } catch (err) {
      setError('Error processing file. Please try again.');
      console.error('File processing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFeedback = async () => {
    if (!file || !subject || !fileContent) {
      setError('Please select both a file and subject.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const systemPrompt = generateSystemPrompt(subject);

      const response = await fetch('http://localhost:5000/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileContent, subject, systemPrompt }),
      });

      if (!response.ok) {
        throw new Error('Error generating feedback');
      }

      const feedbackData = await response.json();
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
        <h2 className="text-2xl font-bold mb-4">Assignment Feedback System</h2>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Assignment</label>
            <div className="flex items-center">
              <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100">
                <FileUp className="w-5 h-5 mr-2" />
                <span>Choose File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.png,.jpg,.jpeg"
                />
              </label>
              {file && <span className="ml-3 text-sm">{file.name}</span>}
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Subject</label>
            <select
              value={subject}
              onChange={handleSubjectChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Choose a subject...</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateFeedback}
            disabled={loading || !file || !subject}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Generate Feedback
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 inline mr-2" />
              {error}
            </div>
          )}

          {/* Feedback Display */}
          {feedback && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                Score: {feedback.score}%
              </h3>
              <p className="mb-4">{feedback.summary}</p>
              <h4 className="text-md font-semibold mb-2">Criteria Feedback:</h4>
              <ul className="list-disc pl-5 mb-4">
                {feedback.criteriaFeedback && feedback.criteriaFeedback.length > 0 ? (
                  feedback.criteriaFeedback.map((item, index) => (
                    <li key={index}>
                      <strong>{item.criterion}:</strong> {item.score}% - {item.feedback}
                    </li>
                  ))
                ) : (
                  <li>No criteria feedback available.</li>
                )}
              </ul>
              <h4 className="text-md font-semibold mb-2">Suggestions:</h4>
              <ul className="list-disc pl-5">
                {feedback.suggestions && feedback.suggestions.length > 0 ? (
                  feedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))
                ) : (
                  <li>No suggestions available.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackSystem;