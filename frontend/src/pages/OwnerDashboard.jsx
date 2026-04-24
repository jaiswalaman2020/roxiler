import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function OwnerDashboard() {
  const [data, setData] = useState({
    store: null,
    averageRating: 0,
    submittedRatings: [],
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    const response = await api.get("/api/owner/dashboard");
    setData(response.data);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updatePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const { data: response } = await api.put(
        "/api/auth/update-password",
        passwordForm,
      );
      setMessage(response.message);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Password update failed",
      );
    }
  };

  return (
    <Layout title="Store Owner Dashboard">
      {message && <p className="info">{message}</p>}

      <section className="card">
        <h3>Update Password</h3>
        <form className="grid-form" onSubmit={updatePassword}>
          <input
            type="password"
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value,
              })
            }
            required
          />
          <input
            type="password"
            placeholder="New password"
            minLength={8}
            maxLength={16}
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            required
          />
          <button type="submit">Update Password</button>
        </form>
      </section>

      <section className="card">
        <h3>Store Summary</h3>
        <p>Store: {data.store?.name || "No store assigned yet"}</p>
        <p>Average Rating: {data.averageRating}</p>
      </section>

      <section className="card">
        <h3>Users Who Submitted Ratings</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.submittedRatings.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.name}</td>
                <td>{entry.email}</td>
                <td>{entry.rating}</td>
                <td>{new Date(entry.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
