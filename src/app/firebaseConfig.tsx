
// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Analytics can be added if needed

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let appInitialized = false;

try {
  const requiredConfigValues = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.storageBucket,
    firebaseConfig.messagingSenderId,
    firebaseConfig.appId,
    // measurementId is optional, so not checked here
  ];

  const isConfigComplete = requiredConfigValues.every(value => value && value.trim() !== '');

  if (isConfigComplete) {
    app = initializeApp(firebaseConfig);
    appInitialized = true;
    // console.log("Firebase initialized successfully."); // Optional: for debugging
  } else {
    console.error(
      "Firebase configuration is incomplete. " +
      "Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set correctly in your .env file " +
      "and the development server is restarted."
    );
    appInitialized = false;
  }
} catch (e) {
    console.error("Error initializing Firebase:", e);
    appInitialized = false;
}

export { app, appInitialized };
