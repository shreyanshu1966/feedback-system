import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

// Custom animated tooltip component
const AnimatedTooltip = ({ children }) => {
  const tooltipRef = useRef(null);
  
  useEffect(() => {
    const tooltip = tooltipRef.current;
    
    gsap.set(tooltip, { opacity: 0, y: 10 });
    
    const handleMouseEnter = () => {
      gsap.to(tooltip, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(tooltip, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: "power2.in"
      });
    };
    
    const parent = tooltip.parentNode;
    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
  
  return (
    <div ref={tooltipRef} className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-indigo-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
      {children}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-indigo-800"></div>
    </div>
  );
};

export default AnimatedTooltip;
