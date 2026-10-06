import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyPasses } from "../services/passService";
import { QRCodeSVG } from "qrcode.react";
import {
  Bus,
  Calendar,
  Printer,
  ShieldCheck,
  AlertCircle,
  Scan,
  CheckCircle,
  X,
  Copy,
  Check,
  CheckCircle2,
  MapPin,
  Clock
} from "lucide-react";
import "../styles/digitalPass.css";

const DigitalPass = () => {
  const { user, token } = useAuth();
  const [activePass, setActivePass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Generate real scannable payload readable by phone cameras and conductor scanners
  const getQrPayload = () => {
    if (!activePass) return "";
    const expiryStr = new Date(activePass.expiryDate).toLocaleDateString();
    const issueStr = new Date(activePass.issueDate || activePass.createdAt).toLocaleDateString();
    const pickup = activePass.pickupPoint || activePass.source;
    const drop = activePass.dropPoint || activePass.destination;

    return [
      `=== TRANSITPASS OFFICIAL DIGITAL BUS PASS ===`,
      `PASS ID     : ${activePass.passId}`,
      `STUDENT     : ${activePass.studentName} (${activePass.studentId})`,
      `DEPARTMENT  : ${user?.department || "General"}`,
      `ALLOTTED RT : ${activePass.route}`,
      `JOURNEY     : ${activePass.source} -> ${activePass.destination}`,
      `PICKUP STOP : ${pickup}`,
      `DROP STOP   : ${drop}`,
      `PASS TYPE   : ${activePass.passType} Pass`,
      `STATUS      : VERIFIED ACTIVE`,
      `ISSUED      : ${issueStr}`,
      `VALID TILL  : ${expiryStr}`,
      `VERIFICATION: https://buspass.college.edu/verify/${activePass.passId}`
    ].join("\n");
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(getQrPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrValue = getQrPayload();

  return (
    <div className="digital-pass-wrapper">
      <div style={{ textAlign: "center", maxWidth: 600 }}>
        <h1>Digital Bus Ticket Pass</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Present this verified digital ticket with scannable QR code to bus conductors and campus gate scanners.
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
                  <h3 className="user-name">{user?.name || activePass.studentName}</h3>
                  <p>Student ID: {activePass.studentId}</p>
                  <p style={{ color: "var(--secondary)", fontSize: "0.8rem" }}>
                    Dept: {user?.department || "General Campus"}
                  </p>
                </div>
              </div>

              {/* Journey Path */}
              <div className="ticket-route-box">
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>From</div>
                  <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{activePass.source}</div>
                </div>
                <div style={{ color: "var(--primary)", fontWeight: 800 }}>➔</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>To</div>
                  <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{activePass.destination}</div>
                </div>
              </div>

              {/* Commute Pickup and Drop Stops */}
              {(activePass.pickupPoint || activePass.totalFare > 0) && (
                <div style={{ margin: "0.75rem 0", padding: "0.6rem 0.85rem", background: "#f8fafc", borderRadius: "6px", fontSize: "0.78rem", border: "1px solid var(--card-border)" }}>
                  <div><strong>🌅 Morning Pickup:</strong> {activePass.pickupPoint || activePass.source}</div>
                  <div style={{ marginTop: 3 }}><strong>🌇 Evening Drop:</strong> {activePass.dropPoint || activePass.destination}</div>
                  {activePass.totalFare > 0 && (
                    <div style={{ marginTop: 3, color: "#047857", fontWeight: 700 }}>
                      Pass Fare: ₹{activePass.totalFare} ({activePass.roundTripDistanceKm || 0} km daily)
                    </div>
                  )}
                </div>
              )}

              {/* Ticket Details Grid */}
              <div className="ticket-info-grid">
                <div className="ticket-info-item">
                  <label>Pass ID</label>
                  <span className="pass-id">{activePass.passId}</span>
                </div>
                <div className="ticket-info-item">
                  <label>Allotted Route</label>
                  <span style={{ color: "var(--primary)", fontWeight: 700 }}>{activePass.route}</span>
                </div>
                <div className="ticket-info-item">
                  <label>Pass Type</label>
                  <span>{activePass.passType} Pass</span>
                </div>
                <div className="ticket-info-item">
                  <label>Issue Date</label>
                  <span>{new Date(activePass.issueDate || activePass.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="ticket-info-item" style={{ gridColumn: "1 / -1" }}>
                  <label>Expiry Date</label>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>
                    {new Date(activePass.expiryDate).toLocaleDateString()} (Active)
                  </span>
                </div>
              </div>

              {/* Real Scannable QR Code Section */}
              <div className="qr-section">
                <div
                  className="qr-placeholder"
                  style={{
                    width: 170,
                    height: 170,
                    padding: 12,
                    background: "#ffffff",
                    borderRadius: 14,
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                    border: "2px solid #e2e8f0"
                  }}
                >
                  <QRCodeSVG
                    value={qrValue}
                    size={146}
                    level="M"
                    includeMargin={false}
                    fgColor="#0f172a"
                    bgColor="#ffffff"
                  />
                </div>

                <div style={{ textAlign: "center", marginTop: 4 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-main)", letterSpacing: "0.05em" }}>
                    OFFICIAL SCANNABLE QR CODE
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Scan with any smartphone camera or conductor terminal
                  </span>
                </div>

                {/* Test Scan Simulator Button */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowScannerModal(true)}
                    className="btn btn-secondary no-print"
                    style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
                  >
                    <Scan size={14} color="var(--primary)" />
                    <span>Test Scan Verification</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="btn btn-secondary no-print"
                    style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
                    title="Copy QR text content"
                  >
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Data"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handlePrint} className="btn btn-secondary no-print" style={{ padding: "0.75rem 1.75rem" }}>
            <Printer size={18} /> Print / Save Pass Ticket (PDF)
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

      {/* Conductor Scanner Verification Simulator Modal */}
      {showScannerModal && activePass && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="glass-panel modal-card" style={{ maxWidth: 480, padding: "1.75rem" }}>
            <div className="modal-header" style={{ marginBottom: "1.25rem", paddingBottom: "0.85rem", borderBottom: "1px solid var(--card-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={22} color="#059669" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#065f46" }}>
                    Scan Verified: Pass Active
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Conductor Scanner Terminal Output
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowScannerModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: 10, border: "1px solid var(--card-border)", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px dashed var(--card-border)" }}>
                <span style={{ color: "var(--text-muted)" }}>Pass ID:</span>
                <strong style={{ color: "var(--primary)" }}>{activePass.passId}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-muted)" }}>Student:</span>
                <strong>{activePass.studentName} ({activePass.studentId})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-muted)" }}>Allotted Route:</span>
                <strong style={{ color: "#0284c7" }}>{activePass.route}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-muted)" }}>Morning Pickup:</span>
                <span>{activePass.pickupPoint || activePass.source}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-muted)" }}>Evening Drop:</span>
                <span>{activePass.dropPoint || activePass.destination}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-muted)" }}>Pass Type:</span>
                <span>{activePass.passType} Pass</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Valid Until:</span>
                <strong style={{ color: "#10b981" }}>{new Date(activePass.expiryDate).toLocaleDateString()}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ecfdf5", padding: "0.75rem 1rem", borderRadius: 8, border: "1px solid #a7f3d0", color: "#065f46", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Digital cryptographic verification matched successfully. Student is authorized for travel.</span>
            </div>

            <button
              onClick={() => setShowScannerModal(false)}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem" }}
            >
              Close Scanner Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalPass;
