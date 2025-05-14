import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { Sparkles } from 'lucide-react';
import '../../utils/customGsap';

gsap.registerPlugin(TextPlugin);

const AnimatedHeroText = () => {
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const containerRef = useRef(null);
  const sparklesRef = useRef(null);
  useEffect(() => {
    // Create a SplitText instance for more advanced animation
    const heading = headingRef.current;
    
    if (!heading) return;
    
    // Create a timeline for the sequence of animations
    const tl = gsap.timeline({ delay: 0.3 });
    // Check if SplitText is available from our custom implementation
    let splitText = null;
    try {
      if (window.SplitText) {
        splitText = new window.SplitText(heading, { 
          type: "chars,words" 
        });
        
        const chars = splitText.chars;
        const words = splitText.words;
        
        // Set initial state
        gsap.set(chars, { 
          y: 100,
          opacity: 0
        });
      
        // Animate each character
        tl.to(chars, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.03,
          ease: "power4.out"
        });
        
        // Add a color highlight animation
        const highlightWords = heading.querySelectorAll('.highlight');
        
        highlightWords.forEach(word => {
          const chars = word.querySelectorAll('.char');
          
          gsap.to(chars, {
            color: "#a5b4fc",
            duration: 0.4,
            stagger: 0.05,
            delay: 1.2,
            ease: "power2.inOut"
          });
          
          // Add a subtle movement to the highlight words
          gsap.to(chars, {
            y: -5,
            duration: 0.4,
            stagger: 0.03,
            delay: 1.2,
            ease: "back.out(1.7)"
          });
          
          // Add sparkle effect for highlight words
          const createSparkle = (char) => {
            const sparkle = document.createElement('div');
            sparkle.className = 'absolute w-1 h-1 bg-indigo-300 rounded-full pointer-events-none';
            
            // Random position around the character
            const charRect = char.getBoundingClientRect();
            const x = Math.random() * charRect.width;
            const y = Math.random() * charRect.height;
            
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            
            char.style.position = 'relative';
            char.appendChild(sparkle);
            
            // Animate the sparkle
            gsap.to(sparkle, {
              scale: 0,
              opacity: 0,
              duration: 1,
              ease: "power1.out",
              onComplete: () => sparkle.remove()
            });
          };
          
          // Create sparkles with delay
          chars.forEach((char, i) => {
            setTimeout(() => {
              createSparkle(char);
            }, 1200 + (i * 60));
          });
        });
        
        // Add a floating animation to all characters
        chars.forEach((char, i) => {
          gsap.to(char, {
            y: `${Math.sin(i) * 5}px`,
            duration: 2 + Math.random(),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1.5 + (i * 0.01)
          });
        });
      }
    } catch (error) {
      console.error("Error in SplitText animation:", error);
      // Fallback animation if an error occurs
      if (headingRef.current) {
        tl.fromTo(
          headingRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        );
      }
    }
    
    // Animate the sparkle icon only if reference exists
    if (sparklesRef.current) {
      tl.fromTo(
        sparklesRef.current,
        { 
          scale: 0, 
          opacity: 0,
          rotation: -45
        },
        { 
          scale: 1.2, 
          opacity: 1,
          rotation: 0,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2
        },
        "-=0.8"
      );
      
      // Rotation animation for the sparkle icon
      gsap.to(sparklesRef.current, {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "none"
      });
    }
    
    // Create a typing effect for the subtitle if reference exists
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { 
          text: "", 
          opacity: 1 
        },
        { 
          duration: 2,
          text: "Our AI-powered system helps educational institutions maintain academic integrity while providing valuable feedback to students.",
          ease: "none"
        },
        "-=0.3"
      );
    }
    
    return () => {
      // Make sure to clean up all animations
      tl.kill();
      
      // Clean up split text if it exists
      if (window.SplitText && splitText) {
        try {
          splitText.revert();
        } catch (e) {
          // Ignore errors if splitText wasn't defined or already reverted
        }
      }
      
      // Kill any standalone animations that might be running
      if (sparklesRef.current) {
        gsap.killTweensOf(sparklesRef.current);
      }
      
      // Kill any animations on chars if they exist
      if (window.SplitText && splitText && splitText.chars) {
        gsap.killTweensOf(splitText.chars);
      }
      
      // Make sure we safely remove event listeners
      const heading = headingRef.current;
      if (heading) {
        // If there were any event listeners directly attached to the heading element
        // Remove them here
        const highlightWords = heading.querySelectorAll('.highlight');
        highlightWords.forEach(word => {
          const chars = word.querySelectorAll('.char');
          chars.forEach(char => {
            // Remove any event listeners if they exist
            // This depends on what listeners you might have added
          });
        });
      }
    };
  }, []);
  
  return (
    <div className="relative">
      <div 
        className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl">
      </div>
      
      <div className="inline-flex items-center mb-2">
        <Sparkles ref={sparklesRef} className="h-6 w-6 text-indigo-400 mr-2" />
        <span className="text-indigo-400 font-medium">Intelligent Education Solutions</span>
      </div>
      
      <h1 
        ref={headingRef} 
        className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
      >
        Elevate academic integrity with <span className="highlight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">intelligent feedback</span>
      </h1>
      
      <p 
        ref={subtitleRef} 
        className="text-lg text-gray-300 max-w-2xl"
      ></p>
    </div>
  );
};

export default AnimatedHeroText;
