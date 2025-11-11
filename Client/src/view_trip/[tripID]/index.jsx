
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripDetails } from "../../firebaseConfig";
import { ClipLoader } from "react-spinners";
import { GetPlaceDetails } from "../../GlobalApi";
import { motion } from "framer-motion";
import pLimit from "p-limit";
import FeedbackSection from "../FeedbackSection";
import { auth } from '../../firebaseConfig';
import { format } from 'date-fns'; // Path to your Firebase config
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
  FaUtensils,
  FaBus,
  FaHotel,
  FaAccessibleIcon,
  FaWallet,
  FaCar,
  FaInfoCircle,
  FaBriefcase,
  FaLeaf,
  FaTree,
  FaMusic,
} from "react-icons/fa";

const ViewTrip = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState({
    tripDetails: {},
    hotelOptions: [],
    itinerary: {},
    transportationOptions: [],
    diningSuggestions: [],
    budgetEstimate: {},
    additionalTips: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsFetched, setDetailsFetched] = useState(false);

  

  // Fetch trip details from backend
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const details = await getTripDetails(tripId);
        if (!details) {
          throw new Error("Trip not found");
        }
        // If destination photo is not provided, fetch it using Google Places API
        if (!details.tripDetails.tripPhotoURL && details.tripDetails.location) {
          const response = await GetPlaceDetails({
            textQuery: details.tripDetails.location,
          });
          if (response?.data?.places?.length > 0) {
            const placeDetails = response.data.places[0];
            if (placeDetails.photos?.length > 0) {
              const photoReference = placeDetails.photos[0].name;
              const photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?key=${
                import.meta.env.VITE_GOOGLE_API_KEY
              }&maxHeightPx=400`;
              details.tripDetails.tripPhotoURL = photoUrl;
            }
          }
        }
        details.tripDetails.id = tripId; // Ensure trip ID is set
        setTripDetails(details);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTripDetails();
  }, [tripId]);

  // Fetch photos for hotels and itinerary activities if missing
  useEffect(() => {
    const fetchPlaceDetailsForFields = async () => {
      try {
        if (!import.meta.env.VITE_GOOGLE_API_KEY) {
          console.error("API key is missing");
          return;
        }

        // Create a concurrency limiter with a max of 5 concurrent requests
        const limit = pLimit(5);

        // Update hotel options concurrently without sequential delays
        const updatedHotels = await Promise.all(
          tripDetails.hotelOptions.map((hotel) =>
            limit(async () => {
              try {
                if (!hotel.hotelImageURL) {
                  const response = await GetPlaceDetails({
                    textQuery: hotel.name,
                  });
                  if (response?.data?.places?.length > 0) {
                    const placeDetails = response.data.places[0];
                    let photoUrl = "/default-hotel.jpg";
                    if (placeDetails.photos?.length > 0) {
                      // Use the first available photo
                      const photoReference = placeDetails.photos[0].name;
                      photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?key=${
                        import.meta.env.VITE_GOOGLE_API_KEY
                      }&maxHeightPx=400`;
                    }
                    return {
                      ...hotel,
                      hotelImageURL: photoUrl,
                      googlePlaceDetails: placeDetails,
                    };
                  }
                }
                return hotel;
              } catch (err) {
                console.error(
                  `Error fetching photo for hotel ${hotel.name}:`,
                  err
                );
                return hotel;
              }
            })
          )
        );

        // Update itinerary activities concurrently without sequential delays
        const updatedItinerary = { ...tripDetails.itinerary };
        for (const day in updatedItinerary) {
          updatedItinerary[day].plan = await Promise.all(
            (updatedItinerary[day].plan || []).map((activity) =>
              limit(async () => {
                try {
                  if (!activity.imageUrl) {
                    const response = await GetPlaceDetails({
                      textQuery: activity.activityName,
                    });
                    if (response?.data?.places?.length > 0) {
                      const placeDetails = response.data.places[0];
                      let photoUrl = "/default-activity.jpg";
                      if (placeDetails.photos?.length > 0) {
                        const photoReference = placeDetails.photos[0].name;
                        photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?key=${
                          import.meta.env.VITE_GOOGLE_API_KEY
                        }&maxHeightPx=400`;
                      }
                      return {
                        ...activity,
                        imageUrl: photoUrl,
                        googlePlaceDetails: placeDetails,
                      };
                    }
                  }
                  return activity;
                } catch (err) {
                  console.error(
                    `Error fetching photo for activity ${activity.activityName}:`,
                    err
                  );
                  return activity;
                }
              })
            )
          );
        }
        setTripDetails((prev) => ({
          ...prev,
          hotelOptions: updatedHotels,
          itinerary: updatedItinerary,
        }));
        setDetailsFetched(true);
      } catch (err) {
        console.error(
          "Error in fetching place details for hotels/itinerary:",
          err
        );
      }
    };

    if (
      !detailsFetched &&
      (tripDetails.hotelOptions.length > 0 ||
        Object.keys(tripDetails.itinerary).length > 0)
    ) {
      fetchPlaceDetailsForFields();
    }
  }, [tripDetails.hotelOptions, tripDetails.itinerary, detailsFetched]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center"
        >
          <ClipLoader size={60} color="#4F46E5" />
          <p className="text-gray-700 font-medium mt-4 text-lg">Loading your adventure...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your travel details</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Trip</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Sort itinerary days (e.g. day1, day2, etc.)
  const sortedItineraryDays = Object.entries(tripDetails.itinerary).sort(
    ([dayA], [dayB]) => {
      const numA = parseInt(dayA.replace(/\D/g, ""), 10);
      const numB = parseInt(dayB.replace(/\D/g, ""), 10);
      return numA - numB;
    }
  );

  // Helper function to generate a map link for hotels
  const getHotelMapLink = (hotel) => {
    const query = encodeURIComponent(`${hotel.name}, ${hotel.address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Helper function to generate a map link for itinerary activities
  const getActivityMapLink = (activity) => {
    const query = encodeURIComponent(
      `${activity.activityName}, ${tripDetails.tripDetails.location}`
    );
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Mapping for trip type icons based on the updated options
  const tripTypeIcons = {
    Adventure: <FaMountain className="text-blue-500 mr-2 text-2xl" />,
    Beach: <FaUmbrellaBeach className="text-blue-500 mr-2 text-2xl" />,
    Cultural: <FaLandmark className="text-blue-500 mr-2 text-2xl" />,
    Business: <FaBriefcase className="text-blue-500 mr-2 text-2xl" />,
    Wellness: <FaLeaf className="text-blue-500 mr-2 text-2xl" />,
    "Road Trip": <FaBus className="text-blue-500 mr-2 text-2xl" />,
    "Eco-Tourism": <FaTree className="text-blue-500 mr-2 text-2xl" />,
    Culinary: <FaUtensils className="text-blue-500 mr-2 text-2xl" />,
    "Festival & Events": <FaMusic className="text-blue-500 mr-2 text-2xl" />,
    "Nature Retreat": <FaTree className="text-blue-500 mr-2 text-2xl" />,
  };

  // Parse tripType string (from the backend) into an array
  const tripTypes = tripDetails.tripDetails.tripType
    ? tripDetails.tripDetails.tripType.split(",").map((t) => t.trim())
    : [];

  const renderTransportationOptions = () => (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center">
        <FaCar className="mr-2" /> Transportation Options
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tripDetails.transportationOptions?.map((option, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <FaBus className="text-blue-500 mr-2 text-xl" />
              <h4 className="text-xl font-semibold">{option.mode}</h4>
            </div>
            <p className="text-gray-600 mb-2">{option.cost}</p>
            <p className="text-gray-600 mb-2">{option.duration}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDiningSuggestions = () => (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center">
        <FaUtensils className="mr-2" /> Dining Suggestions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tripDetails.diningSuggestions?.map((restaurant, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold mb-2">{restaurant.name}</h4>
            <p className="text-gray-600 mb-2">{restaurant.description}</p>
            <div className="flex items-center text-gray-600">
              <FaDollarSign className="mr-1" />
              <span className="mr-4">{restaurant.estimatedCost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBudgetEstimate = () => (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center">
        <FaWallet className="mr-2" /> Budget Estimate
      </h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span>Accommodation:</span>
            <span>{tripDetails.budgetEstimate?.accommodation}</span>
          </div>
          <div className="flex justify-between">
            <span>Transportation:</span>
            <span>{tripDetails.budgetEstimate?.transportation}</span>
          </div>
          <div className="flex justify-between">
            <span>Food:</span>
            <span>{tripDetails.budgetEstimate?.food}</span>
          </div>
          <div className="flex justify-between">
            <span>Activities:</span>
            <span>{tripDetails.budgetEstimate?.activities}</span>
          </div>
          <div className="flex justify-between border-t-2 pt-2 font-semibold">
            <span>Total Estimate:</span>
            <span>{tripDetails.budgetEstimate?.total}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdditionalTips = () => (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center">
        <FaInfoCircle className="mr-2" /> Travel Tips & Recommendations
      </h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ul className="list-disc pl-6 space-y-3">
          {tripDetails.additionalTips?.map((tip, index) => (
            <li key={index} className="text-gray-700">
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section with Animation */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[70vh] overflow-hidden rounded-b-[2.5rem] shadow-2xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2 }}
            src={tripDetails.tripDetails.tripPhotoURL || "/default-destination.jpg"}
            alt="Destination"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-destination.jpg";
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 flex flex-col justify-center items-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center px-4"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {tripDetails.tripDetails.location || "Destination"}
            </h1>
            <p className="text-xl text-white/90 mt-2 font-medium">
              {tripDetails.tripDetails.startDate
                ? format(new Date(tripDetails.tripDetails.startDate), "MMMM dd, yyyy")
                : ""}
            </p>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-12 px-6 flex-grow relative">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {/* Trip Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Summary cards */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaMapMarkerAlt className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Destination</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.location || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaCalendarAlt className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Travel Date</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.startDate || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <div className="flex">
                {tripTypes.map((type, index) => (
                  <React.Fragment key={index}>
                    {tripTypeIcons[type] || null}
                  </React.Fragment>
                ))}
              </div>
              <div>
                <h4 className="text-xl font-semibold">Trip Type</h4>
                <p className="text-gray-700">
                  {tripTypes.length > 0 ? tripTypes.join(", ") : "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaCalendarAlt className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Duration</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.duration || "N/A"} days
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaDollarSign className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Budget</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.budget || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaUserFriends className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Companion</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.travelCompanion || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaMountain className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Interests</h4>
                <p className="text-gray-700">
                  {Array.isArray(tripDetails.tripDetails.interests)
                    ? tripDetails.tripDetails.interests.join(", ")
                    : tripDetails.tripDetails.interests || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaUmbrellaBeach className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Activities</h4>
                <p className="text-gray-700">
                  {Array.isArray(tripDetails.tripDetails.activities)
                    ? tripDetails.tripDetails.activities.join(", ")
                    : tripDetails.tripDetails.activities || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaUtensils className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Dietary</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.dietaryPreferences || "None"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaBus className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Transport</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.transportation || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaHotel className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Accommodation</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.accommodationType || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <FaAccessibleIcon className="text-blue-500 mr-4 text-2xl" />
              <div>
                <h4 className="text-xl font-semibold">Special Needs</h4>
                <p className="text-gray-700">
                  {tripDetails.tripDetails.specialRequirements || "None"}
                </p>
              </div>
            </div>
          </div>

          {/* Hotel Options Section */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Places to Stay
              </h3>
              <div className="h-1 flex-grow ml-6 bg-gradient-to-r from-blue-600/20 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tripDetails.hotelOptions &&
              tripDetails.hotelOptions.length > 0 ? (
                tripDetails.hotelOptions.map((hotel, index) => {
                  const hotelMapLink = getHotelMapLink(hotel);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={hotel.hotelImageURL || "/default-hotel.jpg"}
                          alt={hotel.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-hotel.jpg";
                          }}
                          className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-lg">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span className="font-semibold">{hotel.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {hotel.name}
                        </h4>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-gray-600 flex items-center">
                            <FaMapMarkerAlt className="text-blue-500 mr-2 flex-shrink-0" />
                            <span className="line-clamp-1">{hotel.address}</span>
                          </p>
                          <p className="text-gray-600 flex items-center">
                            <FaDollarSign className="text-blue-500 mr-2 flex-shrink-0" />
                            <span>{hotel.priceEstimate}</span>
                          </p>
                        </div>

                        <a
                          href={hotelMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group"
                        >
                          <FaMap className="mr-2 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">View on Map</span>
                        </a>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full"
                >
                  <div className="text-center bg-white rounded-2xl p-8 shadow-md">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaHotel className="text-blue-500 text-2xl" />
                    </div>
                    <p className="text-gray-600 text-lg">
                      No hotel options available at the moment.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Itinerary Section */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Journey
              </h3>
              <div className="h-1 flex-grow ml-6 bg-gradient-to-r from-indigo-600/20 to-transparent rounded-full" />
            </div>
            
            {sortedItineraryDays.length > 0 ? (
              sortedItineraryDays.map(([day, dayPlan], dayIndex) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * dayIndex }}
                  className="mb-12"
                >
                  <div className="flex items-center mb-6">
                    <div className="bg-indigo-600 text-white text-lg font-bold rounded-full w-12 h-12 flex items-center justify-center">
                      {day.replace(/[^0-9]/g, '')}
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800 ml-4">
                      {dayPlan.title}
                    </h4>
                  </div>

                  <div className="space-y-6">
                    {(dayPlan.plan || []).map((activity, index) => {
                      const activityMapLink = getActivityMapLink(activity);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                              <img
                                src={activity.imageUrl || "/default-activity.jpg"}
                                alt={activity.activityName}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/default-activity.jpg";
                                }}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent md:hidden" />
                            </div>

                            <div className="p-6 md:col-span-2">
                              <h5 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                {activity.activityName}
                              </h5>
                              <p className="text-gray-600 mb-4 line-clamp-3">
                                {activity.description}
                              </p>

                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Time</p>
                                  <p className="font-medium text-gray-900">
                                    {activity.recommendedTimeAllocation}
                                  </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Cost</p>
                                  <p className="font-medium text-gray-900">
                                    {activity.cost}
                                  </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                                  <p className="font-medium text-gray-900">
                                    {activity.duration}
                                  </p>
                                </div>
                              </div>

                              <a
                                href={activityMapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors group"
                              >
                                <FaMap className="mr-2 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">View on Map</span>
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center bg-white rounded-2xl p-8 shadow-md"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMapMarkerAlt className="text-indigo-500 text-2xl" />
                </div>
                <p className="text-gray-600 text-lg">
                  No itinerary available yet.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Additional Sections */}
          {tripDetails.transportationOptions?.length > 0 &&
            renderTransportationOptions()}
          {tripDetails.diningSuggestions?.length > 0 &&
            renderDiningSuggestions()}
          {tripDetails.budgetEstimate &&
            Object.keys(tripDetails.budgetEstimate).length > 0 &&
            renderBudgetEstimate()}
          {tripDetails.additionalTips?.length > 0 && renderAdditionalTips()}

{/* Feedback Section */}
<div className="mt-12">
  <h3 className="text-3xl font-bold text-blue-700 mb-6">
    Traveler Feedback
  </h3>
  <FeedbackSection 
    trip={tripDetails.tripDetails} 
    currentUser={auth.currentUser} // Add this prop
  />
</div>

          {/* Navigation Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex gap-4">
              <button
                onClick={() => navigate("/my-trips")}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all flex items-center shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to Trips
              </button>
              <button
                onClick={() => navigate("/create-trip")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all flex items-center shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Plan Another Trip
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <footer className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 mt-16 shadow-lg relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h4 className="text-2xl font-bold mb-4 text-yellow-300">
                About Us
              </h4>
              <p className="text-gray-200">
                We are a travel company dedicated to providing the best travel
                experiences. Explore the world with us and create unforgettable
                memories.
              </p>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-4 text-yellow-300">
                Quick Links
              </h4>
              <ul className="text-gray-200 space-y-2">
                <li>
                  <a
                    href="/"
                    className="hover:text-yellow-300 transition duration-300"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="hover:text-yellow-300 transition duration-300"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-yellow-300 transition duration-300"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-yellow-300 transition duration-300"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-4 text-yellow-300">
                Stay Updated
              </h4>
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
            <div>
              <h4 className="text-2xl font-bold mb-4 text-yellow-300">
                Connect With Us
              </h4>
              <div className="flex space-x-4 mb-4">
                <a
                  href="https://facebook.com"
                  className="bg-gray-300 p-3 rounded-full hover:bg-yellow-300 transition"
                >
                  <FaFacebook className="text-xl text-black hover:text-white" />
                </a>
                <a
                  href="https://twitter.com"
                  className="bg-gray-300 p-3 rounded-full hover:bg-yellow-300 transition"
                >
                  <FaTwitter className="text-xl text-black hover:text-white" />
                </a>
                <a
                  href="https://instagram.com"
                  className="bg-gray-300 p-3 rounded-full hover:bg-yellow-300 transition"
                >
                  <FaInstagram className="text-xl text-black hover:text-white" />
                </a>
                <a
                  href="https://linkedin.com"
                  className="bg-gray-300 p-3 rounded-full hover:bg-yellow-300 transition"
                >
                  <FaLinkedin className="text-xl text-black hover:text-white" />
                </a>
              </div>
              <p className="flex items-center gap-2 text-gray-200">
                <FaEnvelope className="text-yellow-300" />{" "}
                support@travelcompany.com
              </p>
              <p className="flex items-center gap-2 text-gray-200 mt-2">
                <FaPhone className="text-yellow-300" /> +1 234 567 890
              </p>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-10 pt-6 text-center text-gray-200">
            <p>
              &copy; {new Date().getFullYear()} Travel Company. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ViewTrip;