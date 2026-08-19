import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bus, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className="glass-panel"
      style={{
        borderRadius: 0,
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#0f172a",
        borderBottom: "1px solid var(--card-border)"
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0.85rem 2rem",
          display: "flex",
          alignItems: "center",
          justify: "space-between"
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "1.35rem",
            fontWeight: 800,
            color: "#f8fafc",
            textDecoration: "none"
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563eb 0%, #4338ca 100%)",
              display: "flex",
              alignItems: "center",
              justify: "center"
            }}
          >
            <Bus size={22} color="#fff" />
          </div>
          <span>
            Transit<span style={{ color: "#3b82f6" }}>Pass</span>
          </span>
        </Link>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  justify: "center",
                  border: "1px solid var(--card-border)"
                }}
              >
                <UserIcon size={18} color="#9ca3af" />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f8fafc" }}>
                  {user.name}
                </span>
                <span
                  className={`badge ${user.role === "admin" ? "badge-approved" : "badge-pending"}`}
                  style={{ fontSize: "0.7rem", padding: "0.1rem 0.5rem" }}
                >
                  {user.role === "admin" ? (
                    <>
                      <ShieldCheck size={10} /> Admin Portal
                    </>
                  ) : (
                    `ID: ${user.studentId || "Student"}`
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: "0.5rem 1rem" }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;