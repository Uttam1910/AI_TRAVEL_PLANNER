import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripDetails } from "../../service/firebaseConfig";
import { ClipLoader } from "react-spinners";
import { GetPlaceDetails } from "../../service/Globalapi"; // Import the Google Places API function
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaDollarSign,
  FaMountain,
  FaUmbrellaBeach,
  FaLandmark,
  FaHeart,
  FaStar,
  FaMap,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const ViewTrip = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState({
    tripDetails: {},
    hotelOptions: [],
    itinerary: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trip details
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const details = await getTripDetails(tripId);
        if (!details) {
          throw new Error("Trip not found");
        }
        setTripDetails(details);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  const [isDataFetched, setIsDataFetched] = useState(false);

  



  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        console.log("Checking API Key:", import.meta.env.VITE_GOOGLE_API_KEY); // Debug API Key
  
        if (!import.meta.env.VITE_GOOGLE_API_KEY) {
          console.error("❌ API key is missing! Check your .env file.");
          return;
        }
  
        const updatedHotels = await Promise.all(
          tripDetails.hotelOptions.map(async (hotel, index) => {
            await new Promise((resolve) => setTimeout(resolve, index * 1000)); // Delay requests
  
            try {
              console.log(`Fetching details for hotel: ${hotel.hotelName}`); // Debug hotel name
              const response = await GetPlaceDetails({ textQuery: hotel.hotelName });
  
              if (!response || !response.data || !response.data.places || response.data.places.length === 0) {
                console.warn(`⚠️ No place details found for: ${hotel.hotelName}`);
                return hotel; // Return original data if API response is empty
              }
  
              const placeDetails = response.data.places[0];
              let photoUrl = "/view.jpg";
  
              if (placeDetails.photos && placeDetails.photos.length > 0) {
                const photoReference = placeDetails.photos[0].name;
                photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?key=${import.meta.env.VITE_GOOGLE_API_KEY}&maxHeightPx=400`;
              }
  
              return {
                ...hotel,
                googlePlaceDetails: placeDetails,
                hotelImageURL: photoUrl,
              };
            } catch (err) {
              console.error(`❌ Error fetching details for ${hotel.hotelName}:`, err);
              return hotel;
            }
          })
        );
  
        const updatedItinerary = { ...tripDetails.itinerary };
        for (const day in updatedItinerary) {
          updatedItinerary[day].plan = await Promise.all(
            updatedItinerary[day].plan.map(async (activity, index) => {
              await new Promise((resolve) => setTimeout(resolve, index * 1000)); // Delay requests
  
              try {
                console.log(`Fetching details for activity: ${activity.placeName}`); // Debug activity name
                const response = await GetPlaceDetails({ textQuery: activity.placeName });
  
                if (!response || !response.data || !response.data.places || response.data.places.length === 0) {
                  console.warn(`⚠️ No place details found for: ${activity.placeName}`);
                  return activity;
                }
  
                const placeDetails = response.data.places[0];
                let photoUrl = "https://via.placeholder.com/300";
  
                if (placeDetails.photos && placeDetails.photos.length > 0) {
                  const photoReference = placeDetails.photos[0].name;
                  photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?key=${import.meta.env.VITE_GOOGLE_API_KEY}&maxHeightPx=400`;
                }
  
                return {
                  ...activity,
                  googlePlaceDetails: placeDetails,
                  imageUrl: photoUrl,
                };
              } catch (err) {
                console.error(`❌ Error fetching details for ${activity.placeName}:`, err);
                return activity;
              }
            })
          );
        }
  
        setTripDetails((prev) => ({
          ...prev,
          hotelOptions: updatedHotels,
          itinerary: updatedItinerary,
        }));
      } catch (err) {
        console.error("❌ Error in fetchPlaceDetails function:", err);
      }
    };
  
    if (tripDetails.hotelOptions.length > 0 || Object.keys(tripDetails.itinerary).length > 0) {
      fetchPlaceDetails();
    }
  }, [tripDetails.hotelOptions, tripDetails.itinerary]);
  
  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color="#1d4ed8" />
        <p className="text-gray-500 ml-3">Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-white py-16 px-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Trip Photo */}
          <div className="mb-8">
            <img
              src={tripDetails.tripDetails.tripPhotoURL || "/view.jpg"}
              alt="Trip"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Destination */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
              <FaMapMarkerAlt className="text-blue-500 mr-2 text-xl" />
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Destination:</span>{" "}
                {tripDetails.tripDetails.location || "N/A"}
              </p>
            </div>

            {/* Travel Dates */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
              <FaCalendarAlt className="text-blue-500 mr-2 text-xl" />
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Travel Dates:</span>{" "}
                {tripDetails.tripDetails.startDate || "N/A"}
              </p>
            </div>

            {/* Trip Category */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
              {tripDetails.tripDetails.tripType === "Adventure" && (
                <FaMountain className="text-blue-500 mr-2 text-xl" />
              )}
              {tripDetails.tripDetails.tripType === "Beach" && (
                <FaUmbrellaBeach className="text-blue-500 mr-2 text-xl" />
              )}
              {tripDetails.tripDetails.tripType === "Cultural" && (
                <FaLandmark className="text-blue-500 mr-2 text-xl" />
              )}
              {tripDetails.tripDetails.tripType === "Romantic" && (
                <FaHeart className="text-blue-500 mr-2 text-xl" />
              )}
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Trip Type:</span>{" "}
                {tripDetails.tripDetails.tripType || "N/A"}
              </p>
            </div>

            {/* Trip Duration */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
              <FaCalendarAlt className="text-blue-500 mr-2 text-xl" />
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Trip Duration:</span>{" "}
                {tripDetails.tripDetails.duration || "N/A"}
              </p>
            </div>

            {/* Budget */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
              <FaDollarSign className="text-blue-500 mr-2 text-xl" />
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Budget:</span>{" "}
                {tripDetails.tripDetails.budget || "N/A"}
              </p>
            </div>

            {/* Travel Companion */}
            <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
              <FaUserFriends className="text-blue-500 mr-2 text-xl" />
              <p className="text-xl text-gray-700">
                <span className="font-semibold">Travel Companion:</span>{" "}
                {tripDetails.tripDetails.travelers || "N/A"}
              </p>
            </div>
          </div>

          {/* Hotel Options */}
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-blue-700 mb-6">Hotel Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripDetails.hotelOptions && tripDetails.hotelOptions.length > 0 ? (
                tripDetails.hotelOptions.map((hotel, index) => {
                  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    hotel.hotelAddress
                  )}`;

                  return (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                    >
                      {/* Hotel Image */}
                      <img
                        src={hotel.hotelImageURL}
                        alt={hotel.hotelName}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />

                      {/* Hotel Name */}
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {hotel.hotelName}
                      </h4>

                      {/* Hotel Address */}
                      <div className="flex items-center text-gray-600 mb-2">
                        <FaMapMarkerAlt className="text-blue-500 mr-2" />
                        <p>{hotel.hotelAddress}</p>
                      </div>

                      {/* Hotel Price */}
                      <div className="flex items-center text-gray-600 mb-2">
                        <FaDollarSign className="text-blue-500 mr-2" />
                        <p>{hotel.price}</p>
                      </div>

                      {/* Hotel Rating */}
                      <div className="flex items-center text-gray-600 mb-4">
                        <FaStar className="text-blue-500 mr-2" />
                        <p>Rating: {hotel.rating}</p>
                      </div>

                      {/* Map Link */}
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <FaMap className="mr-2" />
                        View on Map
                      </a>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600">No hotel options available.</p>
              )}
            </div>
          </div>

          {/* Itinerary */}
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">Itinerary</h3>
            {tripDetails.itinerary && Object.keys(tripDetails.itinerary).length > 0 ? (
              Object.entries(tripDetails.itinerary)
                .sort(([dayA], [dayB]) => {
                  const dayNumberA = parseInt(dayA.replace("Day ", ""), 10);
                  const dayNumberB = parseInt(dayB.replace("Day ", ""), 10);
                  return dayNumberA - dayNumberB;
                })
                .map(([day, plan]) => (
                  <div key={day} className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                      {day}: {plan.theme}
                    </h4>
                    <div className="space-y-4">
                      {plan.plan.map((activity, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row"
                        >
                          {/* Image Section */}
                          <div className="md:w-1/3">
                            <img
                              src={activity.imageUrl}
                              alt={activity.placeName}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                          {/* Details Section */}
                          <div className="md:w-2/3 md:pl-6 mt-4 md:mt-0">
                            <h5 className="text-lg font-semibold">{activity.placeName}</h5>
                            <p className="text-gray-600">{activity.placeDetails}</p>
                            <p className="text-gray-600">
                              Ticket Price: {activity.ticketPricing}
                            </p>
                            <p className="text-gray-600">Rating: {activity.rating}</p>
                            <p className="text-gray-600">
                              Time: {activity.time || "Not specified"}
                            </p>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                activity.placeName
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline mt-2 inline-block"
                            >
                              View on Map
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-600">No itinerary available.</p>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 mt-16 shadow-lg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* About Section */}
            <div>
              <h4 className="text-2xl font-bold mb-4 text-yellow-300">About Us</h4>
              <p className="text-gray-200">
                We are a travel company dedicated to providing the best travel experiences.
                Explore the world with us and create unforgettable memories.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-2xl font-bold mb-4 text-yellow-300">Quick Links</h4>
              <ul className="text-gray-200 space-y-2">
                <li>
                  <a href="/" className="hover:text-yellow-300 transition duration-300">Home</a>
                </li>
                <li>
                  <a href="/about" className="hover:text-yellow-300 transition duration-300">About</a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-yellow-300 transition duration-300">Contact</a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-yellow-300 transition duration-300">Privacy Policy</a>
                </li>
              </ul>
            </div>

            {/* Newsletter Subscription */}
            <div>
              <h4 className="text-2xl font-bold mb-4 text-yellow-300">Stay Updated</h4>
              <p className="text-gray-200 mb-4">
                Get travel tips, destination ideas, and exclusive offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="p-2 w-full rounded-l-lg bg-gray-200 text-gray-800 border border-gray-400 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300"
                />
                <button className="bg-black text-white px-4 py-2 rounded-r-lg hover:bg-gray-800 transition">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Media & Contact Info */}
            <div>
              <h4 className="text-2xl font-bold mb-4 text-yellow-300">Connect With Us</h4>
              <div className="flex space-x-4 mb-4">
                <a href="https://facebook.com" className="bg-gray-300 p-3 rounded-full hover:bg-yellow-300 transition">
                  <FaFacebook className="text-xl text-black hover:text-white" />
                </a>
                <a href="https://twitter.com" className="bg-gray-300 p-3 rounded-full hover:bg-yellow-300 transition">
                  <FaTwitter className="text-xl text-black hover:text-white" />
                </a>
                <a href="https://instagram.com" className="bg-gray-300 p-3 rounded-full hover:bg-yellow-300 transition">
                  <FaInstagram className="text-xl text-black hover:text-white" />
                </a>
                <a href="https://linkedin.com" className="bg-gray-300 p-3 rounded-full hover:bg-yellow-300 transition">
                  <FaLinkedin className="text-xl text-black hover:text-white" />
                </a>
              </div>
              <p className="flex items-center gap-2 text-gray-200">
                <FaEnvelope className="text-yellow-300" /> support@travelcompany.com
              </p>
              <p className="flex items-center gap-2 text-gray-200 mt-2">
                <FaPhone className="text-yellow-300" /> +1 234 567 890
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-300 mt-10 pt-6 text-center text-gray-200">
            <p>&copy; {new Date().getFullYear()} Travel Company. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ViewTrip;