import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripDetails } from "../../service/firebaseConfig";
import { ClipLoader } from "react-spinners";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaDollarSign,
  FaMountain,
  FaUmbrellaBeach,
  FaLandmark,
  FaHeart,
} from "react-icons/fa";

const ViewTrip = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState({
    tripDetails: {},
    hotelOptions: [],
    itinerary: {},
  }); // Initialize with default values
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <section className="bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-blue-600 mb-6">
          {/* Your Trip Details */}
        </h2>

        {/* Trip Photo */}
        <div className="mb-8">
          <img
            src={tripDetails.tripDetails.tripPhotoURL || "/view.jpg"}
            alt="Trip"
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Trip Details in Horizontal Layout */}
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
          <h3 className="text-2xl font-semibold text-blue-700 mb-4">
            Hotel Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripDetails.hotelOptions && tripDetails.hotelOptions.length > 0 ? (
              tripDetails.hotelOptions.map((hotel, index) => {
                // Generate Google Maps link using the hotel's address
                const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  hotel.hotelAddress
                )}`;

                return (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={hotel.hotelImageURL}
                      alt={hotel.hotelName}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <h4 className="text-xl font-semibold mt-4">
                      {hotel.hotelName}
                    </h4>
                    <p className="text-gray-600">{hotel.hotelAddress}</p>
                    <p className="text-gray-600">{hotel.price}</p>
                    <p className="text-gray-600">Rating: {hotel.rating}</p>
                    {/* Map Link */}
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                    >
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
          <h3 className="text-2xl font-semibold text-blue-700 mb-4">
            Itinerary
          </h3>
          {tripDetails.itinerary &&
          Object.keys(tripDetails.itinerary).length > 0 ? (
            Object.entries(tripDetails.itinerary).map(([day, plan]) => (
              <div key={day} className="mb-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">
                  {day}: {plan.theme}
                </h4>
                <div className="space-y-4">
                  {plan.plan.map((activity, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow-md"
                    >
                      <h5 className="text-lg font-semibold">
                        {activity.placeName}
                      </h5>
                      <p className="text-gray-600">{activity.placeDetails}</p>
                      <p className="text-gray-600">
                        Ticket Price: {activity.ticketPricing}
                      </p>
                      <p className="text-gray-600">Rating: {activity.rating}</p>
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
  );
};

export default ViewTrip;
