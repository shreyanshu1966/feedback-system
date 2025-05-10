import React, { useState } from 'react';
import { extractTextFromPDF, performOCR } from '../services/documentService';

const DocumentProcessor = ({ onFileProcessed, onError }) => {
  const [processing, setProcessing] = useState(false);

  const createImageFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      // Create a local URL for the file
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      
      // Set up event handlers
      img.onload = () => {
        // Success - release the object URL and return the loaded image
        resolve(img);
      };
      
      img.onerror = () => {
        // Clean up and report error
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image from file'));
      };
      
      // Set crossOrigin to handle potential CORS issues
      img.crossOrigin = 'anonymous';
      img.src = objectUrl;
    });
  };

  const processFile = async (file) => {
    if (!file) {
      onError('No file selected');
      return;
    }

    // More comprehensive file type checking
    const validTypes = {
      'application/pdf': 'pdf',
      'text/plain': 'text',
      'image/png': 'image',
      'image/jpeg': 'image',
      'image/jpg': 'image'
    };

    // Try to determine file type even when MIME type is missing/invalid
    let fileType = validTypes[file.type];
    
    // If type is undefined but has a filename, try to determine from extension
    if (!fileType && file.name) {
      const extension = file.name.split('.').pop().toLowerCase();
      const extensionMap = {
        'pdf': 'pdf',
        'txt': 'text',
        'text': 'text',
        'png': 'image',
        'jpg': 'image',
        'jpeg': 'image'
      };
      fileType = extensionMap[extension];
    }

    if (!fileType) {
      onError(`Unsupported file type: ${file.type || 'unknown'}. Please upload a PDF, text file, or image (PNG/JPEG only).`);
      return;
    }

    setProcessing(true);

    try {
      let extractedContent = '';
      
      // Check file size
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File is too large. Please upload a file smaller than 10MB.');
      }
      
      console.log(`Processing file: ${file.name}, type: ${fileType}, size: ${file.size} bytes`);
      
      switch (fileType) {
        case 'pdf':
          try {
            console.log('Extracting text from PDF...');
            extractedContent = await extractTextFromPDF(file);
            
            // Add extra check for minimal viable content
            if (extractedContent && extractedContent.trim().length < 10) {
              console.warn('PDF extraction returned very little text, content may be incomplete');
            }
          } catch (pdfError) {
            console.error('PDF extraction error:', pdfError);
            
            // Try to recover using a different approach - read as binary and attempt OCR directly
            try {
              console.log('Attempting alternative PDF extraction...');
              const reader = new FileReader();
              
              // Read file as ArrayBuffer
              const arrayBuffer = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
              });

              // Use pdf-lib to process the PDF
              const { PDFDocument } = await import('pdf-lib');
              const pdfDoc = await PDFDocument.load(arrayBuffer);
              
              // Extract pages as images for OCR
              let combinedText = '';
              
              for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                const page = pdfDoc.getPages()[i];
                
                // Convert page to PNG
                const pngBytes = await page.renderToImage({
                  width: page.getWidth() * 2, // Higher resolution for better OCR
                  height: page.getHeight() * 2,
                  format: 'png'
                });
                
                // Create image blob
                const pngBlob = new Blob([pngBytes], { type: 'image/png' });
                
                // Perform OCR on the page image
                try {
                  const pageText = await performOCR(pngBlob);
                  combinedText += pageText + ' ';
                } catch (ocrError) {
                  console.warn(`OCR failed for page ${i + 1}:`, ocrError);
                }
              }
              
              if (combinedText.trim()) {
                return combinedText;
              }
              
              throw new Error('No text could be extracted using alternative method');
            } catch (altError) {
              console.error('Alternative PDF extraction failed:', altError);
              throw new Error(`PDF processing failed: ${pdfError.message}`);
            }
          }
          break;
          
        case 'image':
          try {
            console.log('Performing OCR on image...');
            
            const processImageWithFallbacks = async (imageFile) => {
              console.log('Processing classroom image with custom handling');
              
              // For Google Classroom files, use a more direct approach first
              if (imageFile.name.includes('drive-')) {
                try {
                  // Convert file to ArrayBuffer
                  const arrayBuffer = await imageFile.arrayBuffer();
                  
                  // Create a new image file with proper MIME type
                  const properImageFile = new File(
                    [arrayBuffer],
                    imageFile.name,
                    { type: 'image/png' }
                  );
                  
                  // Load image into an Image element
                  const img = await createImageFromFile(properImageFile);
                  
                  // Create a canvas to draw the image
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  
                  // Draw the image to the canvas
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0);
                  
                  // Get as PNG data URL for OCR
                  const dataUrl = canvas.toDataURL('image/png');
                  
                  // Use the data URL for OCR
                  return await performOCR(dataUrl);
                } catch (err) {
                  console.warn('Google Classroom optimized approach failed:', err);
                }
              }
              
              // Continue with the existing fallback methods
              let errors = [];
              
              // First, attempt to convert to data URL regardless of size
              try {
                console.log('Attempting data URL conversion...');
                const reader = new FileReader();
                const dataUrl = await new Promise((resolve, reject) => {
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = (e) => reject(new Error('Error reading image file'));
                  reader.readAsDataURL(imageFile);
                });
                
                // Preload image with timeout and error handling
                await new Promise((resolve, reject) => {
                  const img = new Image();
                  const timeout = setTimeout(() => {
                    img.src = ''; // Cancel loading
                    reject(new Error('Image load timeout'));
                  }, 10000); // 10 second timeout
                  
                  img.onload = () => {
                    clearTimeout(timeout);
                    // Validate image dimensions
                    if (img.width === 0 || img.height === 0) {
                      reject(new Error('Invalid image dimensions'));
                      return;
                    }
                    resolve();
                  };
                  
                  img.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to load image from data URL'));
                  };
                  
                  // Set crossOrigin to handle CORS issues
                  img.crossOrigin = 'anonymous';
                  img.src = dataUrl;
                });
                
                return await performOCR(dataUrl);
              } catch (err) {
                console.warn('Data URL approach failed:', err);
                errors.push(err);
              }
              
              // Second, try canvas approach
              try {
                console.log('Attempting canvas conversion...');
                const img = new Image();
                const objectUrl = URL.createObjectURL(imageFile);
                
                try {
                  const loadedImg = await new Promise((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = (e) => reject(new Error('Failed to load image from object URL'));
                    img.src = objectUrl;
                  });
                  
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  
                  canvas.width = loadedImg.width;
                  canvas.height = loadedImg.height;
                  ctx.drawImage(loadedImg, 0, 0);
                  
                  // Get as PNG data URL
                  const pngDataUrl = canvas.toDataURL('image/png');
                  
                  // Clean up
                  URL.revokeObjectURL(objectUrl);
                  
                  return await performOCR(pngDataUrl);
                } catch (err) {
                  URL.revokeObjectURL(objectUrl);
                  throw err;
                }
              } catch (err) {
                console.warn('Canvas approach failed:', err);
                errors.push(err);
              }
              
              // Third, try special Google Classroom approach - create a new file with corrected data
              try {
                console.log('Attempting Google Classroom file fix...');
                
                // Extract the raw image data
                const arrayBuffer = await imageFile.arrayBuffer();
                
                // Create a new clean file with the same data but explicit type
                const cleanedFile = new File(
                  [arrayBuffer], 
                  `fixed-${imageFile.name}`, 
                  { type: 'image/png' }
                );
                
                // Try to process with blob URL approach
                const blobUrl = URL.createObjectURL(cleanedFile);
                
                try {
                  // Use fetch to validate the image
                  const response = await fetch(blobUrl);
                  const blob = await response.blob();
                  
                  // Try OCR directly on the blob
                  const result = await performOCR(blob);
                  
                  // Clean up
                  URL.revokeObjectURL(blobUrl);
                  
                  return result;
                } catch (err) {
                  URL.revokeObjectURL(blobUrl);
                  throw err;
                }
              } catch (err) {
                console.warn('Google Classroom fix approach failed:', err);
                errors.push(err);
              }
              
              // If all approaches failed, throw a combined error
              throw new Error(`All image processing approaches failed: ${errors.map(e => e.message).join(', ')}`);
            };
            
            // Process the image using our enhanced method with fallbacks
            extractedContent = await processImageWithFallbacks(file);
            
          } catch (ocrError) {
            console.error('OCR error:', ocrError);
            throw new Error(`Image processing failed: ${ocrError.message}`);
          }
          break;
          
        case 'text':
          console.log('Reading text file...');
          extractedContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Error reading text file'));
            reader.readAsText(file);
          });
          break;
          
        default:
          throw new Error('Unsupported file type');
      }

      if (!extractedContent) {
        throw new Error('No content could be extracted from the file');
      }

      onFileProcessed(file, extractedContent);
    } catch (err) {
      const errorMessage = err.message || 'Error processing file';
      console.error('File processing error:', err);
      
      // Provide more user-friendly error messages
      let friendlyMessage = errorMessage;
      
      if (errorMessage.includes('Image format not recognized') || 
          errorMessage.includes('Error processing image')) {
        friendlyMessage = 'The image format could not be processed. Please try converting it to PNG or JPEG format using an image editor and try again.';
      } else if (errorMessage.includes('PDF processing failed')) {
        friendlyMessage = 'Could not extract text from this PDF. It may be scanned or have security restrictions.';
      } else {
        friendlyMessage = `${errorMessage}. Please try again with a different file or format.`;
      }
      
      onError(friendlyMessage);
    } finally {
      setProcessing(false);
    }
  };

  return { processFile, processing };
};

export default DocumentProcessor;
