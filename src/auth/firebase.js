// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA76dLQTZ69G7Wl1fokXuz5dYPXno5UsJE",
  authDomain: "arogyahomeo-fc0ff.firebaseapp.com",
  projectId: "arogyahomeo-fc0ff",
  storageBucket: "arogyahomeo-fc0ff.firebasestorage.app",
  messagingSenderId: "126491644199",
  appId: "1:126491644199:web:58b2452a3fcf8eb4cf5902",
  measurementId: "G-498QMVKZ48",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Create auth FIRST
export const auth = getAuth(app);

// ✅ THEN set persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

export const db = getFirestore(app);