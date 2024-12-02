import React, { useEffect, useState } from "react";
import "./homepage.css";
import config from "@config";
import PetCard from "@components/PetCard";

const Homepage = () => {
  const [pets, setPets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  const fetchPets = async () => {
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
      setPets(result.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();

    const ws = new WebSocket(`${config.wsUrl}/pets`);

    ws.onopen = () => {
      console.log("Connected to pet feed");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "new_pet") {
        setPets((prevPets) => {
          if (
            message.data.owner_username !==
            localStorage.getItem("currentUsername")
          ) {
            return [...prevPets, message.data];
          }
          return prevPets;
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError(
        "Failed to connect to pet feed. Please try refreshing the page.",
      );
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
      if (event.code === 1008) {
        setError("Authentication error. Please log in again.");
      }
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
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
        <div className="page-title-container">
          <h2 className="page-title">Check Out Other Pets!</h2>
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
