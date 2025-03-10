import { Routes, Route } from "react-router-dom";
import Header from "./components/custom/Header"; // Header component
import Hero from "./components/custom/Hero"; // Hero component for landing page
import CreateTrip from "./create-trip"; // CreateTrip page
import ViewTrip from "./view_trip/[tripID]/index"; // Import the new ViewTrip page
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Trips from "./my-trips/index";
// import ExploreGlobe from "./components/GoogleGlobe";
import GoogleGlobe from './components/GoogleGlobe';
import LandmarkDetection from "./image_analysis/imageinput"; // Import your Landmark Detection component
import HotelBookingPayment from "./hotelbooking/HotelBookingPayment";
import MapComponent from "./maps/MapComponent"; // Interactive Maps component
import RecommendationComponent from "./recommendations/RecommendationComponent"; // Recommendation page

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
          {/* <Route path="/explore" element={<ExploreGlobe />} /> */}
          <Route path="/explore" element={<GoogleGlobe />} />
          <Route path="/landmark" element={<LandmarkDetection />} /> {/* Landmark Detection */}
          <Route path="/hotel-booking" element={<HotelBookingPayment />} /> {/* Hotel Booking & Payment */}
          <Route path="/map" element={<MapComponent />} /> {/* Interactive Maps */}
          <Route path="/recommendations" element={<RecommendationComponent />} /> {/* Recommendations Page */}
        </Routes>
        {/* </AuthProvider> */}
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
