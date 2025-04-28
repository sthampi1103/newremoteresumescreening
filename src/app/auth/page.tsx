'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RecaptchaVerifier,
  getAuth,
  signInWithEmailAndPassword, // Import Firebase sign-in function
  sendPasswordResetEmail, // Import Firebase password reset function
  PhoneAuthProvider,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { app, appInitialized } from '../firebaseConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

// Initialize auth only if app is initialized
const auth = appInitialized ? getAuth(app) : null;

type AuthPageProps = {};

const AuthPage = ({}: AuthPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false); // State for forgot password mode
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success messages
  const [loading, setLoading] = useState(false); // Loading state

  // 2FA states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<any>(null); // Type this properly

  const router = useRouter();

  const generateRecaptcha = () => {
    // @ts-expect-error
    window.recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      },
      auth
    );
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!appInitialized || !auth) {
      setError(
        'Firebase could not be initialized. Check your environment variables and try again.'
      );
      setLoading(false);
      return;
    }

    if (!confirmationResult) {
      setError('Verification process failed. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const result = await confirmationResult.confirm(verificationCode);
      router.push('/'); // Redirect after 2FA success
    } catch (err: any) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!appInitialized || !auth) {
      setError(
        'Firebase could not be initialized. Check your environment variables and try again.'
      );
      setLoading(false);
      return;
    }

    generateRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmationResult);
      setIs2FAEnabled(true); // Move to verification code state
    } catch (err: any) {
      setError(err.message || 'Error sending verification code.');
    } finally {
      setLoading(false);
      window.recaptchaVerifier.reset();
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!appInitialized || !auth) {
      // Check both appInitialized and auth instance
      setError(
        'Firebase could not be initialized. Check your environment variables and try again.'
      );
      setLoading(false);
      return;
    }

    try {
      // Use the imported Firebase function directly
      await signInWithEmailAndPassword(auth, email, password);
      // After successful login, check if 2FA is enabled for user
      // If enabled, redirect to 2FA verification
      // For now, assuming 2FA is always required.
      setIs2FAEnabled(true);
    } catch (err: any) {
      const errorCode = err.code || 'auth/error';
      if (
        errorCode === 'auth/wrong-password' ||
        errorCode === 'auth/user-not-found' ||
        errorCode === 'auth/invalid-credential' ||
        errorCode === 'auth/invalid-email'
      ) {
        setError(
          'Invalid credentials. Please check your email and password or reset your password.'
        );
      } else {
        setError(`An error occurred during login: ${errorCode}. Please try again.`); // Show error code
        console.error('Unhandled Auth Error:', err); // Log unexpected errors
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

    if (!appInitialized || !auth) {
      // Check both appInitialized and auth instance
      setError(
        'Firebase could not be initialized. Check your environment variables and try again.'
      );
      setLoading(false);
      return;
    }

    try {
      // Use the imported Firebase function directly
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        `Password reset email sent to ${email}. Please check your inbox (and spam folder).`
      );
    } catch (err: any) {
      const errorCode = err.code || 'auth/error';
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-email') {
        setError(
          'Email address not found or is invalid. Please enter a registered email address.'
        );
      } else {
        setError(
          `An error occurred sending the password reset email: ${errorCode}. Please try again.`
        ); // Show error code
        console.error('Password Reset Error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40">
      {' '}
      {/* Use min-h-screen and some background */}
      <div className="bg-card text-card-foreground p-8 rounded-lg shadow-lg w-full max-w-md border">
        {' '}
        {/* Increased shadow and max-width */}
        {/* Conditionally render Login or Forgot Password or 2FA form */}
        {!isForgotPassword ? (
          !is2FAEnabled ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <Icons.alertCircle className="h-4 w-4" />
                  <AlertTitle>Login Error</AlertTitle>
                  <AlertDescription suppressHydrationWarning={true}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {successMessage && (
                // Show success message if any (e.g., after password reset redirect)
                <Alert
                  variant="default"
                  className="mb-4 bg-green-100 border-green-300 text-green-800"
                >
                  <Icons.check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription suppressHydrationWarning={true}>
                    {successMessage}
                  </AlertDescription>
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    suppressHydrationWarning={true}
                  />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={loading || !auth} // Disable if loading or auth not ready
                    suppressHydrationWarning={true}
                  >
                    {loading ? (
                      <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.login className="mr-2 h-4 w-4" />
                    )}{' '}
                    {/* Add login icon */}
                    Login
                  </Button>
                </div>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccessMessage(null);
                      setPassword('');
                    }} // Reset password field when switching
                    className="text-sm"
                    disabled={loading}
                    suppressHydrationWarning={true}
                  >
                    Forgot Password?
                  </Button>
                </div>
                {/* Removed the toggle button for Sign Up */}
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">2FA Verification</h2>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <Icons.alertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Error</AlertTitle>
                  <AlertDescription suppressHydrationWarning={true}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handle2FASubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" htmlFor="phone-number">
                    Phone Number
                  </label>
                  <Input
                    className="shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-ring"
                    id="phone-number"
                    type="tel"
                    placeholder="+1XXXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={confirmationResult !== null || loading}
                    suppressHydrationWarning={true}
                  />
                </div>

                {confirmationResult === null && (
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      className="w-full"
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={loading || !auth}
                      suppressHydrationWarning={true}
                    >
                      {loading ? (
                        <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Icons.messageSquare className="mr-2 h-4 w-4" />
                      )}{' '}
                      {/* Updated text */}
                      Send Verification Code
                    </Button>
                  </div>
                )}

                {confirmationResult !== null && (
                  <>
                    <div className="mb-6">
                      <label
                        className="block text-sm font-medium mb-2"
                        htmlFor="verification-code"
                      >
                        Verification Code
                      </label>
                      <Input
                        className="shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-ring"
                        id="verification-code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
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
                        {loading ? (
                          <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Icons.check className="mr-2 h-4 w-4" />
                        )}{' '}
                        {/* Updated text */}
                        Verify Code
                      </Button>
                    </div>
                  </>
                )}
                <div id="recaptcha-container"></div>
              </form>
            </>
          )
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Enter your registered email address below and we'll send you a link to reset
              your password.
            </p>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Icons.alertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription suppressHydrationWarning={true}>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert
                variant="default"
                className="mb-4 bg-green-100 border-green-300 text-green-800"
              >
                <Icons.check className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription suppressHydrationWarning={true}>
                  {successMessage}
                </AlertDescription>
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  suppressHydrationWarning={true}
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <Button
                  className="w-full"
                  type="submit"
                  disabled={loading || !auth} // Disable if loading or auth not ready
                  suppressHydrationWarning={true}
                >
                  {loading ? (
                    <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.mail className="mr-2 h-4 w-4" />
                  )}{' '}
                  {/* Mail icon */}
                  Send Reset Link
                </Button>
              </div>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
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
