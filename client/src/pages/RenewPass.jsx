import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyPasses, submitPassRenewal, calculateBusFare } from "../services/passService";
import {
  RefreshCw,
  Bus,
  AlertCircle,
  CheckCircle,
  MapPin,
  Sunrise,
  Sunset,
  CheckCircle2
} from "lucide-react";
import "../styles/application.css";

const RenewPass = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [passes, setPasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [passType, setPassType] = useState("Monthly");
  const [pincode, setPincode] = useState("");

  // Fare State
  const [fareData, setFareData] = useState(null);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [fareError, setFareError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Duration multipliers (approx. working/travel days)
  const durationMultipliers = {
    Monthly: 22,
    Quarterly: 66,
    Yearly: 220
  };

  useEffect(() => {
    const loadPasses = async () => {
      try {
        const data = await fetchMyPasses(token);
        setPasses(data);
        if (data.length > 0) {
          const firstPass = data[0];
          setSelectedPass(firstPass);
          setPincode(firstPass.pincode || "");

          if (firstPass.dailyFare) {
            setFareData({
              originAddress: firstPass.pickupPoint || firstPass.source,
              destinationAddress: firstPass.destination,
              oneWayDistanceKm: firstPass.oneWayDistanceKm || 0,
              roundTripDistanceKm: firstPass.roundTripDistanceKm || 0,
              ratePerKm: firstPass.routeHasTolls ? 4.5 : 3.0,
              totalFare: firstPass.dailyFare,
              routeHasTolls: Boolean(firstPass.routeHasTolls)
            });
          } else if (firstPass.pincode && /^[1-9][0-9]{5}$/.test(firstPass.pincode)) {
            fetchFareForPass(firstPass.pincode);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load passes");
      } finally {
        setLoading(false);
      }
    };
    if (token) loadPasses();
  }, [token]);

  const fetchFareForPass = async (pin) => {
    const cleanPin = String(pin).trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setFareError("Enter a valid 6-digit Indian postal PIN code.");
      return;
    }

    setFareError("");
    setCalculatingFare(true);
    try {
      const response = await calculateBusFare(cleanPin);
      if (response.success && response.data) {
        setFareData(response.data);
      } else {
        setFareError(response.message || "Failed to calculate renewal fare.");
      }
    } catch (err) {
      setFareError(err.message || "Could not connect to fare service.");
    } finally {
      setCalculatingFare(false);
    }
  };

  const handleSelectPass = (pass) => {
    setSelectedPass(pass);
    setPincode(pass.pincode || "");

    if (pass.dailyFare) {
      setFareData({
        originAddress: pass.pickupPoint || pass.source,
        destinationAddress: pass.destination,
        oneWayDistanceKm: pass.oneWayDistanceKm || 0,
        roundTripDistanceKm: pass.roundTripDistanceKm || 0,
        ratePerKm: pass.routeHasTolls ? 4.5 : 3.0,
        totalFare: pass.dailyFare,
        routeHasTolls: Boolean(pass.routeHasTolls)
      });
    } else if (pass.pincode && /^[1-9][0-9]{5}$/.test(pass.pincode)) {
      fetchFareForPass(pass.pincode);
    } else {
      setFareData(null);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedPass) {
      setError("Please select a pass to renew.");
      return;
    }

    setSubmitting(true);
    try {
      const calculatedTotal = getPassPrice(passType) || 0;

      await submitPassRenewal(
        {
          passId: selectedPass.passId,
          passType,
          pincode: pincode || selectedPass.pincode,
          pickupPoint: fareData?.originAddress || selectedPass.pickupPoint || selectedPass.source,
          dropPoint: fareData?.originAddress || selectedPass.dropPoint || selectedPass.source,
          oneWayDistanceKm: fareData?.oneWayDistanceKm || selectedPass.oneWayDistanceKm || 0,
          roundTripDistanceKm: fareData?.roundTripDistanceKm || selectedPass.roundTripDistanceKm || 0,
          dailyFare: fareData?.totalFare || selectedPass.dailyFare || 0,
          totalFare: calculatedTotal,
          routeHasTolls: fareData?.routeHasTolls !== undefined ? fareData.routeHasTolls : selectedPass.routeHasTolls
        },
        token
      );
      setSuccess("Pass renewal request submitted successfully! Redirecting...");
      setTimeout(() => navigate("/status"), 1800);
    } catch (err) {
      setError(err.message || "Failed to submit renewal request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="application-container" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>Renew Student Bus Pass</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Extend the validity of your bus pass with verified round-trip distance and calculated fare.
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
            You need an approved pass before you can request a renewal.
          </p>
        </div>
      ) : (
        <div className="glass-panel application-form-card">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Select Pass */}
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label>Select Bus Pass to Renew</label>
              <select
                className="form-select"
                value={selectedPass ? selectedPass._id : ""}
                onChange={(e) => {
                  const pass = passes.find((p) => p._id === e.target.value);
                  if (pass) handleSelectPass(pass);
                }}
              >
                {passes.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.passId} ({p.source} ➔ {p.destination}) - Route: {p.route}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Home PIN Code Verification (No toll toggle; handled by backend) */}
            <div style={{ marginBottom: "1.75rem" }}>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={18} color="var(--primary)" />
                Home PIN Code & Fare Verification
              </h3>

              <div className="form-group">
                <label>Home Postal PIN Code</label>
                <div style={{ display: "flex", gap: "0.75rem", maxWidth: 500 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <MapPin size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: 14 }} />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 560034"
                      className="form-input"
                      style={{ paddingLeft: 42 }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchFareForPass(pincode)}
                    disabled={calculatingFare || pincode.length < 6}
                    className="btn btn-secondary"
                    style={{ padding: "0 1.5rem", whiteSpace: "nowrap" }}
                  >
                    {calculatingFare ? "Calculating..." : "Update Fare"}
                  </button>
                </div>
                <small style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
                  Distance and toll rates are evaluated automatically by the backend.
                </small>
              </div>

              {fareError && (
                <div className="alert alert-error" style={{ marginTop: "1rem" }}>
                  <AlertCircle size={18} />
                  <span>{fareError}</span>
                </div>
              )}
            </div>

            {/* Step 3: Verified Commute Route Details */}
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
                    Commute Route & Fare
                  </h3>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem"
                  }}
                >
                  <div style={{ background: "#ffffff", padding: "1rem", borderRadius: 8, border: "1px solid var(--card-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#d97706", fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>
                      <Sunrise size={16} /> MORNING PICKUP (Home)
                    </div>
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
                      {fareData.originAddress}
                    </strong>
                  </div>

                  <div style={{ background: "#ffffff", padding: "1rem", borderRadius: 8, border: "1px solid var(--card-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4f46e5", fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>
                      <Sunset size={16} /> EVENING RETURN DROP (Home)
                    </div>
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
                      {fareData.originAddress}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "0.75rem",
                    background: "#ffffff",
                    padding: "0.85rem",
                    borderRadius: 8,
                    border: "1px solid var(--card-border)",
                    textAlign: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ONE-WAY</div>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{fareData.oneWayDistanceKm} km</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ROUND-TRIP</div>
                    <div style={{ fontWeight: 700, color: "var(--primary)" }}>{fareData.roundTripDistanceKm} km</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>RATE</div>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>₹{fareData.ratePerKm}/km</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>DAILY FARE</div>
                    <div style={{ fontWeight: 800, color: "#047857" }}>₹{fareData.totalFare}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Current Route Allotment Info */}
            {selectedPass && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "0.85rem 1rem",
                  background: "#f8fafc",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--card-border)",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <Bus size={18} color="var(--primary)" />
                <span>
                  Current Allotted Route: <strong>{selectedPass.route}</strong> (managed by administrator)
                </span>
              </div>
            )}

            {/* Step 4: Duration Selection with Prices */}
            <div className="form-group">
              <label>Select Renewal Duration</label>
              <div className="pass-type-selector">
                {passTypes.map((pt) => {
                  const calculatedPrice = getPassPrice(pt.title);
                  return (
                    <div
                      key={pt.title}
                      className={`pass-type-option ${passType === pt.title ? "selected" : ""}`}
                      onClick={() => setPassType(pt.title)}
                    >
                      <div className="pass-type-title">{pt.title}</div>
                      <div className="pass-type-price">
                        {calculatedPrice !== null ? `₹${calculatedPrice}` : "Calculate PIN first"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                        {pt.duration}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Renewal Payable */}
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
                    Total {passType} Renewal Fee:
                  </span>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Valid for all round trips between home pickup & campus
                  </div>
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#15803d" }}>
                  ₹{getPassPrice(passType)}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "2rem", padding: "0.95rem" }}
              disabled={submitting}
            >
              {submitting ? (
                "Processing Renewal..."
              ) : (
                <>
                  <RefreshCw size={18} /> Request Pass Renewal
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RenewPass;
