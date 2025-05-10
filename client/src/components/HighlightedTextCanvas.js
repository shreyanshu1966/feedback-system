import React, { useRef, useEffect, useState } from 'react';

/**
 * Renders the text on a canvas and highlights specified spans with interactivity and tooltips.
 * @param {string} text - The full text to render.
 * @param {Array<{highlightSpan: {start: number, end: number}, score: number, feedback: string, criterion: string}>} feedbacks - Array of feedback objects.
 * @param {Object} activeHighlight - The currently active highlight span.
 */
const HighlightedTextCanvas = ({ text, feedbacks = [], activeHighlight }) => {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null); // {x, y, feedback, criterion, score}
  const [lockedHighlight, setLockedHighlight] = useState(null); // Lock tooltip on click
  const [showAll, setShowAll] = useState(false); // Show all feedback tooltips
  const lineHeight = 22;
  const font = '16px monospace';
  const padding = 10;
  const maxWidth = 700;

  // Helper: choose color based on score
  function getColor(score) {
    if (score >= 80) return '#b9fbc0'; // green
    if (score >= 50) return '#fff3bf'; // yellow
    return '#ffa8a8'; // red
  }

  // Helper: get highlight at mouse position
  function getHighlightAt(x, y, lines, feedbacks, ctx) {
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
  }

  // Helper: get all highlight rects for minimap
  function getAllHighlightRects(lines, feedbacks, ctx) {
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
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Prepare lines and char-to-pos mapping
    let charIndex = 0;
    const lines = [];
    let tempLine = '';
    let tempLineStart = 0;
    for (let i = 0; i < text.length; i++) {
      tempLine += text[i];
      ctx.font = font;
      if (text[i] === '\n' || ctx.measureText(tempLine).width > maxWidth) {
        lines.push({ text: tempLine, start: tempLineStart });
        tempLineStart = i + 1;
        tempLine = '';
      }
    }
    if (tempLine) lines.push({ text: tempLine, start: tempLineStart });

    // Set canvas size
    canvas.width = maxWidth + padding * 2;
    canvas.height = lines.length * lineHeight + padding * 2;

    // Draw highlights for all feedbacks
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
          ctx.save();
          ctx.globalAlpha = (lockedHighlight && lockedHighlight.criterion === fb.criterion) || (activeHighlight && activeHighlight.criterion === fb.criterion) ? 0.9 : 0.5;
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
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(padding, minimapY, maxWidth, minimapHeight);
    // Draw highlight locations on minimap
    const rects = getAllHighlightRects(lines, feedbacks, ctx);
    rects.forEach(rect => {
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, minimapY, Math.max(rect.width, 2), minimapHeight);
    });
    ctx.restore();

    // Mouse move for tooltip
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
    function handleClick(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const found = getHighlightAt(x, y, lines, feedbacks, ctx);
      if (found) {
        setLockedHighlight(found);
        setTooltip({
          x: x + 10,
          y: y - 10,
          ...found
        });
      } else {
        setLockedHighlight(null);
        setTooltip(null);
      }
    }
    function handleKeyDown(e) {
      // Keyboard navigation: left/right to cycle highlights
      if (!feedbacks.length) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        let idx = feedbacks.findIndex(fb => lockedHighlight && lockedHighlight.criterion === fb.criterion);
        if (e.key === 'ArrowRight') idx = (idx + 1) % feedbacks.length;
        if (e.key === 'ArrowLeft') idx = (idx - 1 + feedbacks.length) % feedbacks.length;
        setLockedHighlight(feedbacks[idx]);
        setTooltip({ x: 30, y: 30 + idx * 30, ...feedbacks[idx] });
      }
      if (e.key === 'Escape') {
        setLockedHighlight(null);
        setTooltip(null);
      }
    }
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => { if (!lockedHighlight) setTooltip(null); });
    canvas.addEventListener('click', handleClick);
    canvas.setAttribute('tabindex', 0);
    canvas.addEventListener('keydown', handleKeyDown);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', () => { if (!lockedHighlight) setTooltip(null); });
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('keydown', handleKeyDown);
    };
  }, [text, feedbacks, activeHighlight, lockedHighlight]);

  // Legend
  const legend = [
    { color: '#b9fbc0', label: 'Good (80-100%)' },
    { color: '#fff3bf', label: 'Average (50-79%)' },
    { color: '#ffa8a8', label: 'Needs Improvement (<50%)' },
    { color: '#ffe066', label: 'Selected' }
  ];

  // Show all feedback tooltips
  const renderAllTooltips = () => {
    if (!showAll) return null;
    // For each feedback, find the first highlight position and show tooltip
    return feedbacks.map((fb, idx) => {
      if (!fb.highlightSpan) return null;
      // Estimate position: find line and x/y
      const lines = [];
      let tempLine = '';
      let tempLineStart = 0;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return null;
      ctx.font = font;
      for (let i = 0; i < text.length; i++) {
        tempLine += text[i];
        if (text[i] === '\n' || ctx.measureText(tempLine).width > maxWidth) {
          lines.push({ text: tempLine, start: tempLineStart });
          tempLineStart = i + 1;
          tempLine = '';
        }
      }
      if (tempLine) lines.push({ text: tempLine, start: tempLineStart });
      // Find first line with highlight
      const { start, end } = fb.highlightSpan;
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

  return (
    <div className="my-4 border rounded-lg overflow-x-auto bg-gray-50 relative" aria-label="Assignment text with highlights">
      <div className="flex items-center gap-4 px-2 pt-2">
        <button
          className="px-2 py-1 text-xs bg-blue-100 rounded hover:bg-blue-200 border"
          onClick={() => setShowAll((v) => !v)}
          aria-pressed={showAll}
        >
          {showAll ? 'Hide All Feedback' : 'Show All Feedback'}
        </button>
        <span className="text-xs text-gray-500">Click a highlight to lock/unlock feedback. Use ←/→ to cycle, Esc to clear.</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: maxWidth + padding * 2, maxWidth: '100%', cursor: 'pointer', outline: 'none' }}
        tabIndex={0}
        aria-label="Assignment text canvas"
      />
      {/* Tooltip */}
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
      {/* All tooltips */}
      {renderAllTooltips()}
      {/* Legend */}
      <div className="flex gap-4 mt-2 ml-2">
        {legend.map((item, idx) => (
          <div key={idx} className="flex items-center text-xs">
            <span className="inline-block w-4 h-4 rounded mr-1 border" style={{ background: item.color }}></span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HighlightedTextCanvas;
