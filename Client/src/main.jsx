import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { Toaster } from "@/components/ui/sonner"
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./firebaseConfig"; // Import Firebase configuration first
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
    <BrowserRouter>
    <Toaster />
      <App />
    </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
