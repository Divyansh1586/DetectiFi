import { Navigate } from "react-router-dom";
import { checkAuthStatus } from "@/lib/auth";

export function PrivateRoute({ children }) {
  // Check if token exists and is not expired
  if (!checkAuthStatus()) {
    // Redirect to login if there's no token or if it's expired
    return <Navigate to="/login" replace />;
  }

  return children;
}