import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => navigate("/create-trip");
  const handleExploreClick = () => navigate("/explore");
  const handleLandmarkClick = () => navigate("/landmark");
  const handleBookingClick = () => navigate("/hotel-booking");
  const handleRecommendationsClick = () => navigate("/recommendations");

  const features = [
    { title: "AI Recommendations", desc: "Personalized trip planning powered by advanced AI", icon: "🤖", action: handleRecommendationsClick },
    { title: "Smart Maps", desc: "Interactive maps with real-time travel insights", icon: "🌍", action: handleExploreClick },
    { title: "Booking Integration", desc: "Integrated booking system for seamless reservations", icon: "📅", action: handleBookingClick },
    { title: "Landmark Analysis", desc: "Image analysis for landmark recognition", icon: "🔍", action: handleLandmarkClick },
  ];

  return (
    <section aria-label="Hero" className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Heading & CTAs */}
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Craft Your Perfect Journey
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mb-6 mx-auto lg:mx-0"
          >
            Intelligent travel planning made simple — AI-powered suggestions, real-time maps, and seamless booking all in one place.
          </motion.p>

          <div className="flex flex-col sm:flex-row sm:justify-start gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetStartedClick}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Start Planning Now
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExploreClick}
              className="border border-white/20 text-white/90 font-medium py-3 px-6 rounded-lg hover:bg-white/5 transition-all duration-300"
            >
              Discover Destinations
            </motion.button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            {features.slice(0, 2).map((f, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white">{f.title}</h4>
                <p className="text-xs text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Feature grid */}
        <div className="order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {features.map((feature, idx) => (
              <button
                key={idx}
                onClick={feature.action}
                className="group relative bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-blue-400/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl text-left h-56 flex flex-col justify-center"
                aria-label={feature.title}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 mb-4 mx-auto sm:mx-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{feature.desc}</p>
                </div>
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
