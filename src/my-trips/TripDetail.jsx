// TripDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTripDetails } from "../service/firebaseConfig"; // Adjust the import path if needed

const TripDetail = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await getTripDetails(tripId);
        setTrip(tripData);
      } catch (err) {
        setError("Error fetching trip details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  if (loading) return <div>Loading trip details...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">{trip.title || "Untitled Trip"}</h1>
      <p className="mt-2">{trip.description || "No description provided."}</p>
      {/* Render additional trip details here */}
    </div>
  );
};

export default TripDetail;
