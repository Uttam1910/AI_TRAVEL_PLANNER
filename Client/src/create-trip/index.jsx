import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaUserFriends, FaUsers, FaHandshake, FaGem, FaWallet,
  FaMapMarkerAlt, FaCalendarAlt, FaMountain, FaUmbrellaBeach, FaLandmark,
  FaUtensils, FaBus, FaHotel, FaAccessibleIcon, FaBriefcase, FaUser, FaLeaf, FaTree
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { motion } from "framer-motion";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import Modal from "react-modal";
import { saveTripDetails } from "../firebaseConfig";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { FaMusic, FaMoneyBillWave as FaMoneyBill } from "react-icons/fa";
Modal.setAppElement("#root");

const singleSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#1d4ed8" : provided.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px #1d4ed8" : provided.boxShadow,
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
    destination: null,
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
    specialRequirements: "",
  });

  const navigate = useNavigate();

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 text-left";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

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
    { label: "Cheap", value: "Cheap", icon: <FaMoneyBill /> },
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
    setFormData((prev) => ({
      ...prev,
      [actionMeta.name]: selectedOptions ? selectedOptions.map((o) => o.value) : [],
    }));
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData((prev) => ({ ...prev, [actionMeta.name]: selectedOption ? selectedOption.value : "" }));
  };

  const generateTripPlan = async () => {
    setIsLoading(true);
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const url = `${apiBase.replace(/\/$/, "")}/plans`;
    const requestBody = {
      // ensure we send a string for location
      location: formData.destination || "",
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
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
  if (!data.tripId) return;
  try {
    await saveTripDetails(data, data.tripId);
  } catch (saveErr) {
    console.warn("Warning: saving trip details failed:", saveErr);
  }
  // App route is '/view_trip/:tripId' (lowercase). Use same path.
  navigate(`/view_trip/${data.tripId}`);
    } catch (err) {
      console.error(err);
      // surface a friendly error for the user
      setErrors((prev) => ({ ...prev, submit: "Failed to generate a trip plan. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { const token = localStorage.getItem("authToken"); if (token) setIsAuthenticated(true); }, []);
  useEffect(() => { const h = () => setIsAuthenticated(!!localStorage.getItem("authToken")); window.addEventListener("authChanged", h); return () => window.removeEventListener("authChanged", h); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }
    // validate before submit
    if (!validateForm()) return;
    generateTripPlan();
  };

  // Validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.destination) newErrors.destination = "Please enter a destination.";
    if (!formData.travelDates) newErrors.travelDates = "Please select travel dates.";
    if (!formData.tripCategory || formData.tripCategory.length === 0) newErrors.tripCategory = "Select at least one trip type.";
    const dur = Number(formData.tripDuration);
    if (!dur || dur <= 0) newErrors.tripDuration = "Please enter a valid trip duration (days).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    setIsFormValid(validateForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.destination, formData.travelDates, formData.tripCategory, formData.tripDuration]);

  const handleGoogleLoginSuccess = (tokenResponse) => { fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }).then((r) => r.json()).then((profile) => { localStorage.setItem("authToken", tokenResponse.access_token); localStorage.setItem("googleProfile", JSON.stringify(profile)); setIsAuthenticated(true); setIsModalOpen(false); window.dispatchEvent(new Event("authChanged")); }).catch((e) => { console.error("Failed to fetch user profile:", e); setIsModalOpen(false); }); };
  const handleGoogleLoginFailure = () => { setIsAuthenticated(false); };
  const login = useGoogleLogin({ onSuccess: handleGoogleLoginSuccess, onError: handleGoogleLoginFailure });

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="relative flex items-center">
      <input type="text" onClick={onClick} ref={ref} value={value} readOnly className={`${inputClass} pl-10 h-[42px] hover:cursor-pointer`} placeholder="Select travel dates" />
      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  ));

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Plan with AI — Fast</h2>
                  <p className="text-sm text-slate-500 mt-1">Tell our AI a few details and get a full itinerary — hotels, dining, transport and daily plans.</p>
                </div>
                <div className="bg-gradient-to-tr from-blue-500 to-cyan-400 p-3 rounded-full shadow-lg">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="white"/></svg>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {/* render primary fields (keeps previous form inputs) */}
                {(() => {
                  return (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Destination</label>
                          <GooglePlacesAutocomplete
                            apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
                            selectProps={{
                              value: formData.destination ? { label: formData.destination, value: formData.destination } : null,
                              onChange: (s) => setFormData((p) => ({ ...p, destination: s ? s.label : null })),
                              placeholder: "Where to?",
                              name: "destination",
                              className: "text-left",
                            }}
                            className={inputClass}
                          />
                          {errors.destination && <p className="text-xs text-rose-400 mt-1">{errors.destination}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Dates</label>
                          <DatePicker selected={formData.travelDates ? new Date(formData.travelDates) : null} onChange={(date) => setFormData((p) => ({ ...p, travelDates: date ? date.toISOString().split("T")[0] : "" }))} dateFormat="yyyy-MM-dd" className={`${inputClass} h-[42px]`} placeholderText="Start date" required minDate={new Date()} isClearable withPortal popperClassName="z-50" customInput={<CustomInput />} />
                          {errors.travelDates && <p className="text-xs text-rose-400 mt-1">{errors.travelDates}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Trip Type</label>
                          <Select isMulti name="tripCategory" options={tripCategoryOptions} value={tripCategoryOptions.filter((o) => formData.tripCategory.includes(o.value))} onChange={handleMultiSelectChange} components={{ MultiValue: CustomSingleValue }} styles={{ control: (p) => ({ ...p, minHeight: '42px' }) }} classNamePrefix="select" placeholder="Select trip types" menuPortalTarget={typeof window !== 'undefined' ? document.body : null} />
                          {errors.tripCategory && <p className="text-xs text-rose-400 mt-1">{errors.tripCategory}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Duration (days)</label>
                          <input type="number" id="tripDuration" name="tripDuration" value={formData.tripDuration} onChange={handleInputChange} className={inputClass} placeholder="e.g. 7" />
                          {errors.tripDuration && <p className="text-xs text-rose-400 mt-1">{errors.tripDuration}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
                          <Select name="budget" options={budgetOptions} value={budgetOptions.find((o) => o.value === formData.budget)} onChange={handleSelectChange} components={{ SingleValue: CustomSingleValue, IndicatorSeparator: () => null }} styles={singleSelectStyles} classNamePrefix="select" placeholder="Select budget" menuPortalTarget={typeof window !== 'undefined' ? document.body : null} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Travel Companion</label>
                          <Select name="travelCompanion" options={travelCompanionOptions} value={travelCompanionOptions.find((o) => o.value === formData.travelCompanion)} onChange={handleSelectChange} components={{ SingleValue: CustomSingleValue, IndicatorSeparator: () => null }} styles={singleSelectStyles} classNamePrefix="select" placeholder="Who are you traveling with?" menuPortalTarget={typeof window !== 'undefined' ? document.body : null} />
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Preferences</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Interests</label>
                            <CreatableSelect isMulti name="interests" options={interestOptions} onChange={handleMultiSelectChange} classNamePrefix="select" placeholder="Select or create" menuPortalTarget={typeof window !== 'undefined' ? document.body : null} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Activities</label>
                            <Select isMulti name="activities" options={activityOptions} onChange={handleMultiSelectChange} classNamePrefix="select" placeholder="Preferred activities" menuPortalTarget={typeof window !== 'undefined' ? document.body : null} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Dietary</label>
                            <Select name="dietaryPreferences" options={dietaryOptions} onChange={handleSelectChange} value={dietaryOptions.find((o) => o.value === formData.dietaryPreferences)} classNamePrefix="select" placeholder="Dietary needs" menuPortalTarget={typeof window !== 'undefined' ? document.body : null} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Transport</label>
                            <Select name="transportation" options={transportationOptions} onChange={handleSelectChange} value={transportationOptions.find((o) => o.value === formData.transportation)} classNamePrefix="select" placeholder="Transport preference" menuPortalTarget={typeof window !== 'undefined' ? document.body : null} />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Special Requirements</label>
                          <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleInputChange} className={`${inputClass} h-24`} placeholder="Accessibility, health notes, etc." rows="3" />
                        </div>
                      </div>

                      <div className="pt-6">
                        {errors.submit && <p className="text-sm text-rose-400 mb-3">{errors.submit}</p>}
                        <button type="submit" className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 transition-shadow shadow-md disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || !isFormValid}>
                          {isLoading ? (<><ClipLoader size={18} color="#fff" /><span>Generating Plan...</span></>) : ("Generate Trip Plan")}
                        </button>
                      </div>
                    </form>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Assistant / Chat Panel */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl shadow-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">🤖</div>
                <div>
                  <h3 className="text-xl font-semibold">AI Travel Assistant</h3>
                  <p className="text-sm text-white/90">Smart suggestions as you fill the form — sample ideas and quick actions.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 max-h-[52vh] overflow-auto">
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white/10 p-4 rounded-xl">
                  <div className="text-sm font-semibold">Suggestion</div>
                  <div className="mt-2 text-sm">Try selecting <span className="font-medium">Adventure</span> and <span className="font-medium">Nature Retreat</span> for an outdoors-first itinerary with eco-friendly stays.</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="bg-white/10 p-4 rounded-xl">
                  <div className="text-sm font-semibold">Tips</div>
                  <ul className="mt-2 text-sm list-disc list-inside">
                    <li>Short trips (3-5 days) work best within a single city/region.</li>
                    <li>For festivals, leave buffer days for travel & rest.</li>
                    <li>Add dietary preferences to get tailored dining suggestions.</li>
                  </ul>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="bg-white/10 p-4 rounded-xl">
                  <div className="text-sm font-semibold">Quick Actions</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => { setFormData((p) => ({ ...p, tripCategory: ["Cultural", "Culinary"], travelCompanion: "Just Me", tripDuration: 5 })); }} className="bg-white/20 px-3 py-2 rounded-md text-sm hover:bg-white/30">Cultural + Food</button>
                    <button onClick={() => { setFormData((p) => ({ ...p, tripCategory: ["Beach"], travelCompanion: "A Couple", tripDuration: 7 })); }} className="bg-white/20 px-3 py-2 rounded-md text-sm hover:bg-white/30">Romantic Beach</button>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="mt-6 text-sm text-white/90">
              <div className="flex items-center justify-between">
                <div>Need inspiration? <span className="font-semibold">Click a quick action</span> or fill a few fields and generate your plan.</div>
                <div className="text-xs">v1.0</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};

export default CreateTrip;
