import React, { useEffect, useRef, useState, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FileCheck, ClipboardList, ShieldCheck, Clock, BookOpen, Globe, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);

// Three.js background component
const ThreeBackground = () => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x4B7BEC,
      transparent: true,
      opacity: 0.8
    });
    
    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Add floating shapes
    const createShape = (geometry, color, position, rotation) => {
      const material = new THREE.MeshPhongMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.6,
        flatShading: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position.x, position.y, position.z);
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);
      scene.add(mesh);
      return mesh;
    };
    
    // Add some light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Create shapes
    const sphere1 = createShape(
      new THREE.IcosahedronGeometry(1, 0),
      0x5B21B6,
      { x: -4, y: 2, z: -5 },
      { x: 0, y: 0, z: 0 }
    );
    
    const sphere2 = createShape(
      new THREE.TetrahedronGeometry(0.8, 0),
      0x4B7BEC,
      { x: 4, y: -2, z: -3 },
      { x: 0, y: 0, z: 0 }
    );
    
    const sphere3 = createShape(
      new THREE.OctahedronGeometry(1.2, 0),
      0x2563EB,
      { x: 0, y: 4, z: -8 },
      { x: 0, y: 0, z: 0 }
    );
    
    // Camera position
    camera.position.z = 5;
    
    // Mouse effects
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate particles
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
      // Animate shapes
      sphere1.rotation.x += 0.003;
      sphere1.rotation.y += 0.002;
      
      sphere2.rotation.x -= 0.002;
      sphere2.rotation.z += 0.003;
      
      sphere3.rotation.y += 0.001;
      sphere3.rotation.z -= 0.002;
      
      // Animate based on mouse position
      particlesMesh.rotation.x += mouseY * 0.0003;
      particlesMesh.rotation.y += mouseX * 0.0003;
      
      sphere1.position.x += mouseX * 0.001;
      sphere1.position.y += mouseY * 0.001;
      
      sphere2.position.x -= mouseX * 0.001;
      sphere2.position.y -= mouseY * 0.001;
      
      renderer.render(scene, camera);
    };
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      mountRef.current && mountRef.current.removeChild(renderer.domElement);
    };
  }, []);
  
  return <div ref={mountRef} className="absolute inset-0 -z-10" />;
};

const TooltipProvider = ({ children }) => <>{children}</>;

// Custom cursor component with GSAP animation
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    
    const moveCursor = (e) => {
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
    };
    
    window.addEventListener('mousemove', moveCursor);
    
    // Add hover effects for interactive elements
    const handleLinkHover = () => {
      gsap.to(cursor, { scale: 1.5, opacity: 0.5, duration: 0.3 });
    };
    
    const handleLinkLeave = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
    };
    
    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleLinkHover);
      link.addEventListener('mouseleave', handleLinkLeave);
    });
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleLinkHover);
        link.removeEventListener('mouseleave', handleLinkLeave);
      });
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
    
    const handleMouseEnter = () => {
      gsap.to(btn, { 
        scale: 1.05, 
        boxShadow: primary 
          ? "0 10px 25px rgba(79, 70, 229, 0.6)" 
          : "0 10px 25px rgba(0, 0, 0, 0.1)",
        duration: 0.3 
      });
      
      gsap.to(btn.querySelector(".btn-arrow"), { 
        x: 5,
        opacity: 1, 
        duration: 0.3 
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(btn, { 
        scale: 1, 
        boxShadow: primary 
          ? "0 4px 6px rgba(79, 70, 229, 0.25)" 
          : "0 4px 6px rgba(0, 0, 0, 0.05)", 
        duration: 0.3 
      });
      
      gsap.to(btn.querySelector(".btn-arrow"), { 
        x: 0,
        opacity: 0.5, 
        duration: 0.3 
      });
    };
    
    btn.addEventListener("mouseenter", handleMouseEnter);
    btn.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      btn.removeEventListener("mouseenter", handleMouseEnter);
      btn.removeEventListener("mouseleave", handleMouseLeave);
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
    gsap.fromTo(
      cardRef.current,
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
          trigger: cardRef.current,
          start: "top bottom-=100",
        },
        delay: index ? index * 0.2 : 0
      }
    );
    
    // Hover animation
    const card = cardRef.current;
    const handleMouseEnter = () => {
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
      className={`rounded-3xl shadow-lg border p-8 bg-white transition-shadow ${highlight ? 'border-indigo-200' : 'border-gray-100'} ${className}`}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children }) => <div className="mt-6">{children}</div>;

