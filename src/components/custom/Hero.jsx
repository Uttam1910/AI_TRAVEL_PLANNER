import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate("/create-trip");  // Navigate to the create trip section
  };

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          <span className="text-blue-600">Discover</span>{" "}
          <span className="text-purple-600">New Destinations</span> <br />
          <span className="text-pink-500">With Ease 🌍</span>
        </h1>
        <p className="text-lg md:text-xl leading-relaxed mb-8">
          Your ultimate guide to planning the perfect trip.{" "}
          <span className="text-blue-500">Get personalized recommendations,</span>{" "}
          <span className="text-purple-500">interactive tools,</span> and{" "}
          <span className="text-pink-500">real-time travel insights</span> to make your journey unforgettable.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleGetStartedClick}
            className="bg-blue-600 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:bg-blue-500 transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
