import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// images from public folder used below
import GoogleSignIn from '../components/Auth/GoogleSignIn';
import LinkedInSignIn from '../components/Auth/LinkedInSignIn';
import ProfileSetupModal from '../components/Auth/ProfileSetupModal';
import ProfileSetupLoader from '../components/Auth/ProfileSetupLoader';
import OnboardingComponent from '../components/Auth/OnboardingModal';
import { setUser } from '../store/slices/userSlice';
import { useAuth } from '../context/AuthContext';
import GoogleModal from '../components/Auth/GoogleModal';

const defaultRouteForRole = (role) => {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return '/admin';
    case 'recruiter':
      return '/recruiter/viewjobs';
    case 'spoc':
      return '/spoc/assignedjobs';
    case 'student':
    default:
      return '/student/dashboard';
  }
};


const API_URL = "http://localhost:4000/api";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { login, register, user, loading } = useAuth();

  // UI + Auth State
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showProfileSetupLoader, setShowProfileSetupLoader] = useState(false);

  // Modal state for Student Google sign-in
  const [showStudentGoogleModal, setShowStudentGoogleModal] = useState(false);
  const [showSpocGoogleModal, setShowSpocGoogleModal] = useState(false);
  const [showRecruiterGoogleModal, setShowRecruiterGoogleModal] = useState(false);
  const [showStaffAuthModal, setShowStaffAuthModal] = useState(false);

  // Staff/Keycloak auth state
  const [isStaffRegister, setIsStaffRegister] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffConfirmPassword, setStaffConfirmPassword] = useState("");
  const [staffFirstName, setStaffFirstName] = useState("");
  const [staffLastName, setStaffLastName] = useState("");

  // If already logged in, redirect to role default
  useEffect(() => {
    if (loading) return;
    if (user) {
      const role = localStorage.getItem('role') || user.role || 'student';
      navigate(defaultRouteForRole(role), { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = (user) => {

    setIsAuthenticated(true);
   
    const role = localStorage.getItem('role');
    if(role==='Student'){
      const needOnboarding = !user.profile_completed;
      const needProfileSetup = !user.branch || !user.cgpa;

      setShowOnboarding(needOnboarding);

      if (needProfileSetup) {
        setShowProfileSetupLoader(true);
        setTimeout(() => {
          setShowProfileSetup(true);
          setShowProfileSetupLoader(false);
        }, 900);
      }  else{
      window.location.href = defaultRouteForRole('student');
      }
      
    }else if(role==='recruiter'){

      if(user.is_verified){
        localStorage.setItem("company",user.company);
        window.location.href = defaultRouteForRole('recruiter');
      }else{
        window.location.href = "/recruiter/verification";
      }
    }
    else if(role==='spoc'){
      window.location.href = defaultRouteForRole('spoc');
    }else if(role==='admin'){
      window.location.href = defaultRouteForRole('admin');
    }
  };

  // ✅ GOOGLE SIGN-IN HANDLERS (student)
  const handleGoogleSuccess = (user) => {
    try {
      const role = localStorage.getItem("role") || user.role || "Student";
      
      const userData = {
        u_id: user.id,
        id: user.id,
        role: role,
        email: user.email,
        name: user.name,
        branch: user.branch || "",
        cgpa: user.cgpa || "",
      };

      // Store in Redux
      dispatch(setUser(userData));

      // Also store in localStorage as fallback
      localStorage.setItem("role", userData.role);
      localStorage.setItem("id", userData.id);
      localStorage.setItem("email", userData.email);
      localStorage.setItem("name", userData.name);
      localStorage.setItem("branch", userData.branch);
      localStorage.setItem("cgpa", userData.cgpa);

      alert(`Welcome back, ${userData.name}!`);
      handleGoogleSignIn(user);
     
    } catch (err) {
      console.error("Google sign-in processing failed:", err);
      alert("Failed to sign in with Google. Please try again.");
    }
  };

  const handleGoogleError = (message) => {
    console.error("Google Sign-In Error:", message);
    alert(message || "Google sign-in failed");
  };

    // ✅ GOOGLE SIGN-IN HANDLERS (student)
  const handleSpocGoogleSuccess = (user) => {
    try {
      const role = localStorage.getItem("role") || user.role || "spoc";
      
      const userData = {
        u_id: user.id,
        id: user.id,
        role: role,
        email: user.email,
        name: user.name,
      };

      // Store in Redux
      dispatch(setUser(userData));

      // Also store in localStorage as fallback
      localStorage.setItem("role", userData.role);
      localStorage.setItem("email", userData.email);
      localStorage.setItem("name", userData.name);

      alert(`Welcome back Spoc!, ${userData.name}!`);
      handleGoogleSignIn(user);
     
    } catch (err) {
      console.error("Google sign-in processing failed:", err);
      alert("Failed to sign in with Google. Please try again.");
    }
  };

  const handleSpocGoogleError = (message) => {
    console.error("Google Sign-In Error:", message);
    alert(message || "Google sign-in failed");
  };

  // ✅ RECRUITER GOOGLE/LINKEDIN SUCCESS HANDLER
  const handleRecruiterSuccess = (user) => {
    try {
      const role = localStorage.getItem("role") || user.role || "recruiter";
      
      const userData = {
        u_id: user.id,
        id: user.id,
        role: role,
        email: user.email,
        name: user.name,
      };

      // Store in Redux
      dispatch(setUser(userData));

      // Also store in localStorage as fallback
      localStorage.setItem("role", userData.role);
      localStorage.setItem("email", userData.email);
      localStorage.setItem("name", userData.name);

      alert(`Welcome back Recruiter!, ${userData.name}!`);
      handleGoogleSignIn(user);
     
    } catch (err) {
      console.error("Sign-in processing failed:", err);
      alert("Failed to sign in. Please try again.");
    }
  };

  const handleRecruiterError = (message) => {
    console.error("Sign-In Error:", message);
    alert(message || "Sign-in failed");
  };

  // Staff/Keycloak auth handlers
  const handleStaffRegister = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError("");

    if (staffPassword !== staffConfirmPassword) {
      setStaffError("Passwords do not match");
      setStaffLoading(false);
      return;
    }

    try {
      await register(staffUsername, staffEmail, staffPassword, staffFirstName, staffLastName);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setStaffError(err?.response?.data?.message || "Registration failed");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError("");

    try {
      await login(staffUsername, staffPassword);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setStaffError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAdminLogin = () => {
    window.location.href = "/adminlogin";
  };

  const openStaffAuthModal = () => {
    setShowStaffAuthModal(true);
    setStaffError("");
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
              onClick={() => {
                localStorage.setItem("role", "Student");
                setShowStudentGoogleModal(true);
              }}
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
              onClick={() => {
                localStorage.setItem("role", "recruiter");
                setShowRecruiterGoogleModal(true);
              }}
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
              onClick={() => {
                localStorage.setItem("role", "spoc");
                setShowSpocGoogleModal(true);
              }}
              className="cursor-pointer p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden">
                  <img src="profile/coordinator.png" alt="coordinator" className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Coordinator</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">Coordinator portal</p>
            </div>

            {/* Staff (Keycloak auth modal) */}
            <div
              role="button"
              onClick={openStaffAuthModal}
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
            <GoogleModal
              role="Student"
              setShowGoogleModal={setShowStudentGoogleModal}
              handleGoogleSuccess={handleGoogleSuccess}
              handleGoogleError={handleGoogleError}
            />
          )}

          {/* Spoc Google modal — rendered when user clicks Student */}
          {showSpocGoogleModal && (
            <GoogleModal
              role="spoc"
              setShowGoogleModal={setShowSpocGoogleModal}
              handleGoogleSuccess={handleSpocGoogleSuccess}
              handleGoogleError={handleSpocGoogleError}
            />
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
                  <GoogleSignIn role="recruiter" onSuccess={(user) => { setShowRecruiterGoogleModal(false); handleRecruiterSuccess(user); }} onError={handleRecruiterError} />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  <LinkedInSignIn onSuccess={(user) => { setShowRecruiterGoogleModal(false); handleRecruiterSuccess(user); }} onError={handleRecruiterError} />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Staff Auth Modal */}
        {showStaffAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isStaffRegister ? "Register" : "Sign In"}
                </h3>
                <button
                  onClick={() => setShowStaffAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {staffError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 rounded p-3">
                  {staffError}
                </div>
              )}

              <form onSubmit={isStaffRegister ? handleStaffRegister : handleStaffLogin} className="space-y-4">
                {isStaffRegister && (
                  <>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={staffFirstName}
                      onChange={(e) => setStaffFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required={isStaffRegister}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={staffLastName}
                      onChange={(e) => setStaffLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required={isStaffRegister}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required={isStaffRegister}
                    />
                  </>
                )}

                <input
                  type="text"
                  placeholder="Username"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />

                {isStaffRegister && (
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={staffConfirmPassword}
                    onChange={(e) => setStaffConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                )}

                <button
                  type="submit"
                  disabled={staffLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {staffLoading ? "Processing..." : isStaffRegister ? "Register" : "Sign In"}
                </button>
              </form>

              <button
                onClick={() => {
                  setIsStaffRegister((prev) => !prev);
                  setStaffError("");
                }}
                className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isStaffRegister ? "Already have an account? Sign In" : "Need an account? Register"}
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {showProfileSetupLoader && <ProfileSetupLoader />}

        {showProfileSetup && localStorage.getItem("role")==="Student" && (
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
