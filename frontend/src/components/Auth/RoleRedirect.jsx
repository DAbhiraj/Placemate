import { Navigate } from "react-router-dom";
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

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const role = (localStorage.getItem("role") || user?.role).toLowerCase();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={defaultRouteForRole(role)} replace />;
};

export default RoleRedirect;
