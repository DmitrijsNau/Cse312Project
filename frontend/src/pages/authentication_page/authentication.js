import React, { useState } from 'react';
import './authentication.css';

const Authentication = () => {
    const [currentView, setCurrentView] = useState('signIn');

    const handleFormSubmit = (e) => {
        e.preventDefault();
    };

    const switchView = (view) => {
        setCurrentView(view);
    };

    return (
        <>
            <header className="app-header">
                <div className="logo-container">
                    <h1>Pupple</h1>
                </div>
            </header>

            <main className="app-container">
                <div className="credential-container">
                    <div className="credential-tabs">
                        <button 
                            className={`credential-tab ${currentView === 'signIn' ? 'active' : ''}`}
                            onClick={() => switchView('signIn')}
                        >
                            Sign In
                        </button>
                        <button 
                            className={`credential-tab ${currentView === 'signUp' ? 'active' : ''}`}
                            onClick={() => switchView('signUp')}
                        >
                            Register
                        </button>
                    </div>

                    <div className="credential-forms">
                        {currentView === 'signIn' ? (
                            <form id="signInForm" className="credential-form active" onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <label htmlFor="userIdentifier">Email or Username</label>
                                    <input 
                                        type="text" 
                                        id="userIdentifier" 
                                        required 
                                        placeholder="Enter your email or username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="userPassword">Password</label>
                                    <input 
                                        type="password" 
                                        id="userPassword" 
                                        required 
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <button type="submit" className="credential-button">Sign In</button>
                            </form>
                        ) : (
                            <form id="signUpForm" className="credential-form active" onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <label htmlFor="ownerName">Owner's Name</label>
                                    <input 
                                        type="text" 
                                        id="ownerName" 
                                        required 
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="petName">Pet's Name</label>
                                    <input 
                                        type="text" 
                                        id="petName" 
                                        required 
                                        placeholder="Enter your pet's name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newUsername">Username</label>
                                    <input 
                                        type="text" 
                                        id="newUsername" 
                                        required 
                                        placeholder="Choose a username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newEmail">Email</label>
                                    <input 
                                        type="email" 
                                        id="newEmail" 
                                        required 
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newPassword">Password</label>
                                    <input 
                                        type="password" 
                                        id="newPassword" 
                                        required 
                                        placeholder="Create a password"
                                    />
                                </div>
                                <button type="submit" className="credential-button">Create Account</button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Authentication;