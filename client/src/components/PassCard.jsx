import React from "react";
import { Link } from "react-router-dom";
import { Bus, Calendar, QrCode, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

const PassCard = ({ pass }) => {
  const isExpired = pass.status === "Expired" || new Date(pass.expiryDate) < new Date();

  return (
    <div className="glass-panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: isExpired ? "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)" : "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bus size={18} color="var(--secondary)" />
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>{pass.passId}</span>
          </div>
          <span className={`badge ${isExpired ? 'badge-expired' : 'badge-active'}`}>
            {isExpired ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
            {isExpired ? "Expired" : "Active Pass"}
          </span>
        </div>

        <div style={{ background: "rgba(0, 0, 0, 0.2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>Route Line</div>
          <div style={{ fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{pass.source}</span>
            <ArrowRight size={14} color="var(--secondary)" />
            <span>{pass.destination}</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--secondary)", marginTop: "0.25rem" }}>
            Via: {pass.route} ({pass.passType} Pass)
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Calendar size={14} /> Valid Till:
          </span>
          <span style={{ color: isExpired ? "var(--danger)" : "#fff", fontWeight: 700 }}>
            {new Date(pass.expiryDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      <Link to="/digital-pass" className="btn btn-primary" style={{ width: "100%" }}>
        <QrCode size={16} /> View Digital Pass
      </Link>
    </div>
  );
};

export default PassCard;
