import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";
import axios from "axios";
import GoogleSignIn from "../components/Auth/GoogleSignIn";

const API_URL = "http://localhost:4000/api"; // Change if deployed

const NormalAuth = () => {
  const dispatch = useDispatch();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [role, setRole] = useState("Student");

  // ✅ REGISTER HANDLER
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log()
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        branch,
        cgpa,
        role,
      });

      console.log("✅ Registration successful:", response.data);

      const userData = {
        u_id: response.data.user.id,
        id: response.data.user.id,
        token: response.data.token,
        role: response.data.user.role,
        email: response.data.user.email,
        name: response.data.user.name,
        branch: response.data.user.branch,
        cgpa: response.data.user.cgpa,
      };

      // Store in Redux
      dispatch(setUser(userData));

      // Also store in localStorage as fallback
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("id", response.data.user.id);
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("name", response.data.user.name);
      localStorage.setItem("branch", response.data.user.branch);
      localStorage.setItem("cgpa", response.data.user.cgpa);

      alert(`Welcome ${response.data.user.name}! Registration successful.`);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("❌ Registration failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log("✅ Login successful:", response.data);

      const userData = {
        u_id: response.data.user.id,
        id: response.data.user.id,
        token: response.data.token,
        role: response.data.user.role,
        email: response.data.user.email,
        name: response.data.user.name,
        branch: response.data.user.branch,
        cgpa: response.data.user.cgpa,
      };

      // Store in Redux
      dispatch(setUser(userData));

      // Also store in localStorage as fallback
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("id", response.data.user.id);
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("name", response.data.user.name);
      localStorage.setItem("branch", response.data.user.branch);
      localStorage.setItem("cgpa", response.data.user.cgpa);

      alert(`Welcome back, ${response.data.user.name}!`);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ✅ GOOGLE SIGN-IN HANDLERS (student)
  const handleGoogleSuccess = (user) => {
    try {
      const userData = {
        u_id: user.id,
        id: user.id,
        token: localStorage.getItem("token") || user.token || "",
        role: user.role,
        email: user.email,
        name: user.name,
        branch: user.branch || "",
        cgpa: user.cgpa || "",
      };

      // Store in Redux
      dispatch(setUser(userData));

      // Also store in localStorage as fallback
      if (userData.token) localStorage.setItem("token", userData.token);
      localStorage.setItem("role", userData.role);
      localStorage.setItem("id", userData.id);
      localStorage.setItem("email", userData.email);
      localStorage.setItem("name", userData.name);
      localStorage.setItem("branch", userData.branch);
      localStorage.setItem("cgpa", userData.cgpa);

      alert(`Welcome back, ${userData.name}!`);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Google sign-in processing failed:", err);
      alert("Failed to sign in with Google. Please try again.");
    }
  };

  const handleGoogleError = (message) => {
    console.error("Google Sign-In Error:", message);
    alert(message || "Google sign-in failed");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          {isRegister ? "Register" : "Login"}
        </h2>

        <form
          onSubmit={isRegister ? handleRegister : handleLogin}
          className="space-y-5"
        >
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  placeholder="Enter your branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter your CGPA"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Student">Student</option>
                  <option value="Admin">Admin</option>
                  <option value="Faculty">Faculty</option>
                  <option value="placement_coordinator">Placement Coordinator</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-lg font-medium transition duration-200 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? isRegister
                ? "Registering..."
                : "Logging in..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        {/* Google sign-in for students */}
        {!isRegister && (
          <div className="mt-6 flex flex-col items-center space-y-3">
            <div className="text-sm text-gray-500">or sign in with</div>
            <GoogleSignIn onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>
        )}

        <p className="text-center mt-4 text-gray-600">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="text-blue-600 hover:underline"
              >
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default NormalAuth;
