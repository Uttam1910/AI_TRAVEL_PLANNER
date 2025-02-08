
// Import necessary Firebase functions
import { initializeApp } from "firebase/app";  // Initializes the Firebase app
import { getFirestore, collection, addDoc } from "firebase/firestore";  // Imports Firestore functions for database interactions
import { doc, getDoc, setDoc  } from "firebase/firestore"; // Import Firestore functions

// Firebase configuration values loaded from environment variables (.env file)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  // API key for Firebase from the environment variable
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,  // Firebase Auth domain (useful for authentication)
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,  // Project ID to link to your Firebase project
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,  // Storage bucket URL for Firebase storage
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,  // Sender ID for Firebase Cloud Messaging
  appId: import.meta.env.VITE_FIREBASE_APP_ID,  // Unique app ID for your Firebase app
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,  // Measurement ID for Firebase Analytics
};

// Initialize Firebase with the provided configuration
const app = initializeApp(firebaseConfig);

// Initialize Firestore for database operations
const db = getFirestore(app);


export const saveTripDetails = async (tripData, tripId) => {
  try {
    // Retrieve user details from local storage (assumes the details are stored as a JSON string under the key "userDetail")
    const userDetailsStr = localStorage.getItem('googleProfile');
    if (userDetailsStr) {
      // Parse the JSON string to an object and add it to the trip data
      const userDetails = JSON.parse(userDetailsStr);
      tripData.userDetails = userDetails;
    } else {
      console.warn("No user details found in local storage.");
    }

    // Reference to the specific trip document using the tripId
    const tripDocRef = doc(db, "trips", tripId);
    // Save the trip data (now including user details) to Firestore with the specified tripId
    await setDoc(tripDocRef, tripData);
    console.log("Document written with ID: ", tripId);
    return tripId; // Return the tripId for further use
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e; // Re-throw the error for handling in the component
  }
};





// Function to fetch trip details by tripId
export const getTripDetails = async (tripId) => {
  try {
    // Reference to the specific trip document using the tripId
    const tripDocRef = doc(db, "trips", tripId);

    // Fetch the document
    const tripDocSnap = await getDoc(tripDocRef);

    // Check if the document exists
    if (tripDocSnap.exists()) {
      return tripDocSnap.data(); // Return the trip data
    } else {
      throw new Error("Trip not found"); // Throw an error if the trip doesn't exist
    }
  } catch (e) {
    console.error("Error fetching trip details: ", e);
    throw e; // Re-throw the error for handling in the component
  }
};

