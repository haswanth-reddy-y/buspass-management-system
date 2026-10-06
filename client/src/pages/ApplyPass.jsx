import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitPassApplication, calculateBusFare } from "../services/passService";
import {
  MapPin,
  Bus,
  Send,
  AlertCircle,
  CheckCircle,
  Sunrise,
  Sunset,
  CheckCircle2,
  Clock,
  ShieldCheck
} from "lucide-react";
import "../styles/application.css";

const ApplyPass = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    route: "Pending Admin Allotment",
    source: "",
    destination: "College Campus, India",
    pincode: "",
    pickupPoint: "",
    dropPoint: "",
    passType: "Monthly"
  });

  // Fare Calculation State
  const [fareData, setFareData] = useState(null);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [fareError, setFareError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Duration multipliers (approx. working/travel days)
  const durationMultipliers = {
    Monthly: 22,
    Quarterly: 66,
    Yearly: 220
  };

  const getPassPrice = (type) => {
    if (!fareData?.totalFare) return null;
    const days = durationMultipliers[type] || 22;
    return Number((fareData.totalFare * days).toFixed(2));
  };

  const passTypes = [
    { title: "Monthly", duration: "30 Days (22 Travel Days)" },
    { title: "Quarterly", duration: "90 Days (66 Travel Days)" },
    { title: "Yearly", duration: "365 Days (220 Travel Days)" }
  ];

  // Fetch Fare from Backend API (Backend automatically calculates road distance & toll rate)
  const handleFetchFare = async (pincodeOverride) => {
    const pin = pincodeOverride !== undefined ? pincodeOverride : formData.pincode;

    const cleanPin = String(pin).trim();
    if (!cleanPin) {
      setFareError("Please enter your 6-digit home postal PIN code.");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setFareError("PIN code must be a 6-digit Indian postal code (e.g., 560034).");
      return;
    }

    setFareError("");
    setCalculatingFare(true);

    try {
      // Backend automatically checks distance and tolls
      const response = await calculateBusFare(cleanPin);
      if (response.success && response.data) {
        setFareData(response.data);

        const homeLocality = response.data.originAddress || `${cleanPin}, India`;
        const collegeLocality = response.data.destinationAddress || "College Campus, India";

        // Auto-assign Pickup and Drop locations
        setFormData((prev) => ({
          ...prev,
          source: homeLocality,
          destination: collegeLocality,
          pickupPoint: homeLocality,
          dropPoint: homeLocality
        }));
      } else {
        setFareError(response.message || "Failed to calculate distance & fare.");
      }
    } catch (err) {
      setFareError(err.message || "Could not connect to fare calculation service.");
    } finally {
      setCalculatingFare(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fareData) {
      setError("Please enter your PIN code and fetch the commute fare before submitting.");
      return;
    }

    setLoading(true);

    const calculatedTotal = getPassPrice(formData.passType) || 0;

    const payload = {
      route: "Pending Admin Allotment",
      source: formData.source || fareData.originAddress,
      destination: formData.destination || fareData.destinationAddress,
      pincode: formData.pincode,
      pickupPoint: formData.pickupPoint || fareData.originAddress,
      dropPoint: formData.dropPoint || fareData.originAddress,
      oneWayDistanceKm: fareData.oneWayDistanceKm,
      roundTripDistanceKm: fareData.roundTripDistanceKm,
      dailyFare: fareData.totalFare,
      totalFare: calculatedTotal,
      routeHasTolls: fareData.routeHasTolls,
      passType: formData.passType
    };

    try {
      await submitPassApplication(payload, token);
      setSuccess("Bus pass application submitted successfully! Redirecting to status...");
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
    <div className="application-container" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>Apply for Student Bus Pass</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Enter your home PIN code to fetch distance and fare for morning pickup and evening drop.
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
          {/* Section 1: Home PIN Code Input (No tolls option; backend handles tolls) */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={20} color="var(--primary)" />
              1. Home Postal PIN Code
            </h3>

            <div className="form-group">
              <label>
                Student Home PIN Code <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "0.75rem", maxWidth: 500 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <MapPin
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: "absolute", left: 14, top: 14 }}
                  />
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, pincode: val });
                    }}
                    placeholder="e.g. 560034"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleFetchFare()}
                  disabled={calculatingFare || formData.pincode.length < 6}
                  className="btn btn-primary"
                  style={{ padding: "0 1.5rem", whiteSpace: "nowrap" }}
                >
                  {calculatingFare ? "Fetching..." : "Fetch Fare"}
                </button>
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
                Enter your 6-digit Indian PIN code. Driving distance and toll route rates are automatically evaluated.
              </small>
            </div>

            {fareError && (
              <div className="alert alert-error" style={{ marginTop: "1rem", marginBottom: 0 }}>
                <AlertCircle size={18} />
                <span>{fareError}</span>
              </div>
            )}
          </div>

          {/* Section 2: Calculated Commute & Pickup / Drop Points */}
          {fareData && (
            <div
              style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(59, 130, 246, 0.08) 100%)",
                border: "1px solid #bfdbfe"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                <CheckCircle2 color="#2563eb" size={20} />
                <h3 style={{ fontSize: "1.05rem", margin: 0, color: "var(--text-main)" }}>
                  2. Commute Route & Pickup/Drop Stops
                </h3>
              </div>

              {/* Morning Pickup & Evening Drop Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.25rem"
                }}
              >
                {/* Morning Journey */}
                <div
                  style={{
                    background: "#ffffff",
                    padding: "1rem 1.25rem",
                    borderRadius: 10,
                    border: "1px solid var(--card-border)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#d97706", fontWeight: 700, fontSize: "0.85rem", marginBottom: 6 }}>
                    <Sunrise size={18} /> MORNING COMMUTE
                  </div>
                  <div style={{ fontSize: "0.88rem" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>STARTING PICKUP (Home):</div>
                    <strong style={{ color: "var(--text-main)" }}>{fareData.originAddress}</strong>
                  </div>
                  <div style={{ fontSize: "0.88rem", marginTop: 8 }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>COLLEGE DROP:</div>
                    <span style={{ color: "var(--text-main)" }}>{fareData.destinationAddress}</span>
                  </div>
                </div>

                {/* Evening Return */}
                <div
                  style={{
                    background: "#ffffff",
                    padding: "1rem 1.25rem",
                    borderRadius: 10,
                    border: "1px solid var(--card-border)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4f46e5", fontWeight: 700, fontSize: "0.85rem", marginBottom: 6 }}>
                    <Sunset size={18} /> EVENING RETURN
                  </div>
                  <div style={{ fontSize: "0.88rem" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>CAMPUS PICKUP:</div>
                    <span style={{ color: "var(--text-main)" }}>{fareData.destinationAddress}</span>
                  </div>
                  <div style={{ fontSize: "0.88rem", marginTop: 8 }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>EVENING RETURN DROP (Home):</div>
                    <strong style={{ color: "var(--text-main)" }}>{fareData.originAddress}</strong>
                  </div>
                </div>
              </div>

              {/* Distance & Rate Summary Bar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "0.75rem",
                  background: "#ffffff",
                  padding: "1rem",
                  borderRadius: 8,
                  border: "1px solid var(--card-border)",
                  textAlign: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ONE-WAY</div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-main)" }}>
                    {fareData.oneWayDistanceKm} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ROUND-TRIP (DAILY)</div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--primary)" }}>
                    {fareData.roundTripDistanceKm} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>RATE</div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-main)" }}>
                    ₹{fareData.ratePerKm}/km
                  </div>
                  <div style={{ fontSize: "0.7rem", color: fareData.routeHasTolls ? "#d97706" : "#059669" }}>
                    {fareData.routeHasTolls ? "(Toll Road)" : "(Standard)"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>DAILY FARE</div>
                  <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#047857" }}>
                    ₹{fareData.totalFare}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Bus Route Allotment Notice (Allotted manually by Admin upon approval) */}
          <div
            style={{
              marginBottom: "1.75rem",
              padding: "1rem 1.25rem",
              background: "#f8fafc",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: "0.85rem"
            }}
          >
            <Bus size={24} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>
                Bus Route Allotment
              </div>
              <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                Your official bus route line will be manually allotted by the transport administrator at the time of approval.
              </div>
            </div>
          </div>

          {/* Section 4: Pass Duration with Dynamic Calculated Prices */}
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>
              3. Pass Type & Duration{" "}
              {fareData && (
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                  (Pricing dynamically calculated from round-trip distance)
                </span>
              )}
            </label>
            <div className="pass-type-selector">
              {passTypes.map((pt) => {
                const calculatedPrice = getPassPrice(pt.title);
                return (
                  <div
                    key={pt.title}
                    className={`pass-type-option ${formData.passType === pt.title ? "selected" : ""}`}
                    onClick={() => setFormData({ ...formData, passType: pt.title })}
                  >
                    <div className="pass-type-title">{pt.title}</div>
                    <div className="pass-type-price">
                      {calculatedPrice !== null ? `₹${calculatedPrice}` : "Fetch PIN code first"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                      {pt.duration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Payable Summary */}
          {fareData && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem 1.25rem",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}
            >
              <div>
                <span style={{ fontSize: "0.9rem", color: "#166534" }}>
                  Total {formData.passType} Pass Fee:
                </span>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Daily round-trip commute included for entire validity
                </div>
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#15803d" }}>
                ₹{getPassPrice(formData.passType)}
              </div>
            </div>
          )}

          {/* Submit Application Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "2rem", padding: "0.95rem" }}
            disabled={loading || calculatingFare || !fareData}
          >
            {loading ? (
              "Submitting Application..."
            ) : (
              <>
                <Send size={18} />
                <span>
                  {fareData ? "Submit Pass Application" : "Enter PIN Code & Fetch Fare to Proceed"}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyPass;
