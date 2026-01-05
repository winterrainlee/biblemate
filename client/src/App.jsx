import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// import Home from './pages/Home';
// import Bible from './pages/Bible';
import ReadingDashboard from './pages/ReadingDashboard';
import Notes from './pages/Notes';
import Search from './pages/Search';
import Settings from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ReadingDashboard />} />
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
