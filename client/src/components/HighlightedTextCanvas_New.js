import React from 'react';
import HighlightedTextCanvasSimple from './HighlightedTextCanvasSimple';

/**
 * Renders the text on a canvas and highlights specified spans with interactivity and tooltips.
 * This component re-exports the simplified version to fix event listener errors.
 * @param {string} text - The full text to render.
 * @param {Array<{highlightSpan: {start: number, end: number}, score: number, feedback: string, criterion: string}>} feedbacks - Array of feedback objects.
 * @param {Object} activeHighlight - The currently active highlight span.
 */
const HighlightedTextCanvas = (props) => {
  return <HighlightedTextCanvasSimple {...props} />;
};

export default HighlightedTextCanvas;
