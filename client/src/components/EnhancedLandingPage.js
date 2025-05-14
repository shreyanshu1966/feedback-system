import React, { useEffect, useRef, useState, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  FileCheck, ClipboardList, ShieldCheck, Clock, BookOpen, Globe,
  ChevronRight, Book, Lightbulb, Award, GraduationCap, Sparkles,
  Code, CheckCircle, ArrowRight, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CustomEase } from "gsap/CustomEase";
import EnhancedBackground from "./3d/EnhancedBackground";
import AnimatedSectionTitle from "./animations/AnimatedSectionTitle";
import AnimatedTooltip from "./ui/AnimatedTooltip";
import AnimatedHeroText from "./animations/AnimatedHeroText";
import AnimatedFeatures from "./animations/AnimatedFeatures";
import AnimatedStats from "./animations/AnimatedStats";
import ScrollingMarquee from "./animations/ScrollingMarquee";
import AssignmentPreviewCard from "./animations/AssignmentPreviewCard";
import '../utils/customGsap';

// Register GSAP plugins with optimized settings
gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin, CustomEase);

// Force GSAP to use requestAnimationFrame for better performance
gsap.ticker.fps(0);

// Optimize GSAP with default performance settings
gsap.defaults({
  overwrite: 'auto',
  ease: 'power2.out',
  duration: 0.5
});

// Create custom eases for animations - reduced complexity
CustomEase.create("bounceOut", "M0,0 C0.0,0.0 0.2,0.4 0.4,0.8 0.6,1.2 0.8,1.0 1.0,1.0");
CustomEase.create("smoothBounce", "M0,0 C0.12,0 0.3,1 0.4,1 0.7,1 0.8,0 1,0");

const TooltipProvider = ({ children }) => <>{children}</>;

// Navigation component with animated underline
const Navigation = () => {
  const navRef = useRef(null);
  const underlineRef = useRef(null);
  const handlersRef = useRef({});
  
  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl || !underlineRef.current) return;

    const navItems = navEl.querySelectorAll('.nav-item');
    const underline = underlineRef.current;
    
    const handleMouseEnter = (e) => {
      const item = e.currentTarget;
      const rect = item.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      
      gsap.to(underline, {
        width: rect.width,
        x: rect.left - navRect.left,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(underline, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    // Store handlers in ref to ensure we remove the same functions
    handlersRef.current = {
      handleMouseEnter,
      handleMouseLeave,
      items: navItems
    };
      
    // Add event listeners
    navItems.forEach(item => {
      item.addEventListener('mouseenter', handleMouseEnter);
    });
    
    navEl.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      // Safely remove event listeners during cleanup
      try {
        // Access current elements and handlers through refs
        const currentItems = handlersRef.current.items;
        const currentNav = navRef.current;
        
        if (currentItems && currentItems.forEach) {
          currentItems.forEach(item => {
            if (item) {
              try {
                item.removeEventListener('mouseenter', handlersRef.current.handleMouseEnter);
              } catch (error) {
                console.warn('Error removing mouseenter event listener:', error);
              }
            }
          });
        }
        
        if (currentNav) {
          currentNav.removeEventListener('mouseleave', handlersRef.current.handleMouseLeave);
        }
      } catch (error) {
        console.warn('Error during navigation cleanup:', error);
      }
    };
  }, []);
  
  return (
    <nav className="relative z-20 py-6">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <ShieldCheck className="h-8 w-8 text-indigo-500" />
          <span className="ml-2 text-2xl font-bold text-white">EduShield</span>
        </div>
        
        <div ref={navRef} className="hidden md:flex items-center space-x-8 relative">
          <div 
            ref={underlineRef} 
            className="absolute bottom-0 h-0.5 bg-indigo-400 opacity-0"
          ></div>
          <a href="#features" className="nav-item text-gray-300 hover:text-white transition-colors py-2">Features</a>
          <a href="#how-it-works" className="nav-item text-gray-300 hover:text-white transition-colors py-2">How It Works</a>
          <a href="#testimonials" className="nav-item text-gray-300 hover:text-white transition-colors py-2">Testimonials</a>
          <a href="#benefits" className="nav-item text-gray-300 hover:text-white transition-colors py-2">Benefits</a>
        </div>
        
        <div className="hidden md:block">
          <Button>Get Started</Button>
        </div>
      </div>
    </nav>
  );
};

