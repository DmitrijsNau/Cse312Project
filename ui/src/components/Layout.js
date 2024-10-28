import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ isAuthenticated, setIsAuthenticated }) => {
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };
  return (
    <div>
      {isAuthenticated ? (
        <div>
            <header className="app-header">
                <div className="pupple logo">
                    <img src='/logo.png' alt="Pupple Logo" />
                    <h1>Pupple</h1>
                </div>
                <nav className="main-nav">
                    <ul>
                        <li><Link to="/homepage" className="nav-button">Find Pets</Link></li>
                        <li><Link to="/create-pet" className="nav-button">Register My Pet</Link></li>
                        <li><Link to="/homepage" className="nav-button">My Matches</Link></li>
                        <li><Link to="/homepage" className="nav-button">My Pets</Link></li>
                        <li><Link to="/homepage" className="nav-button">Settings</Link></li>
                    </ul>
                </nav>
                <form onSubmit={handleLogout}>
                    <input type="submit" value="Sign Out" />
                </form>
                <div className="user-menu">
                </div>
            </header>
          <main>
            <Outlet />
          </main>
        </div>
      ) : (
        <div>
            <header className="app-header">
                <div className="logo-container">
                    <h1>Pupple</h1>
                </div>
            </header>
          <main>
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
};

export default Layout;
