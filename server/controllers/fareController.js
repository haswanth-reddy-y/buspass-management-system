const COLLEGE_LOCATION = process.env.COLLEGE_LOCATION || "534101, India";
const DEFAULT_BASE_FARE = 50.0; // ₹50 default base value for calculating
const TOLL_RATE_PER_KM = 1.5;   // ₹1.5 per km with tolls
const TOLL_FREE_RATE_PER_KM = 1.0; // ₹1.0 per km toll-free
const SAME_PINCODE_MONTHLY_FARE = 650.0; // ₹650 per month for same pincode / local zone

// Cache for geocoded college location to avoid redundant lookups
let cachedCollegeLocation = null;

/**
 * Validates 6-digit Indian Postal PIN Code.
 * Indian PIN codes are 6-digit numeric codes where the first digit is between 1-9.
 * @param {string|number} pincode
 * @returns {boolean}
 */
const isValidIndianPincode = (pincode) => {
  if (!pincode) return false;
  const pinStr = String(pincode).trim();
  return /^[1-9][0-9]{5}$/.test(pinStr);
};

/**
 * Geocodes an Indian postal PIN code using OpenStreetMap Nominatim with India Post fallback.
 * 100% Free - No API key or credit card needed.
 * @param {string} pincode
 * @returns {Promise<{ lat: number, lon: number, displayName: string }>}
 */
const geocodePincode = async (pincode) => {
  const cleanPin = String(pincode).trim();

  // 1. Query OpenStreetMap Nominatim by postalcode
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?postalcode=${cleanPin}&country=India&format=json`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BusPassManagementSystem/1.0 (academic; free-routing)"
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
    }
  } catch (err) {
    // Proceed to fallback
  }

  // 2. Fallback: Official India Post API (Resolves every Indian PIN code to district and state)
  try {
    const postOfficeUrl = `https://api.postalpincode.in/pincode/${cleanPin}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const postRes = await fetch(postOfficeUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (postRes.ok) {
      const postData = await postRes.json();
      if (Array.isArray(postData) && postData[0]?.Status === "Success" && postData[0]?.PostOffice?.length > 0) {
        const po = postData[0].PostOffice[0];
        const searchQuery = `${po.District}, ${po.State}, India`;

        // Query Nominatim with resolved district/state
        const geoFallbackRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json`,
          { headers: { "User-Agent": "BusPassManagementSystem/1.0" } }
        );

        if (geoFallbackRes.ok) {
          const geoFallbackData = await geoFallbackRes.json();
          if (Array.isArray(geoFallbackData) && geoFallbackData.length > 0) {
            return {
              lat: parseFloat(geoFallbackData[0].lat),
              lon: parseFloat(geoFallbackData[0].lon),
              displayName: `${cleanPin}, ${po.Name}, ${po.District}, ${po.State}, India`
            };
          }
        }
      }
    }
  } catch (err) {
    // Proceed to error check
  }

  throw {
    statusCode: 404,
    message: `Location not found for pincode '${cleanPin}'. Please verify the student postal code.`
  };
};

/**
 * Geocodes the fixed college location (with caching).
 * @param {string} collegeLocationStr
 * @returns {Promise<{ lat: number, lon: number, displayName: string }>}
 */
const geocodeCollegeLocation = async (collegeLocationStr) => {
  if (cachedCollegeLocation) {
    return cachedCollegeLocation;
  }

  const cleanLoc = collegeLocationStr.trim();
  const pinMatch = cleanLoc.match(/\b([1-9][0-9]{5})\b/);

  try {
    if (pinMatch) {
      cachedCollegeLocation = await geocodePincode(pinMatch[1]);
      return cachedCollegeLocation;
    }

    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanLoc)}&format=json`,
      { headers: { "User-Agent": "BusPassManagementSystem/1.0" } }
    );

    if (geoRes.ok) {
      const data = await geoRes.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedCollegeLocation = {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
        return cachedCollegeLocation;
      }
    }
  } catch (err) {
    // Fallback default coordinates if offline
  }

  // Fallback default coordinates (College Campus)
  cachedCollegeLocation = {
    lat: 16.8351,
    lon: 81.5362,
    displayName: collegeLocationStr || "College Campus, India"
  };
  return cachedCollegeLocation;
};

