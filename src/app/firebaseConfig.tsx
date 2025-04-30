
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
  console.log("Attempting to initialize Firebase...");
  // Basic check for essential config keys
   const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
   const missingKeys = requiredKeys.filter(key => !(firebaseConfig as any)[key]);

  if (missingKeys.length > 0) {
      console.error(
          `Firebase configuration is incomplete. Missing or empty essential environment variables: ${missingKeys.map(k => `NEXT_PUBLIC_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`).join(', ')}. Please check your .env file.`
      );
      appInitialized = false;
      appCheckInitialized = false;
  } else {
    // Prevent re-initialization on hot reloads in development
    if (!getApps().length) {
        console.log("Initializing new Firebase app instance.");
        app = initializeApp(firebaseConfig);
    } else {
        console.log("Using existing Firebase app instance.");
        app = getApps()[0];
    }
    appInitialized = true;
    console.log("Firebase core app initialized successfully.");

    // Initialize App Check with ReCaptcha Enterprise
    const recaptchaEnterpriseSiteKey = process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY;
    const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;

    if (app && recaptchaEnterpriseSiteKey) {
        console.log("Attempting to initialize Firebase App Check with ReCaptcha Enterprise...");
        console.log(`Using ReCAPTCHA Enterprise Site Key: ${recaptchaEnterpriseSiteKey ? 'Provided' : 'MISSING'}`);

        // Set debug token if running locally and token is provided
        // IMPORTANT: Ensure the debug token is correctly generated and not expired.
        // You can generate one in the Firebase Console -> App Check -> Your App -> Manage debug tokens.
       if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production' && debugToken) {
           console.log("Setting Firebase App Check debug token for local development:", debugToken);
           // @ts-ignore - self is defined in browser environment
           (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
       } else if (process.env.NODE_ENV !== 'production') {
           console.log("Firebase App Check debug token not provided or not in development environment. App Check will rely on ReCaptcha Enterprise.");
       }

      try {
          const provider = new ReCaptchaEnterpriseProvider(recaptchaEnterpriseSiteKey);
          console.log("ReCaptchaEnterpriseProvider instance created.");

          initializeAppCheck(app, {
            provider: provider,
            // Optional: Set to true for automated token refresh. Default is true.
            isTokenAutoRefreshEnabled: true
          });

          appCheckInitialized = true;
          console.log("Firebase App Check initialized successfully with ReCaptcha Enterprise provider.");
      } catch (appCheckError) {
            console.error("Firebase App Check initialization failed:", appCheckError);
            appCheckInitialized = false; // Ensure state reflects failure
             // Provide more specific guidance based on common errors
            if (appCheckError instanceof Error && appCheckError.message.includes('reCAPTCHA error')) {
                console.error("Hint: This 'reCAPTCHA error' might be due to an invalid site key, unauthorized domain in Google Cloud Console, or incorrect App Check setup in Firebase.");
            }
      }

    } else if (!app) {
        console.error("Firebase App Check initialization skipped: Firebase app instance is not available.");
        appCheckInitialized = false;
    } else if (!recaptchaEnterpriseSiteKey) {
        console.warn(
         "Firebase App Check initialization skipped: " +
         "NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY environment variable is missing. " +
         "App Check protects your backend resources from abuse. " +
         "It's strongly recommended to configure it with a ReCaptcha Enterprise site key."
       );
       appCheckInitialized = false;
    }

  }
} catch (e) {
    console.error("Critical error during Firebase or App Check initialization:", e);
    appInitialized = false;
    appCheckInitialized = false;
}

console.log(`Initialization Status - Firebase Core: ${appInitialized}, App Check: ${appCheckInitialized}`);

export { app, appInitialized, appCheckInitialized }; // Export appCheckInitialized status
