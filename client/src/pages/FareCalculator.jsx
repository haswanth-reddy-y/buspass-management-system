import React, { useState } from "react";
import { Link } from "react-router-dom";
import { calculateBusFare } from "../services/passService";
import {
  Calculator,
  MapPin,
  Navigation,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Fuel
} from "lucide-react";
import "../styles/application.css";

const FareCalculator = () => {
  const [studentPincode, setStudentPincode] = useState("");
  const [routeHasTolls, setRouteHasTolls] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fareData, setFareData] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError("");
    setFareData(null);

    const cleanPin = studentPincode.trim();
    if (!cleanPin) {
      setError("Please enter your 6-digit postal PIN code.");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setError("Invalid Indian PIN code format. It must be a 6-digit number (e.g. 560034).");
      return;
    }

    setLoading(true);
    try {
      const response = await calculateBusFare(cleanPin, routeHasTolls);
      if (response.success && response.data) {
        setFareData(response.data);
      } else {
        setError(response.message || "Failed to calculate bus fare.");
      }
    } catch (err) {
      setError(err.message || "Unable to reach fare calculation service. Check server or Google Maps configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-container" style={{ maxWidth: 840 }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff"
            }}
          >
            <Calculator size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: 0 }}>Student Bus Fare Calculator</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>
              Calculate accurate round-trip driving distances and daily bus fare from your home to college.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Calculation Form */}
      <div className="glass-panel application-form-card" style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleCalculate}>
          <div className="form-grid-2">
            {/* Student Pincode */}
            <div className="form-group">
              <label htmlFor="studentPincode">
                Student Home PIN Code <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <MapPin
                  size={18}
                  color="var(--text-muted)"
                  style={{ position: "absolute", left: 14, top: 14 }}
                />
                <input
                  id="studentPincode"
                  type="text"
                  maxLength={6}
                  value={studentPincode}
                  onChange={(e) => setStudentPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 560034"
                  className="form-input"
                  style={{ paddingLeft: "2.75rem" }}
                  required
                />
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                6-digit Indian Postal Code
              </small>
            </div>

            {/* Destination Info */}
            <div className="form-group">
              <label>College Destination Location</label>
              <div style={{ position: "relative" }}>
                <Navigation
                  size={18}
                  color="var(--primary)"
                  style={{ position: "absolute", left: 14, top: 14 }}
                />
                <input
                  type="text"
                  value="College Campus (Configured Destination)"
                  disabled
                  className="form-input"
                  style={{ paddingLeft: "2.75rem", background: "#f8fafc", color: "var(--text-muted)" }}
                />
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Fixed destination set in system settings
              </small>
            </div>
          </div>

          {/* Toll Road Toggle */}
          <div
            style={{
              margin: "1.25rem 0",
              padding: "1rem 1.25rem",
              background: "#f8fafc",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-main)" }}>
                Route Includes Toll Plazas?
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Regular Rate: ₹3.0/km | Toll Route Rate: ₹4.5/km
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={routeHasTolls}
                onChange={(e) => setRouteHasTolls(e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--primary)" }}
              />
              <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                {routeHasTolls ? "Tolls (₹4.5/km)" : "No Tolls (₹3.0/km)"}
              </span>
            </label>
          </div>

          {/* Calculate Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "0.95rem", fontSize: "1rem" }}
          >
            {loading ? (
              <span>Calculating Route Distance...</span>
            ) : (
              <>
                <Calculator size={18} />
                <span>Calculate Daily Round-Trip Fare</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {fareData && (
        <div
          className="glass-panel"
          style={{
            padding: "2rem",
            border: "1px solid #bfdbfe",
            background: "linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)",
            borderRadius: "var(--radius-md)",
            marginBottom: "2rem",
            boxShadow: "0 4px 20px -2px rgba(37, 99, 235, 0.12)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <CheckCircle2 color="#2563eb" size={24} />
            <h2 style={{ fontSize: "1.3rem", margin: 0, color: "var(--text-main)" }}>
              Distance & Fare Breakdown
            </h2>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem"
            }}
          >
            {/* One-Way Distance */}
            <div
              style={{
                background: "#ffffff",
                padding: "1rem 1.25rem",
                borderRadius: 10,
                border: "1px solid var(--card-border)"
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                ONE-WAY DISTANCE
              </div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-main)", marginTop: "0.25rem" }}>
                {fareData.oneWayDistanceKm} km
              </div>
              {fareData.estimatedDurationText && (
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <Clock size={12} /> ~{fareData.estimatedDurationText} driving
                </div>
              )}
            </div>

            {/* Round Trip Distance */}
            <div
              style={{
                background: "#ffffff",
                padding: "1rem 1.25rem",
                borderRadius: 10,
                border: "1px solid var(--card-border)"
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                ROUND-TRIP (DAILY)
              </div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#2563eb", marginTop: "0.25rem" }}>
                {fareData.roundTripDistanceKm} km
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                {fareData.oneWayDistanceKm} km × 2
              </div>
            </div>

            {/* Applied Rate */}
            <div
              style={{
                background: "#ffffff",
                padding: "1rem 1.25rem",
                borderRadius: 10,
                border: "1px solid var(--card-border)"
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                RATE APPLIED
              </div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-main)", marginTop: "0.25rem" }}>
                ₹{fareData.ratePerKm}/km
              </div>
              <div style={{ fontSize: "0.78rem", color: fareData.routeHasTolls ? "#d97706" : "#059669", marginTop: 4 }}>
                {fareData.routeHasTolls ? "Includes Tolls (₹4.5)" : "Standard (₹3.0)"}
              </div>
            </div>

            {/* Total Daily Fare */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                padding: "1rem 1.25rem",
                borderRadius: 10,
                color: "#ffffff"
              }}
            >
              <div style={{ fontSize: "0.8rem", opacity: 0.9, fontWeight: 600 }}>
                TOTAL DAILY FARE
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem" }}>
                ₹{fareData.totalFare}
              </div>
              <div style={{ fontSize: "0.78rem", opacity: 0.85, marginTop: 4 }}>
                Round Trip Travel
              </div>
            </div>
          </div>

          {/* Route Locality Details */}
          <div
            style={{
              padding: "1rem",
              background: "#ffffff",
              borderRadius: 8,
              border: "1px solid var(--card-border)",
              marginBottom: "1.5rem",
              fontSize: "0.88rem"
            }}
          >
            <div style={{ marginBottom: 6 }}>
              <strong>From (Home):</strong> {fareData.originAddress}
            </div>
            <div>
              <strong>To (College):</strong> {fareData.destinationAddress}
            </div>
          </div>

          {/* Estimated Monthly Cost & Apply CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e2e8f0"
            }}
          >
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Estimated Monthly Pass (~22 Working Days):{" "}
              </span>
              <strong style={{ fontSize: "1.1rem", color: "#1e40af" }}>
                ₹{Number((fareData.totalFare * 22).toFixed(2))}
              </strong>
            </div>

            <Link
              to="/apply"
              className="btn btn-primary"
              style={{ padding: "0.65rem 1.2rem", fontSize: "0.9rem" }}
            >
              <span>Apply For Bus Pass</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Fare Policy Information Card */}
      <div
        className="glass-panel"
        style={{
          padding: "1.5rem",
          borderRadius: "var(--radius-md)",
          background: "#ffffff"
        }}
      >
        <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={18} color="#2563eb" />
          Official Bus Fare Rules
        </h3>
        <ul style={{ paddingLeft: "1.25rem", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>
          <li>
            <strong>Standard Driving Rate:</strong> ₹3.0 per kilometer for non-toll routes.
          </li>
          <li>
            <strong>Toll Road Rate:</strong> ₹4.5 per kilometer for routes passing through toll plazas.
          </li>
          <li>
            <strong>Round Trip Formula:</strong> Total Daily Fare = (One-way distance in km × 2) × Applicable Rate.
          </li>
          <li>
            Distances are calculated in real-time using Google Maps driving routes to ensure precision and fairness.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FareCalculator;
