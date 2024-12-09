import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "@config";
import "./pet_registration.css";

const PetRegistration = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [releaseDate, setReleaseDate] = useState("");
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

    // optional: image
    if (fileInputRef.current.files[0]) {
      formDataToSend.append("image", fileInputRef.current.files[0]);
    }

    // optional: release date
    if (releaseDate) {
      const localDate = new Date(releaseDate);

      // calculate the actual UTC date based off the difference between local time and GMT
      // if we don't do this, dates entered are in GMT, ~6 hours ahead
      const utcDate = new Date(localDate.getTime());

      // crop out the extra (milliseconds)
      const utcString = utcDate.toISOString().slice(0, 16);

      formDataToSend.append("release_date", utcString);
    }

    try {
      const response = await fetch(`${config.backendApiUrl}/pets/create`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(`an error occured: ${data.message}`);
        throw new Error("Failed to register pet (is your image too big?)");
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
        <div className="form-group">
          <label htmlFor="releaseDate" className="form-label">
            Schedule Pet Registration
          </label>
          <input
            id="releaseDate"
            type="datetime-local"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
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
