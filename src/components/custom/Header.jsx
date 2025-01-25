import React from "react";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

const Header = () => {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google login successful", response);
      // Handle authentication logic here
    },
    onError: (error) => {
      console.error("Google login failed", error);
    },
  });

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <header className="bg-white shadow-md border-b border-gray-300 w-full">
        <nav className="flex justify-between items-center px-2 py-2 w-full">
          {/* Logo aligned to the left with same margin from top and left */}
          <Link to="/" className="flex items-center ml-2 mt-2">
            <img
              src="/logoipsum-348.svg"
              alt="Logo"
              className="w-40 h-auto transition-transform duration-300 ease-in-out transform hover:scale-105"
            />
          </Link>

          {/* Sign Up Button aligned to the right with same margin from top and right */}
          <button
            onClick={handleGoogleLogin}
            className="bg-black text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition-all duration-300 ease-in-out shadow-md mr-2 mt-2"
          >
            Sign Up
          </button>
        </nav>
      </header>
    </GoogleOAuthProvider>
  );
};

export default Header;
