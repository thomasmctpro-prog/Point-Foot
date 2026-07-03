import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// getAuth() throws immediately if the config is incomplete, so only initialize
// once real Firebase credentials are set — otherwise the whole module tree
// (App -> Layout/Login/AuthContext) fails to import and the app renders blank.
export const auth = (isFirebaseConfigured ? getAuth(initializeApp(firebaseConfig)) : null) as Auth;
export const googleProvider = new GoogleAuthProvider();
