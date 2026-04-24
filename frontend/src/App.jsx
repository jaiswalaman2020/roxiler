import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import HomeRedirect from "./pages/HomeRedirect";
import { subscribeApiLoading } from "./api";
import "./App.css";

function App() {
  const [isApiLoading, setIsApiLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeApiLoading(setIsApiLoading);
    return unsubscribe;
  }, []);

  return (
    <>
      {isApiLoading && (
        <div className="global-loader" role="status" aria-live="polite">
          <div className="global-loader-spinner" />
          <p>Connecting to server. Please wait...</p>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute roles={["USER"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute roles={["OWNER"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
