import React, { useState,useEffect, useRef } from 'react';
import axios from 'axios';

const GoogleSignIn = ({ onSuccess, onError, role, onBegin }) => {
  const [currentUser,setCurrentUser] = useState({});
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
      console.log("response in google sign in", response);

      try {
        // Notify parent immediately to show loading overlay
        onBegin?.();
        const userRole = role || localStorage.getItem("role") || "Student";
        const res = await axios.post(
          'http://localhost:4000/api/auth/google',
          { idToken: response.credential, role: userRole },
          { withCredentials: true }
        );

        // Axios automatically parses JSON response
        const data = res.data;
        setCurrentUser(data.user);
        // Notify parent on success so it can handle role routing
        onSuccess?.(data.user);

      } catch (error) {
        console.error('Google Sign-In Error:', error);
        onError?.(
          error.response?.data?.message || 'Failed to sign in. Please try again.'
        );
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
  }, [onSuccess, onError, role, onBegin]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={googleButtonRef}></div>
    </div>
  );
};

export default GoogleSignIn;
