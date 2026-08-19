import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyPasses } from "../services/passService";
import { Bus, Calendar, Printer, ShieldCheck, AlertCircle, QrCode as QrIcon } from "lucide-react";
import "../styles/digitalPass.css";

const DigitalPass = () => {
  const { user, token } = useAuth();
  const [activePass, setActivePass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPass = async () => {
      try {
        const data = await fetchMyPasses(token);
        const active = data.find((p) => p.status === "Active");
        setActivePass(active || null);
      } catch (err) {
        setError(err.message || "Failed to load digital pass");
      } finally {
        setLoading(false);
      }
    };
    if (token) loadPass();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="digital-pass-wrapper">
      <div style={{ textAlign: "center", maxWidth: 600 }}>
        <h1>Digital Bus Ticket Pass</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Present this verified digital pass to bus conductors or scanning terminals.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ maxWidth: 440, width: "100%" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", width: "100%", maxWidth: 440 }}>
          Loading your verified digital pass...
        </div>
      ) : activePass ? (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <div className="ticket-pass">
            <div className="ticket-header">
              <div className="ticket-logo">
                <Bus size={22} color="#06b6d4" />
                <span>TransitPass</span>
              </div>
              <span className="badge badge-approved">
                <ShieldCheck size={14} /> Verified Valid
              </span>
            </div>

            <div className="ticket-body">
              <div className="ticket-student">
                <div className="student-avatar-box">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div className="student-details">
                  <h3>{user?.name || activePass.studentName}</h3>
                  <p>Student ID: {activePass.studentId}</p>
                  <p style={{ color: "var(--secondary)", fontSize: "0.8rem" }}>
                    Dept: {user?.department || "General Campus"}
                  </p>
                </div>
              </div>

              <div className="ticket-route-box">
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>From</div>
                  <div style={{ fontWeight: 700, color: "#fff" }}>{activePass.source}</div>
                </div>
                <div style={{ color: "var(--secondary)", fontWeight: 800 }}>➔</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>To</div>
                  <div style={{ fontWeight: 700, color: "#fff" }}>{activePass.destination}</div>
                </div>
              </div>

              <div className="ticket-info-grid">
                <div className="ticket-info-item">
                  <label>Pass ID</label>
                  <span>{activePass.passId}</span>
                </div>
                <div className="ticket-info-item">
                  <label>Pass Type</label>
                  <span>{activePass.passType} Pass</span>
                </div>
                <div className="ticket-info-item">
                  <label>Issue Date</label>
                  <span>{new Date(activePass.issueDate || activePass.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="ticket-info-item">
                  <label>Expiry Date</label>
                  <span style={{ color: "#10b981" }}>{new Date(activePass.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="qr-section">
                <div className="qr-placeholder">
                  <QrIcon size={120} color="#0b0f19" />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
                  SCAN FOR AUTOMATED ENTRY
                </span>
              </div>
            </div>
          </div>

          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={18} /> Print / Save Pass Ticket
          </button>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", maxWidth: 440, width: "100%" }}>
          <Bus size={48} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
          <h3>No Active Digital Pass Found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            You do not currently possess an approved and active bus pass ticket.
          </p>
        </div>
      )}
    </div>
  );
};

export default DigitalPass;
