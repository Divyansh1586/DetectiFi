import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    // Clear any invalid authentication data
    if (!token || !user) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}