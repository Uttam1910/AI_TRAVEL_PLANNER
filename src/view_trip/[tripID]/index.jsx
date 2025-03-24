
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripDetails } from "../../service/firebaseConfig";
import { ClipLoader } from "react-spinners";
import { GetPlaceDetails } from "../../service/Globalapi";
import pLimit from "p-limit"; // Import p-limit for concurrency control
import FeedbackSection from "../FeedbackSection";
import { auth } from '../../service/firebaseConfig'; // Path to your Firebase config
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <img
          src={
            tripDetails.tripDetails.tripPhotoURL || "/default-destination.jpg"
          }
          alt="Destination"
          loading="lazy" // Enable lazy loading for better performance
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-destination.jpg";
          }}
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold text-white">
            {tripDetails.tripDetails.location || "Destination"}
          </h1>
          <p className="text-lg text-white mt-2">
            {tripDetails.tripDetails.startDate
              ? `Travel Date: ${tripDetails.tripDetails.startDate}`
              : ""}
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-12 px-6 flex-grow">
        <div className="max-w-6xl mx-auto">
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
          <div className="mt-12">
            <h3 className="text-3xl font-bold text-blue-700 mb-6">
              Hotel Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tripDetails.hotelOptions &&
              tripDetails.hotelOptions.length > 0 ? (
                tripDetails.hotelOptions.map((hotel, index) => {
                  const hotelMapLink = getHotelMapLink(hotel);
                  return (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
                    >
                      <img
                        src={hotel.hotelImageURL || "/default-hotel.jpg"}
                        alt={hotel.name}
                        loading="lazy" // Lazy load image
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-hotel.jpg";
                        }}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h4 className="text-2xl font-semibold text-gray-800 mb-2">
                        {hotel.name}
                      </h4>
                      <p className="text-gray-600 mb-2 flex items-center">
                        <FaMapMarkerAlt className="mr-2" /> {hotel.address}
                      </p>
                      <p className="text-gray-600 mb-2 flex items-center">
                        <FaDollarSign className="mr-2" /> {hotel.priceEstimate}
                      </p>
                      <p className="text-gray-600 mb-4 flex items-center">
                        <FaStar className="mr-2 text-yellow-500" /> Rating:{" "}
                        {hotel.rating}
                      </p>
                      <a
                        href={hotelMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        <FaMap className="mr-2" /> View on Map
                      </a>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600 text-lg">
                  No hotel options available.
                </p>
              )}
            </div>
          </div>

          {/* Itinerary Section */}
          <div className="mt-12">
            <h3 className="text-3xl font-bold text-blue-700 mb-6">Itinerary</h3>
            {sortedItineraryDays.length > 0 ? (
              sortedItineraryDays.map(([day, dayPlan]) => (
                <div key={day} className="mb-8">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">
                    {day.toUpperCase()} - {dayPlan.title}
                  </h4>
                  <div className="space-y-6">
                    {(dayPlan.plan || []).map((activity, index) => {
                      const activityMapLink = getActivityMapLink(activity);
                      return (
                        <div
                          key={index}
                          className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row"
                        >
                          <div className="md:w-1/3">
                            <img
                              src={activity.imageUrl || "/default-activity.jpg"}
                              alt={activity.activityName}
                              loading="lazy" // Lazy load image
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-activity.jpg";
                              }}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                          <div className="md:w-2/3 md:pl-8 mt-4 md:mt-0">
                            <h5 className="text-2xl font-semibold mb-2">
                              {activity.activityName}
                            </h5>
                            <p className="text-gray-700 mb-2">
                              {activity.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                              <span>
                                Time: {activity.recommendedTimeAllocation}
                              </span>
                              <span>Cost: {activity.cost}</span>
                              <span>Duration: {activity.duration}</span>
                            </div>
                            <a
                              href={activityMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                            >
                              <FaMap className="mr-2" /> View on Map
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-lg">No itinerary available.</p>
            )}
          </div>

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

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 mt-16 shadow-lg">
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
