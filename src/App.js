// src/App.jsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./auth/firebase";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: snap.exists() ? snap.data().role : "USER",
      });

      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <>
      {user && <Navbar user={user} />}
      <AppRoutes user={user} />
    </>
  );
}