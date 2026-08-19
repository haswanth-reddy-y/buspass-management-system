import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyPasses, submitPassRenewal } from "../services/passService";
import { RefreshCw, Bus, AlertCircle, CheckCircle } from "lucide-react";
import "../styles/application.css";

const RenewPass = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [passes, setPasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [passType, setPassType] = useState("Monthly");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPasses = async () => {
      try {
        const data = await fetchMyPasses(token);
        setPasses(data);
        if (data.length > 0) {
          setSelectedPass(data[0]);
        }
      } catch (err) {
        setError(err.message || "Failed to load passes");
      } finally {
        setLoading(false);
      }
    };
    if (token) loadPasses();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedPass) {
      setError("Please select a pass to renew");
      return;
    }

    setSubmitting(true);
    try {
      await submitPassRenewal({ passId: selectedPass.passId, passType }, token);
      setSuccess("Renewal request submitted successfully! Redirecting...");
      setTimeout(() => navigate("/status"), 1800);
    } catch (err) {
      setError(err.message || "Failed to submit renewal request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="application-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1>Renew Bus Pass</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Extend the validity of your bus pass seamlessly with one click.
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

      {loading ? (
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading pass records...
        </div>
      ) : passes.length === 0 ? (
        <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
          <Bus size={48} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
          <h3>No Bus Pass Records Found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            You need an existing pass before you can request a renewal.
          </p>
        </div>
      ) : (
        <div className="glass-panel application-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Pass to Renew</label>
              <select
                className="form-select"
                value={selectedPass ? selectedPass._id : ""}
                onChange={(e) => {
                  const pass = passes.find((p) => p._id === e.target.value);
                  setSelectedPass(pass);
                }}
              >
                {passes.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.passId} ({p.source} ➔ {p.destination}) - Status: {p.status}
                  </option>
                ))}
              </select>
            </div>

            {selectedPass && (
              <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--card-border)", margin: "1.25rem 0" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Current Pass Details</div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>
                  {selectedPass.source} to {selectedPass.destination}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--secondary)", marginTop: "0.25rem" }}>
                  Route: {selectedPass.route}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  Expired / Expiry Date: {new Date(selectedPass.expiryDate).toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Select Renewal Duration</label>
              <div className="pass-type-selector">
                {["Monthly", "Quarterly", "Yearly"].map((type) => (
                  <div
                    key={type}
                    className={`pass-type-option ${passType === type ? 'selected' : ''}`}
                    onClick={() => setPassType(type)}
                  >
                    <div className="pass-type-title">{type}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "2rem", padding: "0.9rem" }}
              disabled={submitting}
            >
              {submitting ? "Processing..." : <><RefreshCw size={18} /> Request Renewal</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RenewPass;
