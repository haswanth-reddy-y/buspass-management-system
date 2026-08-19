import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllUsers, deleteUserAccount } from "../../services/adminService";
import SearchBar from "../../components/SearchBar";
import { Users, Trash2, ShieldCheck, Mail, CreditCard, AlertCircle } from "lucide-react";
import "../../styles/admin.css";

const ManageUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load user accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadUsers();
  }, [token]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete account for "${name}"?`)) {
      try {
        await deleteUserAccount(id, token);
        loadUsers();
      } catch (err) {
        alert(err.message || "Failed to delete user");
      }
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.studentId && u.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-container">
      <div>
        <h1>Registered Users & Students</h1>
        <p style={{ color: "var(--text-muted)" }}>
          View student database, verify profiles, and manage system accounts.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
            Loading user profiles...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 700, color: "#fff" }}>{u.name}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Mail size={14} color="var(--text-muted)" /> {u.email}
                        </span>
                      </td>
                      <td>{u.studentId || "N/A"}</td>
                      <td>{u.department || "General"}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-approved' : 'badge-pending'}`}>
                          {u.role === "admin" ? <><ShieldCheck size={12} /> Admin</> : "Student"}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== "admin" ? (
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            className="btn btn-danger"
                            style={{ padding: "0.4rem 0.65rem", fontSize: "0.8rem" }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