// Custom cursor component with GSAP animation
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
    useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    
    // Skip setup if elements aren't available
    if (!cursor || !cursorDot) return;
    
    const moveCursor = (e) => {
      if (cursor && cursorDot) {
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.6,
          ease: "power3.out"
        });
        
        gsap.to(cursorDot, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1
        });
      }
    };
    
    window.addEventListener('mousemove', moveCursor);
    
    // Add hover effects for interactive elements
    const handleLinkHover = () => {
      if (cursor) {
        gsap.to(cursor, { scale: 1.5, opacity: 0.5, duration: 0.3 });
      }
    };
    
    const handleLinkLeave = () => {
      if (cursor) {
        gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
      }
    };
      // Store references to event handlers and elements
    const links = Array.from(document.querySelectorAll('a, button'));
    
    // Add event listeners
    links.forEach(link => {
      if (link) {
        link.addEventListener('mouseenter', handleLinkHover);
        link.addEventListener('mouseleave', handleLinkLeave);
      }
    });
    
    // Cleanup function
    return () => {
      // Remove window event listener
      window.removeEventListener('mousemove', moveCursor);
      
      // Safely remove link event listeners
      try {
        links.forEach(link => {
          if (link) {
            link.removeEventListener('mouseenter', handleLinkHover);
            link.removeEventListener('mouseleave', handleLinkLeave);
          }
        });
      } catch (error) {
        console.warn('Error cleaning up CustomCursor event listeners:', error);
      }
    };
  }, []);
  
  return (
    <>
      <div ref={cursorDotRef} className="cursor-dot fixed w-1 h-1 rounded-full bg-indigo-600 z-50 pointer-events-none"></div>
      <div ref={cursorRef} className="cursor-circle fixed w-8 h-8 rounded-full border-2 border-indigo-600 z-50 pointer-events-none"></div>
    </>
  );
};

const Button = ({ children, className, primary = true, ...props }) => {
  const btnRef = useRef(null);
  
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    
    const arrowElement = btn.querySelector(".btn-arrow");
    
    const handleMouseEnter = () => {
      if (!btn) return;
      
      gsap.to(btn, { 
        scale: 1.05, 
        boxShadow: primary 
          ? "0 10px 25px rgba(79, 70, 229, 0.6)" 
          : "0 10px 25px rgba(0, 0, 0, 0.1)",
        duration: 0.3 
      });
      
      if (arrowElement) {
        gsap.to(arrowElement, { 
          x: 5,
          opacity: 1, 
          duration: 0.3 
        });
      }
    };
    
    const handleMouseLeave = () => {      if (!btn) return;
      
      gsap.to(btn, { 
        scale: 1, 
        boxShadow: primary 
          ? "0 4px 6px rgba(79, 70, 229, 0.25)" 
          : "0 4px 6px rgba(0, 0, 0, 0.05)", 
        duration: 0.3
      });
      
      if (arrowElement) {
        gsap.to(arrowElement, { 
          x: 0,
          opacity: 0.5, 
          duration: 0.3 
        });
      }
    };
    
    btn.addEventListener("mouseenter", handleMouseEnter);
    btn.addEventListener("mouseleave", handleMouseLeave);
      return () => {
      const currentBtn = btnRef.current;
      if (currentBtn) {
        try {
          currentBtn.removeEventListener("mouseenter", handleMouseEnter);
          currentBtn.removeEventListener("mouseleave", handleMouseLeave);
        } catch (error) {
          console.warn('Error removing button event listeners:', error);
        }
      }
    };
  }, [primary]);
  
  return (
    <button
      ref={btnRef}
      className={`px-6 py-3 ${primary ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200'} rounded-lg transition shadow-md flex items-center ${className}`}
      {...props}
    >
      <span>{children}</span>
      <ChevronRight className="btn-arrow ml-2 h-4 w-4 opacity-50" />
    </button>
  );
};

