import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

const GoogleSignIn = ({ onSuccess, onError }) => {
  const { setCurrentUser } = useApp();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          }
        );
      }
    };

    const handleCredentialResponse = async (response) => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('token', data.token);
          setCurrentUser(data.user);
          onSuccess?.(data.user);
        } else {
          onError?.(data.message);
        }
      } catch (error) {
        console.error('Google Sign-In Error:', error);
        onError?.('Failed to sign in. Please try again.');
      }
    };

    // Initialize when Google script loads
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);
    }
  }, [setCurrentUser, onSuccess, onError]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={googleButtonRef}></div>
    </div>
  );
};

export default GoogleSignIn;
