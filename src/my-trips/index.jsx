import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const TripsHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        // Retrieve the logged-in user's profile from localStorage.
        const userProfileStr = localStorage.getItem("googleProfile");
        if (!userProfileStr) {
          console.log("No user profile found in localStorage.");
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        // Parse the user profile and extract the unique identifier.
        const userProfile = JSON.parse(userProfileStr);
        console.log("User profile retrieved:", userProfile);
        const userId = userProfile.sub; // 'sub' is assumed to be the unique ID from Google
        console.log("User ID:", userId);

        // Get a reference to Firestore.
        const db = getFirestore();
        const tripsRef = collection(db, "trips");

        // Create a query to fetch trips where "userDetails.sub" equals the current user's ID.
        const q = query(tripsRef, where("userDetails.sub", "==", userId));
        console.log("Query created:", q);

        // Execute the query.
        const querySnapshot = await getDocs(q);
        console.log("QuerySnapshot size:", querySnapshot.size);

        // Map over the results and build an array of trips.
        const tripsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched trips:", tripsList);

        setTrips(tripsList);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError("Error fetching trips.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrips();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading trips...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Trip History</h1>
      {trips.length === 0 ? (
        <p className="text-center text-gray-600">You have not created any trips yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            // Assume your trip document has a "tripDetails" object with properties:
            // tripPhotoURL, location, startDate, tripType, etc.
            const details = trip.tripDetails || {};
            return (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                {/* Trip Photo */}
                <img
                  src={details.tripPhotoURL || "/view.jpg"}
                  alt={details.location || "Trip"}
                  className="w-full h-48 object-cover rounded-t-lg"
                />

                <div className="p-4">
                  {/* Trip Title (or Location as fallback) */}
                  <h2 className="text-xl font-semibold mb-2">
                    {trip.title || details.location || "Untitled Trip"}
                  </h2>
                  
                  {/* Destination */}
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Destination:</span>{" "}
                    {details.location || "N/A"}
                  </p>
                  
                  {/* Travel Dates */}
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Travel Dates:</span>{" "}
                    {details.startDate || "N/A"}
                  </p>
                  
                  {/* Trip Type */}
                  {details.tripType && (
                    <p className="text-gray-600">
                      <span className="font-semibold">Trip Type:</span>{" "}
                      {details.tripType}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TripsHistory;