/**
 * Calculates road driving distance using OSRM (Open Source Routing Machine).
 * 100% Free public routing server with turn-by-turn road precision.
 * @param {object} origin { lat, lon }
 * @param {object} dest { lat, lon }
 * @returns {Promise<{ distanceMeters: number, durationSeconds: number, hasTolls: boolean }>}
 */
const calculateRouteOSRM = async (origin, dest) => {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=false&steps=true`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "BusPassManagementSystem/1.0" }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw {
        statusCode: response.status,
        message: `OSRM Routing API returned HTTP error ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw {
        statusCode: 422,
        message: "No drivable road route found between the student location and the college."
      };
    }

    const route = data.routes[0];
    const distanceMeters = route.distance;
    const durationSeconds = route.duration;

    // Detect if the route uses Indian National Highways (NH), Expressways, or Toll roads
    let hasTolls = false;
    if (route.legs && route.legs[0]?.steps) {
      const steps = route.legs[0].steps;
      for (const step of steps) {
        const roadName = (step.name || "").toUpperCase();
        const roadRef = (step.ref || "").toUpperCase();

        // National Highways (NH) in India and Expressways are toll roads
        if (
          roadRef.includes("NH") ||
          roadName.includes("NH") ||
          roadName.includes("NATIONAL HIGHWAY") ||
          roadName.includes("EXPRESSWAY") ||
          roadName.includes("TOLL")
        ) {
          hasTolls = true;
          break;
        }
      }
    }

    return {
      distanceMeters,
      durationSeconds,
      hasTolls
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw {
        statusCode: 504,
        message: "Routing calculation timed out while communicating with OSRM server."
      };
    }
    throw err;
  }
};

/**
 * Extracts 6-digit PIN code from a location string.
 * @param {string} locationStr
 * @returns {string}
 */
const extractPincode = (locationStr) => {
  if (!locationStr) return "534101";
  const match = String(locationStr).match(/\b([1-9][0-9]{5})\b/);
  return match ? match[1] : "534101";
};

/**
 * Core Fare Calculation logic for round trips.
 * - Default Base Fare: ₹50
 * - Distance rates: ₹1.5/km (with tolls), ₹1.0/km (toll-free)
 * - Same Pincode / Local Zone: ₹650/month (Concession rate)
 * @param {number} oneWayDistanceKm
 * @param {boolean} routeHasTolls
 * @param {boolean} isSamePincode
 * @returns {object}
 */
const computeFareDetails = (oneWayDistanceKm, routeHasTolls, isSamePincode = false) => {
  const roundTripDistanceKm = Number((oneWayDistanceKm * 2).toFixed(2));
  const ratePerKm = routeHasTolls ? TOLL_RATE_PER_KM : TOLL_FREE_RATE_PER_KM;

  if (isSamePincode) {
    const monthlyFare = SAME_PINCODE_MONTHLY_FARE; // ₹650 / month
    const dailyFare = Number((SAME_PINCODE_MONTHLY_FARE / 22).toFixed(2)); // ~₹29.55 / travel day
    const quarterlyFare = Number((SAME_PINCODE_MONTHLY_FARE * 3).toFixed(2)); // ₹1,950
    const yearlyFare = Number((SAME_PINCODE_MONTHLY_FARE * 10).toFixed(2)); // ₹6,500 (10 academic months)

    return {
      isSamePincode: true,
      baseFare: 0,
      ratePerKm,
      roundTripDistanceKm,
      distanceFare: 0,
      dailyFare,
      monthlyFare,
      quarterlyFare,
      yearlyFare,
      totalFare: dailyFare
    };
  }

  const distanceFare = Number((roundTripDistanceKm * ratePerKm).toFixed(2));
  const dailyFare = Number((DEFAULT_BASE_FARE + distanceFare).toFixed(2));
  const monthlyFare = Number((dailyFare * 22).toFixed(2));
  const quarterlyFare = Number((dailyFare * 66).toFixed(2));
  const yearlyFare = Number((dailyFare * 220).toFixed(2));

  return {
    isSamePincode: false,
    baseFare: DEFAULT_BASE_FARE,
    ratePerKm,
    roundTripDistanceKm,
    distanceFare,
    dailyFare,
    monthlyFare,
    quarterlyFare,
    yearlyFare,
    totalFare: dailyFare
  };
};

