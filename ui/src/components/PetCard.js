import React, { useState, useEffect } from 'react';
import './PetCard.css';

const PetCard = ({ pet }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(pet.like_count);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/likes/${pet.id}/liked`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setLiked(data.liked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [pet.id]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/likes/${pet.id}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setLiked(!liked);
        const countResponse = await fetch(`/api/likes/${pet.id}/count`, { credentials: "include"})
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setLikeCount(countData.likes_count)
        }
      }  
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="profile-card">
      <div className="pet-info">
        <h3>{pet.name}</h3>
        <p className="breed">{pet.breed}</p>
        <p className="bio">{pet.bio}</p>
      </div>
      <div className="user-info">
        <p className="username">Owner: {pet.owner_username}</p>
      </div>
      <div className="action-buttons">
        <button 
          className={`like-button ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          ❤️ {likeCount}
        </button>
      </div>
    </div>
  );
};

export default PetCard;
