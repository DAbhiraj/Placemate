import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import GoogleSignIn from '../components/Auth/GoogleSignIn';
import ProfileSetupModal from '../components/Auth/ProfileSetupModal';
import OnboardingComponent from '../components/Auth/OnboardingModal';
import axios from "axios";

const API_URL = "http://localhost:4000/api";

const Login = () => {
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const handleGoogleSignIn = (user) => {
    setCurrentUser(user.user);
    setIsAuthenticated(true);

    const shouldShowOnboarding = !user.profile_completed;
    const shouldShowProfileSetup = !user.branch || !user.cgpa;

    console.log(shouldShowOnboarding, shouldShowProfileSetup);

    setShowOnboarding(shouldShowOnboarding);
    setShowProfileSetup(shouldShowProfileSetup);

    // Redirect only if profile setup is NOT needed
    if (!shouldShowProfileSetup) {
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleSuccess = (user) => {
    console.log("user in login page", user);

    // Store credentials in localStorage
    localStorage.setItem('id', user.id);
    localStorage.setItem('name', user.name);
    localStorage.setItem('email', user.email);
    localStorage.setItem('branch', user.branch);
    localStorage.setItem('cgpa', user.cgpa);
    localStorage.setItem('role', user.role);

    handleGoogleSignIn(user);
  };

  const handleGoogleError = (errorMessage) => {
    console.log(errorMessage);
    setError(errorMessage);
  };

  const handleLogin = () =>{
    window.location.href = "/adminlogin"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">NIT Warangal</h1>
            <p className="text-gray-600">Career & Placement Portal</p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your career portal</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <GoogleSignIn 
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            <div className="text-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Modals */}
      {console.log(showProfileSetup, currentUser)}
      {showProfileSetup && localStorage.getItem("id") && (
        <ProfileSetupModal
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
    />
      )}

      {showOnboarding && <OnboardingComponent />}
      <div>
        <button onClick={handleLogin}>
          Sign in as Admin
        </button>
      </div>
    </div>
  );
};

export default Login;
