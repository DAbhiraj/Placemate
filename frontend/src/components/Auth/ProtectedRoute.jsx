import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const defaultRouteForRole = (role) => {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "/admin";
    case "recruiter":
      return "/recruiter/viewjobs";
    case "spoc":
      return "/spoc/assignedjobs";
    case "student":
      return "/student/dashboard";
    default:
      return "/";
  }
};

const isAllowedPath = (role, pathname) => {
  const p = pathname.toLowerCase();
  const r = (role || "").toLowerCase();
  
 // console.log("ProtectedRoute - Checking access:", { role: r, pathname: p });
  
  if (r === "admin") return p.startsWith("/admin");
  if (r === "recruiter") return p.startsWith("/recruiter");
  if (r === "spoc") return p.startsWith("/spoc");
  if (r === "student") return p.startsWith("/student");
  
  // Student can access student routes (anything not admin/recruiter/spoc)
  return !(p.startsWith("/admin") || p.startsWith("/recruiter") || p.startsWith("/spoc") || p.startsWith("/student"));
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Get role from localStorage first, then from user context
  const storedRole = localStorage.getItem("role");
  const userRole = user?.role;
  const role = (storedRole || userRole).toLowerCase();
  
  // console.log("===== ProtectedRoute State =====");
  // console.log("User:", user);
  // console.log("Loading:", loading);
  // console.log("Stored Role:", storedRole);
  // console.log("User Role:", userRole);
  // console.log("Final Role:", role);
  // console.log("Pathname:", location.pathname);
  // const a = isAllowedPath(role, location.pathname);
  // console.log("✅ ProtectedRoute - Access allowed:", a);
  // console.log("================================");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("❌ ProtectedRoute - No user, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // Enforce role-based route access
  const allowed = isAllowedPath(role, location.pathname);
  // console.log("✅ ProtectedRoute - Access allowed:", allowed);
  
  if (!allowed) {
    const redirectPath = defaultRouteForRole(role);
    // console.log("🔄 ProtectedRoute - Access denied, redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // console.log("✅ ProtectedRoute - Rendering protected content");
  return <Outlet />;
};

export default ProtectedRoute;
