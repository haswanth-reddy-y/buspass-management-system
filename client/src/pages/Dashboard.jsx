import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyPasses, fetchMyApplications } from "../services/passService";
import PassCard from "../components/PassCard";
import ApplicationCard from "../components/ApplicationCard";
import { Bus, Clock, FilePlus, QrCode, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user, token } = useAuth();
  const [passes, setPasses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [passData, appData] = await Promise.all([
          fetchMyPasses(token),
          fetchMyApplications(token)
        ]);
        setPasses(passData);
        setApplications(appData);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  const activePass = passes.find((p) => p.status === "Active");
  const pendingApps = applications.filter((a) => a.status === "Pending");

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.name || "Student"} 👋</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Manage your bus pass applications, view status, and access your digital pass ticket.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ color: "var(--secondary)" }}>
            <Bus size={26} />
          </div>
          <div className="stat-info">
            <h4>Active Pass</h4>
            <div className="stat-value">{activePass ? "1 Active" : "None"}</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ color: "var(--warning)" }}>
            <Clock size={26} />
          </div>
          <div className="stat-info">
            <h4>Pending Applications</h4>
            <div className="stat-value">{pendingApps.length}</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ color: "var(--primary)" }}>
            <FilePlus size={26} />
          </div>
          <div className="stat-info">
            <h4>Total Submissions</h4>
            <div className="stat-value">{applications.length}</div>
          </div>
        </div>
      </div>

      {/* Main Active Pass Section */}
      <div className="dashboard-section">
        <div className="section-title-bar">
          <h2>Digital Bus Pass</h2>
          {activePass ? (
            <Link to="/digital-pass" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
              <QrCode size={16} /> Full View
            </Link>
          ) : (
            <Link to="/apply" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
              <FilePlus size={16} /> Apply New Pass
            </Link>
          )}
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            Loading your bus pass information...
          </div>
        ) : activePass ? (
          <div style={{ maxWidth: 440 }}>
            <PassCard pass={activePass} />
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
            <Bus size={48} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
            <h3 style={{ marginBottom: "0.5rem" }}>No Active Bus Pass</h3>
            <p style={{ color: "var(--text-muted)", maxWidth: 460, margin: "0 auto 1.5rem", fontSize: "0.92rem" }}>
              You do not currently hold an active digital bus pass. You can submit a new application online.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link to="/apply" className="btn btn-primary">
                <FilePlus size={18} /> Apply for New Pass
              </Link>
              <Link to="/renew" className="btn btn-secondary">
                <RefreshCw size={18} /> Pass Renewal
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recent Applications Feed */}
      <div className="dashboard-section">
        <div className="section-title-bar">
          <h2>Recent Applications</h2>
          <Link to="/status" style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="applications-grid">
            {applications.slice(0, 3).map((app) => (
              <ApplicationCard key={app._id} application={app} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            No recent applications found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
