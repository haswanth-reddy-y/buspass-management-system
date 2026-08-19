import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FilePlus,
  RefreshCw,
  Clock,
  QrCode,
  Users,
  FileCheck,
  BarChart3
} from "lucide-react";

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === "admin";

  const studentLinks = [
    { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { to: "/apply", label: "Apply Pass", icon: <FilePlus size={18} /> },
    { to: "/renew", label: "Renew Pass", icon: <RefreshCw size={18} /> },
    { to: "/status", label: "Applications", icon: <Clock size={18} /> },
    { to: "/digital-pass", label: "Digital Pass", icon: <QrCode size={18} /> }
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Admin Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/admin/applications", label: "Applications Queue", icon: <FileCheck size={18} /> },
    { to: "/admin/users", label: "Manage Students", icon: <Users size={18} /> },
    { to: "/admin/reports", label: "Reports & Analytics", icon: <BarChart3 size={18} /> }
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside
      className="glass-panel"
      style={{
        width: 260,
        borderRadius: 0,
        borderTop: 0,
        borderBottom: 0,
        padding: "1.75rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }}
    >
      <div
        style={{
          padding: "0 0.75rem 1rem",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em"
        }}
      >
        {isAdmin ? "Admin Control Panel" : "Student Menu"}
      </div>

      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            fontSize: "0.92rem",
            color: isActive ? "#ffffff" : "var(--text-muted)",
            background: isActive
              ? "linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%)"
              : "transparent",
            border: isActive ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.2s ease"
          })}
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;