import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// import Home from './pages/Home';
// import Bible from './pages/Bible';
import ReadingDashboard from './pages/ReadingDashboard';
import Notes from './pages/Notes';
import Search from './pages/Search';
import Settings from './pages/Settings';
import BibleChartPage from './pages/BibleChartPage';
import LoginPage from './pages/LoginPage';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [authState, setAuthState] = useState({
    loading: true,
    authRequired: false,
    authenticated: false
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Auth check failed');
      }

      const data = await response.json();
      setAuthState({
        loading: false,
        authRequired: data.authRequired,
        authenticated: data.authenticated
      });
    } catch (err) {
      // If auth check fails, assume auth is required to be safe
      setAuthState({
        loading: false,
        authRequired: true,
        authenticated: false
      });
    }
  };

  const handleLogin = () => {
    setAuthState(prev => ({ ...prev, authenticated: true }));
  };

  // Show loading state
  if (authState.loading) {
    return (
      <ThemeProvider>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}>
          로딩 중...
        </div>
      </ThemeProvider>
    );
  }

  // Show login page if auth required and not authenticated
  if (authState.authRequired && !authState.authenticated) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ReadingDashboard />} />
            <Route path="/chart" element={<BibleChartPage />} />
            <Route path="/settings" element={<Settings />} />
            {/* Redirect legacy routes */}
            <Route path="*" element={<ReadingDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
