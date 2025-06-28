import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Loading } from './components/ui/Loading';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Skills } from './pages/dashboard/Skills';
import { Quests } from './pages/dashboard/Quests';
import { Progress } from './pages/dashboard/Progress';
import { Settings } from './pages/dashboard/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  if (loading || showLoading) {
    return <Loading 
      fullScreen 
      onLoadingComplete={() => setShowLoading(false)} 
    />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { user, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  if (loading || showLoading) {
    return <Loading 
      fullScreen 
      onLoadingComplete={() => setShowLoading(false)} 
    />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
        
        {/* Auth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="skills" element={<Skills />} />
          <Route path="quests" element={<Quests />} />
          <Route path="progress" element={<Progress />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;