// Updated animated 3D card component
const AssignmentPreviewCard = () => {
  const cardRef = useRef(null);
  const progressRef = useRef(null);
  const passedBadgeRef = useRef(null);
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
      // Animate the passed badge
      .fromTo(passedBadgeRef.current, 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }, 
        "-=0.5")
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
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-white/20 rounded overflow-hidden">
              <div className="typing-line h-full bg-blue-400/30 rounded"></div>
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
                <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full w-full"></div>
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
        </CardContent>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  
  useEffect(() => {
    // Hero section animations
    gsap.fromTo(
      ".hero-title", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    
    gsap.fromTo(
      ".hero-subtitle", 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
    );
    
    gsap.fromTo(
      ".hero-btn", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power3.out" }
    );
    
    // Floating background circles
    gsap.to(".bg-circle-1", {
      y: -30,
      x: 20,
      rotation: 15,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(".bg-circle-2", {
      y: 30,
      x: -20,
      rotation: -15,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Section title animations
    gsap.utils.toArray(".section-title").forEach((title) => {
      gsap.fromTo(
        title, 
        { opacity: 0, y: 50 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: title,
            start: "top bottom-=100",
          }
        }
      );
    });
    
    // Section description animations
    gsap.utils.toArray(".section-desc").forEach((desc) => {
      gsap.fromTo(
        desc, 
        { opacity: 0, y: 30 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: desc,
            start: "top bottom-=100",
          }
        }
      );
    });
    
    // Clean up
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleProceed = () => {
    navigate("/feedback"); // Redirect to FeedbackSystem.js
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Navbar */}
          <nav className="bg-white border-b border-gray-200 py-4 fixed w-full z-50 shadow-sm">
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">AssignMate</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="Features">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors" aria-label="How It Works">
                  How It Works
                </a>
              </div>
            </div>
          </nav>

          <main className="flex-grow pt-16">
            {/* Hero Section */}
            <section ref={heroRef} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 md:py-32 relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="bg-circle-1 absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="bg-circle-2 absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
              </div>

              <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 mb-10 md:mb-0">
                    <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                      Smart Assignment Checking Made Simple
                    </h1>
                    <p className="hero-subtitle text-xl md:text-2xl mb-8 text-blue-100 max-w-xl">
                      Get instant feedback, detect plagiarism, and improve your assignments with our AI-powered platform.
                    </p>
                    <div className="hero-btn">
                      <Button onClick={handleProceed}>Proceed</Button>
                    </div>
                  </div>

                  <div className="md:w-1/2 flex justify-center">
                    <AssignmentPreviewCard />
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} id="features" className="py-20 bg-gray-100">
              <div className="container mx-auto px-4 md:px-6">
                <h2 className="section-title text-4xl font-bold text-center mb-8 text-gray-800">Powerful Features</h2>
                <p className="section-desc text-center text-gray-600 max-w-2xl mx-auto mb-12">
                  Discover how AssignMate helps students improve their work and teachers save time with our comprehensive features.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[
                    {
                      title: "Instant Assignment Feedback",
                      desc: "Get real-time feedback on your assignments with detailed suggestions for improvement.",
                      icon: <ClipboardList className="h-10 w-10 text-blue-600" />,
                    },
                    {
                      title: "Plagiarism Detection",
                      desc: "Our advanced system checks your work against millions of sources to ensure originality.",
                      icon: <ShieldCheck className="h-10 w-10 text-blue-600" />,
                    },
                    {
                      title: "Save Time Grading",
                      desc: "Educators can automate grading processes and provide faster feedback to students.",
                      icon: <Clock className="h-10 w-10 text-blue-600" />,
                    },
                    {
                      title: "Custom Rubric",
                      desc: "Create and apply personalized grading rubrics to evaluate assignments effectively.",
                      icon: <BookOpen className="h-10 w-10 text-blue-600" />,
                    },
                    {
                      title: "Citation Checking",
                      desc: "Automatically verify and format citations according to various academic standards.",
                      icon: <ClipboardList className="h-10 w-10 text-blue-600" />,
                    },
                    {
                      title: "24/7 Availability",
                      desc: "Access our platform anytime, anywhere, from any device with internet connection.",
                      icon: <Globe className="h-10 w-10 text-blue-600" />,
                    },
                  ].map((item, i) => (
                    <Card key={i} index={i} className="hover:shadow-xl transition-shadow">
                      <div className="flex items-center space-x-4">
                        {item.icon}
                        <div>
                          <h3 className="font-semibold text-xl text-gray-800">{item.title}</h3>
                          <p className="text-md text-gray-600 mt-2">{item.desc}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section ref={howItWorksRef} id="how-it-works" className="py-20 bg-white">
              <div className="container mx-auto px-4 md:px-6">
                <h2 className="section-title text-4xl font-bold text-center mb-8 text-gray-800">How It Works</h2>
                <p className="section-desc text-center text-gray-600 max-w-2xl mx-auto mb-12">
                  Getting started with AssignMate is simple. Follow these three steps to improve your assignments.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[
                    {
                      title: "Upload Your Assignment",
                      desc: "Simply upload your document in any common format (PDF, Word, Text) to our secure platform.",
                      icon: <ClipboardList className="h-10 w-10 text-blue-600" />,
                    },
                    {
                      title: "Automated Analysis",
                      desc: "Our AI analyzes your work for grammar, plagiarism, citation accuracy, and structural improvements.",
                      icon: <ShieldCheck className="h-10 w-10 text-blue-600" />,
                    },
                    {
                      title: "Get Detailed Feedback",
                      desc: "Receive a comprehensive report with actionable suggestions to improve your assignment.",
                      icon: <FileCheck className="h-10 w-10 text-blue-600" />,
                    },
                  ].map((item, i) => (
                    <Card key={i} index={i} className="hover:shadow-xl transition-shadow">
                      <div className="flex items-center space-x-4">
                        {item.icon}
                        <div>
                          <h3 className="font-semibold text-xl text-gray-800">{item.title}</h3>
                          <p className="text-md text-gray-600 mt-2">{item.desc}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">AssignMate</h3>
                <p className="text-gray-400 text-sm">
                  Smart assignment checking for students and educators. Improve your academic performance with our AI-powered platform.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Product</h4>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>Features</li>
                  <li>For Students</li>
                  <li>For Educators</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Resources</h4>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>Blog</li>
                  <li>Tutorials</li>
                  <li>Help Center</li>
                  <li>About Us</li>
                  <li>Contact</li>
                  <li>Careers</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
              © 2025 AssignMate. All rights reserved. |{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>{" "}
              |{" "}
              <a href="#" className="underline">
                Terms of Service
              </a>
            </div>
          </footer>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default LandingPage;