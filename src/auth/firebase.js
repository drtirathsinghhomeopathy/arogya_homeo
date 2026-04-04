// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics"; // ✅ New: Analytics added

const firebaseConfig = {
  apiKey: "AIzaSyDxEQ4sZ2ZIdfDGqKvpQx3R3jvoGFg87cw",
  authDomain: "tirathsinghshomeopathicclinic.firebaseapp.com",
  projectId: "tirathsinghshomeopathicclinic",
  storageBucket: "tirathsinghshomeopathicclinic.appspot.com", // ✅ FIXED
  messagingSenderId: "353963010777",
  appId: "1:353963010777:web:2300f85ab6893808fdacc8",
  measurementId: "G-9BD726QYW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics
export const analytics = getAnalytics(app);

// Auth with persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

console.log("API KEY:", firebaseConfig.apiKey);

// Firestore
export const db = getFirestore(app);