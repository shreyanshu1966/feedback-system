import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Renders the text on a canvas and highlights specified spans with interactivity and tooltips.
 * Simplified version without animations to fix event listener errors.
 * @param {string} text - The full text to render.
 * @param {Array<{highlightSpan: {start: number, end: number}, score: number, feedback: string, criterion: string}>} feedbacks - Array of feedback objects.
 * @param {Object} activeHighlight - The currently active highlight span.
 */
const HighlightedTextCanvasSimple = ({ text, feedbacks = [], activeHighlight }) => {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null); // {x, y, feedback, criterion, score}
  const [lockedHighlight, setLockedHighlight] = useState(null); // Lock tooltip on click
  const [showAll, setShowAll] = useState(false); // Show all feedback tooltips
  const lineHeight = 22;
  const font = '16px monospace';
  const padding = 10;
  const maxWidth = 700;
  
  // Use a ref to store the lines calculated in useEffect
  const linesRef = useRef([]);
  
  // Helper: choose color based on score
  const getColor = useCallback((score) => {
    if (score >= 80) return '#b9fbc0'; // green
    if (score >= 50) return '#fff3bf'; // yellow
    return '#ffa8a8'; // red
  }, []);

  // Helper: get highlight at mouse position
  const getHighlightAt = useCallback((x, y, lines, feedbacks, ctx) => {
    for (let i = 0; i < feedbacks.length; i++) {
      const fb = feedbacks[i];
      if (!fb.highlightSpan) continue;
      const { start, end } = fb.highlightSpan;
      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const lineStart = line.start;
        const lineEnd = line.start + line.text.length;
        const highlightStart = Math.max(start, lineStart);
        const highlightEnd = Math.min(end, lineEnd);
        if (highlightStart < highlightEnd) {
          // Calculate x/y for highlight
          const pre = line.text.slice(0, highlightStart - lineStart);
          const highlight = line.text.slice(highlightStart - lineStart, highlightEnd - lineStart);
          const preWidth = ctx.measureText(pre).width;
          const highlightWidth = ctx.measureText(highlight).width;
          const yTop = padding + li * lineHeight;
          const yBottom = yTop + lineHeight;
          const xStart = padding + preWidth;
          const xEnd = xStart + highlightWidth;
          if (x >= xStart && x <= xEnd && y >= yTop && y <= yBottom) {
            return { ...fb, x: xEnd, y: yTop };
          }
        }
      }
    }
    return null;
  }, [padding, lineHeight]);

  // Helper: get all highlight rects for minimap
  const getAllHighlightRects = useCallback((lines, feedbacks, ctx) => {
    const rects = [];
    feedbacks.forEach((fb, idx) => {
      if (!fb.highlightSpan) return;
      const { start, end } = fb.highlightSpan;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = line.start;
        const lineEnd = line.start + line.text.length;
        const highlightStart = Math.max(start, lineStart);
        const highlightEnd = Math.min(end, lineEnd);
        if (highlightStart < highlightEnd) {
          const pre = line.text.slice(0, highlightStart - lineStart);
          const highlight = line.text.slice(highlightStart - lineStart, highlightEnd - lineStart);
          const preWidth = ctx.measureText(pre).width;
          const highlightWidth = ctx.measureText(highlight).width;
          const yTop = padding + i * lineHeight;
          rects.push({
            x: padding + preWidth,
            y: yTop,
            width: highlightWidth,
            height: lineHeight,
            color: getColor(fb.score),
            fbIdx: idx
          });
        }
      }
    });
    return rects;
  }, [padding, lineHeight, getColor]);

  // Click handler to lock/unlock tooltips
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Use the lines stored in the ref
    const lines = linesRef.current;
    if (!lines || !lines.length) return;
    
    const found = getHighlightAt(x, y, lines, feedbacks, ctx);
    
    if (found) {
      if (lockedHighlight && lockedHighlight.criterion === found.criterion) {
        setLockedHighlight(null);
      } else {
        setLockedHighlight(found);
      }
    } else {
      setLockedHighlight(null);
    }
  }, [feedbacks, lockedHighlight, getHighlightAt]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    // Escape key clears locked highlight
    if (e.key === 'Escape') {
      setLockedHighlight(null);
      return;
    }
    
    // Left/right arrows to navigate between highlights
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && feedbacks.length > 0) {
      e.preventDefault();
      
      // Find current index if any highlight is locked
      let currentIndex = -1;
      if (lockedHighlight) {
        currentIndex = feedbacks.findIndex(fb => 
          fb.criterion === lockedHighlight.criterion
        );
      }
      
      // Calculate next index based on direction
      let nextIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = currentIndex < feedbacks.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : feedbacks.length - 1;
      }
      
      // Set the new locked highlight
      setLockedHighlight(feedbacks[nextIndex]);
    }
  }, [feedbacks, lockedHighlight]);

  // Use effect to set up the canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up canvas context
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Prepare lines and char-to-pos mapping
    const lines = [];
    let tempLine = '';
    let tempLineStart = 0;
    for (let i = 0; i < text.length; i++) {
      tempLine += text[i];
      if (text[i] === '\n' || ctx.measureText(tempLine).width > maxWidth) {
        lines.push({ text: tempLine, start: tempLineStart });
        tempLineStart = i + 1;
        tempLine = '';
      }
    }
    if (tempLine) lines.push({ text: tempLine, start: tempLineStart });
    
    // Store lines in the ref for access in event handlers
    linesRef.current = lines;

    // Set canvas size
    canvas.width = maxWidth + padding * 2;
    canvas.height = lines.length * lineHeight + padding * 2;

    // Draw highlights for all feedbacks
    feedbacks.forEach((fb) => {
      if (!fb.highlightSpan) return;
      const { start, end } = fb.highlightSpan;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineStart = line.start;
        const lineEnd = line.start + line.text.length;
        const highlightStart = Math.max(start, lineStart);
        const highlightEnd = Math.min(end, lineEnd);
        if (highlightStart < highlightEnd) {
          const pre = line.text.slice(0, highlightStart - lineStart);
          const highlight = line.text.slice(highlightStart - lineStart, highlightEnd - lineStart);
          const preWidth = ctx.measureText(pre).width;
          const highlightWidth = ctx.measureText(highlight).width;
          const yTop = padding + i * lineHeight;
          ctx.save();
          ctx.globalAlpha = (lockedHighlight && lockedHighlight.criterion === fb.criterion) || 
                            (activeHighlight && activeHighlight.criterion === fb.criterion) ? 0.9 : 0.5;
          ctx.fillStyle = getColor(fb.score);
          ctx.fillRect(padding + preWidth, yTop, highlightWidth, lineHeight - 4);
          ctx.restore();
        }
      }
    });

    // Draw text
    ctx.font = font;
    ctx.fillStyle = '#222';
    lines.forEach((line, i) => {
      ctx.fillText(line.text, padding, padding + (i + 1) * lineHeight - 6);
    });

    // Draw minimap/overview bar
    const minimapHeight = 8;
    const minimapY = canvas.height - minimapHeight - 2;
    ctx.save();
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(padding, minimapY, maxWidth, minimapHeight);
    // Draw highlight locations on minimap
    const rects = getAllHighlightRects(lines, feedbacks, ctx);
    rects.forEach(rect => {
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, minimapY, Math.max(rect.width, 2), minimapHeight);
    });
    ctx.restore();

    // Define event handlers
    function handleMouseMove(e) {
      if (lockedHighlight) return; // Don't show hover tooltip if locked
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const found = getHighlightAt(x, y, lines, feedbacks, ctx);
      if (found) {
        setTooltip({
          x: x + 10,
          y: y - 10,
          ...found
        });
      } else {
        setTooltip(null);
      }
    }

    function handleMouseLeave() {
      if (!lockedHighlight) setTooltip(null);
    }

    // Store event handler references for cleanup
    const mouseMoveHandler = handleMouseMove;
    const mouseLeaveHandler = handleMouseLeave;
    const clickHandler = handleClick;
    const keyDownHandler = handleKeyDown;

    // Add event listeners
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseleave', mouseLeaveHandler);
    canvas.addEventListener('click', clickHandler);
    canvas.setAttribute('tabindex', 0);
    canvas.addEventListener('keydown', keyDownHandler);
    
    // Return cleanup function
    return () => {
      const currentCanvas = canvasRef.current;
      if (currentCanvas) {
        try {
          currentCanvas.removeEventListener('mousemove', mouseMoveHandler);
          currentCanvas.removeEventListener('mouseleave', mouseLeaveHandler);
          currentCanvas.removeEventListener('click', clickHandler);
          currentCanvas.removeEventListener('keydown', keyDownHandler);
        } catch (error) {
          console.warn('Error removing event listeners:', error);
        }
      }
    };
  }, [
    text, 
    feedbacks, 
    activeHighlight, 
    lockedHighlight, 
    font, 
    maxWidth, 
    lineHeight, 
    padding, 
    getColor,
    getHighlightAt,
    getAllHighlightRects,
    handleClick,
    handleKeyDown
  ]);

  // Show all feedback tooltips
  const renderAllTooltips = () => {
    if (!showAll) return null;
    
    return feedbacks.map((fb, idx) => {
      if (!fb.highlightSpan) return null;
      
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !linesRef.current.length) return null;
      
      // Find first line with highlight
      const { start, end } = fb.highlightSpan;
      const lines = linesRef.current;
      
      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const lineStart = line.start;
        const lineEnd = line.start + line.text.length;
        const highlightStart = Math.max(start, lineStart);
        const highlightEnd = Math.min(end, lineEnd);
        
        if (highlightStart < highlightEnd) {
          const pre = line.text.slice(0, highlightStart - lineStart);
          const preWidth = ctx.measureText(pre).width;
          const yTop = padding + li * lineHeight;
          
          return (
            <div
              key={idx}
              className="absolute z-10 p-2 bg-white border border-gray-300 rounded shadow text-xs max-w-xs"
              style={{ left: preWidth + 40, top: yTop + 10 + idx * 10, pointerEvents: 'none' }}
              aria-label={`Feedback for ${fb.criterion}`}
            >
              <div className="font-semibold mb-1">{fb.criterion} ({fb.score}%)</div>
              <div>{fb.feedback}</div>
            </div>
          );
        }
      }
      return null;
    });
  };

  // Legend items for color coding
  const legend = [
    { color: '#b9fbc0', label: 'Good (80-100%)' },
    { color: '#fff3bf', label: 'Average (50-79%)' },
    { color: '#ffa8a8', label: 'Needs Improvement (<50%)' }
  ];

  return (
    <div className="my-4 border rounded-lg overflow-x-auto bg-gray-50 relative" aria-label="Assignment text with highlights">
      <div className="flex items-center gap-4 px-2 pt-2">
        <button
          className="px-2 py-1 text-xs bg-blue-100 rounded hover:bg-blue-200 border"
          onClick={() => setShowAll(prev => !prev)}
          aria-pressed={showAll}
        >
          {showAll ? 'Hide All Feedback' : 'Show All Feedback'}
        </button>
        <span className="text-xs text-gray-500">Click a highlight to lock/unlock feedback. Use arrow keys to cycle.</span>
      </div>
      
      <canvas
        ref={canvasRef}
        style={{ width: maxWidth + padding * 2, maxWidth: '100%', cursor: 'pointer', outline: 'none' }}
        tabIndex={0}
        aria-label="Assignment text canvas"
      />
      
      {/* Tooltip for hover */}
      {tooltip && !showAll && (
        <div
          className="absolute z-10 p-2 bg-white border border-gray-300 rounded shadow text-xs max-w-xs"
          style={{ left: tooltip.x, top: tooltip.y, pointerEvents: 'none' }}
          aria-label={`Feedback for ${tooltip.criterion}`}
        >
          <div className="font-semibold mb-1">{tooltip.criterion} ({tooltip.score}%)</div>
          <div>{tooltip.feedback}</div>
        </div>
      )}
      
      {/* All tooltips when "Show All" is enabled */}
      {renderAllTooltips()}
      
      {/* Legend */}
      <div className="flex gap-4 mt-2 ml-2 mb-2">
        {legend.map((item, idx) => (
          <div key={idx} className="flex items-center text-xs">
            <span 
              className="inline-block w-4 h-4 rounded mr-1 border" 
              style={{ background: item.color }}
            ></span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HighlightedTextCanvasSimple;
