import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ReadingDashboard from './pages/ReadingDashboard';
// Dynamic imports for code splitting - reduces initial bundle size
const Settings = lazy(() => import('./pages/Settings'));
const BibleChartPage = lazy(() => import('./pages/BibleChartPage'));
import LoginPage from './pages/LoginPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { TabProvider } from './contexts/TabContext';

// Loading fallback component
const PageLoader = () => (
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
);

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
      <TabProvider>
        <Router>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<ReadingDashboard />} />
                <Route path="/chart" element={<BibleChartPage />} />
                <Route path="/settings" element={<Settings />} />
                {/* Redirect legacy routes */}
                <Route path="*" element={<ReadingDashboard />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </TabProvider>
    </ThemeProvider>
  );
}

export default App;
