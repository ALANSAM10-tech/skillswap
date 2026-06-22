import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Auth from '../pages/Auth';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import SwapRequests from '../pages/SwapRequests';
import LearningPaths from '../pages/LearningPaths';
import Settings from '../pages/Settings';
import Mentorship from '../pages/Mentorship';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/connections" element={<SwapRequests />} />
      <Route path="/learning-path" element={<LearningPaths />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/mentorship" element={<Mentorship />} />
      <Route path="*" element={<Home />} /> {/* Fallback route */}
    </Routes>
  );
}
