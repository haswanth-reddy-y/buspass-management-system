import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, X, ShieldAlert } from "lucide-react";

/**
 * PassExpiryAlert Component
 * Automatically displays a pop-up notification modal when a student's active pass is about to expire (within 7 days)
 * or has expired, with one-click renewal redirection.
 */
const PassExpiryAlert = ({ activePass }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activePass || !activePass.expiryDate) return;

    const expiry = new Date(activePass.expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Trigger pop-up alert if 7 days or fewer remain until expiry
    if (diffDays <= 7) {
      const dismissKey = `dismiss_expiry_alert_${activePass.passId}_${now.toDateString()}`;
      const dismissed = sessionStorage.getItem(dismissKey);
      if (!dismissed) {
        setShowModal(true);
      }
    }
  }, [activePass]);

  if (!activePass || !activePass.expiryDate) return null;

  const expiry = new Date(activePass.expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Only display if within 7 days of expiry
  if (diffDays > 7) return null;

  const isExpired = diffDays <= 0;
  const daysText = isExpired
    ? "has expired"
    : diffDays === 1
    ? "expires tomorrow"
    : `expires in ${diffDays} days`;

  const handleDismiss = () => {
    const dismissKey = `dismiss_expiry_alert_${activePass.passId}_${new Date().toDateString()}`;
    sessionStorage.setItem(dismissKey, "true");
    setShowModal(false);
  };

  const handleRenewNow = () => {
    setShowModal(false);
    navigate("/renew");
  };

  return (
    <>
      {/* 1. Interactive Pop-up Notification Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div
            className="glass-panel modal-card"
            style={{
              maxWidth: 480,
              padding: "2rem",
              border: `1px solid ${isExpired ? "#fca5a5" : "#fde68a"}`,
              boxShadow: "0 25px 50px -12px rgba(180, 83, 9, 0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: isExpired ? "#fee2e2" : "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isExpired ? "#dc2626" : "#d97706"
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: isExpired ? "#b91c1c" : "#92400e" }}>
                    {isExpired ? "Bus Pass Expired!" : "Bus Pass Expiring Soon!"}
                  </h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
                    Official Transit Expiry Notice
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                title="Dismiss notification"
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                background: isExpired ? "#fef2f2" : "#fffbeb",
                border: `1px solid ${isExpired ? "#fecaca" : "#fde68a"}`,
                borderRadius: 10,
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                color: isExpired ? "#991b1b" : "#78350f",
                lineHeight: 1.55
              }}
            >
              Your <strong>{activePass.passType} Pass</strong> (ID: <code>{activePass.passId}</code>) on route <strong>{activePass.route}</strong> {daysText} on <strong>{expiry.toLocaleDateString()}</strong>.
              <div style={{ marginTop: 8, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Please request a renewal to avoid transit service disruption.
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleDismiss}
                className="btn btn-secondary"
                style={{ padding: "0.65rem 1.25rem", fontSize: "0.88rem" }}
              >
                Remind Later
              </button>
              <button
                type="button"
                onClick={handleRenewNow}
                className="btn"
                style={{
                  padding: "0.65rem 1.4rem",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  background: isExpired ? "#dc2626" : "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                  color: "#ffffff",
                  boxShadow: "0 4px 12px rgba(180, 83, 9, 0.3)"
                }}
              >
                <RefreshCw size={16} /> Renew Pass Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Persistent Attention Banner on Page */}
      <div
        style={{
          background: isExpired
            ? "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
            : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          border: `1px solid ${isExpired ? "#fca5a5" : "#fcd34d"}`,
          borderRadius: 10,
          padding: "0.85rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={20} color={isExpired ? "#dc2626" : "#d97706"} />
          <div>
            <strong style={{ color: isExpired ? "#991b1b" : "#92400e", fontSize: "0.92rem" }}>
              {isExpired ? "Your bus pass has expired!" : `Attention: Your bus pass ${daysText} (${expiry.toLocaleDateString()})`}
            </strong>
            <div style={{ fontSize: "0.8rem", color: isExpired ? "#7f1d1d" : "#78350f" }}>
              Pass ID: {activePass.passId} | Route: {activePass.route}
            </div>
          </div>
        </div>
        <Link
          to="/renew"
          className="btn"
          style={{
            background: isExpired ? "#dc2626" : "#d97706",
            color: "#ffffff",
            padding: "0.45rem 1rem",
            fontSize: "0.82rem",
            fontWeight: 700
          }}
        >
          <RefreshCw size={14} /> Renew Now
        </Link>
      </div>
    </>
  );
};

export default PassExpiryAlert;
