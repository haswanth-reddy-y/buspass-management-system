import React from "react";

const Footer = () => {
  return (
    <footer style={{ padding: "1.5rem 2rem", textAlign: "center", borderTop: "1px solid var(--card-border)", background: "rgba(11, 15, 25, 0.9)", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "auto" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          © {new Date().getFullYear()} TransitPass Management System. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Support & Helpdesk</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
