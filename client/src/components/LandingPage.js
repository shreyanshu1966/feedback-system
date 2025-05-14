import React, { Suspense, useState } from "react";
import EnhancedLandingPage from "./EnhancedLandingPage";

// This component now includes error handling for 3D elements
const LandingPage = () => {
  const [has3DError, setHas3DError] = useState(false);
  
  // Error boundary for 3D content
  if (has3DError) {
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