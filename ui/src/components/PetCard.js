// PetCard.js
import React, { useState, useEffect } from "react";
import { Heart, Trash2 } from "lucide-react";
import styles from "./PetCard.module.css";

const PetCard = ({ pet, actions }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(pet.like_count);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/likes/${pet.id}/liked`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setLiked(data.liked);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    // Only check like status if we're showing the like button
    if (actions?.includes("like")) {
      checkLikeStatus();
    }
  }, [pet.id, actions]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/likes/${pet.id}`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setLiked(!liked);
        const countResponse = await fetch(`/api/likes/${pet.id}/count`, {
          credentials: "include",
        });
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setLikeCount(countData.likes_count);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Define the action buttons map
  const actionButtons = {
    like: (
      <button
        key="like"
        className={liked ? styles.likeButtonLiked : styles.likeButton}
        onClick={handleLike}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Heart
          className={`${styles.buttonIcon} ${liked ? styles.filledIcon : ""}`}
        />
        <span>{likeCount}</span>
      </button>
    ),
    delete: (onDelete) => (
      <button
        key="delete"
        className={styles.deleteButton}
        onClick={() => onDelete(pet.id)}
        aria-label="Delete pet"
      >
        <Trash2 className={styles.buttonIcon} />
        <span>Delete</span>
      </button>
    ),
    matches: (onMatchesClick) => (
      <button
        key="matches"
        className={styles.matchesButton}
        onClick={() => onMatchesClick(pet.id)}
        aria-label="View matches"
      >
        <Heart className={styles.buttonIcon} />
        <span>Matches</span>
      </button>
    ),
  };

  return (
    <div className={styles.card}>
      <div className={styles.infoSection}>
        <h3 className={styles.petName}>{pet.name}</h3>
        <p className={`${styles.textContent} ${styles.italicText}`}>
          {pet.breed}
        </p>
        <p className={`${styles.textContent} ${styles.bioText}`}>{pet.bio}</p>
      </div>

      <div className={styles.imageContainer}>
        {pet.image_url ? (
          <img
            src={pet.image_url}
            alt={`${pet.name}'s profile`}
            className={styles.petImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <img
              src="/images/placeholder.png"
              alt="Pet placeholder"
              className={styles.placeholderImage}
            />
          </div>
        )}
      </div>

      <div className={styles.infoSection}>
        <p className={`${styles.textContent} ${styles.italicText}`}>
          Owner: {pet.owner_username}
        </p>
      </div>

      {actions && (
        <div className={styles.actionButtons}>
          {actions.map((action) => {
            if (typeof action === "string") {
              return actionButtons[action];
            }
            return actionButtons[action.type](action.handler);
          })}
        </div>
      )}
    </div>
  );
};

export default PetCard;
