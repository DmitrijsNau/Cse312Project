import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
    const [currentView, setCurrentView] = useState('signIn');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        const username = document.getElementById('userIdentifier').value;
        const password = document.getElementById('userPassword').value;
        
        try {
            const response = await fetch(`/api/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
                method: 'POST',
                credentials: 'include' // to include cookies
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }
            if (data.err) {
                throw new Error(data.err);
            }
            
            setError('')
            navigate('/homepage', { replace: true })
            window.location.reload()
        } catch (err) {
            setError(err.message || 'Login failed.');
        }
    };
        
    const handleSignUp = async (e) => {
        e.preventDefault();
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const passwordConfirm = document.getElementById('newPasswordConfirm').value;
        if (password !== passwordConfirm) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    password_confirm: passwordConfirm,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }
            
            setError('');
            setCurrentView('signIn');
        } catch (err) {
            setError(err.message);
        }
    };

    const switchView = (view) => {
        setError('');
        setCurrentView(view);
    };

    return (
        <main className="app-container">
            <div className="credential-container">
                {error && (
                    <div className="error-message p-4 mb-4 text-red-500 bg-red-100 rounded">
                        {error}
                    </div>
                )}
                
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
                        <form id="signInForm" className="credential-form active" onSubmit={handleSignIn}>
                            <div className="form-group">
                                <label htmlFor="userIdentifier">Username</label>
                                <input 
                                    type="text" 
                                    id="userIdentifier" 
                                    required 
                                    placeholder="Username..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="userPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="userPassword" 
                                    required 
                                    placeholder="Password..."
                                />
                            </div>
                            <button type="submit" className="credential-button">Sign In</button>
                        </form>
                    ) : (
                        <form id="signUpForm" className="credential-form active" onSubmit={handleSignUp}>
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
                                <label htmlFor="newPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="newPassword" 
                                    required 
                                    placeholder="Create a password"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="newPasswordConfirm" 
                                    required 
                                    placeholder="Confirm password"
                                />
                            </div>
                            <button type="submit" className="credential-button">Create Account</button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AuthPage;
