import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../utils/customGsap';

// Get the SplitText from the global scope or our custom implementation
const SplitText = window.SplitText || null;

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// Animated section title component with enhanced animations
const AnimatedSectionTitle = ({ children, className, align = 'center', size = 'large', highlight = true }) => {
  const titleRef = useRef(null);
  const splitRef = useRef(null);
  
  useEffect(() => {
    // Initialize new SplitText
    splitRef.current = new SplitText(titleRef.current, {
      type: "chars,words", 
      charsClass: "char",
      wordsClass: "word"
    });
    
    const chars = splitRef.current.chars;
    const words = splitRef.current.words;
    
    // Reset any previous animations
    gsap.set(chars, { opacity: 0, y: 80, rotationX: -90 });
    
    // Advanced staggered animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: titleRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none reverse"
      }
    });
    
    // First animate the characters
    tl.to(chars, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      stagger: 0.02,
      duration: 0.7,
      ease: "back.out(1.2)"
    });
    
    // Then add a subtle bounce effect to each word
    tl.to(words, {
      scale: 1.08,
      duration: 0.2,
      ease: "power1.inOut",
      stagger: 0.1,
      yoyo: true,
      repeat: 1
    }, "-=0.3");
    
    // Add a subtle highlight color animation if highlight is true
    if (highlight) {
      // Randomly pick some characters for highlight effect
      const highlightChars = [];
      for (let i = 0; i < chars.length; i++) {
        if (Math.random() > 0.7) {
          highlightChars.push(chars[i]);
        }
      }
      
      // Subtle color pulse animation for selected characters
      tl.to(highlightChars, {
        color: "#6366F1", // Indigo color
        duration: 0.8,
        stagger: 0.1,
        repeat: 1,
        yoyo: true
      }, "-=0.5");
    }
    
    // Cleanup
    return () => {
      if (splitRef.current) {
        splitRef.current.revert();
      }
      tl.kill();
    };
  }, [children, highlight]);
  
  // Dynamic sizing and alignment
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  const sizeClass = size === 'large' 
    ? 'text-4xl md:text-5xl lg:text-6xl' 
    : size === 'medium' 
      ? 'text-3xl md:text-4xl' 
      : 'text-2xl md:text-3xl';
    return (
    <h2
      ref={titleRef}
      className={`font-bold tracking-tight ${sizeClass} ${alignClass} ${className || ''}`}
      style={{ perspective: '1000px' }}
    >
      {children}
    </h2>
  );
};

export default AnimatedSectionTitle;
