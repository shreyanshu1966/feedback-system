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

export {
  setupPdfWorker,
  readFileContent,
  extractTextFromPDF,
  performOCR
};
