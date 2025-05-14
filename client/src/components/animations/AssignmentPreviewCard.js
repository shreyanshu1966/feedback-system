import React, { useRef, useEffect } from 'react';
import { FileCheck, Star, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

const AssignmentPreviewCard = () => {
  const cardRef = useRef(null);
  const progressRef = useRef(null);
  const cardWrapperRef = useRef(null);
  
  useEffect(() => {
    // 3D tilt effect
    const wrapper = cardWrapperRef.current;
    const card = cardRef.current;
    
    const handleMouseMove = (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY, 
        duration: 0.5,
        ease: "power1.out",
        transformPerspective: 1000,
        transformOrigin: "center"
      });
      
      // Add highlight effect
      const intensity = 0.2;
      const highlightX = ((x / rect.width) - 0.5) * 100 * intensity + 50;
      const highlightY = ((y / rect.height) - 0.5) * 100 * intensity + 50;
      
      gsap.to(card, {
        background: `radial-gradient(circle at ${highlightX}% ${highlightY}%, rgba(165, 180, 252, 0.3) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(79, 70, 229, 0.05) 100%)`,
        duration: 0.3
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.6,
        ease: "power3.out",
        background: "rgba(255, 255, 255, 0.1)",
      });
    };
    
    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    
    // Animate the card elements
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    
    tl.fromTo(cardRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" })
      // Animate text content typing
      .to(".typing-text", { 
        text: "Climate Change Impact", 
        duration: 1.5, 
        ease: "none" 
      }, "-=0.3")
      // Animate the content block appearing
      .fromTo(".content-block", { height: 0, opacity: 0 }, { height: "112px", opacity: 1, duration: 0.8 }, "+=0.5")
      // Animate the progress bar
      .fromTo(progressRef.current, { width: "0%" }, { width: "100%", duration: 2, ease: "power2.inOut" }, "+=0.3")
      // Animate the feedback section
      .fromTo(".feedback-item", 
        { x: -20, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.2, ease: "power2.out" }, 
        "-=0.2")
      // Floating animation
      .to(cardRef.current, {
        y: "-10px",
        duration: 1.5,
        ease: "power1.inOut",
        yoyo: true,
        repeat: 1
      }, "+=1")
      // Reset animation (fade out)
      .to(cardRef.current, { opacity: 0, duration: 1, delay: 2 });
    
    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
      tl.kill();
    }
  }, []);
  
  return (
    <div ref={cardWrapperRef} className="w-full max-w-md mx-auto perspective">
      <div 
        ref={cardRef} 
        className="bg-white/10 backdrop-blur-md border-indigo-500/20 border text-white shadow-xl w-full rounded-3xl p-6 preserve-3d"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileCheck className="h-6 w-6 text-indigo-300 mr-2" />
            <span className="font-semibold text-indigo-100">Assignment Checker</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-8 bg-white/20 rounded overflow-hidden flex items-center px-3">
            <div className="typing-text text-white"></div>
          </div>

          <div className="content-block h-28 bg-white/20 rounded p-3 overflow-hidden">
            <div className="text-xs text-white/70">
              <p className="mb-1">
                The impact of climate change on global agriculture has become increasingly evident in recent years...
              </p>
              <p className="mb-1">
                Studies show that rising temperatures affect crop yields and water availability...
              </p>
              <p>Sustainable farming practices must be adopted to mitigate these effects...</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Analysis progress</span>
              <span className="text-xs font-medium">100%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div ref={progressRef} className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full w-0"></div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="h-8 bg-white/20 rounded w-1/3 flex items-center justify-center">
              <span className="text-xs font-medium">Originality</span>
            </div>
            <div className="h-8 bg-green-400/30 rounded w-1/3 flex items-center justify-center">
              <span className="text-xs font-medium">Passed</span>
            </div>
            <div className="h-8 bg-white/20 rounded w-1/3 flex items-center justify-center">
              <span className="text-xs font-medium">Grammar</span>
            </div>
          </div>

          <div className="h-24 bg-white/20 rounded p-3 overflow-hidden">
            <div className="text-xs space-y-2">
              <div className="feedback-item flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-1 mr-2"></div>
                <span>Strong thesis statement identified</span>
              </div>
              <div className="feedback-item flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1 mr-2"></div>
                <span>Consider adding more empirical evidence</span>
              </div>
              <div className="feedback-item flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1 mr-2"></div>
                <span>Citations properly formatted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPreviewCard;
