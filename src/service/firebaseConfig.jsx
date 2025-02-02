
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

// Function to save trip details to Firestore
// export const saveTripDetails = async (tripData) => {
//   try {
//     // Reference to the 'trips' collection in Firestore database
//     const tripCollectionRef = collection(db, "trips");

//     // Add the trip data (tripData) to the Firestore 'trips' collection
//     const docRef = await addDoc(tripCollectionRef, tripData);

//     // Log the ID of the document that was added to the collection
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     // Log any errors that occur during the operation
//     console.error("Error adding document: ", e);
//   }
// };


export const saveTripDetails = async (tripData, tripId) => {
  try {
    // Reference to the specific trip document using the tripId
    const tripDocRef = doc(db, "trips", tripId);

    // Save the trip data to Firestore with the specified tripId
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

// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const tripsCollection = import.meta.env.VITE_FIRESTORE_TRIPS_COLLECTION || "trips";

// // Validate trip data before saving
// const validateTripData = (tripData) => {
//   const requiredFields = [
//     "destination",
//     "travelDates",
//     "tripCategory",
//     "tripDuration",
//     "budget",
//     "travelCompanion",
//     "tripPlan",
//   ];

//   for (const field of requiredFields) {
//     if (!tripData[field]) {
//       throw new Error(`Missing required field: ${field}`);
//     }
//   }
// };

// // Save trip details to Firestore
// export const saveTripDetails = async (tripData) => {
//   try {
//     validateTripData(tripData); // Validate trip data before saving

//     const tripDataWithTimestamp = {
//       ...tripData,
//       createdAt: serverTimestamp(), // Add server-side timestamp
//     };

//     const tripCollectionRef = collection(db, tripsCollection); // Use environment variable
//     const docRef = await addDoc(tripCollectionRef, tripDataWithTimestamp);
//     console.log("Document written with ID: ", docRef.id);
//     return docRef.id; // Return the document ID for further use
//   } catch (e) {
//     console.error("Error adding document: ", e);
//     throw e; // Re-throw the error for handling in the component
//   }
// };

// // Fetch trip details by tripId
// export const getTripDetails = async (tripId) => {
//   try {
//     const tripDocRef = doc(db, tripsCollection, tripId); // Use environment variable
//     const tripDocSnap = await getDoc(tripDocRef);

//     if (tripDocSnap.exists()) {
//       return tripDocSnap.data(); // Return the trip data
//     } else {
//       throw new Error("Trip not found"); // Throw an error if the trip doesn't exist
//     }
//   } catch (e) {
//     console.error("Error fetching trip details: ", e);
//     throw e; // Re-throw the error for handling in the component
//   }
// };