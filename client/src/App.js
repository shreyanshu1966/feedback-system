import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import FeedbackSystem from './components/FeedbackSystem';
import GetFeedback from './components/GetFeedback';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/feedback" element={<FeedbackSystem />} />
          <Route path="/get-feedback" element={<GetFeedback />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;