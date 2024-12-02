import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import PetCard from "@components/PetCard";
import config from "@config";
import "./user_pets.css";

const MyPets = () => {
  const [pets, setPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();

  const fetchPets = async () => {
    try {
      const response = await fetch(`${config.backendApiUrl}/pets/by-user?user_id=${userId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch pets");
      }
      const result = await response.json();
      if (result.err) {
        throw new Error(result.message || "Failed to fetch pets");
      }
      setPets(result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <main className="my-pets-container">
      <div class="page-title-container">
      </div>
      {!pets || pets.length === 0 ? (
        <div className="my-pets-empty">
          <p>This user does not have any pets!</p>
          </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default MyPets;
