import React from "react";
import { useNavigate } from "react-router-dom";

// Hero Component
const Hero = () => {
  const navigate = useNavigate();

  // Navigation handlers
  const handleGetStartedClick = () => navigate("/create-trip");
  const handleExploreClick = () => navigate("/explore");
  const handleLandmarkClick = () => navigate("/landmark"); // Navigate to image analysis page
  const handleBookingClick = () => navigate("/hotel-booking"); // Navigate to hotel booking section
  const handleMapClick = () => navigate("/map"); // Navigate to the Interactive Maps page

  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-6 min-h-screen flex items-center">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Plan Your <span className="text-yellow-400">Dream Trip</span> Effortlessly ✈️
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl leading-relaxed mb-8">
          Get AI-powered recommendations, real-time insights, and seamless planning tools to craft the perfect journey.
          <span className="block mt-2 text-yellow-300">Adventure awaits—start your journey today!</span>
        </p>

        {/* Primary Action Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={handleGetStartedClick}
            className="bg-yellow-400 text-gray-900 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-yellow-300 transition-all duration-300"
          >
            Get Started 🚀
          </button>
          <button
            onClick={handleExploreClick}
            className="bg-white text-blue-600 font-medium py-3 px-8 rounded-full shadow-lg hover:bg-gray-200 transition-all duration-300"
          >
            Explore More 🌍
          </button>
        </div>

        {/* Additional Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-yellow-300">🔍 Smart Recommendations</h3>
            <p className="text-sm mt-2">Personalized trip plans tailored to your preferences.</p>
          </div>
          <div 
            onClick={handleExploreClick}
            className="cursor-pointer bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-xl font-bold text-yellow-300">📍 Interactive Maps</h3>
            <p className="text-sm mt-2">Explore new places with detailed travel insights.</p>
          </div>
          <div 
            onClick={handleBookingClick}
            className="cursor-pointer bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-xl font-bold text-yellow-300">📅 Seamless Booking</h3>
            <p className="text-sm mt-2">Plan & book accommodations, flights, and activities.</p>
          </div>
          <div 
            onClick={handleLandmarkClick} 
            className="cursor-pointer bg-white bg-opacity-10 p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-xl font-bold text-yellow-300">📸 Landmark Detection</h3>
            <p className="text-sm mt-2">
              Analyze images to discover iconic landmarks and get detailed insights.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
