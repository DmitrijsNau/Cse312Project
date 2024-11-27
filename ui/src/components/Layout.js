import React, { useState }   from "react";
import { Outlet, Link } from "react-router-dom";
import ConversationsModal from '@components/ConversationsModal';

import "./Layout.css";

const Layout = ({
  isAuthenticated,
  setIsAuthenticated,
  currentUsername,
  setCurrentUsername,
}) => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const openChatModal = () => {
    setIsChatModalOpen(true);
    // Optionally, you can set a default recipientId or leave it null
    setSelectedUserId(null);
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
    setSelectedUserId(null);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setIsAuthenticated(false);
      setCurrentUsername("");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <header className="app-header">
            <div className="pupple logo">
              <img src="/logo.png" alt="Pupple Logo" className="logo" />
              <h1>Pupple</h1>
            </div>
            <nav className="main-nav">
              <ul>
                <li>
                  <Link to="/homepage" className="nav-button">
                    Find Pets
                  </Link>
                </li>
                <li>
                  <Link to="/create-pet" className="nav-button">
                    Register My Pet
                  </Link>
                </li>
                <li>
                  <Link to="/my-pets" className="nav-button">
                    My Pets
                  </Link>
                </li>
                <li>
              <button onClick={openChatModal} className="nav-button">
                My DMs
              </button>
                </li>
              </ul>
            </nav>
            <div className="user-menu-container">
              <div className="user-menu">
                <p>Welcome, {currentUsername}</p>
              </div>
              <form onSubmit={handleLogout}>
                <input className="nav-button" type="submit" value="Sign Out" />
              </form>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
          <ConversationsModal
        isOpen={isChatModalOpen}
        onClose={closeChatModal}
        recipientId={selectedUserId}
      />
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
