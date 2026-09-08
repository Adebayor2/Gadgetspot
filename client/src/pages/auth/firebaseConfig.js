
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const requiredFirebaseConfig = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN,
  VITE_PROJECT_ID: import.meta.env.VITE_PROJECT_ID,
  VITE_STORAGE_BUCKET: import.meta.env.VITE_STORAGE_BUCKET,
  VITE_MESSAGING_SENDER_ID: import.meta.env.VITE_MESSAGING_SENDER_ID,
  VITE_APP_ID: import.meta.env.VITE_APP_ID,
};

const missingFirebaseConfig = Object.entries(requiredFirebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingFirebaseConfig.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingFirebaseConfig.join(', ')}`);
}

const firebaseConfig = {
  apiKey: requiredFirebaseConfig.VITE_FIREBASE_API_KEY,
  authDomain: requiredFirebaseConfig.VITE_AUTH_DOMAIN,
  projectId: requiredFirebaseConfig.VITE_PROJECT_ID,
  storageBucket: requiredFirebaseConfig.VITE_STORAGE_BUCKET,
  messagingSenderId: requiredFirebaseConfig.VITE_MESSAGING_SENDER_ID,
  appId: requiredFirebaseConfig.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

