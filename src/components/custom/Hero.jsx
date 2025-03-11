import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  // Navigation handlers
  const handleGetStartedClick = () => navigate("/create-trip");
  const handleExploreClick = () => navigate("/explore");
  const handleLandmarkClick = () => navigate("/landmark");
  const handleBookingClick = () => navigate("/hotel-booking");
  const handleRecommendationsClick = () => navigate("/recommendations");

  return (
    <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-24 px-6 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Craft Your Perfect Journey
          </span>
          <br className="hidden md:block" />
          <span className="text-2xl sm:text-3xl md:text-4xl font-light mt-4 block">
            Intelligent Travel Planning Made Simple
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          Leverage AI-powered insights, real-time collaboration, and smart itinerary tools to 
          create unforgettable travel experiences. 
          <span className="block mt-3 text-blue-200 font-medium">
            Your adventure starts here – explore smarter, travel better.
          </span>
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button
            onClick={handleGetStartedClick}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 px-8 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Start Planning Now
          </button>
          <button
            onClick={handleExploreClick}
            className="border-2 border-blue-400 text-blue-100 font-medium py-4 px-8 rounded-lg hover:bg-blue-500/10 transition-all duration-300 hover:scale-[1.02]"
          >
            Discover Destinations
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "AI Recommendations", icon: "🤖", action: handleRecommendationsClick },
            { title: "Smart Maps", icon: "🌍", action: handleExploreClick },
            { title: "Booking Integration", icon: "📅", action: handleBookingClick },
            { title: "Landmark Analysis", icon: "🔍", action: handleLandmarkClick },
          ].map((feature, idx) => (
            <div 
              key={idx}
              onClick={feature.action}
              className="group relative bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-blue-400/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="relative z-10">
                <div className="w-12 h-12 mb-4 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {[
                    "Personalized trip planning powered by advanced AI",
                    "Interactive maps with real-time travel insights",
                    "Integrated booking system for seamless reservations",
                    "Image analysis for landmark recognition"
                  ][idx]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;