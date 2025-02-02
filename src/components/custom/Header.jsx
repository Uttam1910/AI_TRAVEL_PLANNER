// Importing React library for creating components
import React from "react"; 

// Importing Link component from react-router-dom for navigation between pages
import { Link } from "react-router-dom"; 

// Importing GoogleOAuthProvider for providing Google OAuth context
// Importing useGoogleLogin hook for handling Google authentication
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"; 

// Defining the Header component
const Header = () => { 
  // Initializing the Google login function using useGoogleLogin hook
  const handleGoogleLogin = useGoogleLogin({
    // Callback function executed on successful login
    onSuccess: (response) => {
      console.log("Google login successful", response); // Logging success response
      // Handle authentication logic here (e.g., storing tokens)
    },
    // Callback function executed on login failure
    onError: (error) => {
      console.error("Google login failed", error); // Logging error response
    },
  });

  return (
    // Providing Google OAuth context to enable authentication
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      {/* Header section with background color, shadow, and border */}
      <header className="bg-white shadow-md border-b border-gray-300 w-full">
        {/* Navigation bar with flexbox for layout, padding for spacing */}
        <nav className="flex justify-between items-center px-2 py-2 w-full">
          {/* Logo positioned on the left with margin from the left and top */}
          <Link to="/" className="flex items-center ml-2 mt-2">
            {/* Logo image with responsive width, hover effect for scaling */}
            <img
              src="/logoipsum-348.svg" // Path to the logo image
              alt="Logo" // Alternative text for accessibility
              className="w-40 h-auto transition-transform duration-300 ease-in-out transform hover:scale-105"
            />
          </Link>

          {/* Sign Up button positioned on the right with margin */}
          <button
            onClick={handleGoogleLogin} // Calls Google login function on click
            className="bg-black text-white font-semibold py-2 px-6 rounded-lg 
                      hover:bg-gray-800 transition-all duration-300 ease-in-out shadow-md mr-2 mt-2"
          >
            Sign Up
          </button>
        </nav>
      </header>
    </GoogleOAuthProvider>
  );
};

// Exporting Header component for use in other parts of the application
export default Header;
