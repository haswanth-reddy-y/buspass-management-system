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
  ShieldCheck,
  Home,
  Navigation,
  Compass
} from "lucide-react";
import "../styles/application.css";

const ApplyPass = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    route: "Pending Admin Allotment",
    pincode: "",
    villageTown: "",
    stopName: "",
    dropPoint: "College Campus, India",
    passType: "Monthly"
  });

  // Fare Calculation State
  const [fareData, setFareData] = useState(null);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [fareError, setFareError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const getPassPrice = (type) => {
    if (!fareData) return null;
    if (fareData.isSamePincode) {
      if (type === "Monthly") return 650;
      if (type === "Quarterly") return 1950;
      if (type === "Yearly") return 6500;
      return 650;
    }
    if (type === "Monthly") return fareData.monthlyFare || Number((fareData.dailyFare * 22).toFixed(2));
    if (type === "Quarterly") return fareData.quarterlyFare || Number((fareData.dailyFare * 66).toFixed(2));
    if (type === "Yearly") return fareData.yearlyFare || Number((fareData.dailyFare * 220).toFixed(2));
    return Number((fareData.dailyFare * 22).toFixed(2));
  };

  const passTypes = [
    { title: "Monthly", duration: "30 Days (22 Travel Days)" },
    { title: "Quarterly", duration: "90 Days (66 Travel Days)" },
    { title: "Yearly", duration: "365 Days (220 Travel Days)" }
  ];

  // Fetch Fare from Backend API (Free Nominatim + OSRM)
  const handleFetchFare = async (pincodeOverride) => {
    const pin = pincodeOverride !== undefined ? pincodeOverride : formData.pincode;

    const cleanPin = String(pin).trim();
    if (!cleanPin) {
      setFareError("Please enter your 6-digit home postal PIN code.");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setFareError("PIN code must be a 6-digit Indian postal code (e.g., 534101, 560034).");
      return;
    }

    setFareError("");
    setCalculatingFare(true);

    try {
      const response = await calculateBusFare(cleanPin);
      if (response.success && response.data) {
        setFareData(response.data);

        // Pre-fill village/town suggestion from geocoded address if not already entered by student
        const suggestedTown = response.data.originAddress
          ? response.data.originAddress.split(",")[0].trim()
          : "";

        setFormData((prev) => ({
          ...prev,
          pincode: cleanPin,
          villageTown: prev.villageTown || suggestedTown,
          dropPoint: prev.dropPoint || response.data.destinationAddress || "College Campus, India"
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

    if (!formData.villageTown || !formData.villageTown.trim()) {
      setError("Please enter your Village or Town name.");
      return;
    }

    if (!formData.stopName || !formData.stopName.trim()) {
      setError("Please enter your Boarding Stop name.");
      return;
    }

    if (!formData.dropPoint || !formData.dropPoint.trim()) {
      setError("Please enter your Drop Location.");
      return;
    }

    setLoading(true);

    const calculatedTotal = getPassPrice(formData.passType) || 0;
    const formattedPickup = `${formData.villageTown.trim()} - ${formData.stopName.trim()}`;

    const payload = {
      route: "Pending Admin Allotment",
      source: formData.villageTown.trim(),
      destination: formData.dropPoint.trim(),
      pincode: formData.pincode.trim(),
      villageTown: formData.villageTown.trim(),
      stopName: formData.stopName.trim(),
      pickupPoint: formattedPickup,
      dropPoint: formData.dropPoint.trim(),
      oneWayDistanceKm: fareData.oneWayDistanceKm,
      roundTripDistanceKm: fareData.roundTripDistanceKm,
      dailyFare: fareData.dailyFare,
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
    <div className="application-container" style={{ maxWidth: 880 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>Apply for Student Bus Pass</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Calculate distance-based fare using your postal PIN code, specify your stop & village details manually, and apply for your pass.
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
          {/* Section 1: Postal PIN Code */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={20} color="var(--primary)" />
              1. Home Postal PIN Code
            </h3>

            <div className="form-group">
              <label>
                Student Home PIN Code <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "0.75rem", maxWidth: 520 }}>
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
                    placeholder="e.g. 534101"
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
                  {calculatingFare ? "Calculating..." : "Fetch Fare"}
                </button>
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 6, display: "block" }}>
                Enter your 6-digit postal PIN code to automatically calculate route commute fare.
              </small>
            </div>

            {fareError && (
              <div className="alert alert-error" style={{ marginTop: "1rem", marginBottom: 0 }}>
                <AlertCircle size={18} />
                <span>{fareError}</span>
              </div>
            )}
          </div>

          {/* Section 2: Manual Student Stop Details (Village/Town, Stop Name, Drop Location) */}
          <div style={{ marginBottom: "1.75rem", padding: "1.25rem", background: "#f8fafc", borderRadius: "var(--radius-md)", border: "1px solid var(--card-border)" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8, color: "var(--text-main)" }}>
              <Navigation size={18} color="var(--primary)" />
              2. Student Stop & Commute Details (Manual Input)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              {/* Village or Town Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>
                  Village / Town Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Home size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={formData.villageTown}
                    onChange={(e) => setFormData({ ...formData, villageTown: e.target.value })}
                    placeholder="e.g. Tadepalligudem / Pentapadu"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>
                <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  Enter your native village or town name.
                </small>
              </div>

              {/* Boarding Stop Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>
                  Boarding / Pickup Stop Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Compass size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={formData.stopName}
                    onChange={(e) => setFormData({ ...formData, stopName: e.target.value })}
                    placeholder="e.g. Main Bus Stand / Clock Tower"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>
                <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  Specific stop where you board the bus.
                </small>
              </div>

              {/* Drop Location */}
              <div className="form-group" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
                <label>
                  Drop Location (Campus Arrival & Return) <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <MapPin size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={formData.dropPoint}
                    onChange={(e) => setFormData({ ...formData, dropPoint: e.target.value })}
                    placeholder="e.g. College Campus Main Gate / Engineering Block"
                    className="form-input"
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>
                <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  College arrival drop and return pickup point (manually customizable).
                </small>
              </div>
            </div>

            {/* Commute Summary Cards */}
            {(formData.villageTown || formData.stopName) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "1rem",
                  marginTop: "1.25rem"
                }}
              >
                {/* Morning Commute */}
                <div
                  style={{
                    background: "#ffffff",
                    padding: "1rem 1.25rem",
                    borderRadius: 8,
                    border: "1px solid var(--card-border)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#d97706", fontWeight: 700, fontSize: "0.82rem", marginBottom: 6 }}>
                    <Sunrise size={16} /> MORNING COMMUTE
                  </div>
                  <div style={{ fontSize: "0.85rem" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>BOARDING PICKUP:</div>
                    <strong style={{ color: "var(--text-main)" }}>
                      {formData.stopName ? `${formData.stopName}, ` : ""}{formData.villageTown || "Your Village/Town"}
                    </strong>
                  </div>
                  <div style={{ fontSize: "0.85rem", marginTop: 6 }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>CAMPUS DROP:</div>
                    <span style={{ color: "var(--text-main)" }}>{formData.dropPoint || "College Campus, India"}</span>
                  </div>
                </div>

                {/* Evening Commute */}
                <div
                  style={{
                    background: "#ffffff",
                    padding: "1rem 1.25rem",
                    borderRadius: 8,
                    border: "1px solid var(--card-border)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4f46e5", fontWeight: 700, fontSize: "0.82rem", marginBottom: 6 }}>
                    <Sunset size={16} /> EVENING RETURN
                  </div>
                  <div style={{ fontSize: "0.85rem" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>CAMPUS PICKUP:</div>
                    <span style={{ color: "var(--text-main)" }}>{formData.dropPoint || "College Campus, India"}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", marginTop: 6 }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>RETURN DROP:</div>
                    <strong style={{ color: "var(--text-main)" }}>
                      {formData.stopName ? `${formData.stopName}, ` : ""}{formData.villageTown || "Your Village/Town"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Verified Route Distance & Fare Breakdown */}
          {fareData && (
            <div
              style={{
                marginBottom: "2rem",
                padding: "1.5rem",
                borderRadius: "var(--radius-md)",
                background: fareData.isSamePincode
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.09) 100%)"
                  : "linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(59, 130, 246, 0.08) 100%)",
                border: `1px solid ${fareData.isSamePincode ? "#a7f3d0" : "#bfdbfe"}`
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 color={fareData.isSamePincode ? "#059669" : "#2563eb"} size={20} />
                  <h3 style={{ fontSize: "1.05rem", margin: 0, color: "var(--text-main)" }}>
                    3. Fare & Commute Calculation
                  </h3>
                </div>

                {fareData.isSamePincode ? (
                  <span
                    style={{
                      background: "#d1fae5",
                      color: "#065f46",
                      padding: "0.3rem 0.75rem",
                      borderRadius: 20,
                      fontSize: "0.8rem",
                      fontWeight: 700
                    }}
                  >
                    🎉 Same Pincode Concession Rate: ₹650 / Month
                  </span>
                ) : (
                  <span
                    style={{
                      background: "#e0e7ff",
                      color: "#3730a3",
                      padding: "0.3rem 0.75rem",
                      borderRadius: 20,
                      fontSize: "0.8rem",
                      fontWeight: 700
                    }}
                  >
                    Standard Route: Base ₹50 + ₹{fareData.ratePerKm}/km
                  </span>
                )}
              </div>

              {/* Stats Bar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "0.75rem",
                  background: "#ffffff",
                  padding: "1rem",
                  borderRadius: 8,
                  border: "1px solid var(--card-border)",
                  textAlign: "center"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ONE-WAY</div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-main)" }}>
                    {fareData.oneWayDistanceKm} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ROUND-TRIP (DAILY)</div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--primary)" }}>
                    {fareData.roundTripDistanceKm} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>KM RATE</div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-main)" }}>
                    ₹{fareData.ratePerKm}/km
                  </div>
                  <div style={{ fontSize: "0.68rem", color: fareData.routeHasTolls ? "#d97706" : "#059669" }}>
                    {fareData.routeHasTolls ? "(Toll Road: ₹1.5)" : "(Toll-Free: ₹1.0)"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>DAILY FARE</div>
                  <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#047857" }}>
                    ₹{fareData.dailyFare}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    {fareData.isSamePincode ? "(Concession daily avg)" : "(₹50 base + km)"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Bus Route Notice */}
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
                Official Bus Route Allotment
              </div>
              <div style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                Your official bus route line will be manually allotted by the transport administrator at the time of approval.
              </div>
            </div>
          </div>

          {/* Section 5: Pass Duration with Dynamic Calculated Prices */}
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>
              4. Pass Type & Duration{" "}
              {fareData && (
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                  ({fareData.isSamePincode ? "Local Flat Rate Concession: ₹650/month" : "Dynamic Distance Pricing"})
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
                <span style={{ fontSize: "0.9rem", color: "#166534", fontWeight: 700 }}>
                  Total {formData.passType} Pass Fee:
                </span>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {fareData.isSamePincode
                    ? "Local student concession applied (₹650/month)"
                    : "Base ₹50 + round-trip commute included for entire duration"}
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
