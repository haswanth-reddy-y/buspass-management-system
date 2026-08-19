const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const dns=require('dns');
const User = require("./models/User");
const BusPass = require("./models/BusPass");
const Application = require("./models/Application");
const { generatePassId, generateApplicationId } = require("./utils/generatePassId");

const seedDatabase = async () => {
  try {
    dns.setServers(["8.8.8.8","1.1.1.1"]);
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/buspass_db";
    console.log("Connecting to MongoDB for seeding:", mongoUri);
    await mongoose.connect(mongoUri);

    console.log("Cleaning old data...");
    await User.deleteMany({});
    await BusPass.deleteMany({});
    await Application.deleteMany({});

    console.log("Seeding Users...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);

    const admin = await User.create({
      name: "System Administrator",
      email: "admin@buspass.com",
      password: adminPassword,
      studentId: "ADMIN-001",
      department: "Administration",
      phone: "+1 800 555 0199",
      role: "admin"
    });

    const student1 = await User.create({
      name: "John Doe",
      email: "john@student.edu",
      password: studentPassword,
      studentId: "CS-2026-101",
      department: "Computer Science",
      phone: "+1 555 014 2001",
      role: "student"
    });

    const student2 = await User.create({
      name: "Alice Smith",
      email: "alice@student.edu",
      password: studentPassword,
      studentId: "EC-2026-204",
      department: "Electronics & Comm",
      phone: "+1 555 014 2002",
      role: "student"
    });

    const student3 = await User.create({
      name: "Robert Johnson",
      email: "robert@student.edu",
      password: studentPassword,
      studentId: "ME-2026-308",
      department: "Mechanical Eng",
      phone: "+1 555 014 2003",
      role: "student"
    });

    console.log("Seeding Applications...");
    const app1Id = generateApplicationId();
    const app2Id = generateApplicationId();
    const app3Id = generateApplicationId();

    const app1 = await Application.create({
      applicationId: app1Id,
      student: student1._id,
      studentName: student1.name,
      studentId: student1.studentId,
      route: "Route 101 - Central Express",
      source: "City Central Station",
      destination: "University Main Gate",
      passType: "Monthly",
      applicationType: "New",
      status: "Approved",
      processedDate: new Date()
    });

    const app2 = await Application.create({
      applicationId: app2Id,
      student: student2._id,
      studentName: student2.name,
      studentId: student2.studentId,
      route: "Route 202 - Tech Corridor",
      source: "Metro Tech Park",
      destination: "Campus Innovation Lab",
      passType: "Quarterly",
      applicationType: "New",
      status: "Approved",
      processedDate: new Date()
    });

    const app3 = await Application.create({
      applicationId: app3Id,
      student: student3._id,
      studentName: student3.name,
      studentId: student3.studentId,
      route: "Route 303 - North Suburban",
      source: "North Heights Terminal",
      destination: "University Main Gate",
      passType: "Monthly",
      applicationType: "New",
      status: "Pending"
    });

    console.log("Seeding Active Bus Passes...");
    const pass1Id = generatePassId();
    const pass2Id = generatePassId();

    const expiry1 = new Date();
    expiry1.setMonth(expiry1.getMonth() + 1);

    const expiry2 = new Date();
    expiry2.setMonth(expiry2.getMonth() + 3);

    await BusPass.create({
      passId: pass1Id,
      student: student1._id,
      studentName: student1.name,
      studentId: student1.studentId,
      route: app1.route,
      source: app1.source,
      destination: app1.destination,
      passType: app1.passType,
      issueDate: new Date(),
      expiryDate: expiry1,
      status: "Active",
      qrCodeData: JSON.stringify({
        passId: pass1Id,
        studentId: student1.studentId,
        route: app1.route,
        expiry: expiry1.toISOString()
      })
    });

    await BusPass.create({
      passId: pass2Id,
      student: student2._id,
      studentName: student2.name,
      studentId: student2.studentId,
      route: app2.route,
      source: app2.source,
      destination: app2.destination,
      passType: app2.passType,
      issueDate: new Date(),
      expiryDate: expiry2,
      status: "Active",
      qrCodeData: JSON.stringify({
        passId: pass2Id,
        studentId: student2.studentId,
        route: app2.route,
        expiry: expiry2.toISOString()
      })
    });

    console.log("✅ Database Seeding Completed Successfully!");
    console.log("-----------------------------------------");
    console.log("Admin Account: admin@buspass.com / admin123");
    console.log("Student Accounts (Password: student123):");
    console.log(" - john@student.edu");
    console.log(" - alice@student.edu");
    console.log(" - robert@student.edu");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database Seeding Failed:", error);
    process.exit(1);
  }
};

seedDatabase();
