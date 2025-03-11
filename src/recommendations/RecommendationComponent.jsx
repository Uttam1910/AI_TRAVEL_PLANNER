import React, { useEffect, useState } from "react";
import axios from "axios";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const DynamicRecommendations = () => {
  const [recommendationsByType, setRecommendationsByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user trips from Firestore (unchanged)
  const fetchUserTrips = async () => {
    const userProfileStr = localStorage.getItem("googleProfile");
    if (!userProfileStr) {
      throw new Error("User not logged in.");
    }
    const userProfile = JSON.parse(userProfileStr);
    const userId = userProfile.sub;
    const db = getFirestore();
    const tripsRef = collection(db, "trips");
    const tripsQuery = query(tripsRef, where("userDetails.sub", "==", userId));
    const querySnapshot = await getDocs(tripsQuery);
    const trips = querySnapshot.docs.map((doc) => doc.data());
    return trips;
  };

  // Compute distinct (normalized) trip types from trips (unchanged)
  const computeDistinctTripTypes = (trips) => {
    const tripTypesSet = new Set();
    trips.forEach((trip) => {
      const tripTypeRaw = trip.tripDetails?.tripType;
      if (tripTypeRaw) {
        const normalized = tripTypeRaw.trim().toLowerCase();
        tripTypesSet.add(normalized);
      }
    });
    return Array.from(tripTypesSet);
  };

  // Call AI endpoint for a given trip type (unchanged)
  const fetchRecommendationsForType = async (tripType) => {
    const prompt = `List 10 diverse and exciting travel destinations known for their ${tripType} experiences. For each destination, provide a brief description.`;
    try {
      const response = await axios.post("http://localhost:5000/api/ai-recommendations", { prompt });
      if (response.data && response.data.recommendations) {
        return response.data.recommendations;
      }
      return [];
    } catch (err) {
      console.error(`Error fetching recommendations for ${tripType}:`, err);
      return [];
    }
  };

  // Main effect: load trips (unchanged)
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const trips = await fetchUserTrips();
        const distinctTypes = computeDistinctTripTypes(trips);
        console.log("Distinct trip types:", distinctTypes);

        const recommendationsObj = {};
        await Promise.all(
          distinctTypes.map(async (type) => {
            const recs = await fetchRecommendationsForType(type);
            recommendationsObj[type] = recs;
          })
        );
        setRecommendationsByType(recommendationsObj);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="text-lg font-medium text-gray-700">Curating your perfect recommendations...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md p-6 rounded-xl bg-white shadow-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  const sortedCategories = Object.entries(recommendationsByType).sort(
    ([, recsA], [, recsB]) => recsB.length - recsA.length
  );

  if (sortedCategories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-6">🌍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Let's Start Your Journey!</h2>
          <p className="text-gray-600">No trip history found. Start planning your first adventure to get personalized recommendations!</p>
        </div>
      </div>
    );
  }

  // Emoji mapping for trip types
  const typeEmojis = {
    adventure: "🏔️",
    beach: "🏖️",
    cultural: "🏛️",
    romantic: "💖",
    family: "👨👩👧👦",
    business: "💼",
    // Add more mappings as needed
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
<div className="max-w-7xl mx-auto">
         {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Personalized Travel Guide
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover destinations tailored to your travel personality and history
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCategories.map(([type, recs]) => (
            <div
              key={type}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 opacity-20"></div>
              <div className="relative px-6 py-8">
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3">
                    {typeEmojis[type] || "✈️"}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 capitalize">
                    {type} Destinations
                  </h3>
                </div>
                
                {recs.length > 0 ? (
                  <ul className="space-y-5">
                    {recs.map((item, index) => (
                      <li
                        key={index}
                        className="p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors group/item relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover/item:opacity-100 transition-opacity rounded-lg"></div>
                        <div className="relative">
                          {typeof item === "object" ? (
                            <>
                              <div className="flex items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                    {item.destination}
                                  </h4>
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-700">{item}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 italic">More recommendations coming soon!</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicRecommendations;