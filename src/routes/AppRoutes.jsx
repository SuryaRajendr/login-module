
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import VerifyOTP from "../pages/Login/VerifyOTP";
import Register from "../pages/Login/Register";

import AdminDashboard from "../pages/Admin/Dashboard";
import SupplierDashboard from "../pages/Supplier/Dashboard";
import VendorDashboard from "../pages/Vendor/Dashboard";

import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/dashboard"
        element={
          <ProtectedRoute role="supplier">
            <SupplierDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute role="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;
