import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PetCard from "@components/PetCard";
import config from "@config";
import "./my_pets.css";

const MyPets = () => {
  const [pets, setPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPets = async () => {
    try {
      const response = await fetch(`${config.backendApiUrl}/pets/my-pets`, {
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

  const handleDelete = async (petId) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        const response = await fetch(`${config.backendApiUrl}/pets/${petId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to delete pet");
        }
        fetchPets(); // refresh after a pet is deleted
      } catch (error) {
        setError(error.message);
      }
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
        <h2 class="page-title">My Pets!</h2>
      </div>
      {!pets || pets.length === 0 ? (
        <div className="my-pets-empty">
          <p>You haven't registered any pets yet!</p>
          <div className="my-pets-header">
            <h2>My Pets</h2>
            <Link to="/create-pet" className="register-pet-link">
              Register New Pet
            </Link>
          </div>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              actions={[
                { type: "delete", handler: handleDelete },
                {
                  type: "matches",
                  handler: (petId) => navigate(`/matches/${petId}`),
                },
              ]}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default MyPets;