/**
 * Controller to calculate student bus fare for round trips.
 * POST /api/fare/calculate
 */
const calculateFare = async (req, res) => {
  try {
    const { studentPincode, routeHasTolls } = req.body;

    // 1. Validate student pincode input
    if (!studentPincode) {
      return res.status(400).json({
        success: false,
        message: "Field 'studentPincode' is required."
      });
    }

    const cleanPincode = String(studentPincode).trim();
    if (!isValidIndianPincode(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Indian pincode format. Pincode must be a 6-digit numeric code (e.g., '560001')."
      });
    }

    // 2. Resolve origin and destination coordinates (100% Free)
    const collegeLocationStr = process.env.COLLEGE_LOCATION || COLLEGE_LOCATION;
    const collegePincode = extractPincode(collegeLocationStr);

    let originGeo, destGeo;
    try {
      originGeo = await geocodePincode(cleanPincode);
      destGeo = await geocodeCollegeLocation(collegeLocationStr);
    } catch (geoErr) {
      return res.status(geoErr.statusCode || 404).json({
        success: false,
        message: geoErr.message || "Failed to geocode location for pincode."
      });
    }

    // 3. Compute road driving distance via OSRM
    let routeResult;
    try {
      routeResult = await calculateRouteOSRM(originGeo, destGeo);
    } catch (routeErr) {
      return res.status(routeErr.statusCode || 502).json({
        success: false,
        message: routeErr.message || "Failed to calculate road route."
      });
    }

    const oneWayDistanceKm = Number((routeResult.distanceMeters / 1000).toFixed(2));
    const durationMinutes = Math.round(routeResult.durationSeconds / 60);
    const estimatedDurationText = `${durationMinutes} mins`;

    // 4. Toll logic: automatic backend detection or override
    const hasTolls = routeHasTolls !== undefined && routeHasTolls !== null && routeHasTolls !== ""
      ? Boolean(routeHasTolls === true || String(routeHasTolls).toLowerCase() === "true")
      : routeResult.hasTolls;

    // 5. Same pincode check (if student lives in same pincode as college or within 1.5 km)
    const isSamePincode = cleanPincode === collegePincode || oneWayDistanceKm <= 1.5;

    const fareDetails = computeFareDetails(
      oneWayDistanceKm,
      hasTolls,
      isSamePincode
    );

    // 6. Return success response
    return res.status(200).json({
      success: true,
      message: "Bus fare calculated successfully.",
      data: {
        studentPincode: cleanPincode,
        collegeLocation: collegeLocationStr,
        collegePincode,
        isSamePincode: fareDetails.isSamePincode,
        originAddress: originGeo.displayName,
        destinationAddress: destGeo.displayName,
        routeHasTolls: hasTolls,
        baseFare: fareDetails.baseFare,
        ratePerKm: fareDetails.ratePerKm,
        oneWayDistanceKm,
        oneWayDistanceText: `${oneWayDistanceKm} km`,
        roundTripDistanceKm: fareDetails.roundTripDistanceKm,
        estimatedDurationText,
        dailyFare: fareDetails.dailyFare,
        monthlyFare: fareDetails.monthlyFare,
        quarterlyFare: fareDetails.quarterlyFare,
        yearlyFare: fareDetails.yearlyFare,
        totalFare: fareDetails.totalFare,
        currency: "INR"
      }
    });
  } catch (error) {
    console.error("Fare Calculation Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during fare calculation.",
      error: error.message
    });
  }
};

module.exports = {
  calculateFare,
  isValidIndianPincode,
  computeFareDetails,
  extractPincode,
  geocodePincode,
  geocodeCollegeLocation,
  calculateRouteOSRM,
  COLLEGE_LOCATION,
  DEFAULT_BASE_FARE,
  TOLL_RATE_PER_KM,
  TOLL_FREE_RATE_PER_KM,
  SAME_PINCODE_MONTHLY_FARE
};
