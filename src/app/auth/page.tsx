'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {app, appInitialized} from '../firebaseConfig';

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

    try {
      if (!appInitialized){
        setError("Firebase could not be initialized.  Check your environment variables and try again.");
        return;
      }
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      const errorCode = err.code || 'auth/error';
      if (errorCode === 'auth/email-already-in-use') {
        setError('Email already in use. Please sign in instead.');
      } else if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
        setError('Invalid credentials');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
            <button
              type="button"
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Login' : 'Create an Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
