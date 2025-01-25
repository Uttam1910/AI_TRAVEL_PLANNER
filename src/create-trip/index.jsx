import React, { useState } from "react";
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
import Select from "react-select";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GoogleLogin } from "@react-oauth/google"; // Google OAuth library
import Modal from "react-modal";
import { saveTripDetails } from "../service/firebaseConfig";
import { ClipLoader } from "react-spinners"; // Spinner library for loading indicator
import { Link, animateScroll as scroll } from "react-scroll";
import { useNavigate } from "react-router-dom";


Modal.setAppElement("#root"); // Specify the app root for accessibility

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
    tripCategory: "",
    tripDuration: "",
    travelCompanion: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication
  const [tripPlan, setTripPlan] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const tripCategoryOptions = [
    { label: "Adventure", value: "Adventure", icon: <FaMountain /> },
    { label: "Beach", value: "Beach", icon: <FaUmbrellaBeach /> },
    { label: "Cultural", value: "Cultural", icon: <FaLandmark /> },
    { label: "Romantic", value: "Romantic", icon: <FaHeart /> },
  ];

  const budgetOptions = [
    { label: "Cheap", value: "Cheap", icon: <FaDollarSign /> },
    { label: "Moderate", value: "Moderate", icon: <FaDollarSign /> },
    { label: "Luxury", value: "Luxury", icon: <FaDollarSign /> },
  ];

  const travelCompanionOptions = [
    { label: "Just Me", value: "Just Me", icon: <FaUserFriends /> },
    { label: "A Couple", value: "A Couple", icon: <FaUserFriends /> },
    { label: "Family", value: "Family", icon: <FaUserFriends /> },
    { label: "Friends", value: "Friends", icon: <FaUserFriends /> },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData({
      ...formData,
      [actionMeta.name]: selectedOption ? selectedOption.value : "",
    });
  };

  const navigate = useNavigate();
  const generateTripPlan = async () => {
    setIsLoading(true); // Start loading
    const url = "http://localhost:3000/plans";
    const requestBody = {
      location: formData.destination,
      date: formData.travelDates,
      tripType: formData.tripCategory,
      duration: formData.tripDuration,
      budget: formData.budget,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response from backend:", data);
      setTripPlan(data);
      setRawResponse(data);

      // Save trip plan to Firebase after successfully generating it
      await saveTripDetails(data);  // Call saveTripDetails and pass the generated data

      // Navigate to the "View Trip" page
      navigate("/view-trip/:tripId");

    } catch (error) {
      console.error("Error generating trip plan:", error);
    }finally {
    setIsLoading(false); // End loading
  }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsModalOpen(true); // Open modal if not authenticated
      return;
    }

    if (!formData.tripCategory) {
      alert("Please select a trip type.");
      return;
    }

    generateTripPlan();
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log("Login Success:", credentialResponse);
    setIsAuthenticated(true); // Update authentication state on success
    setIsModalOpen(false); // Close modal upon successful login
  };

  const handleGoogleLoginFailure = () => {
    console.log("Login Failed");
    setIsAuthenticated(false);
  };
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-blue-600 mb-6">
          Ready to Plan Your Dream Trip?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Let's get started by filling in some details. Our smart tool will help
          you plan an unforgettable trip based on your preferences and budget.
          🧳✈️
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destination with Google Places Autocomplete */}
          <div>
            <label
              htmlFor="destination"
              className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaMapMarkerAlt className="mr-2 text-blue-500" />
              Where do you want to go?
            </label>
            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_API_KEY} // Use Vite's environment variable syntax
              selectProps={{
                value: formData.destination,
                onChange: (value) =>
                  setFormData({
                    ...formData,
                    destination: value ? value.description : "",
                  }),
                placeholder: "Enter your destination",
                className: "text-left",
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
            />
          </div>

          {/* Travel Dates */}
          <div>
            <label
              htmlFor="travelDates"
              className=" text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaCalendarAlt className="mr-2 text-blue-500" />
              When are you planning to travel?
            </label>
            <input
              type="text"
              id="travelDates"
              name="travelDates"
              value={formData.travelDates}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="e.g. 1st June - 10th June"
              required
            />
          </div>

          {/* Trip Category */}
          <div>
            <label
              htmlFor="tripCategory"
              className=" text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaUserFriends className="mr-2 text-blue-500" />
              What type of trip are you planning?
            </label>
            <Select
              name="tripCategory"
              options={tripCategoryOptions}
              value={tripCategoryOptions.find(
                (option) => option.value === formData.tripCategory
              )}
              onChange={handleSelectChange}
              components={{ SingleValue: CustomSingleValue }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="Select a trip type"
              required
            />
          </div>

          {/* Trip Duration */}
          <div>
            <label
              htmlFor="tripDuration"
              className=" text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaCalendarAlt className="mr-2 text-blue-500" />
              How many days are you planning your trip?
            </label>
            <input
              type="number"
              id="tripDuration"
              name="tripDuration"
              value={formData.tripDuration}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="e.g. 7 days"
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="budget"
              className=" text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaDollarSign className="mr-2 text-blue-500" />
              What is your budget?
            </label>
            <Select
              name="budget"
              options={budgetOptions}
              value={budgetOptions.find(
                (option) => option.value === formData.budget
              )}
              onChange={handleSelectChange}
              components={{ SingleValue: CustomSingleValue }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="Select your budget"
              required
            />
          </div>

          {/* Travel Companion */}
          <div>
            <label
              htmlFor="travelCompanion"
              className=" text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaUserFriends className="mr-2 text-blue-500" />
              Who do you plan on traveling with?
            </label>
            <Select
              name="travelCompanion"
              options={travelCompanionOptions}
              value={travelCompanionOptions.find(
                (option) => option.value === formData.travelCompanion
              )}
              onChange={handleSelectChange}
              components={{ SingleValue: CustomSingleValue }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="Select your travel companion"
              required
            />
          </div>

          {/* Google Login
          {!isAuthenticated && (
            <div className="my-6">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
              />
            </div>
          )} */}

          {/* Submit Button */}
          <div>
             {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "Generating Trip Plan..." : "Generate Trip Plan"}
          </button>
          </div>
        </form>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="mt-6">
            <ClipLoader size={50} color="#1d4ed8" />
            <p className="text-gray-500 mt-3">Please wait, generating your trip plan...</p>
          </div>
        )}


        {/* Modal for authentication prompt */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Authentication Required"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60"
        >
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full overflow-auto">
            <h3 className="text-3xl font-bold mb-6 text-gray-800">
              Sign In Required
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You need to sign in to generate your trip plan. Please log in to
              proceed.
            </p>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              className="w-full mb-6" // Google button style
            />
            <br />
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 px-4 bg-gray-700 text-white font-semibold rounded-lg transition hover:bg-gray-800 focus:ring focus:ring-gray-400 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </Modal>

        {tripPlan && (
          <div className="mt-12 bg-blue-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">
              Your Generated Trip Plan:
            </h3>
            <pre className="text-left whitespace-pre-wrap bg-gray-100 p-4 rounded-lg">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
};

export default CreateTrip;
