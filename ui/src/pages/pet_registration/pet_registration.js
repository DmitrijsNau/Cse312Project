import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "@config";
import "./pet_registration.css";

const PetRegistration = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    breed: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(URL.createObjectURL(file));
      } else {
        setError("Please select an image file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("bio", formData.bio || "");
    formDataToSend.append("breed", formData.breed);

    // we only want to include an image if it was uploaded
    if (fileInputRef.current.files[0]) {
      formDataToSend.append("image", fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch(`${config.backendApiUrl}/pets/create`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register pet");
      }

      navigate("/homepage");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pet-registration-container">
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="registration-form">
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter your pet's name"
          className="pet-name-input"
        />

        <div onClick={handleImageClick} className="image-upload-container">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Selected pet"
              className="selected-image"
            />
          ) : (
            <div className="upload-placeholder">
              <img
                src="/images/placeholder.png"
                alt="Upload placeholder"
                className="placeholder-image"
              />
              <p className="upload-text">Click to upload pet image</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="form-group">
          <label htmlFor="breed" className="form-label">
            Breed*
          </label>
          <input
            type="text"
            id="breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            required
            placeholder="Enter your pet's breed"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about your pet"
            className="form-textarea"
          />
        </div>

        <button type="submit" className="submit-button">
          Register Pet
        </button>
      </form>
    </div>
  );
};

export default PetRegistration;
