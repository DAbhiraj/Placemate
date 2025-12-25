import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LinkedInCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({ error }, window.location.origin);
        window.close();
      } else {
        navigate('/');
      }
      return;
    }

    if (code && state) {
      // Send code to parent window
      if (window.opener) {
        window.opener.postMessage({ code, state }, window.location.origin);
        window.close();
      } else {
        // If not in popup, redirect to login
        navigate('/');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing LinkedIn authentication...</p>
      </div>
    </div>
  );
};

export default LinkedInCallback;
