import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set up PDF.js worker
const setupPdfWorker = () => {
  const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
};

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

    // Try direct text extraction first (more reliable when available)
    try {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText += pageText + ' ';
      }
      
      // If we got some text directly, return it
      if (extractedText.trim().length > 10) {
        console.log("Successfully extracted text directly from PDF");
        return extractedText.trim();
      }
    } catch (textExtractionError) {
      console.log("Direct text extraction failed, falling back to OCR", textExtractionError);
    }

    // Fall back to OCR approach if direct extraction failed or returned little text
    console.log("Using OCR fallback for PDF...");
    
    // Increase rendering quality for better OCR results
    const scale = 2.0; // Higher scale = better quality for OCR

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });

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
      const imageData = canvas.toDataURL('image/png', 1.0); // Use maximum quality
      
      try {
        const ocrResult = await performOCR(imageData);
        // Append the OCR result to the extracted text
        extractedText += ocrResult + ' ';
      } catch (ocrError) {
        console.warn(`OCR failed for page ${i}, continuing with other pages`, ocrError);
      }
    }

    // Return the combined text after processing all pages
    if (extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from any PDF page');
    }
    
    return extractedText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

// Improve OCR performance and reliability
const performOCR = async (imageData) => {
  let objectUrl = null;
  
  try {
    // Check if input is valid
    if (!imageData) {
      throw new Error('No image data provided');
    }

    // If imageData is a File object, validate and convert it properly
    let imageSource = imageData;
    
    if (imageData instanceof File) {
      // Create a proper URL for the image
      objectUrl = URL.createObjectURL(imageData);
      imageSource = objectUrl;
    } 
    
    // Configure Tesseract with more options for better results
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => console.debug('Tesseract progress:', m),
      errorHandler: e => console.error('Tesseract error:', e)
    });
    
    // Configure recognizer to optimize for document text
    await worker.setParameters({
      tessedit_ocr_engine_mode: 3, // Legacy + LSTM mode for better results
      preserve_interword_spaces: 1,
      tessjs_create_pdf: '0'
    });
    
    // Set a timeout to prevent hanging on problematic images
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OCR operation timed out')), 60000) // Longer timeout
    );
    
    // Try to recognize with timeout
    const result = await Promise.race([
      worker.recognize(imageSource),
      timeoutPromise
    ]);
    
    // Release worker resources
    await worker.terminate();

    // Validate result - accept even minimal text
    if (!result?.data?.text) {
      throw new Error('OCR found no text in the image');
    }

    return result.data.text.trim();
  } catch (error) {
    // More detailed error for debugging
    console.error('OCR Processing Error:', {
      message: error.message || 'Unknown OCR error',
      name: error.name,
      imageType: typeof imageData === 'string' ? 'data URL' : (imageData instanceof File ? 'File' : typeof imageData)
    });
    
    throw error;
  } finally {
    // Always clean up object URL if we created one
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
};

export {
  setupPdfWorker,
  readFileContent,
  extractTextFromPDF,
  performOCR
};
