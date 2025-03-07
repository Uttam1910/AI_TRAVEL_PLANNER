import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaUserFriends, // For "A Couple"
  FaUsers, // For "Family"
  FaHandshake, // For "Friends"
  FaMoneyBillWave, // For "Cheap"
  FaDollarSign, // For "Moderate"
  FaGem, // For "Luxury
  FaWallet, // replaced FaDollarSign with FaWallet for budget
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMountain,
  FaUmbrellaBeach,
  FaLandmark,
  FaHeart,
  FaUtensils,
  FaBus,
  FaHotel,
  FaAccessibleIcon,
  FaBriefcase,
  FaUser,
  FaLeaf,
  FaTree,
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
import { FaMusic } from "react-icons/fa";
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
    tripCategory: [], // Changed to an array for multi-select
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

  // Updated trip category options with additional choices and corresponding icons
  const tripCategoryOptions = [
    { label: "Adventure", value: "Adventure", icon: <FaMountain /> },
    { label: "Beach", value: "Beach", icon: <FaUmbrellaBeach /> },
    { label: "Cultural", value: "Cultural", icon: <FaLandmark /> },
    { label: "Business", value: "Business", icon: <FaBriefcase /> },
    { label: "Wellness", value: "Wellness", icon: <FaLeaf /> },
    { label: "Road Trip", value: "Road Trip", icon: <FaBus /> },
    { label: "Eco-Tourism", value: "Eco-Tourism", icon: <FaTree /> },
    { label: "Culinary", value: "Culinary", icon: <FaUtensils /> },
    {
      label: "Festival & Events",
      value: "Festival & Events",
      icon: <FaMusic />,
    },
    { label: "Nature Retreat", value: "Nature Retreat", icon: <FaTree /> },
  ];

  const budgetOptions = [
    { label: "Cheap", value: "Cheap", icon: <FaMoneyBillWave /> },
    { label: "Moderate", value: "Moderate", icon: <FaWallet /> }, // Changed here
    { label: "Luxury", value: "Luxury", icon: <FaGem /> },
  ];

  const travelCompanionOptions = [
    { label: "Just Me", value: "Just Me", icon: <FaUser /> },
    { label: "A Couple", value: "A Couple", icon: <FaUserFriends /> },
    { label: "Family", value: "Family", icon: <FaUsers /> },
    { label: "Friends", value: "Friends", icon: <FaHandshake /> },
  ];

  // New options for additional fields
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Updated handler for multi-select fields (used for interests, activities, and now tripCategory)
  const handleMultiSelectChange = (selectedOptions, actionMeta) => {
    setFormData({
      ...formData,
      [actionMeta.name]: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    });
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData((prev) => ({
      ...prev,
      [actionMeta.name]: selectedOption ? selectedOption.value : "",
    }));
  };

  // Updated generateTripPlan with new fields
  const generateTripPlan = async () => {
    setIsLoading(true);
    const url = "http://localhost:5000/plans";
    const requestBody = {
      location: formData.destination,
      date: formData.travelDates,
      tripType: formData.tripCategory, // This will now be an array of trip types
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

  // Check auth state on mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  // Listen for auth changes from other components (like Header)
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

  // Define the custom input using forwardRef so it receives DatePicker props
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="relative flex items-center">
      <input
        type="text"
        onClick={onClick}
        ref={ref}
        value={value}
        readOnly
        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 
        text-left h-[42px] hover:cursor-pointer"
        placeholder="Select travel dates"
      />
      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  ));

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-blue-600 mb-6">
            Ready to Plan Your Dream Trip?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let's get started by filling in some details. Our smart tool will
            help you plan an unforgettable trip based on your preferences and
            budget. 🧳✈️
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Destination */}
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
                    ? {
                        label: formData.destination,
                        value: formData.destination,
                      }
                    : null,
                  onChange: (selectedOption) =>
                    setFormData((prev) => ({
                      ...prev,
                      destination: selectedOption?.label || "",
                    })),
                  placeholder: "Enter your destination",
                  className: "text-left",
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
              />
            </div>

            {/* Travel Dates */}
            <div>
              <label
                htmlFor="travelDates"
                className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
              >
                <FaCalendarAlt className="mr-2 text-blue-500" />
                When are you planning to travel?
              </label>
              <div className="relative">
                <DatePicker
                  selected={
                    formData.travelDates ? new Date(formData.travelDates) : null
                  }
                  onChange={(date) => {
                    const isoDate = date
                      ? date.toISOString().split("T")[0]
                      : "";
                    setFormData({ ...formData, travelDates: isoDate });
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-4 py-3 pl-3 border border-gray-300 rounded-lg shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 
                 text-left h-[42px] hover:cursor-pointer"
                  placeholderText="Select travel dates"
                  required
                  minDate={new Date()}
                  isClearable
                  withPortal
                  popperClassName="z-50"
                  // Remove showMonthDropdown & showYearDropdown in favor of a custom header
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className="flex items-center justify-between px-2 py-2 bg-white">
                      <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        className="p-2 text-gray-700 hover:text-blue-500"
                      >
                        &lt;
                      </button>
                      <div className="flex items-center">
                        <select
                          value={date.getMonth()}
                          onChange={({ target: { value } }) =>
                            changeMonth(Number(value))
                          }
                          className="bg-white border border-gray-300 rounded-md px-2 py-1 
                             text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          onChange={({ target: { value } }) =>
                            changeYear(value)
                          }
                          className="ml-2 bg-white border border-gray-300 rounded-md px-2 py-1 
                             text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from(
                            { length: 100 },
                            (_, i) => new Date().getFullYear() - i
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        className="p-2 text-gray-700 hover:text-blue-500"
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
              <label
                htmlFor="tripCategory"
                className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
              >
                <FaUserFriends className="mr-2 text-blue-500" />
                What type of trip are you planning?
              </label>
              <Select
                isMulti
                name="tripCategory"
                options={tripCategoryOptions}
                value={tripCategoryOptions.filter((option) =>
                  formData.tripCategory.includes(option.value)
                )}
                onChange={handleMultiSelectChange}
                components={{ MultiValue: CustomSingleValue }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
                placeholder="Select one or more trip types"
                required
              />
            </div>

            {/* Trip Duration */}
            <div>
              <label
                htmlFor="tripDuration"
                className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
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

            {/* // 3. Modified Budget section */}
            <div>
              <label
                htmlFor="budget"
                className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
              >
                <FaWallet className="mr-2 text-blue-500" />
                What is your budget?
              </label>
              <Select
                name="budget"
                options={budgetOptions}
                value={budgetOptions.find(
                  (option) => option.value === formData.budget
                )}
                onChange={handleSelectChange}
                components={{
                  SingleValue: CustomSingleValue,
                  IndicatorSeparator: () => null,
                }}
                styles={singleSelectStyles}
                className="w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
                placeholder="Select your budget"
                required
              />
            </div>

            {/* // 4. Modified Travel Companion section */}
            <div>
              <label
                htmlFor="travelCompanion"
                className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start"
              >
                <FaUsers className="mr-2 text-blue-500" />
                Who do you plan on traveling with?
              </label>
              <Select
                name="travelCompanion"
                options={travelCompanionOptions}
                value={travelCompanionOptions.find(
                  (option) => option.value === formData.travelCompanion
                )}
                onChange={handleSelectChange}
                components={{
                  SingleValue: CustomSingleValue,
                  IndicatorSeparator: () => null,
                }}
                styles={singleSelectStyles}
                className="w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left"
                placeholder="Select your travel companion"
                required
              />
            </div>

            {/* Additional Preferences Section */}
            <div className="border-t pt-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Additional Preferences
              </h3>

              {/* Interests */}
              <div>
                <label className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start">
                  <FaMountain className="mr-2 text-blue-500" />
                  What are your main interests?
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
              <div>
                <label className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start">
                  <FaUmbrellaBeach className="mr-2 text-blue-500" />
                  Preferred Activities
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
              <div>
                <label className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start">
                  <FaUtensils className="mr-2 text-blue-500" />
                  Dietary Preferences
                </label>
                <Select
                  name="dietaryPreferences"
                  options={dietaryOptions}
                  onChange={handleSelectChange}
                  value={dietaryOptions.find(
                    (option) => option.value === formData.dietaryPreferences
                  )}
                  placeholder="Select dietary needs..."
                />
              </div>

              {/* Transportation Preferences */}
              <div>
                <label className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start">
                  <FaBus className="mr-2 text-blue-500" />
                  Transportation Preference
                </label>
                <Select
                  name="transportation"
                  options={transportationOptions}
                  onChange={handleSelectChange}
                  value={transportationOptions.find(
                    (option) => option.value === formData.transportation
                  )}
                  placeholder="Select transportation preference..."
                />
              </div>

              {/* Accommodation Type */}
              <div>
                <label className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start">
                  <FaHotel className="mr-2 text-blue-500" />
                  Accommodation Type
                </label>
                <Select
                  name="accommodationType"
                  options={accommodationOptions}
                  onChange={handleSelectChange}
                  value={accommodationOptions.find(
                    (option) => option.value === formData.accommodationType
                  )}
                  placeholder="Select accommodation type..."
                />
              </div>

              {/* Special Requirements */}
              <div>
                <label className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-start">
                  <FaAccessibleIcon className="mr-2 text-blue-500" />
                  Special Requirements
                </label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                  placeholder="Accessibility needs, health considerations, etc."
                  rows="3"
                />
              </div>
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

          {/* Modal for authentication */}
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
              <button
                onClick={() => login()}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg transition hover:bg-blue-700 focus:ring focus:ring-blue-400 focus:outline-none mb-6"
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
    </GoogleOAuthProvider>
  );
};

export default CreateTrip;
