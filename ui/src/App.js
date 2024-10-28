import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth_page/AuthPage';
import Homepage from './pages/home_page/homepage';
import Layout from './components/Layout';
import PetRegistration from './pages/pet_registration/pet_registration';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/homepage" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/homepage" replace /> : 
                <AuthPage setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          <Route 
            path="/homepage" 
            element={
              isAuthenticated ? 
                <Homepage /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/create-pet" 
            element={
              isAuthenticated ?
              <PetRegistration /> :
              <Navigate to="/login" replace />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
