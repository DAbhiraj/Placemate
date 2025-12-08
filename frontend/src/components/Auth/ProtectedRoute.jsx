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
        return "/dashboard";
    default:
      return "/";
  }
};

const isAllowedPath = (role, pathname) => {
  const p = pathname.toLowerCase();
  const r = (role || "").toLowerCase();
  if (r === "admin") return p.startsWith("/admin");
  if (r === "recruiter") return p.startsWith("/recruiter");
  if (r === "spoc") return p.startsWith("/spoc");
  
  // default student
  return !(p.startsWith("/admin") || p.startsWith("/recruiter") || p.startsWith("/spoc"));
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const role = (localStorage.getItem("role") || user?.role || "student").toLowerCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Enforce role-based route access
  if (!isAllowedPath(role, location.pathname)) {
    return <Navigate to={defaultRouteForRole(role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
