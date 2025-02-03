import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { FaBars, FaTimes, FaGoogle, FaUserCircle } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Check if the user is already authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem("googleAuthToken");
    const profile = localStorage.getItem("googleProfile");
    if (token && profile) {
      setIsAuthenticated(true);
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google login successful", response);

      // Fetch user profile using the access token
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${response.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((profile) => {
          console.log("User Profile:", profile);

          // Store the token and profile in localStorage
          localStorage.setItem("googleAuthToken", response.access_token);
          localStorage.setItem("googleProfile", JSON.stringify(profile));

          // Update state
          setIsAuthenticated(true);
          setUserProfile(profile);
        })
        .catch((error) => {
          console.error("Failed to fetch user profile", error);
        });
    },
    onError: (error) => {
      console.error("Google login failed", error);
    },
  });

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem("googleAuthToken");
    localStorage.removeItem("googleProfile");

    // Update state
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md border-b border-gray-300 w-full">
        <nav className="flex justify-between items-center px-4 py-3 w-full">
          {/* Logo (DO NOT MOVE) */}
          <Link to="/" className="flex items-center ml-2 mt-2">
            <img
              src="/logoipsum-348.svg"
              alt="Logo"
              className="w-40 h-auto transition-transform hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-6 text-lg font-medium">
            <li>
              <Link
                to="/explore"
                className="hover:text-yellow-300 transition duration-300"
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                to="/trips"
                className="hover:text-yellow-300 transition duration-300"
              >
                My Trips
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-yellow-300 transition duration-300"
              >
                About
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Icon */}
          <div
            className="md:hidden cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>

          {/* Mobile Dropdown Menu */}
          {menuOpen && (
            <ul className="absolute top-16 left-0 w-full bg-white text-gray-900 shadow-md p-4 flex flex-col gap-4 md:hidden">
              <li>
                <Link
                  to="/explore"
                  onClick={() => setMenuOpen(false)}
                  className="block p-2"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  to="/trips"
                  onClick={() => setMenuOpen(false)}
                  className="block p-2"
                >
                  My Trips
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="block p-2"
                >
                  About
                </Link>
              </li>
            </ul>
          )}

          {/* Conditional Rendering for Authentication */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 mr-2 mt-2">
              {/* User Profile Picture */}
              {userProfile?.picture ? (
                <img
                  src={userProfile.picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <FaUserCircle className="text-3xl" />
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-black text-white font-semibold py-2 px-6 rounded-lg 
                          hover:bg-gray-800 transition-all duration-300 shadow-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="bg-black text-white font-semibold py-2 px-6 rounded-lg 
                        hover:bg-gray-800 transition-all duration-300 shadow-md mr-2 mt-2 flex items-center gap-2"
            >
              <FaGoogle />
              Sign Up
            </button>
          )}
        </nav>
      </header>
    </GoogleOAuthProvider>
  );
};

export default Header;
