import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const Layout = ({ isAuthenticated }) => {
    const handleLogout = async (e) => {
        e.preventDefault();
        // logging out functionality will be added here 
    };
  return (
    <div>
      {isAuthenticated ? (
        <div>
            <header className="app-header">
                <div className="pupple logo">
                    <img alt="Pupple Logo" />
                    <h1>Authed</h1>
                </div>
                <nav className="main-nav">
                    <ul>
                        <li><a href="#matches" className="active">Matches</a></li>
                        <li><a href="#profile">Profile</a></li>
                        <li><a href="#messages">Messages</a></li>
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