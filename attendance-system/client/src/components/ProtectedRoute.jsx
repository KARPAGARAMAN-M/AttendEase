import { Navigate } from "react-router-dom";
import { rolePath } from "../auth";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={rolePath(user.role)} replace />;
  }

  return children;
}
