import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ title, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <header className="topbar">
        <h2>{title}</h2>
        <div className="topbar-right">
          {user && (
            <span>
              {user.name} ({user.role})
            </span>
          )}
          {!user && <Link to="/login">Login</Link>}
          {user && <button onClick={logout}>Logout</button>}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
