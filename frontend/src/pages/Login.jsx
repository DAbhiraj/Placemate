import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
// images from public folder used below
import GoogleSignIn from '../components/Auth/GoogleSignIn';
import LinkedInSignIn from '../components/Auth/LinkedInSignIn';
import ProfileSetupModal from '../components/Auth/ProfileSetupModal';
import ProfileSetupLoader from '../components/Auth/ProfileSetupLoader';
import OnboardingComponent from '../components/Auth/OnboardingModal';
import { setUser } from '../store/slices/userSlice';

const API_URL = "http://localhost:4000/api";

const Login = () => {
  const dispatch = useDispatch();

  // UI + Auth State
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showProfileSetupLoader, setShowProfileSetupLoader] = useState(false);

  // Modal state for Student Google sign-in
  const [showStudentGoogleModal, setShowStudentGoogleModal] = useState(false);
  const [showRecruiterGoogleModal, setShowRecruiterGoogleModal] = useState(false);

  const handleGoogleSignIn = (user) => {

    setIsAuthenticated(true);
   
    const role = localStorage.getItem('role');
    if(role==='student'){
      const needOnboarding = !user.profile_completed;
      const needProfileSetup = !user.branch || !user.cgpa;

      setShowOnboarding(needOnboarding);

      if (needProfileSetup) {
        setShowProfileSetupLoader(true);
        setTimeout(() => {
          setShowProfileSetup(true);
          setShowProfileSetupLoader(false);
        }, 900);
      } else {
        window.location.href = "/dashboard";
      }
    }else if(role==='recruiter'){

      if(user.is_verified){
        localStorage.setItem("company",user.company);
        window.location.href = "/recruiter/viewjobs";
      }else{
        window.location.href = "/recruiter/verification";
      }
    }
    else if(role==='spoc'){
      window.location.href = "/spoc/assignedjobs";
    }else if(role==='admin'){
      window.location.href = "/admin";
    }
  };

  const handleGoogleSuccess = (user) => {
    console.log("Google User:", user);

    dispatch(setUser({
      u_id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      cgpa: user.cgpa,
      role: user.role,
      token: user.token,
    }));

    // Persist
    localStorage.setItem('id', user.id);
    localStorage.setItem('name', user.name);
    localStorage.setItem('email', user.email);
    localStorage.setItem('branch', user.branch);
    localStorage.setItem('cgpa', user.cgpa);
    localStorage.setItem('role', user.role);

    handleGoogleSignIn(user);
  };

  const handleGoogleError = (msg) => {
    console.log(msg);
    setError(msg);
  };

  const handleAdminLogin = () => {
    window.location.href = "/adminlogin";
  };

  const handleStaffLogin = () => {
    // Staff uses normal signin page
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-start justify-center p-8">

      <div className="w-full max-w-6xl">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 mb-8 text-center">
          <div className="flex items-center justify-center space-x-4 flex-col">
            <img src="/NIT.png" alt="NIT logo" className="w-28 h-auto mb-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CCPD</h1>
              <p className="text-gray-600">Centre for Career Planning and Development</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Sign in as</h2>
            <p className="text-gray-600">Choose your role to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Student (opens Google sign-in modal) */}
            <div
              role="button"
              onClick={() => setShowStudentGoogleModal(true)}
              className="cursor-pointer p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden">
                    <img src="profile/student.png" alt="student" className="w-full h-full object-contain" />
                  </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Student</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">Sign in with Google</p>
            </div>

            {/* Recruiter (placeholder) */}
            <div role="button"
              onClick={() => setShowRecruiterGoogleModal(true)}
              className="cursor-pointer p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden">
                  <img src="profile/recruiter.png" alt="recruiter" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Recruiter</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">Recruiter portal</p>
            </div>

            {/* Coordinator (placeholder) */}
            <div role="button"
              onClick={() => setShowRecruiterGoogleModal(true)}
              className="cursor-pointer p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden">
                  <img src="profile/coordinator.png" alt="coordinator" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Coordinator</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">Coordinator portal</p>
            </div>

            {/* Staff (normal signin) */}
            <div
              role="button"
              onClick={handleStaffLogin}
              className="cursor-pointer p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden">
                  <img src="profile/staff.png" alt="staff" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Staff</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">Staff / Office login</p>
            </div>
          </div>

          {/* Student Google modal — rendered when user clicks Student */}
          {showStudentGoogleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Student Sign in</h3>
                  <button onClick={() => setShowStudentGoogleModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Sign in with your student Google account</p>
                <div className="flex justify-center">
                  <GoogleSignIn onSuccess={(user) => { setShowStudentGoogleModal(false); handleGoogleSuccess(user); }} onError={handleGoogleError} />
                </div>
              </div>
            </div>
          )}

          {showRecruiterGoogleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recruiter Sign in</h3>
                  <button onClick={() => setShowRecruiterGoogleModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Choose your preferred sign-in method</p>
                <div className="flex flex-col gap-3">
                  <GoogleSignIn onSuccess={(user) => { setShowRecruiterGoogleModal(false); handleGoogleSuccess(user); }} onError={handleGoogleError} />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  <LinkedInSignIn onSuccess={(user) => { setShowRecruiterGoogleModal(false); handleGoogleSuccess(user); }} onError={handleGoogleError} />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modals */}
        {showProfileSetupLoader && <ProfileSetupLoader />}

        {showProfileSetup && localStorage.getItem("id") && (
          <ProfileSetupModal
            isOpen={showProfileSetup}
            onClose={() => setShowProfileSetup(false)}
            onParsed={() => {
              window.location.href = "/profile";
            }}
          />
        )}

        {showOnboarding && <OnboardingComponent />}
      </div>
    </div>
  );
};

export default Login;
