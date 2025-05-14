import React, { Suspense, useState, useEffect } from "react";
import EnhancedLandingPage from "./EnhancedLandingPage";

// This component now includes improved error handling and performance optimization for 3D elements
const LandingPage = () => {
  const [has3DError, setHas3DError] = useState(false);
  const [shouldRender3D, setShouldRender3D] = useState(true);
  
  // Check device performance on mount
  useEffect(() => {
    // Simple performance detection
    const checkPerformance = () => {
      // Check if device is mobile or has low memory
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
      
      // Detect low-end devices
      if (isMobile || hasLowMemory || window.innerWidth < 768) {
        console.info("Low performance device detected, disabling 3D");
        setShouldRender3D(false);
      }
    };
    
    checkPerformance();
    
    // Also check for slow frames after a short delay
    const perfTimeout = setTimeout(() => {
      if (window.performance && window.performance.memory) {
        const highMemoryUsage = window.performance.memory.usedJSHeapSize > 200000000; // 200MB
        if (highMemoryUsage) {
          console.info("High memory usage detected, disabling 3D");
          setShouldRender3D(false);
        }
      }
    }, 3000);
    
    return () => clearTimeout(perfTimeout);
  }, []);
  
  // Error boundary for 3D content
  if (has3DError || !shouldRender3D) {
    // Render a fallback version without 3D elements
    return (
      <div className="landing-page-fallback">
        <EnhancedLandingPage disable3D={true} />
      </div>
    );
  }

  // Try to catch errors
  try {
    return (
      <ErrorBoundary onError={() => setHas3DError(true)}>
        <EnhancedLandingPage />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("3D rendering error:", error);
    setHas3DError(true);
    return <EnhancedLandingPage disable3D={true} />;
  }
};

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D component error:", error, errorInfo);
    if (this.props.onError) this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Parent will handle fallback
    }
    return this.props.children;
  }
}

export default LandingPage;