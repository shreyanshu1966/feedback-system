import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart, Download, Users, BookOpen, Lock, LineChart, PieChart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AnimatedCounter = ({ value, label, icon: Icon, suffix = "", delay = 0 }) => {
  const counterRef = useRef(null);
  const numberRef = useRef(null);
  const iconRef = useRef(null);
  const progressRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const counter = counterRef.current;
    const number = numberRef.current;
    const progress = progressRef.current;
    
    // Create a counter animation with progress bar
    let counterTween = gsap.to(number, {
      innerText: value,
      duration: 2,
      snap: { innerText: 1 },
      delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: counter,
        start: "top bottom-=100",
      },
      onUpdate: function() {
        // Add suffix if provided
        if (suffix) {
          number.innerText = number.innerText + suffix;
        }
        
        // Update progress bar width based on current value
        const currentValue = parseInt(number.innerText);
        const progressPercent = (currentValue / value) * 100;
        progress.style.width = `${progressPercent}%`;
      }
    });
    
    // Card rise effect
    gsap.fromTo(
      counter,
      { 
        y: 50,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: delay + 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: counter,
          start: "top bottom-=100",
        }
      }
    );
    
    // Pulse effect on completion
    gsap.to(counter, {
      boxShadow: "0 10px 30px rgba(79, 70, 229, 0.3)",
      scale: 1.05,
      duration: 0.5,
      delay: delay + 2,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: counter,
        start: "top bottom-=100",
      }
    });
    
    // Rotate icon slightly
    gsap.to(iconRef.current, {
      rotation: 10,
      duration: 0.5,
      delay: delay + 2.5,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
    
    // Hover animations setup
    const handleMouseEnter = () => {
      setIsHovered(true);
      
      gsap.to(counter, {
        y: -10,
        boxShadow: "0 15px 30px rgba(79, 70, 229, 0.4)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(iconRef.current, {
        scale: 1.2,
        rotation: 15,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      
      // Create particles
      createParticles(counter, 5);
    };
    
    const handleMouseLeave = () => {
      setIsHovered(false);
      
      gsap.to(counter, {
        y: 0,
        boxShadow: "0 10px 15px rgba(79, 70, 229, 0.2)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(iconRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.inOut"
      });
    };
    
    counter.addEventListener('mouseenter', handleMouseEnter);
    counter.addEventListener('mouseleave', handleMouseLeave);
    
    // Create floating particles around the stat
    const createParticles = (element, count) => {
      const rect = element.getBoundingClientRect();
      
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 rounded-full bg-indigo-400/50 pointer-events-none';
        
        // Random position within the element
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        element.appendChild(particle);
        
        // Float up and fade out
        gsap.to(particle, {
          y: -30 - (Math.random() * 20),
          x: (Math.random() - 0.5) * 20,
          opacity: 0,
          duration: 1 + Math.random(),
          onComplete: () => particle.remove(),
          ease: "power1.out"
        });
      }
    };
    
    return () => {
      counterTween.kill();
      counter.removeEventListener('mouseenter', handleMouseEnter);
      counter.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [value, suffix, delay]);
  
  return (
    <div 
      ref={counterRef} 
      className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-indigo-500/20 flex flex-col items-center text-center relative transition-all hover:cursor-pointer group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-2xl"></div>
      
      <div ref={iconRef} className="mb-3 relative">
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"></div>
        <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-full">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <h3 className="text-4xl md:text-5xl font-bold text-white mb-1">
        <span ref={numberRef}>0</span>
      </h3>
      
      <p className="text-indigo-200 font-medium mb-3">{label}</p>
      
      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-auto">
        <div 
          ref={progressRef} 
          className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 w-0"
        ></div>
      </div>
      
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1 h-1 bg-indigo-400 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
};

const AnimatedStats = () => {
  const statsRef = useRef(null);
  
  useEffect(() => {
    // Add floating background elements
    const statsContainer = statsRef.current;
    const shapes = ["circle", "square", "triangle"];
    
    for (let i = 0; i < 12; i++) {
      const shape = document.createElement('div');
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      
      const size = 8 + Math.random() * 12;
      
      // Different shape classes
      if (shapeType === "circle") {
        shape.className = 'absolute rounded-full bg-indigo-400/10 pointer-events-none';
      } else if (shapeType === "square") {
        shape.className = 'absolute rounded-md bg-indigo-400/10 pointer-events-none';
      } else {
        shape.className = 'absolute bg-indigo-400/10 pointer-events-none';
        shape.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
      }
      
      shape.style.width = `${size}px`;
      shape.style.height = `${size}px`;
      
      // Random position
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`;
      
      statsContainer.appendChild(shape);
      
      // Floating animation
      gsap.to(shape, {
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        rotation: Math.random() * 360,
        duration: 10 + Math.random() * 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
    
    return () => {
      // Clean up will happen when the component unmounts
    };
  }, []);
    const stats = [
    { value: 98, label: "Detection Accuracy", suffix: "%", icon: BarChart },
    { value: 20000, label: "Users Worldwide", suffix: "+", icon: Users },
    { value: 500, label: "Institutions", suffix: "+", icon: BookOpen },
    { value: 99, label: "Data Security", suffix: "%", icon: Lock },
    { value: 1500, label: "Daily Assignments", suffix: "+", icon: Download },
    { value: 85, label: "Improved Scores", suffix: "%", icon: LineChart }
  ];
  
  return (
    <div ref={statsRef} className="py-12 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
        {stats.map((stat, index) => (
          <AnimatedCounter 
            key={stat.label}
            value={stat.value}
            label={stat.label}
            suffix={stat.suffix}
            icon={stat.icon}
            delay={index * 0.2}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedStats;
