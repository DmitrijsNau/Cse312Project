import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';

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
                    <img alt="Pupple Logo" />
                    <h1>Pupple</h1>
                </div>
                <nav className="main-nav">
                    <ul>
                        <li><a href="#matches" className="active">Matches</a></li>
                        <li><a href="#profile">Profile</a></li>
                        <li><a href="#messages">Messages</a></li>
                        <li><Link to="/create-pet">Create Pet</Link></li>
                        <li><a href="#settings">Settings</a></li>
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
