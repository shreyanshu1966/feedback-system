import React, { useRef, useEffect } from 'react';
import { Sparkles, CheckCircle, Shield, BookOpen, Brain, FileCheck, ClipboardList, ShieldCheck, Code } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ icon: Icon, title, description, index, highlight = false }) => {
  const cardRef = useRef(null);
  const iconRef = useRef(null);
  const contentRef = useRef(null);
  
  useEffect(() => {
    // Entrance animation with staggered timing based on index
    gsap.fromTo(
      cardRef.current,
      { 
        y: 100,
        opacity: 0,
        scale: 0.8
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom-=100",
        },
        delay: index * 0.2
      }
    );
    
    // Icon hover animation
    const iconEl = iconRef.current;
    const card = cardRef.current;
    const content = contentRef.current;
    
    const handleMouseEnter = () => {
      // Animate icon
      gsap.to(iconEl, { 
        scale: 1.2, 
        rotate: 10,
        color: "#4F46E5", // Indigo-600
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      
      // Animate card
      gsap.to(card, {
        y: -15,
        scale: 1.03,
        boxShadow: "0 20px 30px -10px rgba(79, 70, 229, 0.3)",
        backgroundColor: highlight ? "rgba(79, 70, 229, 0.05)" : "white",
        borderColor: "rgba(79, 70, 229, 0.5)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Animate content
      gsap.to(content.querySelector('h3'), {
        color: "#4F46E5", // Indigo-600
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Create particle effect
      if (Math.random() > 0.7) {
        createParticle(iconEl);
      }
    };
    
    const handleMouseLeave = () => {
      // Restore icon
      gsap.to(iconEl, { 
        scale: 1, 
        rotate: 0,
        color: "#818CF8", // Indigo-400
        duration: 0.3
      });
      
      // Restore card
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        backgroundColor: "white",
        borderColor: highlight ? "rgba(79, 70, 229, 0.2)" : "rgba(243, 244, 246, 1)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Restore content
      gsap.to(content.querySelector('h3'), {
        color: "#1F2937", // Gray-800
        duration: 0.3,
        ease: "power2.out"
      });
    };
    
    // Helper function to create floating particles
    const createParticle = (element) => {
      const rect = element.getBoundingClientRect();
      const particle = document.createElement('div');
      particle.className = 'absolute w-1.5 h-1.5 rounded-full bg-indigo-400 pointer-events-none';
      
      // Position the particle around the icon
      const x = rect.width / 2 + (Math.random() - 0.5) * 20;
      const y = rect.height / 2 + (Math.random() - 0.5) * 20;
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      element.appendChild(particle);
      
      // Animate the particle
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        opacity: 0,
        duration: 1 + Math.random(),
        ease: "power2.out",
        onComplete: () => particle.remove()
      });
    };
    
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [index, highlight]);
  
  return (
    <div 
      ref={cardRef} 
      className={`feature-card rounded-2xl p-6 shadow-lg transition-all border ${highlight ? 'border-indigo-200' : 'border-gray-100'} bg-white`}
    >
      <div ref={contentRef}>
        <div className="rounded-xl bg-indigo-100 p-4 inline-block mb-4">
          <Icon ref={iconRef} className="h-10 w-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-800">
          {title}
        </h3>
        <p className="text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
};

const AnimatedFeatures = () => {
  const containerRef = useRef(null);
  
  const features = [
    {
      icon: FileCheck,
      title: "Originality Checking",
      description: "Detect AI-generated content and ensure academic integrity with our advanced algorithms.",
      highlight: true
    },
    {
      icon: ClipboardList,
      title: "Detailed Reports",
      description: "Get comprehensive analysis with insights on writing style, originality, and improvement areas."
    },
    {
      icon: ShieldCheck,
      title: "Privacy Protected",
      description: "Your data is secure with end-to-end encryption and strict privacy controls."
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Access a library of resources to help students improve their academic writing."
    },
    {
      icon: Code,
      title: "API Integration",
      description: "Easily integrate with LMS platforms like Canvas, Blackboard, and Moodle."
    },
    {
      icon: Brain,
      title: "AI Feedback",
      description: "Receive constructive feedback and suggestions to enhance academic writing skills.",
      highlight: true
    }
  ];
  
  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, i) => (
        <FeatureCard
          key={i}
          index={i}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          highlight={feature.highlight}
        />
      ))}
    </div>
  );
};

export default AnimatedFeatures;
