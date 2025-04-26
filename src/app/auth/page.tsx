'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {app, appInitialized} from '../firebaseConfig';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

let auth;
if (appInitialized){
    auth = getAuth(app);
}

export const signUp = async (email: string, password: string): Promise<void> => {
  if (auth) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Signup error:", error.message, error.code);
      throw error;
    }
  } else {
    console.error("Firebase not initialized. Cannot sign up.");
    throw new Error("Firebase not initialized");
  }
};

export const signIn = async (email: string, password: string): Promise<void> => {
  if (auth) {
     try {
       await signInWithEmailAndPassword(auth, email, password);
     } catch (error: any) {
       console.error("Signin error:", error.message, error.code);
       throw error;
     }
  } else {
    console.error("Firebase not initialized. Cannot sign in.");
    throw new Error("Firebase not initialized");
  }
};

type AuthPageProps = {};

const AuthPage = ({}: AuthPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!appInitialized){
      setError("Firebase could not be initialized. Check your environment variables and try again.");
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.push('/'); // Redirect to home page after successful login/signup
    } catch (err: any) {
      const errorCode = err.code || 'auth/error';
      if (errorCode === 'auth/email-already-in-use') {
        setError('Email already in use. Please sign in instead.');
      } else if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        setError('Invalid credentials');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-card text-card-foreground p-8 rounded-lg shadow-md w-96 border">
        <h2 className="text-2xl font-bold mb-6 text-center">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        {error && (
          <div
            className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded relative mb-4"
            role="alert"
            suppressHydrationWarning={true}
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <Input
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-ring"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              suppressHydrationWarning={true}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <Input
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-ring"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              suppressHydrationWarning={true}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              className="w-full"
              type="submit"
              suppressHydrationWarning={true}
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>

          </div>
           <div className="mt-4 text-center">
             <Button
                type="button"
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
                suppressHydrationWarning={true}
              >
                {isSignUp ? 'Already have an account? Login' : 'Create an Account'}
              </Button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
