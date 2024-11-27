import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/auth_page/AuthPage";
import Homepage from "./pages/home_page/homepage";
import MyPets from "./pages/my_pets/my_pets";
import Layout from "./components/Layout";
import PetRegistration from "./pages/pet_registration/pet_registration";
import MatchesList from './pages/matches/matches';
import UserPets from "./pages/user_pets/user_pets";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState("");
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/status"); // Replace with your actual API endpoint
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        setCurrentUsername(data.username);
      } catch (error) {
        console.error("Auth check failed:", error);
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
        <Route
          element={
            <Layout
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
              currentUsername={currentUsername}
              setCurrentUsername={setCurrentUsername}
            />
          }
        >
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/homepage" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/homepage" replace />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/homepage"
            element={
              isAuthenticated ? <Homepage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/my-pets"
            element={
              isAuthenticated ? <MyPets /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/create-pet"
            element={
              isAuthenticated ? (
                <PetRegistration />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/matches/:petId"
            element={
            isAuthenticated ? <MatchesList /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/user/:userId"
            element={
            isAuthenticated ? <UserPets /> : <Navigate to="/login" replace />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
