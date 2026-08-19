import React from "react";
import { ArrowRight, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const ApplicationCard = ({ application }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case "Approved": return "badge-approved";
      case "Rejected": return "badge-rejected";
      default: return "badge-pending";
    }
  };

  return (
    <div className="glass-panel app-card">
      <div>
        <div className="app-card-header">
          <div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>
              App ID: {application.applicationId}
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--secondary)" }}>
              {application.applicationType} Pass ({application.passType})
            </span>
          </div>
          <span className={`badge ${getBadgeClass(application.status)}`}>
            {application.status === "Approved" && <CheckCircle size={12} />}
            {application.status === "Pending" && <Clock size={12} />}
            {application.status === "Rejected" && <AlertTriangle size={12} />}
            {application.status}
          </span>
        </div>

        <div className="app-route-info">
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>Route Path</div>
          <div className="route-endpoint" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{application.source}</span>
            <ArrowRight size={14} className="route-arrow" />
            <span>{application.destination}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Route: {application.route}
          </div>
        </div>

        {application.rejectionReason && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.82rem", color: "#fca5a5" }}>
            <strong>Rejection Reason:</strong> {application.rejectionReason}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "var(--text-muted)", paddingTop: "0.75rem", borderTop: "1px solid var(--card-border)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <Calendar size={12} /> Applied: {new Date(application.appliedDate || application.createdAt).toLocaleDateString()}
        </span>
        {application.processedDate && (
          <span>Processed: {new Date(application.processedDate).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
