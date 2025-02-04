// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import { FaBars, FaTimes, FaGoogle, FaUserCircle } from "react-icons/fa";

// const Header = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userProfile, setUserProfile] = useState(null);

//   // Check localStorage for authentication data on mount
//   useEffect(() => {
//     const storedToken = localStorage.getItem("googleAuthToken");
//     const storedProfile = localStorage.getItem("googleProfile");

//     if (storedToken && storedProfile) {
//       setIsAuthenticated(true);
//       setUserProfile(JSON.parse(storedProfile));
//     }
//   }, []);

//   const handleSuccess = (response) => {
//     fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
//       headers: { Authorization: `Bearer ${response.credential}` },
//     })
//       .then((res) => res.json())
//       .then((profile) => {
//         // Store the token and profile in localStorage
//         localStorage.setItem("authToken", response.credential);
//         localStorage.setItem("googleProfile", JSON.stringify(profile));

//         // Update state
//         setIsAuthenticated(true);
//         setUserProfile(profile);
//       })
//       .catch((error) => console.error("Failed to fetch user profile", error));
//   };

//   const handleFailure = (error) => {
//     console.error("Google login failed", error);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("googleAuthToken");
//     localStorage.removeItem("googleProfile");
//     setIsAuthenticated(false);
//     setUserProfile(null);
//   };

//   return (
//     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
//       <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md border-b border-gray-300 w-full">
//         <nav className="flex justify-between items-center px-4 py-3 w-full">
//           {/* Logo */}
//           <Link to="/" className="flex items-center ml-2 mt-2">
//             <img
//               src="/logoipsum-348.svg"
//               alt="Logo"
//               className="w-40 h-auto transition-transform hover:scale-105"
//             />
//           </Link>

//           {/* Desktop Navigation */}
//           <ul className="hidden md:flex gap-6 text-lg font-medium">
//             {["Explore", "Trips", "About"].map((item) => (
//               <li key={item}>
//                 <Link
//                   to={`/${item.toLowerCase()}`}
//                   className="hover:text-yellow-300 transition duration-300"
//                 >
//                   {item}
//                 </Link>
//               </li>
//             ))}
//           </ul>

//           {/* Mobile Menu Icon */}
//           <div
//             className="md:hidden cursor-pointer"
//             onClick={() => setMenuOpen(!menuOpen)}
//           >
//             {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
//           </div>

//           {/* Mobile Dropdown Menu */}
//           {menuOpen && (
//             <ul className="absolute top-16 left-0 w-full bg-white text-gray-900 shadow-md p-4 flex flex-col gap-4 md:hidden">
//               {["Explore", "Trips", "About"].map((item) => (
//                 <li key={item}>
//                   <Link
//                     to={`/${item.toLowerCase()}`}
//                     onClick={() => setMenuOpen(false)}
//                     className="block p-2"
//                   >
//                     {item}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           )}

//           {/* Authentication Section */}
//           {isAuthenticated ? (
//             <div className="flex items-center gap-4 mr-2 mt-2">
//               {userProfile?.picture ? (
//                 <img
//                   src={userProfile.picture}
//                   alt="Profile"
//                   className="w-10 h-10 rounded-full"
//                 />
//               ) : (
//                 <FaUserCircle className="text-3xl" />
//               )}
//               <button
//                 onClick={handleLogout}
//                 className="bg-black text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md"
//               >
//                 Logout
//               </button>
//             </div>
//           ) : (
//             <div className="mr-2 mt-2">
//               <GoogleLogin
//                 onSuccess={handleSuccess}
//                 onError={handleFailure}
//               />
//             </div>
//           )}
//         </nav>
//       </header>
//     </GoogleOAuthProvider>
//   );
// };

// export default Header;


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Check localStorage for authentication data on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("googleAuthToken");
    const storedProfile = localStorage.getItem("googleProfile");

    if (storedToken && storedProfile) {
      setIsAuthenticated(true);
      setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleGoogleLoginSuccess = (response) => {
    // Fetch user profile using the access token
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${response.credential}` },
    })
      .then((res) => res.json())
      .then((profile) => {
        // Store the token and profile in localStorage
        localStorage.setItem("authToken", response.credential);
        localStorage.setItem("googleProfile", JSON.stringify(profile));

        // Update state to reflect authentication
        setIsAuthenticated(true);
        setUserProfile(profile);
      })
      .catch((error) => console.error("Failed to fetch user profile", error));
  };

  const handleLogout = () => {
    // Remove the token and profile from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("googleProfile");

    // Update state to reflect logout
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md border-b border-gray-300 w-full">
        <nav className="flex justify-between items-center px-4 py-3 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center ml-2 mt-2">
            <img
              src="/logoipsum-348.svg"
              alt="Logo"
              className="w-40 h-auto transition-transform hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-6 text-lg font-medium">
            {["Explore", "Trips", "About"].map((item) => (
              <li key={item}>
                <Link
                  to={`/${item.toLowerCase()}`}
                  className="hover:text-yellow-300 transition duration-300"
                >
                  {item}
                </Link>
              </li>
            ))}
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
              {["Explore", "Trips", "About"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="block p-2"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 mr-2 mt-2">
              {userProfile?.picture ? (
                <img
                  src={userProfile.picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <FaUserCircle className="text-3xl" />
              )}
              <button
                onClick={handleLogout}
                className="bg-black text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => console.error("Google login failed")}
              className="mr-2 mt-2"
            />
          )}
        </nav>
      </header>
    </GoogleOAuthProvider>
  );
};

export default Header;
