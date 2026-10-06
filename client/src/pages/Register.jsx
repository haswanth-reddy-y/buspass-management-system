import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bus, User, Mail, Lock, CreditCard, Building, Phone, ArrowRight, AlertCircle } from "lucide-react";
import "../styles/login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    department: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <Bus size={32} color="#3b82f6" />
            <span>Transit<span style={{ color: "#3b82f6" }}>Pass</span></span>
          </div>
          <p className="auth-subtitle">Create a student account to get started</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
              <input
                type="text"
                name="name"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="john@univ.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Student ID Number</label>
              <div style={{ position: "relative" }}>
                <CreditCard size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
                <input
                  type="text"
                  name="studentId"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="CS-2026-042"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Department / Branch</label>
              <div style={{ position: "relative" }}>
                <Building size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="Computer Science"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div style={{ position: "relative" }}>
                <Phone size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
              <input
                type="password"
                name="password"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem", padding: "0.85rem" }}
            disabled={loading}
          >
            {loading ? "Creating account..." : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
