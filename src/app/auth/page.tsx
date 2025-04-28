'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail, // Import the function for password reset
  // createUserWithEmailAndPassword, // Keep import for potential future use, but functionality disabled
} from 'firebase/auth';
import {app, appInitialized} from '../firebaseConfig';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Icons } from "@/components/icons"; // Import Icons for Alert

let auth;
if (appInitialized){
    auth = getAuth(app);
}

// Sign up function remains for potential future re-enablement, but is not called from UI
// export const signUp = async (email: string, password: string): Promise<void> => {
//   if (auth) {
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//     } catch (error: any) {
//       console.error("Signup error:", error.message, error.code);
//       throw error;
//     }
//   } else {
//     console.error("Firebase not initialized. Cannot sign up.");
//     throw new Error("Firebase not initialized");
//   }
// };

export const signIn = async (email: string, password: string): Promise<void> => {
  if (auth) {
     try {
       await signInWithEmailAndPassword(auth, email, password);
     } catch (error: any) {
       // Error is caught and handled in handleSubmit, logging here might be redundant
       // console.error("Signin error:", error.message, error.code);
       throw error; // Re-throw the error to be handled by the calling function (handleSubmit)
     }
  } else {
    console.error("Firebase not initialized. Cannot sign in.");
    throw new Error("Firebase not initialized");
  }
};

// Function to handle sending password reset email
export const forgotPassword = async (email: string): Promise<void> => {
    if (auth) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.error("Password reset error:", error.message, error.code);
            throw error; // Re-throw to be handled by the UI
        }
    } else {
        console.error("Firebase not initialized. Cannot send password reset email.");
        throw new Error("Firebase not initialized");
    }
};


type AuthPageProps = {};

const AuthPage = ({}: AuthPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [isSignUp, setIsSignUp] = useState(false); // Removed isSignUp state
  const [isForgotPassword, setIsForgotPassword] = useState(false); // State for forgot password mode
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success messages
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!appInitialized){
      setError("Firebase could not be initialized. Check your environment variables and try again.");
      setLoading(false);
      return;
    }

    try {
      await signIn(email, password);
      router.push('/'); // Redirect to home page after successful login
    } catch (err: any) {
      const errorCode = err.code || 'auth/error';
      // Removed signup-specific error handling (email-already-in-use)
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential' || errorCode === 'auth/invalid-email') {
        setError('Invalid credentials. Please check your email and password or reset your password.');
      } else {
        setError('An error occurred during login. Please try again.');
        console.error("Unhandled Auth Error:", err); // Log unexpected errors
      }
    } finally {
       setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (event: React.FormEvent) => {
     event.preventDefault();
     setError(null);
     setSuccessMessage(null);
     setLoading(true);

     if (!appInitialized) {
         setError("Firebase could not be initialized. Check your environment variables and try again.");
         setLoading(false);
         return;
     }

     try {
         await forgotPassword(email);
         setSuccessMessage(`Password reset email sent to ${email}. Please check your inbox (and spam folder).`);
         // Optionally clear email field or redirect/change view after success
         // setEmail(''); // Clear email field
         // setIsForgotPassword(false); // Go back to login view
     } catch (err: any) {
          const errorCode = err.code || 'auth/error';
         // Check if the email is not registered or invalid format
         if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-email') {
             // Provide a specific message asking the user to check the email
            setError('Email address not found or is invalid. Please enter a registered email address.');
         } else {
            setError('An error occurred sending the password reset email. Please try again.');
            console.error("Password Reset Error:", err);
         }
     } finally {
         setLoading(false);
     }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40"> {/* Use min-h-screen and some background */}
      <div className="bg-card text-card-foreground p-8 rounded-lg shadow-lg w-full max-w-md border"> {/* Increased shadow and max-width */}

        {/* Conditionally render Login or Forgot Password form */}
        {!isForgotPassword ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
             {error && (
               <Alert variant="destructive" className="mb-4">
                 <Icons.alertCircle className="h-4 w-4" />
                 <AlertTitle>Login Error</AlertTitle>
                 <AlertDescription suppressHydrationWarning={true}>{error}</AlertDescription>
               </Alert>
             )}
             {successMessage && ( // Show success message if any (e.g., after password reset redirect)
                 <Alert variant="default" className="mb-4 bg-green-100 border-green-300 text-green-800">
                   <Icons.check className="h-4 w-4" />
                   <AlertTitle>Success</AlertTitle>
                   <AlertDescription suppressHydrationWarning={true}>{successMessage}</AlertDescription>
                 </Alert>
             )}
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="email-login">
                  Email
                </label>
                <Input
                  className="shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-ring"
                  id="email-login"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  suppressHydrationWarning={true}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" htmlFor="password-login">
                  Password
                </label>
                <Input
                  className="shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-ring"
                  id="password-login"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  suppressHydrationWarning={true}
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <Button
                  className="w-full"
                  type="submit"
                  disabled={loading}
                  suppressHydrationWarning={true}
                >
                  {loading ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : <Icons.login className="mr-2 h-4 w-4" />} {/* Add login icon */}
                  Login
                </Button>

              </div>
              <div className="text-center">
                 <Button
                    type="button"
                    variant="link"
                    onClick={() => { setIsForgotPassword(true); setError(null); setSuccessMessage(null); setPassword(''); }} // Reset password field when switching
                    className="text-sm"
                    disabled={loading}
                    suppressHydrationWarning={true}
                  >
                    Forgot Password?
                  </Button>
               </div>
               {/* Removed the toggle button for Sign Up */}
               {/* <div className="mt-4 text-center">
                 <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm"
                    suppressHydrationWarning={true}
                  >
                    {isSignUp ? 'Already have an account? Login' : 'Create an Account'}
                  </Button>
               </div> */}
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
            <p className="text-sm text-muted-foreground mb-4 text-center">Enter your registered email address below and we'll send you a link to reset your password.</p>
             {error && (
                 <Alert variant="destructive" className="mb-4">
                    <Icons.alertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription suppressHydrationWarning={true}>{error}</AlertDescription>
                 </Alert>
             )}
             {successMessage && (
                 <Alert variant="default" className="mb-4 bg-green-100 border-green-300 text-green-800">
                     <Icons.check className="h-4 w-4" />
                     <AlertTitle>Success</AlertTitle>
                     <AlertDescription suppressHydrationWarning={true}>{successMessage}</AlertDescription>
                 </Alert>
             )}
            <form onSubmit={handleForgotPasswordSubmit}>
               <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="email-forgot">
                  Email
                </label>
                <Input
                  className="shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-ring"
                  id="email-forgot"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  suppressHydrationWarning={true}
                />
              </div>
               <div className="flex items-center justify-between mb-4">
                 <Button
                    className="w-full"
                    type="submit"
                    disabled={loading}
                    suppressHydrationWarning={true}
                 >
                    {loading ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : <Icons.mail className="mr-2 h-4 w-4" />} {/* Mail icon */}
                    Send Reset Link
                 </Button>
              </div>
              <div className="text-center">
                 <Button
                    type="button"
                    variant="link"
                    onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMessage(null); }}
                    className="text-sm"
                    disabled={loading}
                    suppressHydrationWarning={true}
                  >
                    Back to Login
                  </Button>
               </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default AuthPage;
