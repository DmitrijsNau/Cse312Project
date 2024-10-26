import React from 'react';
import './homepage.css';

const Homepage = () => {
    const handleLogout = async (e) => {
        e.preventDefault();
        // logging out functionality will be added here 
    };

    const handleSkip = () => {
        // add skip match functionality later on 
    };

    const handleLike = () => {
        // add like functionality later on 
    };

    return (
        <>
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
                        <li><a href="#settings">Settings</a></li>
                    </ul>
                </nav>
                <form onSubmit={handleLogout}>
                    <input type="submit" value="Sign Out" />
                </form>
                <div className="user-menu">
                </div>
            </header>

            <main className="app-container">
                <section id="Matches" className="section active">
                    <h2>Check Out Your Pup's Match!</h2>
                    <div className="profile-card">
                        <div className="profile-images">
                            <img src="/path-to-image" alt="Matched Dog" className="main-image" />
                        </div>
                        <div className="profile-info">
                            <h3>Max</h3>
                            <p className="breed">German Shepherd</p>
                            <p className="age">3 years old</p>
                            <div className="tags">
                                <span className="tag">Friendly</span>
                                <span className="tag">Active</span>
                                <span className="tag">Trained</span>
                            </div>
                            <p className="bio">
                                Energetic and playful pup looking for adventure buddies! 
                                Love playing fetch and going on long walks.
                            </p>
                            <div className="location">
                                <span>📍 2 miles away</span>
                            </div>
                        </div>
                        <div className="action-buttons">
                            <button className="btn-skip" onClick={handleSkip}>
                                EW!🤮
                            </button>
                            <button className="btn-like" onClick={handleLike}>
                                YES!❤️
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Homepage;