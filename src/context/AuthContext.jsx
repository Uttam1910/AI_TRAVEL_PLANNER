// import { createContext, useState, useEffect } from "react";
// import { googleLogout } from "@react-oauth/google";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     !!localStorage.getItem("user")
//   );

//   useEffect(() => {
//     const user = localStorage.getItem("user");
//     if (user) setIsAuthenticated(true);
//   }, []);

//   const login = (userData) => {
//     localStorage.setItem("user", JSON.stringify(userData));
//     setIsAuthenticated(true);
//   };

//   const logout = () => {
//     localStorage.removeItem("user");
//     googleLogout();
//     setIsAuthenticated(false);
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
