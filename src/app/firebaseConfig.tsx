
// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check"; // Updated import
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
let appCheckInitialized = false;

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
    // Prevent re-initialization on hot reloads in development
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    appInitialized = true;
    // console.log("Firebase initialized successfully."); // Optional: for debugging

    // Initialize App Check with ReCaptcha Enterprise
    const recaptchaEnterpriseSiteKey = process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY; // Use Enterprise key
    const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN; // For local testing

    if (app && recaptchaEnterpriseSiteKey) {
      // Set debug token if running locally and token is provided
      // IMPORTANT: Replace 'YOUR_DEBUG_TOKEN' with your actual debug token
      // or remove this block entirely for production builds.
       if (process.env.NODE_ENV !== 'production' && debugToken) {
          // @ts-ignore - self is defined in browser environment
          self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
          console.log("Using Firebase App Check debug token.");
       }


      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaEnterpriseSiteKey), // Use Enterprise provider
        // Optional: Set to true for automated token refresh. Default is true.
        isTokenAutoRefreshEnabled: true
      });
      appCheckInitialized = true;
      // console.log("Firebase App Check initialized successfully with ReCaptcha Enterprise."); // Optional
    } else if (!recaptchaEnterpriseSiteKey) {
        console.warn(
         "Firebase App Check initialization skipped: " +
         "NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY environment variable is missing. " + // Updated variable name
         "App Check protects your backend resources from abuse (e.g., Auth, Firestore). " +
         "It's recommended to configure it with a ReCaptcha Enterprise site key. See Firebase documentation."
       );
       appCheckInitialized = false;
    }

  } else {
    console.error(
      "Firebase configuration is incomplete. " +
      "Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set correctly in your .env file " +
      "and the development server is restarted."
    );
    appInitialized = false;
    appCheckInitialized = false;
  }
} catch (e) {
    console.error("Error initializing Firebase or App Check:", e);
    appInitialized = false;
    appCheckInitialized = false;
}

export { app, appInitialized, appCheckInitialized }; // Export appCheckInitialized status
