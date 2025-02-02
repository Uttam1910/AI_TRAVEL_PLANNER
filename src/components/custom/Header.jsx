import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { FaBars, FaTimes, FaGoogle } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google login successful", response);
    },
    onError: (error) => {
      console.error("Google login failed", error);
    },
  });

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
              <Link to="/explore" className="hover:text-yellow-300 transition duration-300">
                Explore
              </Link>
            </li>
            <li>
              <Link to="/trips" className="hover:text-yellow-300 transition duration-300">
                My Trips
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-yellow-300 transition duration-300">
                About
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Icon */}
          <div className="md:hidden cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>

          {/* Mobile Dropdown Menu */}
          {menuOpen && (
            <ul className="absolute top-16 left-0 w-full bg-white text-gray-900 shadow-md p-4 flex flex-col gap-4 md:hidden">
              <li>
                <Link to="/explore" onClick={() => setMenuOpen(false)} className="block p-2">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/trips" onClick={() => setMenuOpen(false)} className="block p-2">
                  My Trips
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={() => setMenuOpen(false)} className="block p-2">
                  About
                </Link>
              </li>
            </ul>
          )}

          {/* Sign Up Button (DO NOT MOVE) */}
          <button
            onClick={handleGoogleLogin}
            className="bg-black text-white font-semibold py-2 px-6 rounded-lg 
                      hover:bg-gray-800 transition-all duration-300 shadow-md mr-2 mt-2 flex items-center gap-2"
          >
            <FaGoogle />
            Sign Up
          </button>
        </nav>
      </header>
    </GoogleOAuthProvider>
  );
};

export default Header;
