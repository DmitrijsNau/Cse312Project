import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Authentication from './pages/authentication_page/authentication';
import Homepage from './pages/home_page/homepage';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with actual authentication logic

  return (
    <Router>
      <Routes>
      <Route element={<Layout isAuthenticated={isAuthenticated} />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/homepage" element={<Homepage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;