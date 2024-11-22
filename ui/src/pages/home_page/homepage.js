import React, { useEffect, useState } from "react";

import "./homepage.css";
import config from "@config";
import PetCard from "@components/PetCard";

const Homepage = () => {
  const [pets, setPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.backendApiUrl}/pets/get-all`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        if (!result) {
          throw new Error("No data available");
        }
        if (result.err !== false) {
          throw new Error(result.err);
        }
        console.log(result.data);
        console.log(result);
        setPets(result.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>;
  }

  return (
    <main className="my-pets-container">
      <section id="Matches" className="section active">
        <div class="page-title-container">
          <h2 class="page-title">Check Out Other Pets!</h2>
        </div>
        <div className="pets-grid">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} actions={["like"]} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Homepage;
