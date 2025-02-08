import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { GetPlaceDetails } from "../service/GlobalApi"; // Import the Google Places API function

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
        let tripsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched trips before sorting:", tripsList);

        // Sort the trips in ascending order based on the creation timestamp.
        tripsList = tripsList.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            // If createdAt is a Firestore Timestamp, convert it to a Date.
            const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateA - dateB; // ascending order (oldest first)
          }
          return 0;
        });
        console.log("Sorted trips:", tripsList);

        // For each trip, use the Google Places API to fetch a fresh image using the destination.
        const updatedTripsList = await Promise.all(
          tripsList.map(async (trip) => {
            const details = trip.tripDetails || {};
            if (details.location) {
              try {
                const response = await GetPlaceDetails({ textQuery: details.location });
                if (response?.data?.places?.length > 0) {
                  const placeDetails = response.data.places[0];
                  if (placeDetails.photos?.length > 0) {
                    const photoReference = placeDetails.photos[0].name;
                    const photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?key=${import.meta.env.VITE_GOOGLE_API_KEY}&maxHeightPx=400`;
                    return { ...trip, googleImageUrl: photoUrl };
                  }
                }
              } catch (err) {
                console.error(`Error fetching place details for location: ${details.location}`, err);
              }
            }
            // Fallback: use the trip's stored photo URL or a default image.
            return { ...trip, googleImageUrl: details.tripPhotoURL || "/view.jpg" };
          })
        );

        console.log("Updated trips with Google Image:", updatedTripsList);
        setTrips(updatedTripsList);
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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          {/* Spinner */}
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4"></div>
          <p className="text-xl text-gray-700">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-xl mb-4">Error: {error}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8 text-center">Your Trip History</h1>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <p className="text-center text-gray-600">You have not created any trips yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const details = trip.tripDetails || {};
            return (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/view_Trip/${trip.id}`)}
              >
                {/* Trip Photo */}
                <img
                  src={trip.googleImageUrl || "/view.jpg"}
                  alt={details.location || "Trip"}
                  className="w-full h-48 object-cover rounded-t-lg"
                />

                <div className="p-4">
                  {/* Trip Title */}
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

      {/* Back Button (only one at the bottom) */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default TripsHistory;
