import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { GetPlaceDetails } from "../GlobalApi"; // Import the Google Places API function

const TripsHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper function to fetch Google image for a given trip location.
  const fetchGoogleImageForTrip = async (location, tripPhotoURL) => {
    if (location) {
      try {
        const response = await GetPlaceDetails({ textQuery: location });
        if (response?.data?.places?.length > 0) {
          const placeDetails = response.data.places[0];
          if (placeDetails.photos?.length > 0) {
            const photoReference = placeDetails.photos[0].name;
            return `https://places.googleapis.com/v1/${photoReference}/media?key=${import.meta.env.VITE_GOOGLE_API_KEY}&maxHeightPx=400`;
          }
        }
      } catch (err) {
        console.error(`Error fetching place details for location: ${location}`, err);
      }
    }
    // Fallback: return stored photo URL or a default image.
    return tripPhotoURL || "/view.jpg";
  };

  // Function to fetch user trips from Firestore.
  const fetchUserTrips = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Retrieve the logged-in user's profile from localStorage.
      const userProfileStr = localStorage.getItem("googleProfile");
      if (!userProfileStr) {
        console.error("No user profile found in localStorage.");
        setError("User not logged in.");
        return;
      }

      // Parse the user profile and extract the unique identifier.
      const userProfile = JSON.parse(userProfileStr);
      const userId = userProfile.sub; // 'sub' is assumed to be the unique ID from Google

      // Get a reference to Firestore.
      const db = getFirestore();
      const tripsRef = collection(db, "trips");

      // Create a query to fetch trips for the current user.
      const tripsQuery = query(tripsRef, where("userDetails.sub", "==", userId));

      // Execute the query.
      const querySnapshot = await getDocs(tripsQuery);

      // Build an array of trips from the query snapshot.
      let tripsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort the trips in descending order (newest first) based on the creation timestamp.
      tripsList = tripsList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        }
        return 0;
      });

      // Enhance each trip with a fresh image using the Google Places API.
      const updatedTripsList = await Promise.all(
        tripsList.map(async (trip) => {
          const details = trip.tripDetails || {};
          const googleImageUrl = await fetchGoogleImageForTrip(details.location, details.tripPhotoURL);
          return { ...trip, googleImageUrl };
        })
      );

      setTrips(updatedTripsList);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("Error fetching trips.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trips when the component mounts.
  useEffect(() => {
    fetchUserTrips();
  }, [fetchUserTrips]);

  // Helper function to format date strings.
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
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

      {/* Refresh Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={fetchUserTrips}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Refresh Trips
        </button>
      </div>

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
                    {formatDate(details.startDate)} - {formatDate(details.endDate)}
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

      {/* Footer Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={fetchUserTrips}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Refresh Trips
        </button>
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
