import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
// import { saveFeedback } from "../service/firebaseConfig"; 

const FeedbackSection = ({ tripId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveFeedback({ tripId, rating, comment });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  if (submitted) {
    return (
      <div className="mt-12 text-center">
        <p className="text-green-600 font-semibold">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mt-12">
      <h3 className="text-2xl font-semibold text-blue-700 mb-4">Your Feedback</h3>
      <div className="flex items-center mb-4">
        <span className="mr-2">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer text-2xl ${
              star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </div>
      <textarea
        className="w-full border border-gray-300 p-3 rounded-lg mb-4"
        rows="4"
        placeholder="Tell us about your experience or suggestions..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackSection;






































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




















import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaUserFriends,
  FaUsers,
  FaHandshake,
  FaMoneyBillWave,
  FaDollarSign,
  FaGem,
  FaWallet,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMountain,
  FaUmbrellaBeach,
  FaLandmark,
  FaUtensils,
  FaBus,
  FaHotel,
  FaAccessibleIcon,
  FaBriefcase,
  FaUser,
  FaLeaf,
  FaTree,
  FaMusic,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import Modal from "react-modal";
import { saveTripDetails } from "../service/firebaseConfig";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
Modal.setAppElement("#root");

// Custom styles for react-select single select
const singleSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#0e7490" : provided.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px #0e7490" : provided.boxShadow,
    "&:hover": { borderColor: "#0e7490" },
  }),
};

const CustomSingleValue = ({ data }) => (
  <div className="flex items-center">
    {data.icon && <div className="mr-2 text-xl">{data.icon}</div>}
    <div>{data.label}</div>
  </div>
);

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    destination: "",
    travelDates: "",
    travelers: "",
    budget: "",
    tripCategory: [],
    tripDuration: "",
    travelCompanion: "",
    interests: [],
    activities: [],
    dietaryPreferences: "None",
    transportation: "Mixed",
    accommodationType: "Hotel",
    specialRequirements: "None",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Options for various select fields
  const tripCategoryOptions = [
    { label: "Adventure", value: "Adventure", icon: <FaMountain /> },
    { label: "Beach", value: "Beach", icon: <FaUmbrellaBeach /> },
    { label: "Cultural", value: "Cultural", icon: <FaLandmark /> },
    { label: "Business", value: "Business", icon: <FaBriefcase /> },
    { label: "Wellness", value: "Wellness", icon: <FaLeaf /> },
    { label: "Road Trip", value: "Road Trip", icon: <FaBus /> },
    { label: "Eco-Tourism", value: "Eco-Tourism", icon: <FaTree /> },
    { label: "Culinary", value: "Culinary", icon: <FaUtensils /> },
    { label: "Festival & Events", value: "Festival & Events", icon: <FaMusic /> },
    { label: "Nature Retreat", value: "Nature Retreat", icon: <FaTree /> },
  ];

  const budgetOptions = [
    { label: "Cheap", value: "Cheap", icon: <FaMoneyBillWave /> },
    { label: "Moderate", value: "Moderate", icon: <FaWallet /> },
    { label: "Luxury", value: "Luxury", icon: <FaGem /> },
  ];

  const travelCompanionOptions = [
    { label: "Just Me", value: "Just Me", icon: <FaUser /> },
    { label: "A Couple", value: "A Couple", icon: <FaUserFriends /> },
    { label: "Family", value: "Family", icon: <FaUsers /> },
    { label: "Friends", value: "Friends", icon: <FaHandshake /> },
  ];

  const interestOptions = [
    { label: "Sightseeing", value: "Sightseeing" },
    { label: "Adventure Sports", value: "Adventure Sports" },
    { label: "Local Cuisine", value: "Local Cuisine" },
    { label: "Historical Sites", value: "Historical Sites" },
    { label: "Nature & Parks", value: "Nature & Parks" },
    { label: "Shopping", value: "Shopping" },
  ];

  const activityOptions = [
    { label: "Hiking", value: "Hiking" },
    { label: "Museum Visits", value: "Museum Visits" },
    { label: "Water Sports", value: "Water Sports" },
    { label: "City Tours", value: "City Tours" },
    { label: "Nightlife", value: "Nightlife" },
  ];

  const dietaryOptions = [
    { label: "None", value: "None" },
    { label: "Vegetarian", value: "Vegetarian" },
    { label: "Vegan", value: "Vegan" },
    { label: "Gluten-Free", value: "Gluten-Free" },
    { label: "Halal", value: "Halal" },
  ];

  const transportationOptions = [
    { label: "Public Transport", value: "Public" },
    { label: "Private Transport", value: "Private" },
    { label: "Mixed", value: "Mixed" },
    { label: "Walking Focus", value: "Walking" },
  ];

  const accommodationOptions = [
    { label: "Hotel", value: "Hotel" },
    { label: "Hostel", value: "Hostel" },
    { label: "Vacation Rental", value: "Vacation Rental" },
    { label: "Bed & Breakfast", value: "Bed & Breakfast" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (selectedOptions, actionMeta) => {
    setFormData({
      ...formData,
      [actionMeta.name]: selectedOptions ? selectedOptions.map((option) => option.value) : [],
    });
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData((prev) => ({
      ...prev,
      [actionMeta.name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const generateTripPlan = async () => {
    setIsLoading(true);
    const url = "http://localhost:5000/plans";
    const requestBody = {
      location: formData.destination,
      date: formData.travelDates,
      tripType: formData.tripCategory,
      duration: formData.tripDuration,
      budget: formData.budget,
      travelCompanion: formData.travelCompanion,
      interests: formData.interests,
      activities: formData.activities,
      dietaryPreferences: formData.dietaryPreferences,
      transportation: formData.transportation,
      accommodationType: formData.accommodationType,
      specialRequirements: formData.specialRequirements,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("Backend response:", data);
      if (!data.tripId) return console.error("Trip ID not found in response");

      await saveTripDetails(data, data.tripId);
      navigate(`/view_Trip/${data.tripId}`);
    } catch (error) {
      console.error("Error generating trip plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };
    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }
    if (!formData.tripCategory || formData.tripCategory.length === 0) {
      alert("Please select at least one trip type.");
      return;
    }
    generateTripPlan();
  };

  const handleGoogleLoginSuccess = (tokenResponse) => {
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
    })
      .then((res) => res.json())
      .then((profile) => {
        localStorage.setItem("authToken", tokenResponse.access_token);
        localStorage.setItem("googleProfile", JSON.stringify(profile));
        setIsAuthenticated(true);
        setIsModalOpen(false);
        window.dispatchEvent(new Event("authChanged"));
      })
      .catch((error) => {
        console.error("Failed to fetch user profile:", error);
        setIsModalOpen(false);
      });
  };

  const handleGoogleLoginFailure = () => {
    console.error("Google login failed");
    setIsAuthenticated(false);
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginFailure,
  });

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="relative flex items-center">
      <input
        type="text"
        onClick={onClick}
        ref={ref}
        value={value}
        readOnly
        className="w-full px-4 py-3 pl-10 border border-gray-600 rounded-lg shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-teal-500 bg-blue-900 text-gray-100 
                   text-left h-10 transition-all duration-300 cursor-pointer"
        placeholder="Select travel dates"
      />
      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-300" />
    </div>
  ));

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <section className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-700 to-blue-800 flex items-center justify-center py-16 px-4">
        <div className="max-w-4xl w-full bg-blue-800 bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-8 sm:p-12">
          <h2 className="text-4xl font-extrabold text-center text-teal-300 mb-6">
            Dive Into Your Dream Trip
          </h2>
          <p className="text-lg text-gray-200 text-center mb-10">
            Let the deep currents of your imagination guide you. Fill in your details, and let our tool navigate you through an ocean of possibilities.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Destination */}
            <div>
              <label htmlFor="destination" className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-teal-300" /> Where do you want to go?
              </label>
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
                selectProps={{
                  value: formData.destination ? { label: formData.destination, value: formData.destination } : null,
                  onChange: (selectedOption) =>
                    setFormData((prev) => ({
                      ...prev,
                      destination: selectedOption?.label || "",
                    })),
                  placeholder: "Enter your destination",
                  className: "text-left",
                }}
                className="w-full"
              />
            </div>

            {/* Travel Dates */}
            <div>
              <label htmlFor="travelDates" className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                <FaCalendarAlt className="mr-2 text-teal-300" /> When are you planning to travel?
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.travelDates ? new Date(formData.travelDates) : null}
                  onChange={(date) => {
                    const isoDate = date ? date.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, travelDates: isoDate });
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-4 py-3 pl-3 border border-gray-600 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-teal-500 bg-blue-900 text-gray-100 h-10 transition-all duration-300 cursor-pointer"
                  placeholderText="Select travel dates"
                  required
                  minDate={new Date()}
                  isClearable
                  withPortal
                  popperClassName="z-50"
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className="flex items-center justify-between px-2 py-2 bg-blue-800">
                      <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        className="p-2 text-gray-200 hover:text-teal-300 transition-colors"
                      >
                        &lt;
                      </button>
                      <div className="flex items-center">
                        <select
                          value={date.getMonth()}
                          onChange={({ target: { value } }) => changeMonth(Number(value))}
                          className="bg-blue-800 border border-gray-600 rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ].map((month, index) => (
                            <option key={month} value={index}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <select
                          value={date.getFullYear()}
                          onChange={({ target: { value } }) => changeYear(value)}
                          className="ml-2 bg-blue-800 border border-gray-600 rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        className="p-2 text-gray-200 hover:text-teal-300 transition-colors"
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                  customInput={<CustomInput />}
                />
              </div>
            </div>

            {/* Trip Category */}
            <div>
              <label htmlFor="tripCategory" className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                <FaUserFriends className="mr-2 text-teal-300" /> What type of trip are you planning?
              </label>
              <Select
                isMulti
                name="tripCategory"
                options={tripCategoryOptions}
                value={tripCategoryOptions.filter((option) => formData.tripCategory.includes(option.value))}
                onChange={handleMultiSelectChange}
                components={{ MultiValue: CustomSingleValue }}
                className="w-full"
                classNamePrefix="select"
                placeholder="Select one or more trip types"
                required
              />
            </div>

            {/* Trip Duration */}
            <div>
              <label htmlFor="tripDuration" className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                <FaCalendarAlt className="mr-2 text-teal-300" /> How many days are you planning your trip?
              </label>
              <input
                type="number"
                id="tripDuration"
                name="tripDuration"
                value={formData.tripDuration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-blue-900 text-gray-100 h-10 transition-all duration-300"
                placeholder="e.g. 7 days"
                required
              />
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                <FaWallet className="mr-2 text-teal-300" /> What is your budget?
              </label>
              <Select
                name="budget"
                options={budgetOptions}
                value={budgetOptions.find((option) => option.value === formData.budget)}
                onChange={handleSelectChange}
                components={{
                  SingleValue: CustomSingleValue,
                  IndicatorSeparator: () => null,
                }}
                styles={singleSelectStyles}
                className="w-full"
                placeholder="Select your budget"
                required
              />
            </div>

            {/* Travel Companion */}
            <div>
              <label htmlFor="travelCompanion" className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                <FaUsers className="mr-2 text-teal-300" /> Who do you plan on traveling with?
              </label>
              <Select
                name="travelCompanion"
                options={travelCompanionOptions}
                value={travelCompanionOptions.find((option) => option.value === formData.travelCompanion)}
                onChange={handleSelectChange}
                components={{
                  SingleValue: CustomSingleValue,
                  IndicatorSeparator: () => null,
                }}
                styles={singleSelectStyles}
                className="w-full"
                placeholder="Select your travel companion"
                required
              />
            </div>

            {/* Additional Preferences */}
            <div className="border-t border-teal-600 pt-6">
              <h3 className="text-2xl font-bold text-gray-200 mb-4">Additional Preferences</h3>

              {/* Interests */}
              <div className="mb-6">
                <label className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                  <FaMountain className="mr-2 text-teal-300" /> What are your main interests?
                </label>
                <CreatableSelect
                  isMulti
                  name="interests"
                  options={interestOptions}
                  onChange={handleMultiSelectChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select or create interests..."
                />
              </div>

              {/* Preferred Activities */}
              <div className="mb-6">
                <label className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                  <FaUmbrellaBeach className="mr-2 text-teal-300" /> Preferred Activities
                </label>
                <Select
                  isMulti
                  name="activities"
                  options={activityOptions}
                  onChange={handleMultiSelectChange}
                  placeholder="Select preferred activities..."
                />
              </div>

              {/* Dietary Preferences */}
              <div className="mb-6">
                <label className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                  <FaUtensils className="mr-2 text-teal-300" /> Dietary Preferences
                </label>
                <Select
                  name="dietaryPreferences"
                  options={dietaryOptions}
                  onChange={handleSelectChange}
                  value={dietaryOptions.find((option) => option.value === formData.dietaryPreferences)}
                  placeholder="Select dietary needs..."
                />
              </div>

              {/* Transportation Preferences */}
              <div className="mb-6">
                <label className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                  <FaBus className="mr-2 text-teal-300" /> Transportation Preference
                </label>
                <Select
                  name="transportation"
                  options={transportationOptions}
                  onChange={handleSelectChange}
                  value={transportationOptions.find((option) => option.value === formData.transportation)}
                  placeholder="Select transportation preference..."
                />
              </div>

              {/* Accommodation Type */}
              <div className="mb-6">
                <label className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                  <FaHotel className="mr-2 text-teal-300" /> Accommodation Type
                </label>
                <Select
                  name="accommodationType"
                  options={accommodationOptions}
                  onChange={handleSelectChange}
                  value={accommodationOptions.find((option) => option.value === formData.accommodationType)}
                  placeholder="Select accommodation type..."
                />
              </div>

              {/* Special Requirements */}
              <div>
                <label className="block text-xl font-semibold text-gray-200 mb-2 flex items-center">
                  <FaAccessibleIcon className="mr-2 text-teal-300" /> Special Requirements
                </label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-blue-900 text-gray-100 transition-all duration-300"
                  placeholder="Accessibility needs, health considerations, etc."
                  rows="3"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 px-6 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-all duration-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                disabled={isLoading}
              >
                {isLoading ? "Generating Trip Plan..." : "Generate Trip Plan"}
              </button>
            </div>
          </form>

          {isLoading && (
            <div className="mt-8 flex flex-col items-center">
              <ClipLoader size={50} color="#14b8a6" />
              <p className="text-gray-300 mt-3">Please wait, generating your trip plan...</p>
            </div>
          )}

          {/* Modal for authentication */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            contentLabel="Authentication Required"
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70"
          >
            <div className="bg-blue-800 p-8 rounded-lg shadow-2xl max-w-md w-full overflow-auto">
              <h3 className="text-3xl font-bold mb-6 text-teal-300">Sign In Required</h3>
              <p className="text-gray-300 mb-8 leading-relaxed">
                To navigate these deep waters, please sign in to generate your trip plan.
              </p>
              <button
                onClick={() => login()}
                className="w-full py-2 px-4 bg-teal-600 text-white font-semibold rounded-lg transition hover:bg-teal-700 focus:ring focus:ring-teal-400 focus:outline-none mb-6"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 px-4 bg-gray-700 text-white font-semibold rounded-lg transition hover:bg-gray-800 focus:ring focus:ring-gray-400 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </Modal>

          {tripPlan && (
            <div className="mt-12 bg-blue-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-teal-300 mb-4">Your Generated Trip Plan:</h3>
              <pre className="text-left whitespace-pre-wrap bg-gray-800 p-4 rounded-lg text-gray-100">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};

export default CreateTrip;











from flask import Flask, request, jsonify
import os
import logging
import requests
from urllib.parse import quote
from google.cloud import vision
import requests_cache

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Install caching for external requests (cache expires in 1 hour)
requests_cache.install_cache('api_cache', backend='sqlite', expire_after=3600)

# Set Google Cloud Vision credentials using the correct file name (service-account.json)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(BASE_DIR, "service-account.json")

def get_wikidata_info(wikidata_id):
    """Fetch structured data from Wikidata"""
    if not wikidata_id:
        return {}
    
    try:
        # Fetch main entity data
        params = {
            "action": "wbgetentities",
            "ids": wikidata_id,
            "format": "json",
            "props": "claims|descriptions|labels",
            "languages": "en"
        }
        response = requests.get("https://www.wikidata.org/w/api.php", params=params, timeout=5)
        if response.status_code != 200:
            return {}
        
        entity_data = response.json().get("entities", {}).get(wikidata_id, {})
        claims = entity_data.get("claims", {})
        
        # Extract relevant properties
        info = {
            "description": entity_data.get("descriptions", {}).get("en", {}).get("value", ""),
            "inception_date": extract_claim_value(claims.get("P571", [])),
            "architectural_styles": extract_entity_labels(claims.get("P149", [])),
            "country": extract_entity_labels(claims.get("P17", [])),
            "official_website": extract_claim_value(claims.get("P856", []), is_url=True)
        }
        
        return info
    except Exception as e:
        logging.error(f"Wikidata query failed: {str(e)}")
        return {}

def extract_claim_value(claims, is_url=False):
    """Extract value from Wikidata claims"""
    if not claims:
        return None
    try:
        value = claims[0].get("mainsnak", {}).get("datavalue", {}).get("value")
        if is_url:
            return value
        if isinstance(value, dict) and "time" in value:
            return value["time"].lstrip("+").split("T")[0]
        return value
    except Exception:
        return None

def extract_entity_labels(claims):
    """Resolve Wikidata entity IDs to their English labels"""
    if not claims:
        return []
    
    entity_ids = [c.get("mainsnak", {}).get("datavalue", {}).get("value", {}).get("id") for c in claims]
    entity_ids = list(filter(None, set(entity_ids)))
    
    if not entity_ids:
        return []
    
    try:
        params = {
            "action": "wbgetentities",
            "ids": "|".join(entity_ids),
            "format": "json",
            "props": "labels",
            "languages": "en"
        }
        response = requests.get("https://www.wikidata.org/w/api.php", params=params, timeout=5)
        if response.status_code != 200:
            return []
        
        labels = {}
        for qid, data in response.json().get("entities", {}).items():
            labels[qid] = data.get("labels", {}).get("en", {}).get("value", qid)
        
        return [labels.get(eid, eid) for eid in entity_ids]
    except Exception:
        return []

def get_location_details(latitude, longitude):
    """Get human-readable location details using OpenStreetMap"""
    try:
        headers = {'User-Agent': 'LandmarkInfoService/1.0 (contact@example.com)'}
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}"
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            address = response.json().get("address", {})
            return {
                "country": address.get("country"),
                "city": address.get("city") or address.get("town") or address.get("village")
            }
    except Exception as e:
        logging.error(f"Geocoding failed: {str(e)}")
    return {}

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    try:
        # Process image with Google Cloud Vision
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=request.files['image'].read())
        response = client.landmark_detection(image=image)
        landmarks = response.landmark_annotations
        
        if not landmarks:
            return jsonify({"error": "No landmarks detected"}), 404

        landmark = landmarks[0]
        landmark_name = landmark.description
        locations = [{"latitude": loc.lat_lng.latitude, "longitude": loc.lat_lng.longitude}
                     for loc in landmark.locations if loc.lat_lng]

        # Fetch Wikipedia data
        wiki_data = {}
        try:
            wiki_response = requests.get(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(landmark_name)}",
                timeout=5
            )
            if wiki_response.status_code == 200:
                wiki_data = wiki_response.json()
        except Exception as e:
            logging.error(f"Wikipedia query failed: {str(e)}")

        # Fetch Wikidata information
        wikidata_id = wiki_data.get("wikibase_item")
        wikidata_info = get_wikidata_info(wikidata_id) if wikidata_id else {}

        # Prepare location details
        location_details = {}
        if locations:
            loc = locations[0]
            location_details = {
                "coordinates": loc,
                **get_location_details(loc["latitude"], loc["longitude"])
            }
            # Add Google Maps link
            location_details["maps_link"] = f"https://maps.google.com/?q={loc['latitude']},{loc['longitude']}"

        # Build comprehensive response
        result = {
            "name": landmark_name,
            "description": wikidata_info.get("description") or wiki_data.get("extract") or "No description available",
            "historical_context": {
                "inception_date": wikidata_info.get("inception_date"),
                "architectural_styles": wikidata_info.get("architectural_styles"),
                "significance": wiki_data.get("description")
            },
            "location": location_details,
            "official_website": wikidata_info.get("official_website"),
            "references": {
                "wikipedia": wiki_data.get("content_urls", {}).get("desktop", {}).get("page"),
                "wikidata": f"https://www.wikidata.org/wiki/{wikidata_id}" if wikidata_id else None,
                "google_maps": location_details.get("maps_link")
            }
        }

        return jsonify(result)

    except Exception as e:
        logging.exception("Processing failed")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
