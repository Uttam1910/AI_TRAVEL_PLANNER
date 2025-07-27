// firebaseConfig.jsx

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ✅ Import full Firestore module to avoid tree-shaking issues
import * as firestore from "firebase/firestore";
const {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} = firestore;

// ✅ Log environment variables to confirm they are loading correctly
console.log("🔧 Firebase ENV Vars:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ✅ Defensive init: prevent re-initializing Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
console.log("✅ Firebase App initialized:", app.name);

// ✅ Auth and Firestore instances
const auth = getAuth(app);
let db;
try {
  db = getFirestore(app);
  console.log("✅ Firestore initialized");
} catch (error) {
  console.error("❌ Failed to initialize Firestore:", error);
}

export { auth, db };

// ===================== Utility Functions ========================= //

export const saveTripDetails = async (tripData, tripId) => {
  try {
    const userDetailsStr = localStorage.getItem("googleProfile");
    if (userDetailsStr) {
      const userDetails = JSON.parse(userDetailsStr);
      tripData.userDetails = userDetails;
    } else {
      console.warn("⚠️ No user details found in local storage.");
    }

    const tripDocRef = doc(db, "trips", tripId);
    await setDoc(tripDocRef, tripData);
    console.log("✅ Trip saved with ID:", tripId);
    return tripId;
  } catch (e) {
    console.error("❌ Error adding trip:", e);
    throw e;
  }
};

export const getTripDetails = async (tripId) => {
  try {
    const tripDocRef = doc(db, "trips", tripId);
    const tripDocSnap = await getDoc(tripDocRef);

    if (tripDocSnap.exists()) {
      console.log("✅ Trip fetched:", tripDocSnap.data());
      return tripDocSnap.data();
    } else {
      console.warn("⚠️ Trip not found for ID:", tripId);
      throw new Error("Trip not found");
    }
  } catch (e) {
    console.error("❌ Error fetching trip details:", e);
    throw e;
  }
};

export const getUserTrips = async (userId) => {
  try {
    const tripsRef = collection(db, "trips");
    const q = query(tripsRef, where("userDetails.id", "==", userId));
    const querySnapshot = await getDocs(q);

    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ ${trips.length} trips found for user ${userId}`);
    return trips;
  } catch (error) {
    console.error("❌ Error fetching user trips:", error);
    throw error;
  }
};

export const saveFeedback = async (feedback) => {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) throw new Error("Server error");
    console.log("✅ Feedback saved to server");
    return await response.json();
  } catch (error) {
    const localId = `local-${Date.now()}`;
    localStorage.setItem(
      `feedback-${feedback.tripId}-${localId}`,
      JSON.stringify(feedback)
    );
    console.warn("⚠️ Feedback saved locally:", localId);
    return { id: localId, local: true };
  }
};
