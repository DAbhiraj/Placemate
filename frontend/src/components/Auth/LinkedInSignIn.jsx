import React, { useState } from 'react';
import { Linkedin } from 'lucide-react';
import axios from 'axios';

const LinkedInSignIn = ({ onSuccess, onError, onBegin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkedInLogin = () => {
    setIsLoading(true);
    onBegin?.();
    
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_LINKEDIN_REDIRECT_URI || 'http://localhost:5173/auth/linkedin/callback');
    const state = Math.random().toString(36).substring(7);
    const scope = encodeURIComponent('openid profile email');
    
    // Store state for verification
    localStorage.setItem('linkedin_oauth_state', state);
    
    // LinkedIn OAuth URL
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    
    // Open LinkedIn OAuth in a popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      linkedInAuthUrl,
      'LinkedIn Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for the OAuth callback
    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        setIsLoading(false);
      }
    }, 1000);

    // Listen for message from popup
    window.addEventListener('message', handleOAuthCallback);
  };

  const handleOAuthCallback = async (event) => {
    // Verify origin for security
    if (event.origin !== window.location.origin) return;

    const { code, state } = event.data;
    
    if (!code) {
      setIsLoading(false);
      return;
    }

    // Verify state
    const savedState = localStorage.getItem('linkedin_oauth_state');
    if (state !== savedState) {
      onError?.('Invalid state parameter. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      // Send code to backend
      const res = await axios.post(
        'http://localhost:4000/api/auth/linkedin',
        { code }
      );

      const data = res.data;
      localStorage.setItem('token', data.token);
      onSuccess?.(data.user);
    } catch (error) {
      console.error('LinkedIn Sign-In Error:', error);
      onError?.(
        error.response?.data?.message || 'Failed to sign in with LinkedIn. Please try again.'
      );
    } finally {
      setIsLoading(false);
      // Parent can clear its own overlay in its success/error handlers
      localStorage.removeItem('linkedin_oauth_state');
    }
  };

  return (
    <button
      onClick={handleLinkedInLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      <Linkedin className="w-5 h-5" />
      {isLoading ? 'Connecting...' : 'Sign in with LinkedIn'}
    </button>
  );
};

export default LinkedInSignIn;
