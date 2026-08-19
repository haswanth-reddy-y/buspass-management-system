import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitPassApplication } from "../services/passService";
import { MapPin, Navigation, Bus, Send, AlertCircle, CheckCircle } from "lucide-react";
import "../styles/application.css";

const ApplyPass = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    route: "Route 101 - Central Express",
    source: "",
    destination: "",
    passType: "Monthly"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const routeOptions = [
  "Route 01 - Bhimavaram → Tadepalligudem",
  "Route 02 - Tadepalligudem → Bhimavaram",
  "Route 03 - Eluru → Tadepalligudem",
  "Route 04 - Tadepalligudem → Eluru",
  "Route 05 - Bhimavaram → Eluru",
  "Route 06 - Eluru → Bhimavaram",
  "Route 07 - Tanuku → Tadepalligudem",
  "Route 08 - Tadepalligudem → Tanuku",
  "Route 09 - Tanuku → Bhimavaram",
  "Route 10 - Bhimavaram → Tanuku",
  "Route 11 - Nidadavole → Tadepalligudem",
  "Route 12 - Tadepalligudem → Nidadavole",
  "Route 13 - Nidadavole → Tanuku",
  "Route 14 - Kovvur → Nidadavole",
  "Route 15 - Kovvur → Rajahmundry"
];

  const passTypes = [
    { title: "Monthly", duration: "30 Days" },
    { title: "Quarterly", duration: "90 Days" },
    { title: "Yearly", duration: "365 Days" }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await submitPassApplication(formData, token);
      setSuccess("Application submitted successfully! Redirecting to application status...");
      setTimeout(() => {
        navigate("/status");
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1>Apply for Bus Pass</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Fill out the route details and pass duration to request a new digital bus pass.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="glass-panel application-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Bus Route</label>
            <div style={{ position: "relative" }}>
              <Bus size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
              <select
                name="route"
                className="form-select"
                style={{ paddingLeft: 42 }}
                value={formData.route}
                onChange={handleChange}
                required
              >
                {routeOptions.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Boarding Stop (Source)</label>
              <div style={{ position: "relative" }}>
                <MapPin size={18} color="var(--secondary)" style={{ position: "absolute", left: 14, top: 14 }} />
                <input
                  type="text"
                  name="source"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="e.g. Central Station"
                  value={formData.source}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Destination Stop</label>
              <div style={{ position: "relative" }}>
                <Navigation size={18} color="var(--accent)" style={{ position: "absolute", left: 14, top: 14 }} />
                <input
                  type="text"
                  name="destination"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="e.g. University Campus Gate 2"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>Pass Type & Duration</label>
            <div className="pass-type-selector">
              {passTypes.map((pt) => (
                <div
                  key={pt.title}
                  className={`pass-type-option ${formData.passType === pt.title ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, passType: pt.title })}
                >
                  <div className="pass-type-title">{pt.title}</div>
                  <div className="pass-type-price">{pt.price} / {pt.duration}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "2rem", padding: "0.9rem" }}
            disabled={loading}
          >
            {loading ? "Submitting..." : <><Send size={18} /> Submit Application</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyPass;
