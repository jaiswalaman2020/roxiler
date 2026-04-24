import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    address: "",
    sortBy: "name",
    sortOrder: "asc",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");

  const loadStores = async () => {
    const { data } = await api.get("/api/stores", { params: filters });
    setStores(data.stores);
  };

  useEffect(() => {
    loadStores();
  }, [filters]);

  const updatePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const { data } = await api.put("/api/auth/update-password", passwordForm);
      setMessage(data.message);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Password update failed",
      );
    }
  };

  const submitRating = async (storeId, rating) => {
    try {
      await api.put(`/api/stores/${storeId}/rating`, { rating });
      loadStores();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit rating");
    }
  };

  return (
    <Layout title="Normal User Dashboard">
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
        <h3>Stores</h3>
        <div className="grid-form">
          <input
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            placeholder="Search by address"
            value={filters.address}
            onChange={(e) =>
              setFilters({ ...filters, address: e.target.value })
            }
          />
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="name">Sort: Name</option>
            <option value="address">Sort: Address</option>
            <option value="overall_rating">Sort: Rating</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) =>
              setFilters({ ...filters, sortOrder: e.target.value })
            }
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Address</th>
              <th>Overall Rating</th>
              <th>Your Rating</th>
              <th>Submit / Modify</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.address}</td>
                <td>{store.overallRating}</td>
                <td>{store.userSubmittedRating ?? "Not rated"}</td>
                <td>
                  <select
                    defaultValue={store.userSubmittedRating ?? ""}
                    onChange={(e) =>
                      submitRating(store.id, Number(e.target.value))
                    }
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
