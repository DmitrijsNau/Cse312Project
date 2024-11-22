import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PetCard from "@components/PetCard";
import config from "@config";
import "./my_pets.css";

const MyPets = () => {
  const [pets, setPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="my-pets-header">
        <h2>My Pets</h2>
        <Link to="/create-pet" className="register-pet-link">
          Register New Pet
        </Link>
      </div>

      {!pets || pets.length === 0 ? (
        <div className="my-pets-empty">
          <p>You haven't registered any pets yet!</p>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <div key={pet.id}>
              <PetCard pet={pet} />
              <button
                className="delete-button"
                onClick={async () => {
                  if (
                    window.confirm("Are you sure you want to delete this pet?")
                  ) {
                    try {
                      const response = await fetch(
                        `${config.backendApiUrl}/pets/${pet.id}`,
                        {
                          method: "DELETE",
                          credentials: "include",
                        },
                      );
                      if (!response.ok) {
                        throw new Error("Failed to delete pet");
                      }
                      fetchPets(); // Refresh the list
                    } catch (error) {
                      setError(error.message);
                    }
                  }
                }}
              >
                Delete Pet
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyPets;
