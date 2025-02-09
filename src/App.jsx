import { Routes, Route } from "react-router-dom";
import Header from "./components/custom/Header"; // Header component
import Hero from "./components/custom/Hero"; // Hero component for landing page
import CreateTrip from "./create-trip"; // CreateTrip page
import ViewTrip from "./view_trip/[tripID]/index"; // Import the new ViewTrip page
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Trips from "./my-trips/index";
import ExploreGlobe from "./components/ExploreGlobe";
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}
      >
        {/* <AuthProvider> */}
        {/* Header - Visible on all pages */}

        <Header />

        {/* Application Content */}
        <Routes>
          <Route path="/" element={<Hero />} /> {/* Landing Page */}
          <Route path="/create-trip" element={<CreateTrip />} />{" "}
          {/* Create a Trip */}
          <Route path="/view_trip/:tripId" element={<ViewTrip />} />{" "}
          {/* View Trip Details */}
          {/* Route to display the list of trips */}
          <Route path="/trips" element={<Trips />} />
          {/* Route to display a specific trip's details */}
          {/* <Route path="/trips/:tripId" element={<TripDetail />} /> */}
          <Route path="/explore" element={<ExploreGlobe />} />
        </Routes>
        {/* </AuthProvider> */}
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
