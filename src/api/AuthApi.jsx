import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../auth/firebase";
import { ROLES } from "../constants/roles";

// Define admin emails here
const ADMIN_EMAILS = ["admin@example.com"]; // add your admin emails

const AuthApi = {
  // Register new user (email/password)
  registerUser: async (email, password, role = ROLES.USER) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, {
      email: user.email,
      role,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: new Date(),
    });

    return { uid: user.uid, email: user.email, role };
  },

  // Login existing user (email/password)
  loginUser: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // create default doc
      await setDoc(docRef, {
        email: user.email,
        role: ROLES.USER,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
      });

      return { uid: user.uid, email: user.email, role: ROLES.USER };
    }

    const data = docSnap.data();
    return {
      uid: user.uid,
      email: user.email,
      role: data.role,
      displayName: data.displayName || "",
      photoURL: data.photoURL || "",
    };
  },

  // Login with Google
  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Assign role based on email
      const role = ADMIN_EMAILS.includes(user.email) ? ROLES.ADMIN : ROLES.USER;

      await setDoc(docRef, {
        email: user.email,
        role,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
      });

      return { uid: user.uid, email: user.email, role, displayName: user.displayName || "", photoURL: user.photoURL || "" };
    }

    const data = docSnap.data();
    return {
      uid: user.uid,
      email: user.email,
      role: data.role,
      displayName: data.displayName || "",
      photoURL: data.photoURL || "",
    };
  },

  // Logout
  logout: async () => {
    await signOut(auth);
  },
};

export default AuthApi;