const Card = ({ children, className, index, highlight = false }) => {
  const cardRef = useRef(null);
  
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    
    // Create animation
    const animation = gsap.fromTo(
      card,
      { 
        y: 50,
        opacity: 0 
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top bottom-=100",
        },
        delay: index ? index * 0.2 : 0
      }
    );
    
    // Hover animation
    const handleMouseEnter = () => {
      if (!card) return;
      
      gsap.to(card, { 
        y: -10, 
        boxShadow: highlight
          ? "0 20px 25px -5px rgba(79, 70, 229, 0.2), 0 10px 10px -5px rgba(79, 70, 229, 0.15)"
          : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        duration: 0.3 
      });
      
      if (highlight) {
        gsap.to(card, { borderColor: "rgba(79, 70, 229, 0.5)", duration: 0.3 });
      }
    };
    
    const handleMouseLeave = () => {
      if (!card) return;
      
      gsap.to(card, { 
        y: 0, 
        boxShadow: highlight
          ? "0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(79, 70, 229, 0.05)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        duration: 0.3 
      });
      
      if (highlight) {
        gsap.to(card, { borderColor: "rgba(79, 70, 229, 0.2)", duration: 0.3 });
      }
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
      className={`rounded-3xl shadow-lg border p-8 transition-shadow ${highlight ? 'border-indigo-200' : 'border-gray-100'} ${className}`}
    >
      {children}
    </div>
  );
};

