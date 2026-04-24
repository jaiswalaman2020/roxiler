import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

const defaultUser = {
  name: "",
  email: "",
  address: "",
  password: "",
  role: "USER",
};
const defaultStore = { name: "", email: "", address: "", ownerId: "" };

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState(defaultUser);
  const [storeForm, setStoreForm] = useState(defaultStore);
  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
    sortBy: "name",
    sortOrder: "asc",
  });
  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
    sortBy: "name",
    sortOrder: "asc",
  });
  const [message, setMessage] = useState("");

  const loadStats = async () => {
    const { data } = await api.get("/api/admin/dashboard");
    setStats(data);
  };

  const loadUsers = async () => {
    const { data } = await api.get("/api/admin/users", { params: userFilters });
    setUsers(data.users);
  };

  const loadStores = async () => {
    const { data } = await api.get("/api/admin/stores", {
      params: storeFilters,
    });
    setStores(data.stores);
  };

  const loadUserDetails = async (id) => {
    const { data } = await api.get(`/api/admin/users/${id}`);
    setSelectedUser(data.user);
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [userFilters]);

  useEffect(() => {
    loadStores();
  }, [storeFilters]);

  const submitUser = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api.post("/api/admin/users", userForm);
      setUserForm(defaultUser);
      setMessage("User created");
      loadUsers();
      loadStats();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Failed to create user",
      );
    }
  };

  const submitStore = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api.post("/api/admin/stores", {
        ...storeForm,
        ownerId: storeForm.ownerId ? Number(storeForm.ownerId) : undefined,
      });
      setStoreForm(defaultStore);
      setMessage("Store created");
      loadStores();
      loadStats();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Failed to create store",
      );
    }
  };

  return (
    <Layout title="System Administrator Dashboard">
      <div className="stats-grid">
        <div className="card">Total Users: {stats.totalUsers}</div>
        <div className="card">Total Stores: {stats.totalStores}</div>
        <div className="card">Total Ratings: {stats.totalRatings}</div>
      </div>

      {message && <p className="info">{message}</p>}

      <section className="card">
        <h3>Add User</h3>
        <form className="grid-form" onSubmit={submitUser}>
          <input
            placeholder="Name"
            value={userForm.name}
            maxLength={60}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
            required
          />
          <input
            placeholder="Address"
            value={userForm.address}
            maxLength={400}
            onChange={(e) =>
              setUserForm({ ...userForm, address: e.target.value })
            }
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={userForm.password}
            minLength={8}
            maxLength={16}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
            required
          />
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OWNER">OWNER</option>
          </select>
          <button type="submit">Create User</button>
        </form>
      </section>

      <section className="card">
        <h3>Add Store</h3>
        <form className="grid-form" onSubmit={submitStore}>
          <input
            placeholder="Store Name"
            value={storeForm.name}
            onChange={(e) =>
              setStoreForm({ ...storeForm, name: e.target.value })
            }
            required
          />
          <input
            placeholder="Store Email"
            type="email"
            value={storeForm.email}
            onChange={(e) =>
              setStoreForm({ ...storeForm, email: e.target.value })
            }
            required
          />
          <input
            placeholder="Store Address"
            value={storeForm.address}
            maxLength={400}
            onChange={(e) =>
              setStoreForm({ ...storeForm, address: e.target.value })
            }
            required
          />
          <input
            placeholder="Owner User ID (optional)"
            value={storeForm.ownerId}
            onChange={(e) =>
              setStoreForm({ ...storeForm, ownerId: e.target.value })
            }
          />
          <button type="submit">Create Store</button>
        </form>
      </section>

      <section className="card">
        <h3>Users (Normal + Admin + Owner)</h3>
        <div className="grid-form">
          <input
            placeholder="Filter Name"
            value={userFilters.name}
            onChange={(e) =>
              setUserFilters({ ...userFilters, name: e.target.value })
            }
          />
          <input
            placeholder="Filter Email"
            value={userFilters.email}
            onChange={(e) =>
              setUserFilters({ ...userFilters, email: e.target.value })
            }
          />
          <input
            placeholder="Filter Address"
            value={userFilters.address}
            onChange={(e) =>
              setUserFilters({ ...userFilters, address: e.target.value })
            }
          />
          <select
            value={userFilters.role}
            onChange={(e) =>
              setUserFilters({ ...userFilters, role: e.target.value })
            }
          >
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OWNER">OWNER</option>
          </select>
          <select
            value={userFilters.sortBy}
            onChange={(e) =>
              setUserFilters({ ...userFilters, sortBy: e.target.value })
            }
          >
            <option value="name">Sort: Name</option>
            <option value="email">Sort: Email</option>
            <option value="address">Sort: Address</option>
            <option value="role">Sort: Role</option>
          </select>
          <select
            value={userFilters.sortOrder}
            onChange={(e) =>
              setUserFilters({ ...userFilters, sortOrder: e.target.value })
            }
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => loadUserDetails(user.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedUser && (
          <div className="sub-card">
            <h4>User Details</h4>
            <p>Name: {selectedUser.name}</p>
            <p>Email: {selectedUser.email}</p>
            <p>Address: {selectedUser.address}</p>
            <p>Role: {selectedUser.role}</p>
            {selectedUser.role === "OWNER" && (
              <p>Rating: {selectedUser.rating}</p>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <h3>Stores</h3>
        <div className="grid-form">
          <input
            placeholder="Filter Name"
            value={storeFilters.name}
            onChange={(e) =>
              setStoreFilters({ ...storeFilters, name: e.target.value })
            }
          />
          <input
            placeholder="Filter Email"
            value={storeFilters.email}
            onChange={(e) =>
              setStoreFilters({ ...storeFilters, email: e.target.value })
            }
          />
          <input
            placeholder="Filter Address"
            value={storeFilters.address}
            onChange={(e) =>
              setStoreFilters({ ...storeFilters, address: e.target.value })
            }
          />
          <select
            value={storeFilters.sortBy}
            onChange={(e) =>
              setStoreFilters({ ...storeFilters, sortBy: e.target.value })
            }
          >
            <option value="name">Sort: Name</option>
            <option value="email">Sort: Email</option>
            <option value="address">Sort: Address</option>
            <option value="overall_rating">Sort: Rating</option>
          </select>
          <select
            value={storeFilters.sortOrder}
            onChange={(e) =>
              setStoreFilters({ ...storeFilters, sortOrder: e.target.value })
            }
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.email}</td>
                <td>{store.address}</td>
                <td>{store.overall_rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
