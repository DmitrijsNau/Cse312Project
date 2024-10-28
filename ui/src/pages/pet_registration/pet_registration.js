import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '@config';
import './pet_registration.css';

const PetRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        breed: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${config.backendApiUrl}/pets/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for sending cookies
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to register pet');
            }

            // Redirect to homepage on success
            navigate('/homepage');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <main className="app-container">
            <div className="pet-registration-container">
                <h2>Register Your Pet</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="pet-registration-form">
                    <div className="form-group">
                        <label htmlFor="name">Pet's Name*</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your pet's name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="breed">Breed*</label>
                        <input
                            type="text"
                            id="breed"
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            required
                            placeholder="Enter your pet's breed"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about your pet"
                            rows="4"
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Register Pet
                    </button>
                </form>
            </div>
        </main>
    );
};

export default PetRegistration;

