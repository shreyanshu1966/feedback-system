import React, { useState } from 'react';
import { extractTextFromPDF, performOCR } from '../services/documentService';

const DocumentProcessor = ({ onFileProcessed, onError }) => {
  const [processing, setProcessing] = useState(false);

  const processFile = async (file) => {
    if (!file) return;

    if (!['application/pdf', 'text/plain', 'image/png', 'image/jpeg'].includes(file.type)) {
      onError('Unsupported file type. Please upload a PDF, text, or image file.');
      return;
    }

    setProcessing(true);

    try {
      let extractedContent = '';
      
      if (file.type === 'application/pdf') {
        extractedContent = await extractTextFromPDF(file);
      } else if (['image/png', 'image/jpeg'].includes(file.type)) {
        extractedContent = await performOCR(file);
      } else {
        // For text files, just read the content directly
        const reader = new FileReader();
        extractedContent = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
      }
      
      onFileProcessed(file, extractedContent || 'No text could be extracted.');
    } catch (err) {
      onError('Error processing file. Please try again.');
      console.error('File processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return { processFile, processing };
};

export default DocumentProcessor;
