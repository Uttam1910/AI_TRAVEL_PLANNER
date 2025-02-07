import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
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
import { GoogleLogin } from "@react-oauth/google";
import Modal from "react-modal";
import { saveTripDetails } from "../service/firebaseConfig";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  // This effect listens for the custom "authChanged" event and updates the auth state accordingly.
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("authChanged", handleAuthChange);
    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }
    if (!formData.tripCategory) {
      alert("Please select a trip type.");
      return;
    }
    generateTripPlan();
  };

  // Updated login success callback:
  const handleGoogleLoginSuccess = (credentialResponse) => {
    console.log("Login Success:", credentialResponse);
    // Fetch user profile using the access token from tokenResponse
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
    })
    
      .then((res) => res.json())
      .then((profile) => {
        // Save token and profile to localStorage
        localStorage.setItem("authToken", credentialResponse.credential);
        localStorage.setItem("googleProfile", JSON.stringify(profile));
        setIsAuthenticated(true);
        setIsModalOpen(false);
        // Dispatch custom event so Header updates its state
        window.dispatchEvent(new Event("authChanged"));
      })
      .catch((error) => {
        console.error("Failed to fetch user profile:", error);
        setIsModalOpen(false);
      });
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
          you plan an unforgettable trip based on your preferences and budget. 🧳✈️
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label
              htmlFor="destination"
              className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaMapMarkerAlt className="mr-2 text-blue-500" />
              Where do you want to go?
            </label>

            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
              selectProps={{
                value: formData.destination
                  ? { label: formData.destination, value: formData.destination }
                  : null,
                onChange: (selectedOption) =>
                  setFormData({
                    ...formData,
                    destination: selectedOption?.label || "",
                  }),
                placeholder: "Enter your destination",
                className: "text-left",
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
            />
          </div>

          <div>
            <label
              htmlFor="travelDates"
              className=" text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
            >
              <FaCalendarAlt className="mr-2 text-blue-500" />
              When are you planning to travel?
            </label>
            <input
              type="date"
              id="travelDates"
              name="travelDates"
              value={formData.travelDates}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              placeholder="e.g. 1st June - 10th June"
              required
            />
          </div>

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

          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? "Generating Trip Plan..." : "Generate Trip Plan"}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="mt-6">
            <ClipLoader size={50} color="#1d4ed8" />
            <p className="text-gray-500 mt-3">
              Please wait, generating your trip plan...
            </p>
          </div>
        )}

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
              className="w-full mb-6"
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
