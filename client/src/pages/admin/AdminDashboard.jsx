import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminStats } from "../../services/adminService";
import { Users, FileCheck, Clock, CheckCircle, XCircle, Bus, ArrowRight, AlertCircle } from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/admin.css";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminStats(token);
        setStats(data);
      } catch (err) {
        setError(err.message || "Failed to load admin statistics");
      } finally {
        setLoading(false);
      }
    };
    if (token) loadStats();
  }, [token]);

  return (
    <div className="admin-container">
      <div>
        <h1 className="dashboard-title">System Control Center</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Overview of applications, student passes, metrics, and real-time transit stats.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
          Gathering system diagnostics & statistics...
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ color: "var(--secondary)" }}>
                <Users size={26} />
              </div>
              <div className="stat-info">
                <h4>Registered Students</h4>
                <div className="stat-value">{stats?.totalUsers || 0}</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ color: "var(--warning)" }}>
                <Clock size={26} />
              </div>
              <div className="stat-info">
                <h4>Pending Approvals</h4>
                <div className="stat-value">{stats?.pendingApplications || 0}</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ color: "var(--success)" }}>
                <CheckCircle size={26} />
              </div>
              <div className="stat-info">
                <h4>Active Bus Passes</h4>
                <div className="stat-value">{stats?.activePasses || 0}</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ color: "var(--danger)" }}>
                <XCircle size={26} />
              </div>
              <div className="stat-info">
                <h4>Rejected Requests</h4>
                <div className="stat-value">{stats?.rejectedApplications || 0}</div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-title-bar">
              <h2>Recent Applications Queue</h2>
              <Link to="/admin/applications" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
                Manage All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="glass-panel" style={{ padding: "1.25rem" }}>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Route</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentApplications && stats.recentApplications.length > 0 ? (
                      stats.recentApplications.map((app) => (
                        <tr key={app._id}>
                          <td style={{ fontWeight: 700, color: "#fff" }}>{app.applicationId}</td>
                          <td>{app.studentName}</td>
                          <td>{app.studentId}</td>
                          <td>{app.source} ➔ {app.destination}</td>
                          <td>{app.applicationType} ({app.passType})</td>
                          <td>
                            <span className={`badge ${app.status === 'Approved' ? 'badge-approved' : app.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>{new Date(app.appliedDate || app.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                          No application records registered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
