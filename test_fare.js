const assert = require("assert");
const {
  isValidIndianPincode,
  computeFareDetails,
  calculateFare
} = require("./server/controllers/fareController");

console.log("--- Starting Unit & Controller Tests for Free Bus Fare Engine ---");

// 1. Test Pincode Validation
assert.strictEqual(isValidIndianPincode("560001"), true, "560001 should be valid");
assert.strictEqual(isValidIndianPincode("110001"), true, "110001 should be valid");
assert.strictEqual(isValidIndianPincode(600001), true, "Numeric 600001 should be valid");
assert.strictEqual(isValidIndianPincode("012345"), false, "Leading zero should be invalid");
assert.strictEqual(isValidIndianPincode("56001"), false, "5 digits should be invalid");
assert.strictEqual(isValidIndianPincode("5600001"), false, "7 digits should be invalid");
assert.strictEqual(isValidIndianPincode("56000A"), false, "Letters should be invalid");
assert.strictEqual(isValidIndianPincode(""), false, "Empty string should be invalid");
assert.strictEqual(isValidIndianPincode(null), false, "Null should be invalid");
console.log("✓ Pincode validation tests passed.");

// 2. Test Fare Computation
// One way = 15 km -> Round trip = 30 km
// Without tolls: 30 * 3.0 = 90
const noToll = computeFareDetails(15, false);
assert.strictEqual(noToll.roundTripDistanceKm, 30);
assert.strictEqual(noToll.ratePerKm, 3.0);
assert.strictEqual(noToll.totalFare, 90.0);

// With tolls: 30 * 4.5 = 135
const withToll = computeFareDetails(15, true);
assert.strictEqual(withToll.roundTripDistanceKm, 30);
assert.strictEqual(withToll.ratePerKm, 4.5);
assert.strictEqual(withToll.totalFare, 135.0);

// Floating point precision check: one way = 12.34 km -> Round trip = 24.68 km
// 24.68 * 4.5 = 111.06
const floatWithToll = computeFareDetails(12.34, true);
assert.strictEqual(floatWithToll.roundTripDistanceKm, 24.68);
assert.strictEqual(floatWithToll.totalFare, 111.06);
console.log("✓ Fare calculation formula tests passed.");

// 3. Test Controller Request Validation
const mockRes = () => {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
};

(async () => {
  // Test missing pincode
  {
    const req = { body: {} };
    const res = mockRes();
    await calculateFare(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /studentPincode.*required/i);
  }

  // Test invalid pincode format
  {
    const req = { body: { studentPincode: "123" } };
    const res = mockRes();
    await calculateFare(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /Invalid Indian pincode/i);
  }

  // Test Live Free Routing Call (Nominatim + OSRM)
  {
    const req = { body: { studentPincode: "560034" } };
    const res = mockRes();
    await calculateFare(req, res);

    assert.strictEqual(res.statusCode, 200, `Expected 200 but got ${res.statusCode}: ${JSON.stringify(res.jsonData)}`);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.data.studentPincode, "560034");
    assert.ok(res.jsonData.data.oneWayDistanceKm > 0, "Distance should be > 0");
    assert.ok(res.jsonData.data.roundTripDistanceKm > 0, "Round trip distance should be > 0");
    assert.ok(res.jsonData.data.totalFare > 0, "Total fare should be > 0");
    console.log(`✓ Live Free Engine result for 560034: ${res.jsonData.data.oneWayDistanceKm} km one-way, Daily Fare: ₹${res.jsonData.data.totalFare}`);
  }

  console.log("✓ Controller validation and live free engine tests passed.");
  console.log("\n=============================================");
  console.log("  FREE ENGINE TESTS PASSED WITH 100% SUCCESS! ");
  console.log("=============================================");
})();
