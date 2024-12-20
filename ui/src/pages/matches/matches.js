import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessagesSquare, PawPrint } from "lucide-react";
import config from "@config";
import styles from "./matches.module.css";

const MatchesList = () => {
  const [matches, setMatches] = useState([]);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { petId } = useParams();
  const navigate = useNavigate();

  // fetch the data when component loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        // get pet info first
        const petResponse = await fetch(
          `${config.backendApiUrl}/pets/by-id?pet_id=${petId}`,
          {
            credentials: "include",
          },
        );

        if (!petResponse.ok) {
          throw new Error("Failed to fetch pet details");
        }

        const petData = await petResponse.json();
        setPet(petData);

        const matchesResponse = await fetch(
          `${config.backendApiUrl}/pets/${petId}/matches`,
          {
            credentials: "include",
          },
        );

        if (!matchesResponse.ok) {
          throw new Error("Failed to fetch matches");
        }

        const matchesData = await matchesResponse.json();
        if (matchesData.err) {
          throw new Error(matchesData.message || "Failed to fetch matches");
        }

        setMatches(matchesData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <main className="my-pets-container">
      <div className={styles.backButton}>
        <button
          onClick={() => navigate("/my-pets")}
          className={styles.actionButton}
        >
          <ArrowLeft className={styles.buttonIcon} />
          Back to My Pets
        </button>
      </div>

      <div className="page-title-container">
        <h2 className="page-title">Matches for {pet?.name}</h2>
      </div>

      <div className={styles.matchesGrid}>
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className={styles.matchCard}>
              <div className={styles.infoSection}>
                <div className={styles.avatarContainer}>
                  <span className={styles.avatarLetter}>
                    {match.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className={styles.username}>{match.username}</h3>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.actionButton}
                    onClick={() => console.log("unimplemented")}
                    aria-label="Go to DMs"
                  >
                    <MessagesSquare className={styles.buttonIcon} />
                    <span>DMs</span>
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => navigate(`/user/${match.id}`)}
                    aria-label="View Pets"
                  >
                    <PawPrint className={styles.buttonIcon} />
                    <span>View Pets</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No matches yet for {pet?.name}</p>
            <p className={styles.emptyStateSubtext}>
              Matches will appear here when other users like your pet
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MatchesList;
