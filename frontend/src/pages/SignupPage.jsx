import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await signup(form);
      navigate("/user");
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0] ||
          err.response?.data?.message ||
          "Signup failed",
      );
    }
  };

  return (
    <div className="auth-card">
      <h1>Sign Up</h1>
      <form onSubmit={onSubmit}>
        <label>Name (required, max 60 chars)</label>
        <input
          required
          maxLength={60}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <label>Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label>Address (max 400 chars)</label>
        <textarea
          required
          maxLength={400}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <label>Password (8-16, 1 uppercase, 1 special)</label>
        <input
          type="password"
          required
          minLength={8}
          maxLength={16}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Create account</button>
      </form>
      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
