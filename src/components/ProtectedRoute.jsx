
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const normalizeRole = (value) => String(value || "").toLowerCase();

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && normalizeRole(user.role) !== normalizeRole(role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
