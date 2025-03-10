import React, { useEffect, useState } from "react";
import axios from "axios";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const DynamicRecommendations = () => {
  const [recommendationsByType, setRecommendationsByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user trips from Firestore
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

  // Compute distinct (normalized) trip types from trips
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

  // Call AI endpoint for a given trip type
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

  // Main effect: load trips, compute distinct types, then get AI recommendations for each type
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
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading recommendations...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Error: {error}
      </div>
    );

  const sortedCategories = Object.entries(recommendationsByType).sort(
    ([, recsA], [, recsB]) => recsB.length - recsA.length
  );

  if (sortedCategories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        No trip history found to generate recommendations.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-10">
          Personalized Travel Recommendations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCategories.map(([type, recs]) => (
            <div
              key={type}
              className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                <h3 className="text-2xl font-semibold text-gray-800 capitalize">
                  {type} Experiences
                </h3>
              </div>
              <div className="p-6">
                {recs.length > 0 ? (
                  <ul className="space-y-4">
                    {recs.map((item, index) => (
                      <li
                        key={index}
                        className="p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        {typeof item === "object" ? (
                          <>
                            <div className="font-bold text-lg text-blue-600">
                              {item.destination}
                            </div>
                            <div className="text-gray-600">{item.description}</div>
                          </>
                        ) : (
                          <span className="text-gray-700">{item}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No recommendations available for this category.</p>
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
