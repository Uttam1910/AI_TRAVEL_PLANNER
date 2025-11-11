import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { GetPlaceDetails } from "../GlobalApi";
import { db } from "../firebaseConfig";
import { FaMapMarkerAlt, FaCalendarAlt, FaTag, FaSync, FaHome, FaPlus } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

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

      // Use the imported Firestore instance
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <ClipLoader size={50} color="#4F46E5" className="mb-4" />
          <p className="text-xl text-gray-700 font-medium">Loading your adventures...</p>
          <p className="text-gray-500 mt-2">Please wait while we fetch your trips</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Trips</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
            >
              <FaHome className="mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Adventures</h1>
            <p className="text-gray-600">Discover and manage your travel memories</p>
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <button
              onClick={fetchUserTrips}
              className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
            <button
              onClick={() => navigate("/create-trip")}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <FaPlus className="mr-2" />
              Plan New Trip
            </button>
          </div>
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaMapMarkerAlt className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trips Yet</h3>
            <p className="text-gray-600 mb-6">Start planning your next adventure today!</p>
            <button
              onClick={() => navigate("/create-trip")}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
            >
              <FaPlus className="mr-2" />
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => {
              const details = trip.tripDetails || {};
              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/view_Trip/${trip.id}`)}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity group-hover:bg-opacity-30" />
                    <img
                      src={trip.googleImageUrl || "/view.jpg"}
                      alt={details.location || "Trip"}
                      className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {trip.title || details.location || "Untitled Trip"}
                    </h2>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                        <span>{details.location || "N/A"}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                        <span>{formatDate(details.startDate)} - {formatDate(details.endDate)}</span>
                      </div>
                      
                      {details.tripType && (
                        <div className="flex items-center text-gray-600">
                          <FaTag className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                          <span>{details.tripType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to Home - Only show if there are trips */}
        {trips.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <FaHome className="mr-2" />
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsHistory;
