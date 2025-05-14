import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { User, Star, Quote, Heart, Medal, MessageSquare } from 'lucide-react';

const Testimonial = ({ content, author, role, rating, highlight = false }) => {
  const testimonialRef = useRef(null);
  const quoteIconRef = useRef(null);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const card = testimonialRef.current;
    const quoteIcon = quoteIconRef.current;
    const contentElement = contentRef.current;
    
    // Initial floating animation
    gsap.to(card, {
      y: "-10px",
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
    
    // Slight rotation animation for the quote icon
    gsap.to(quoteIcon, {
      rotation: 15,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
    
    // Hover animation
    const handleMouseEnter = () => {
      // Pause the floating animation
      gsap.killTweensOf(card);
      
      gsap.to(card, { 
        y: -20, 
        scale: 1.05,
        boxShadow: highlight 
          ? "0 25px 30px -5px rgba(79, 70, 229, 0.4), 0 10px 15px -5px rgba(79, 70, 229, 0.3)"
          : "0 25px 30px -5px rgba(79, 70, 229, 0.2), 0 10px 15px -5px rgba(79, 70, 229, 0.15)",
        borderColor: highlight 
          ? "rgba(79, 70, 229, 0.8)"
          : "rgba(79, 70, 229, 0.5)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      // Animate the quote icon
      gsap.to(quoteIcon, {
        scale: 1.3,
        rotation: 15,
        opacity: 0.8,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
      
      // Text content animation - staggered appearance
      gsap.to(contentElement, {
        color: "#4338CA", // Indigo-700
        duration: 0.3
      });
      
      // Create sparkle effect
      createSparkles(card, 3);
    };
    
    const handleMouseLeave = () => {
      // Resume the floating animation
      gsap.to(card, {
        y: "-10px",
        scale: 1,
        boxShadow: highlight 
          ? "0 10px 15px -3px rgba(79, 70, 229, 0.2), 0 4px 6px -2px rgba(79, 70, 229, 0.15)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        borderColor: highlight 
          ? "rgba(79, 70, 229, 0.3)"
          : "rgba(79, 70, 229, 0.2)",
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(card, {
            y: "-10px",
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
        }
      });
      
      // Reset the quote icon
      gsap.to(quoteIcon, {
        scale: 1,
        rotation: 0,
        opacity: 0.5,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.to(quoteIcon, {
            rotation: 15,
            duration: 3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
        }
      });
      
      // Reset text content
      gsap.to(contentElement, {
        color: "#4B5563", // Gray-600
        duration: 0.3
      });
    };
    
    // Helper function to create sparkles effect
    const createSparkles = (element, count) => {
      const rect = element.getBoundingClientRect();
      
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const sparkle = document.createElement('div');
          sparkle.className = 'absolute w-1 h-1 rounded-full bg-yellow-400 pointer-events-none z-10';
          
          // Random position near the card
          const x = Math.random() * rect.width;
          const y = Math.random() * rect.height;
          
          sparkle.style.left = `${x}px`;
          sparkle.style.top = `${y}px`;
          
          element.appendChild(sparkle);
          
          // Animate the sparkle
          gsap.to(sparkle, {
            scale: 4,
            opacity: 0,
            duration: 0.8,
            onComplete: () => sparkle.remove(),
            ease: "power1.out"
          });
        }, i * 200);
      }
    };
    
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      gsap.killTweensOf(card);
      gsap.killTweensOf(quoteIcon);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [highlight]);
  
  // Determine which icon to use based on rating
  const getIcon = () => {
    if (rating >= 5) return <Medal className="h-6 w-6 text-yellow-500" />;
    if (rating >= 4) return <Heart className="h-6 w-6 text-pink-500" />;
    return <MessageSquare className="h-6 w-6 text-blue-500" />;
  };
  
  return (
    <div 
      ref={testimonialRef}
      className={`bg-white rounded-xl shadow-md border ${highlight ? 'border-indigo-300' : 'border-indigo-200'} p-6 w-80 flex-shrink-0 mx-3 relative ${highlight ? 'bg-indigo-50/50' : ''}`}
    >
      <div ref={quoteIconRef} className="absolute top-6 right-6 opacity-50">
        <Quote className="h-8 w-8 text-indigo-400" />
      </div>
      
      <div className="flex space-x-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 fill-current ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
      
      <p ref={contentRef} className="text-gray-600 mb-4">{content}</p>
      
      <div className="flex items-center">
        <div className={`${highlight ? 'bg-indigo-200' : 'bg-indigo-100'} rounded-full p-2 mr-3`}>
          {getIcon()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

const ScrollingMarquee = () => {
  const scrollerRef = useRef(null);
  const innerScrollerRef = useRef(null);
  const secondScrollerRef = useRef(null);
  
  useEffect(() => {
    const scroller = scrollerRef.current;
    const innerScroller = innerScrollerRef.current;
    const secondScroller = secondScrollerRef.current;
    
    // Create a staggered scroll effect with two rows moving in opposite directions
    const tl = gsap.timeline();
    
    // First row - left to right
    tl.to(innerScroller, {
      x: "-50%",
      duration: 40,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          return `${parseFloat(x) % -50}%`;
        }
      }
    });
    
    // Second row - right to left (opposite direction)
    tl.to(secondScroller, {
      x: "50%",
      duration: 40,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          return `${parseFloat(x) % 50}%`;
        }
      }
    }, 0);
    
    // Pause the animation on hover
    const handleMouseEnter = () => {
      gsap.to(tl, { timeScale: 0.2, duration: 0.5 });
    };
    
    const handleMouseLeave = () => {
      gsap.to(tl, { timeScale: 1, duration: 0.5 });
    };
    
    scroller.addEventListener("mouseenter", handleMouseEnter);
    scroller.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      scroller.removeEventListener("mouseenter", handleMouseEnter);
      scroller.removeEventListener("mouseleave", handleMouseLeave);
      tl.kill();
    };
  }, []);
  
  const testimonials = [
    {
      content: "This feedback system has completely transformed how we address academic integrity issues at our university.",
      author: "Dr. Jennifer Wilson",
      role: "University Professor",
      rating: 5,
      highlight: true
    },
    {
      content: "The AI detection is incredibly accurate and helps us maintain high standards for all student submissions.",
      author: "Michael Chen",
      role: "Department Chair",
      rating: 5
    },
    {
      content: "Students appreciate the detailed feedback they receive, which helps them improve their writing skills.",
      author: "Sarah Johnson",
      role: "Academic Advisor",
      rating: 4
    },
    {
      content: "The integration with our existing systems was seamless. Highly recommended for any educational institution.",
      author: "Robert Davis",
      role: "IT Administrator",
      rating: 5,
      highlight: true
    },
    {
      content: "A game-changer for promoting original thinking and academic honesty in our classrooms.",
      author: "Emily Rodriguez",
      role: "High School Teacher",
      rating: 5
    },
    {
      content: "The analytics provided have given us valuable insights into student writing patterns and learning progress.",
      author: "David Thompson",
      role: "Academic Director",
      rating: 4
    }
  ];
  
  // Second set of testimonials for the second row
  const testimonials2 = [
    {
      content: "We've seen a significant improvement in the quality of student submissions since implementing this system.",
      author: "Prof. Mark Johnson",
      role: "College Dean",
      rating: 5,
      highlight: true
    },
    {
      content: "The real-time feedback has been invaluable for our distance learning programs.",
      author: "Lisa Chen",
      role: "Online Learning Coordinator",
      rating: 4
    },
    {
      content: "Parents have expressed appreciation for the detailed insights into their children's writing progress.",
      author: "James Wilson",
      role: "School Principal",
      rating: 5
    },
    {
      content: "The platform has helped us standardize assessment criteria across our entire department.",
      author: "Dr. Maria Santos",
      role: "Education Researcher",
      rating: 5,
      highlight: true
    },
    {
      content: "Customer support has been exceptional. They've addressed all our questions promptly.",
      author: "Thomas Brown",
      role: "Technology Coordinator",
      rating: 4
    },
    {
      content: "The AI suggestions have helped students develop critical thinking skills beyond just writing.",
      author: "Rachel Kim",
      role: "Writing Center Director",
      rating: 5
    }
  ];
  
  // Duplicate each row to create a continuous effect
  const firstRowTestimonials = [...testimonials, ...testimonials];
  const secondRowTestimonials = [...testimonials2, ...testimonials2];
  
  return (
    <div ref={scrollerRef} className="py-12 overflow-hidden">
      <div className="flex flex-col space-y-8">
        {/* First row */}
        <div className="relative w-full overflow-hidden">
          <div 
            ref={innerScrollerRef} 
            className="flex"
          >
            {firstRowTestimonials.map((testimonial, index) => (
              <Testimonial 
                key={`row1-${index}`}
                content={testimonial.content} 
                author={testimonial.author} 
                role={testimonial.role}
                rating={testimonial.rating}
                highlight={testimonial.highlight}
              />
            ))}
          </div>
        </div>
        
        {/* Second row - moves in opposite direction */}
        <div className="relative w-full overflow-hidden">
          <div 
            ref={secondScrollerRef} 
            className="flex"
          >
            {secondRowTestimonials.map((testimonial, index) => (
              <Testimonial 
                key={`row2-${index}`}
                content={testimonial.content} 
                author={testimonial.author} 
                role={testimonial.role}
                rating={testimonial.rating}
                highlight={testimonial.highlight}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollingMarquee;
