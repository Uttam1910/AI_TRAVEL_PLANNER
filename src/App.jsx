import { Routes, Route } from "react-router-dom";
import Header from "./components/custom/Header"; // Corrected path for Header
import Hero from "./components/custom/Hero"; // Corrected path for Hero
import CreateTrip from "./create-trip"; // Import CreateTrip component
import "./App.css";
import { GoogleOAuthProvider } from '@react-oauth/google';


function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      {/* Header - Visible on all pages */}
      <Header />

      {/* Application Content */}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/create-trip" element={<CreateTrip />} />
      </Routes>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
