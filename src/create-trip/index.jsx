import React, { useState } from "react"; // Import React and useState hook
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaDollarSign,
  FaMountain,
  FaUmbrellaBeach,
  FaLandmark,
  FaHeart,
} from "react-icons/fa"; // Import specific icons from React Icons
import Select from "react-select"; // Import Select component for dropdowns
import GooglePlacesAutocomplete from "react-google-places-autocomplete"; // Import Google Places autocomplete for destination input
import { GoogleLogin } from "@react-oauth/google"; // Google OAuth library
import Modal from "react-modal"; // Modal component for displaying authentication prompt
import { saveTripDetails } from "../service/firebaseConfig"; // Import function to save trip details to Firebase
import { ClipLoader } from "react-spinners"; // Spinner library for loading indicator
import { Link, animateScroll as scroll } from "react-scroll"; // Import scroll functionality for smooth scrolling
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation after actions
import axios from "axios"; // Axios for HTTP requests

Modal.setAppElement("#root"); // Set the app root for accessibility

// Custom component for displaying selected value with an icon in the Select dropdown
const CustomSingleValue = ({ data }) => (
  <div className="flex items-center">
    {data.icon && <div className="mr-2 text-xl">{data.icon}</div>}{" "}
    {/* Display icon if available */}
    <div>{data.label}</div> {/* Display label of the option */}
  </div>
);

const CreateTrip = () => {
  // useState hooks to manage form data and application state
  const [formData, setFormData] = useState({
    destination: "",
    travelDates: "",
    travelers: "",
    budget: "",
    tripCategory: "",
    tripDuration: "",
    travelCompanion: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state
  const [tripPlan, setTripPlan] = useState(null); // Store generated trip plan
  const [rawResponse, setRawResponse] = useState(null); // Store raw response from the backend
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for authentication prompt
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const navigate = useNavigate(); // Navigation hook

  // Options for the trip category select dropdown
  const tripCategoryOptions = [
    { label: "Adventure", value: "Adventure", icon: <FaMountain /> },
    { label: "Beach", value: "Beach", icon: <FaUmbrellaBeach /> },
    { label: "Cultural", value: "Cultural", icon: <FaLandmark /> },
    { label: "Romantic", value: "Romantic", icon: <FaHeart /> },
  ];

  // Options for the budget select dropdown
  const budgetOptions = [
    { label: "Cheap", value: "Cheap", icon: <FaDollarSign /> },
    { label: "Moderate", value: "Moderate", icon: <FaDollarSign /> },
    { label: "Luxury", value: "Luxury", icon: <FaDollarSign /> },
  ];

  // Options for the travel companion select dropdown
  const travelCompanionOptions = [
    { label: "Just Me", value: "Just Me", icon: <FaUserFriends /> },
    { label: "A Couple", value: "A Couple", icon: <FaUserFriends /> },
    { label: "Family", value: "Family", icon: <FaUserFriends /> },
    { label: "Friends", value: "Friends", icon: <FaUserFriends /> },
  ];

  // Handle changes in text inputs and update form data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Update the specific field in the form data
    });
  };

  // Handle changes in the select dropdowns and update form data
  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData({
      ...formData,
      [actionMeta.name]: selectedOption ? selectedOption.value : "", // Update selected field with its value
    });
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
      console.log("Backend response:", data);

      if (!data.tripId) {
        console.error("Trip ID not found in response");
        return;
      }

      // Save trip to Firebase using the tripId from the backend response
      await saveTripDetails(data, data.tripId);

      // Navigate to the view trip page using the tripId
      navigate(`/view_Trip/${data.tripId}`);
    } catch (error) {
      console.error("Error generating trip plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!isAuthenticated) {
      setIsModalOpen(true); // Open authentication modal if not authenticated
      return;
    }

    if (!formData.tripCategory) {
      alert("Please select a trip type."); // Show alert if trip type is not selected
      return;
    }

    generateTripPlan(); // Proceed to generate trip plan
  };

  // Handle successful Google login
  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log("Login Success:", credentialResponse); // Log success message
    setIsAuthenticated(true); // Set authenticated state to true
    setIsModalOpen(false); // Close authentication modal
  };

  // Handle failed Google login
  const handleGoogleLoginFailure = () => {
    console.log("Login Failed"); // Log failure message
    setIsAuthenticated(false); // Set authenticated state to false
  };

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-4xl font-extrabold text-blue-600 mb-6">
          Ready to Plan Your Dream Trip?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Let's get started by filling in some details. Our smart tool will help
          you plan an unforgettable trip based on your preferences and budget.
          🧳✈️
        </p>

        {/* Trip Planning Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destination Input with Google Places Autocomplete */}
          <div>
            <label
              htmlFor="destination"
              className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaMapMarkerAlt className="mr-2 text-blue-500" />
              Where do you want to go?
            </label>

            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_API_KEY} // Use environment variable for API key
              selectProps={{
                value: formData.destination
                  ? { label: formData.destination, value: formData.destination }
                  : null, // Ensure correct format for selected value
                onChange: (selectedOption) =>
                  setFormData({
                    ...formData,
                    destination: selectedOption?.label || "", // Update destination correctly
                  }),
                placeholder: "Enter your destination",
                className: "text-left",
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
            />
          </div>

          {/* Travel Dates Input */}
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
              onChange={handleInputChange} // Handle change in travel dates
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="e.g. 1st June - 10th June"
              required // Make this field required
            />
          </div>

          {/* Trip Category Dropdown */}
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
              options={tripCategoryOptions} // Pass options for trip categories
              value={tripCategoryOptions.find(
                (option) => option.value === formData.tripCategory
              )}
              onChange={handleSelectChange} // Handle change in trip category
              components={{ SingleValue: CustomSingleValue }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="Select a trip type"
              required // Make this field required
            />
          </div>

          {/* Trip Duration Input */}
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
              onChange={handleInputChange} // Handle change in trip duration
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="e.g. 7 days"
              required // Make this field required
            />
          </div>

          {/* Budget Dropdown */}
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
              options={budgetOptions} // Pass options for budget
              value={budgetOptions.find(
                (option) => option.value === formData.budget
              )}
              onChange={handleSelectChange} // Handle change in budget
              components={{ SingleValue: CustomSingleValue }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="Select your budget"
              required // Make this field required
            />
          </div>

          {/* Travel Companion Dropdown */}
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
              options={travelCompanionOptions} // Pass options for travel companions
              value={travelCompanionOptions.find(
                (option) => option.value === formData.travelCompanion
              )}
              onChange={handleSelectChange} // Handle change in travel companion
              components={{ SingleValue: CustomSingleValue }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="Select your travel companion"
              required // Make this field required
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading ? "Generating Trip Plan..." : "Generate Trip Plan"}{" "}
              {/* Change button text based on loading state */}
            </button>
          </div>
        </form>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="mt-6">
            <ClipLoader size={50} color="#1d4ed8" />{" "}
            {/* Display loading spinner */}
            <p className="text-gray-500 mt-3">
              Please wait, generating your trip plan...
            </p>
          </div>
        )}

        {/* Modal for Google Login */}
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
              onSuccess={handleGoogleLoginSuccess} // Handle success login
              onError={handleGoogleLoginFailure} // Handle failed login
              className="w-full mb-6" // Styling for Google login button
            />
            <br />
            <button
              onClick={() => setIsModalOpen(false)} // Close modal on cancel
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