const EnhancedLandingPage = ({ disable3D = false }) => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const queryClient = new QueryClient();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  
  useEffect(() => {
    // Initialize GSAP scroll animations
    const sections = gsap.utils.toArray('.animate-section');
    sections.forEach(section => {
      gsap.fromTo(
        section, 
        { 
          y: 100, 
          opacity: 0 
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top bottom-=100",
          }
        }
      );
    });
    
    // Hero section particles
    if (heroRef.current) {
      const particles = [];
      const particleCount = 50;
      const heroSection = heroRef.current;
      
      // Create particles
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute bg-indigo-400 rounded-full opacity-0';
        
        // Random size
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        heroSection.appendChild(particle);
        particles.push(particle);
        
        // Animate each particle
        gsap.to(particle, {
          opacity: Math.random() * 0.5 + 0.1,
          duration: 1,
          delay: i * 0.05,
        });
        
        gsap.to(particle, {
          x: `${(Math.random() - 0.5) * 200}`,
          y: `${(Math.random() - 0.5) * 200}`,
          duration: Math.random() * 50 + 30,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }
    
    // Smooth scroll for navigation links
    const handleNavLinkClick = (e) => {
      const targetId = e.currentTarget.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          gsap.to(window, {
            duration: 1,
            scrollTo: {
              y: targetElement,
              offsetY: 50
            },
            ease: "power3.inOut"
          });
        }
      }
    };
      // Add event listeners to navigation links
    const navLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
    navLinks.forEach(link => {
      link.addEventListener('click', handleNavLinkClick);
    });
    
    return () => {
      // Clean up event listeners
      navLinks.forEach(link => {
        link.removeEventListener('click', handleNavLinkClick);
      });
      
      // Clear GSAP animations
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  const handleGetStarted = () => {
    navigate('/feedback');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 text-white overflow-hidden">
        {/* Only render 3D background if not disabled */}
        {!disable3D && (
          <Suspense fallback={<div className="fixed inset-0 bg-indigo-900" />}>
            <EnhancedBackground />
          </Suspense>
        )}
          {/* Static background as fallback when 3D is disabled - optimized with a static image */}
        {disable3D && (
          <div className="fixed inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
            {/* Simple star field for a lightweight effect */}
            <div className="absolute inset-0 opacity-40" style={{
              backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>
        )}
        
        {/* Custom cursor */}
        <CustomCursor />
        
        {/* Navigation */}
        <Navigation />
        
        {/* Main content */}
        <main ref={mainRef} className="relative z-10 pt-2 overflow-hidden">
          {/* Hero Section */}
          <section id="hero" ref={heroRef} className="py-20 md:py-16 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center space-y-12 lg:space-y-0">
              <div className="lg:w-1/2 text-center lg:text-left lg:pr-10">
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-6">
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI-Powered Academic Integrity
                  </span>
                </div>
                
                <AnimatedHeroText />
                
                <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto lg:mx-0">
                  Our AI-powered system helps educational institutions maintain academic integrity 
                  while providing valuable feedback to students.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button 
                    onClick={handleGetStarted}
                    className="text-lg px-8 py-4"
                  >
                    Get Started
                  </Button>
                  <Button 
                    primary={false}
                    className="text-lg"
                    onClick={() => {
                      gsap.to(window, {
                        duration: 1.2,
                        scrollTo: "#features",
                        ease: "power3.inOut"
                      });
                    }}
                  >
                    Learn More
                  </Button>
                </div>
                
                <div className="mt-8 flex items-center justify-center lg:justify-start text-indigo-300 space-x-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>99.8% Accuracy</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Used by 500+ institutions</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <AssignmentPreviewCard />
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section id="features" ref={featuresRef} className="py-20 px-6 animate-section">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <AnimatedSectionTitle size="large" highlight={true}>
                  Powerful Features
                </AnimatedSectionTitle>
                <p className="text-xl text-gray-300 mt-6 max-w-3xl mx-auto">
                  Our comprehensive toolkit helps educational institutions maintain academic integrity 
                  while providing valuable feedback to students.
                </p>
              </div>
              
              <AnimatedFeatures />
            </div>
          </section>
          
          {/* Stats Section */}
          <section id="stats" className="py-20 px-6 animate-section bg-gradient-to-b from-gray-900 to-indigo-900">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <AnimatedSectionTitle size="large" highlight={true}>
                  By The Numbers
                </AnimatedSectionTitle>
                <p className="text-xl text-gray-300 mt-6 max-w-3xl mx-auto">
                  Our platform has helped thousands of educators and students across the globe.
                </p>
              </div>
              
              <AnimatedStats />
            </div>
          </section>
          
          {/* How It Works Section */}
          <section id="how-it-works" className="py-20 px-6 animate-section relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 z-0"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <AnimatedSectionTitle size="large" highlight={true}>
                  How It Works
                </AnimatedSectionTitle>
                <p className="text-xl text-gray-300 mt-6 max-w-3xl mx-auto">
                  Our simple yet powerful process makes it easy to incorporate into your academic workflow.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {[
                  {
                    icon: <FileCheck className="h-12 w-12 text-indigo-400" />,
                    title: "Upload Document",
                    description: "Submit papers, essays, or any written work through our secure platform."
                  },
                  {
                    icon: <ClipboardList className="h-12 w-12 text-indigo-400" />,
                    title: "AI Analysis",
                    description: "Our advanced AI algorithms analyze the content for originality and quality."
                  },
                  {
                    icon: <ShieldCheck className="h-12 w-12 text-indigo-400" />,
                    title: "Detailed Feedback",
                    description: "Receive comprehensive insights and suggestions for improvement."
                  }
                ].map((item, i) => (
                  <Card 
                    key={i} 
                    index={i} 
                    highlight 
                    className="bg-gray-800/50 border-indigo-500/20 backdrop-blur-sm"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 bg-indigo-500/20 rounded-xl mb-6 text-indigo-300">
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                      <p className="text-gray-300">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
          
          {/* Testimonials Section */}
          <section id="testimonials" className="py-20 animate-section">
            <div className="max-w-7xl mx-auto px-6 mb-12">
              <div className="text-center mb-16">
                <AnimatedSectionTitle size="large" highlight={true}>
                  What People Are Saying
                </AnimatedSectionTitle>
                <p className="text-xl text-gray-300 mt-6 max-w-3xl mx-auto">
                  Hear from educators and administrators who have implemented our system.
                </p>
              </div>
              
              <ScrollingMarquee />
            </div>
          </section>
          
          {/* Benefits Section */}
          <section id="benefits" className="py-20 px-6 animate-section bg-gradient-to-b from-indigo-900 to-gray-900">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <AnimatedSectionTitle size="large" highlight={true}>
                  Benefits For Education
                </AnimatedSectionTitle>
                <p className="text-xl text-gray-300 mt-6 max-w-3xl mx-auto">
                  Our platform provides numerous advantages for the entire academic ecosystem.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {[
                  {
                    icon: <BookOpen className="h-8 w-8 text-indigo-400" />,
                    title: "Enhanced Learning",
                    description: "Provides students with constructive feedback that helps them improve their writing skills."
                  },
                  {
                    icon: <Clock className="h-8 w-8 text-indigo-400" />,
                    title: "Time Savings",
                    description: "Automates the process of checking for AI-generated content, saving educators valuable time."
                  },
                  {
                    icon: <Award className="h-8 w-8 text-indigo-400" />,
                    title: "Academic Integrity",
                    description: "Promotes a culture of honesty and originality in academic work."
                  },
                  {
                    icon: <GraduationCap className="h-8 w-8 text-indigo-400" />,
                    title: "Educational Quality",
                    description: "Maintains high standards for written assignments and academic submissions."
                  },
                  {
                    icon: <Globe className="h-8 w-8 text-indigo-400" />,
                    title: "Global Standards",
                    description: "Aligns with international best practices for academic integrity and assessment."
                  },
                  {
                    icon: <Lightbulb className="h-8 w-8 text-indigo-400" />,
                    title: "Innovation Support",
                    description: "Encourages creative thinking while ensuring original content creation."
                  }
                ].map((item, i) => (
                  <Card 
                    key={i} 
                    index={i} 
                    className="bg-gray-800/50 border-indigo-500/20 backdrop-blur-sm"
                  >
                    <div className="flex flex-col items-start">
                      <div className="p-3 bg-indigo-500/20 rounded-xl mb-4 text-indigo-300">
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                      <p className="text-gray-300">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section id="cta" className="py-20 px-6 animate-section">
            <div className="max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90 rounded-3xl"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDEwMGw2MCA2ME02MCAxMDBsNDAgNDBNMTQwIDEwMGwtNDAgNDBNMTAwIDYwbC00MCA0ME0xMDAgMTAwbDQwLTQwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWxsPSJub25lIiBvcGFjaXR5PSIuMSIvPjwvc3ZnPg==')]"></div>
              
              <div className="relative z-10 p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Transform Your Educational Experience?
                </h2>
                <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of educational institutions already benefiting from our platform.
                </p>
                <Button 
                  onClick={handleGetStarted}
                  className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 text-lg"
                >
                  Get Started Today
                </Button>
                
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: "Universities", value: "200+" },
                    { label: "Schools", value: "500+" },
                    { label: "Students", value: "50k+" },
                    { label: "Assignments", value: "1M+" }
                  ].map((stat, i) => (
                    <div key={i} className="p-3">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-indigo-200 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <footer className="py-12 px-6 border-t border-gray-800">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                <div className="flex items-center">
                  <ShieldCheck className="h-8 w-8 text-indigo-400" />
                  <span className="ml-2 text-2xl font-bold">EduShield</span>
                </div>
                <p className="text-gray-400">
                  Helping educational institutions maintain academic integrity with AI-powered feedback.
                </p>
                <div className="flex space-x-4 text-gray-400">
                  <a href="#" className="hover:text-indigo-400 transition-colors">Twitter</a>
                  <a href="#" className="hover:text-indigo-400 transition-colors">LinkedIn</a>
                  <a href="#" className="hover:text-indigo-400 transition-colors">Facebook</a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a></li>
                  <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                  <li><a href="#testimonials" className="hover:text-indigo-400 transition-colors">Testimonials</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">API Guides</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm text-center">
              <p>© {new Date().getFullYear()} EduShield. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default EnhancedLandingPage;
