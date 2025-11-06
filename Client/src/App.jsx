import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/custom/Header"; // Header component
import Hero from "./components/custom/Hero"; // Hero component for landing page
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Lazy-load route screens for better performance (no logic changes)
const CreateTrip = lazy(() => import("./create-trip"));
const ViewTrip = lazy(() => import("./view_trip/[tripID]/index"));
const Trips = lazy(() => import("./my-trips/index"));
const GoogleGlobe = lazy(() => import('./components/GoogleGlobe'));
const LandmarkDetection = lazy(() => import("./image_analysis/imageinput"));
const HotelBookingPayment = lazy(() => import("./hotelbooking/HotelBookingPayment"));
const MapComponent = lazy(() => import("./maps/MapComponent"));
const RecommendationComponent = lazy(() => import("./recommendations/RecommendationComponent"));
const Explore = lazy(() => import("./explore/Explore"));

const Page = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}
      >
        {/* <AuthProvider> */}
        {/* Header - Visible on all pages */}

        <Header />

        {/* Application Content */}
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading…</div>}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Page><Hero /></Page>} /> {/* Landing Page */}
              <Route path="/create-trip" element={<Page><CreateTrip /></Page>} />{" "}
              {/* Create a Trip */}
              <Route path="/view_trip/:tripId" element={<Page><ViewTrip /></Page>} />{" "}
              {/* View Trip Details */}
              {/* Route to display the list of trips */}
              <Route path="/trips" element={<Page><Trips /></Page>} />
              {/* Route to display a specific trip's details */}
              {/* <Route path="/trips/:tripId" element={<TripDetail />} /> */}
              {/* <Route path="/explore" element={<ExploreGlobe />} /> */}
              <Route path="/explore" element={<Page><GoogleGlobe /></Page>} />
              <Route path="/landmark" element={<Page><LandmarkDetection /></Page>} /> {/* Landmark Detection */}
              <Route path="/hotel-booking" element={<Page><HotelBookingPayment /></Page>} /> {/* Hotel Booking & Payment */}
              <Route path="/map" element={<Page><MapComponent /></Page>} /> {/* Interactive Maps */}
              <Route path="/recommendations" element={<Page><RecommendationComponent /></Page>} /> {/* Recommendations Page */}
              <Route path="/explore" element={<Page><Explore /></Page>} /> {/* Explore Page */}
            </Routes>
          </Suspense>
        </AnimatePresence>
        {/* <FeedbackModal /> */}
        {/* </AuthProvider> */}
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
