import React from 'react';
import './PetCard.css'; 

const PetCard = ({ pet }) => {
    const handleSkip = () => {
    }
    const handleLike = () => {
    }
  return (
    <div className="profile-card">
      <div className="profile-images">
        {/* <img src="/path-to-image" alt="Matched Dog" className="main-image" /> */}
      </div>
      <div className="pet-info">
        <h3>{pet.name}</h3>
        <p className="breed">{pet.breed}</p>
        <p className="bio">{pet.bio}</p>
      </div>
      <div className="user-info">
        <p className="username">Owner: {pet.owner_username}</p>
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
  );
};

export default PetCard;
