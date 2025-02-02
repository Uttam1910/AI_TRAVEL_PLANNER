// Importing React library to create a functional component
import React from "react"; 

// Importing useNavigate hook from react-router-dom for programmatic navigation
import { useNavigate } from "react-router-dom"; 

// Defining the Hero component
const Hero = () => { 
  // Initializing the navigate function to enable navigation between pages
  const navigate = useNavigate(); 

  // Function to handle the "Get Started" button click
  const handleGetStartedClick = () => {
    navigate("/create-trip");  // Redirects the user to the "Create Trip" page
  };

  return (
    // Hero section with background color, padding for spacing
    <section className="bg-white py-16 px-6">
      {/* Centered container with a max width constraint */}
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading with large text size, bold font, and margin for spacing */}
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          {/* Using span elements with different colors for visual emphasis */}
          <span className="text-blue-600">Discover</span>{" "} 
          <span className="text-purple-600">New Destinations</span> <br />
          <span className="text-pink-500">With Ease 🌍</span>
        </h1>

        {/* Description paragraph with medium text size and line spacing */}
        <p className="text-lg md:text-xl leading-relaxed mb-8">
          Your ultimate guide to planning the perfect trip.{" "}
          {/* Span elements used for color styling */}
          <span className="text-blue-500">Get personalized recommendations,</span>{" "}
          <span className="text-purple-500">interactive tools,</span> and{" "}
          <span className="text-pink-500">real-time travel insights</span> to make your journey unforgettable.
        </p>

        {/* Button container aligned to the center with spacing */}
        <div className="flex justify-center gap-4">
          {/* "Get Started" button with styling and click event handler */}
          <button
            onClick={handleGetStartedClick} // Calls function to navigate on click
            className="bg-blue-600 text-white font-medium py-3 px-8 rounded-full shadow-lg 
                      hover:bg-blue-500 transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

// Exporting Hero component for use in other parts of the application
export default Hero;
