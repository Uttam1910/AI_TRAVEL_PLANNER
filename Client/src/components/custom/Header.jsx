import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { FaBars, FaTimes, FaUserCircle, FaGoogle } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  // Keep all existing state and logic the same
  const updateAuthState = () => {
    const storedToken = localStorage.getItem("authToken");
    const storedProfile = localStorage.getItem("googleProfile");
    if (storedToken && storedProfile) {
      setIsAuthenticated(true);
      setUserProfile(JSON.parse(storedProfile));
    } else {
      setIsAuthenticated(false);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    updateAuthState();
  }, []);

  useEffect(() => {
    const handleAuthChange = () => updateAuthState();
    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  const handleGoogleLoginSuccess = (tokenResponse) => {
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
    })
      .then((res) => res.json())
      .then((profile) => {
        localStorage.setItem("authToken", tokenResponse.access_token);
        localStorage.setItem("googleProfile", JSON.stringify(profile));
        setIsAuthenticated(true);
        setUserProfile(profile);
        window.dispatchEvent(new Event("authChanged"));
      })
      .catch((error) => console.error("Failed to fetch user profile", error));
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => console.error("Google login failed"),
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("googleProfile");
    setIsAuthenticated(false);
    setUserProfile(null);
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  const navigationItems = isAuthenticated ? ["Trips"] : [];

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-slate-900 to-indigo-900/80 backdrop-blur-md border-b border-white/10 fixed w-full top-0 z-50"
      > {/* Header */}
        <nav aria-label="Primary navigation" className="flex justify-between items-center px-6 sm:px-8 h-20 max-w-7xl mx-auto">
          {/* Logo Container */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo4.png"
              alt="Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 hover:scale-105"
              style={{
                filter: 'brightness(0) invert(1)',
                WebkitFilter: 'brightness(0) invert(1)'
              }}
            />
            <span className="sr-only">AI Travel Planner</span>
          </Link>

          {/* Navigation Items (desktop) */}
          {navigationItems.length > 0 && (
            <ul className="hidden md:flex gap-8 items-center">
              {navigationItems.map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-300 font-medium text-lg"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Mobile Menu Toggle */}
          {navigationItems.length > 0 && (
            <button
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-2 text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          )}

          {/* Mobile Menu (overlay) */}
          {menuOpen && navigationItems.length > 0 && (
            <div id="mobile-menu" role="menu" aria-hidden={!menuOpen} className="absolute top-20 left-0 w-full bg-slate-800/95 backdrop-blur-sm md:hidden">
              <ul className="flex flex-col items-center py-4 gap-4">
                {navigationItems.map((item) => (
                  <li key={item} className="w-full text-center">
                    <Link
                      to={`/${item.toLowerCase()}`}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-gray-300 hover:text-blue-400 hover:bg-white/5 transition-all"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {userProfile?.picture ? (
                    <img
                      src={userProfile.picture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-blue-400 transition-all cursor-pointer"
                    />
                  ) : (
                    <FaUserCircle className="text-3xl text-gray-300 hover:text-blue-400 cursor-pointer" />
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/5 border border-white/10 text-gray-300 px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-500/20 hover:border-blue-400/30 hover:text-white transition-all duration-300 shadow-sm text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="flex items-center gap-3 bg-white/5 border border-white/10 text-gray-300 px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-500/20 hover:border-blue-400/30 hover:text-white transition-all duration-300 shadow-sm text-sm"
              >
                <FaGoogle className="text-blue-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </nav>
      </motion.header>
    </GoogleOAuthProvider>
  );
};

export default Header;
