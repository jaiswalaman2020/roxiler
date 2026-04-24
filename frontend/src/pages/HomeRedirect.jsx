import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "OWNER") return <Navigate to="/owner" replace />;
  return <Navigate to="/user" replace />;
}
