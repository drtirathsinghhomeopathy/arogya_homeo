// src/App.js
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./auth/firebase";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 🔐 fetch role from Firestore
      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: snap.exists() ? snap.data().role : "USER",
      });

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="p-4">Loading…</div>;
  }

  return <AppRoutes user={user} />;
}