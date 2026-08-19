import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyApplications } from "../services/passService";
import ApplicationCard from "../components/ApplicationCard";
import SearchBar from "../components/SearchBar";
import { Clock, AlertCircle } from "lucide-react";
import "../styles/application.css";

const ApplicationStatus = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApps = async () => {
      try {
        const data = await fetchMyApplications(token);
        setApplications(data);
      } catch (err) {
        setError(err.message || "Failed to load application history");
      } finally {
        setLoading(false);
      }
    };
    if (token) loadApps();
  }, [token]);

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesSearch =
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1>Application Status & History</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Track all your bus pass applications and view approval updates.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {loading ? (
        <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading application records...
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="applications-grid">
          {filteredApps.map((app) => (
            <ApplicationCard key={app._id} application={app} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <Clock size={48} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
          <h3>No Applications Found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            No records matched your search criteria or no applications have been submitted yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;
