import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student Pages
import Dashboard from "./pages/Dashboard";
import ApplyPass from "./pages/ApplyPass";
import RenewPass from "./pages/RenewPass";
import ApplicationStatus from "./pages/ApplicationStatus";
import DigitalPass from "./pages/DigitalPass";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageApplications from "./pages/admin/ManageApplications";
import ManageUsers from "./pages/admin/ManageUsers";
import Reports from "./pages/admin/Reports";

const App = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-body">
        {user && <Sidebar />}

        <main className="main-content">
          <div key={location.pathname} className="page-transition">
            <Routes location={location}>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={user ? <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace /> : <Login />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/dashboard" replace /> : <Register />}
              />

              {/* Student Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/apply" element={<ApplyPass />} />
                <Route path="/renew" element={<RenewPass />} />
                <Route path="/status" element={<ApplicationStatus />} />
                <Route path="/digital-pass" element={<DigitalPass />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/applications" element={<ManageApplications />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/reports" element={<Reports />} />
              </Route>

              {/* Default Catch-all Redirect */}
              <Route
                path="*"
                element={
                  <Navigate
                    to={
                      !user
                        ? "/login"
                        : user.role === "admin"
                        ? "/admin/dashboard"
                        : "/dashboard"
                    }
                    replace
                  />
                }
              />
            </Routes>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default App;
