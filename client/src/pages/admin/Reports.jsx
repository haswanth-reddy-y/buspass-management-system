import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllPasses, fetchAllApplications, revokeUserPass } from "../../services/adminService";
import SearchBar from "../../components/SearchBar";
import { BarChart3, Bus, Download, Ban, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import "../../styles/admin.css";

const Reports = () => {
  const { token } = useAuth();
  const [passes, setPasses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [passData, appData] = await Promise.all([
        fetchAllPasses(token),
        fetchAllApplications("All", "", token)
      ]);
      setPasses(passData);
      setApplications(appData);
    } catch (err) {
      setError(err.message || "Failed to load report metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadReportData();
  }, [token]);

  const handleRevokePass = async (id, passId) => {
    if (window.confirm(`Are you sure you want to revoke bus pass ${passId}?`)) {
      try {
        await revokeUserPass(id, token);
        loadReportData();
      } catch (err) {
        alert(err.message || "Failed to revoke pass");
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ["Pass ID,Student Name,Student ID,Route,Source,Destination,Pass Type,Status,Expiry Date\n"];
    const rows = passes.map((p) =>
      `"${p.passId}","${p.studentName}","${p.studentId}","${p.route}","${p.source}","${p.destination}","${p.passType}","${p.status}","${new Date(p.expiryDate).toLocaleDateString()}"`
    );
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BusPass_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filteredPasses = passes.filter((p) =>
    p.passId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1>Analytics & Issuance Reports</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Comprehensive pass records, route demand metrics, and export capabilities.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-primary">
          <Download size={18} /> Export Report (CSV)
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Summary */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ color: "var(--secondary)" }}>
            <Bus size={26} />
          </div>
          <div className="stat-info">
            <h4>Total Issued Passes</h4>
            <div className="stat-value">{passes.length}</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ color: "var(--success)" }}>
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-info">
            <h4>Currently Active</h4>
            <div className="stat-value">{passes.filter((p) => p.status === "Active").length}</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ color: "var(--danger)" }}>
            <Ban size={26} />
          </div>
          <div className="stat-info">
            <h4>Expired / Revoked</h4>
            <div className="stat-value">{passes.filter((p) => p.status !== "Active").length}</div>
          </div>
        </div>
      </div>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Pass Registry Table</h3>
        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
            Compiling report records...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pass ID</th>
                  <th>Student Info</th>
                  <th>Route & Journey</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Expiry Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.length > 0 ? (
                  filteredPasses.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 700, color: "#fff" }}>{p.passId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.studentName}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.studentId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.source} ➔ {p.destination}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>{p.route}</div>
                      </td>
                      <td>{p.passType}</td>
                      <td>
                        <span className={`badge ${p.status === 'Active' ? 'badge-approved' : 'badge-rejected'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{new Date(p.expiryDate).toLocaleDateString()}</td>
                      <td>
                        {p.status === "Active" ? (
                          <button
                            onClick={() => handleRevokePass(p._id, p.passId)}
                            className="btn btn-danger"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                          >
                            <ShieldAlert size={14} /> Revoke
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                      No pass records match the search filter.
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

export default Reports;
