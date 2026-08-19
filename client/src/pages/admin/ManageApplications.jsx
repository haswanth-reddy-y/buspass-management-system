import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllApplications, updateApplicationStatus } from "../../services/adminService";
import SearchBar from "../../components/SearchBar";
import { CheckCircle, XCircle, Clock, AlertCircle, X } from "lucide-react";
import "../../styles/admin.css";

const ManageApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalAction, setModalAction] = useState(""); // "Approve" or "Reject"
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllApplications(statusFilter, searchTerm, token);
      setApplications(data);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, statusFilter, searchTerm]);

  const openActionModal = (app, action) => {
    setSelectedApp(app);
    setModalAction(action);
    setRejectionReason("");
    setRemarks("");
  };

  const closeModal = () => {
    setSelectedApp(null);
    setModalAction("");
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (modalAction === "Reject" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejecting the application.");
      return;
    }

    setActionLoading(true);
    try {
      const status = modalAction === "Approve" ? "Approved" : "Rejected";
      await updateApplicationStatus(selectedApp._id, { status, rejectionReason, remarks }, token);
      closeModal();
      loadData();
    } catch (err) {
      alert(err.message || "Failed to update application status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div>
        <h1>Manage Bus Pass Applications</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Review, approve, or reject student pass requests with automated digital ticket issuance.
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

      <div className="glass-panel" style={{ padding: "1.25rem" }}>
        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
            Loading application records...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Student Info</th>
                  <th>Route Journey</th>
                  <th>Pass Type</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 700, color: "#fff" }}>{app.applicationId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.studentName}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{app.studentId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.source} ➔ {app.destination}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>Route: {app.route}</div>
                      </td>
                      <td>{app.applicationType} ({app.passType})</td>
                      <td>
                        <span className={`badge ${app.status === 'Approved' ? 'badge-approved' : app.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.appliedDate || app.createdAt).toLocaleDateString()}</td>
                      <td>
                        {app.status === "Pending" ? (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => openActionModal(app, "Approve")}
                              className="btn btn-success"
                              style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => openActionModal(app, "Reject")}
                              className="btn btn-danger"
                              style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                            Processed ({app.status})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2.5rem" }}>
                      No application records found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Approval/Rejection Modal */}
      {selectedApp && (
        <div className="modal-overlay">
          <div className="glass-panel modal-card">
            <div className="modal-header">
              <h3 style={{ color: modalAction === "Approve" ? "#10b981" : "#ef4444" }}>
                {modalAction} Application ({selectedApp.applicationId})
              </h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
                <div><strong>Student:</strong> {selectedApp.studentName} ({selectedApp.studentId})</div>
                <div><strong>Route:</strong> {selectedApp.source} ➔ {selectedApp.destination}</div>
                <div><strong>Pass Duration:</strong> {selectedApp.passType}</div>
              </div>

              {modalAction === "Reject" && (
                <div className="form-group">
                  <label>Rejection Reason *</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Enter reason for rejecting this application..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Admin Remarks (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Verified ID proof"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={modalAction === "Approve" ? "btn btn-success" : "btn btn-danger"}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : `Confirm ${modalAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageApplications;
