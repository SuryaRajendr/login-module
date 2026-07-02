
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import VerifyOTP from "../pages/Login/VerifyOTP";
import Register from "../pages/Login/Register";

import AdminDashboard from "../pages/Admin/Dashboard";
import AdminInvoices from "../pages/Admin/Invoices";
import AdminBilling from "../pages/Admin/Billing";
import AdminPayments from "../pages/Admin/Payments";
import SupplierDashboard from "../pages/Supplier/Dashboard";
import SupplierStockList from "../pages/Supplier/StockList";
import SupplierAddProduct from "../pages/Supplier/AddProduct";
import SupplierBulkUpload from "../pages/Supplier/BulkUpload";
import SupplierVendorRequests from "../pages/Supplier/VendorRequests";
import VendorDashboard from "../pages/Vendor/Dashboard";
import VendorBrowseProducts from "../pages/Vendor/BrowseProducts";
import VendorMyOrders from "../pages/Vendor/MyOrders";
import VendorRequestProduct from "../pages/Vendor/RequestProduct";
import SupplierOrders from "../pages/Supplier/Orders";
import AdminOrders from "../pages/Admin/Orders";
import AdminReports from "../pages/Admin/Reports";
import ProfilePage from "../pages/Profile/ProfilePage";

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
        path="/admin/profile"
        element={
          <ProtectedRoute role="admin">
            <ProfilePage role="admin" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/invoices"
        element={
          <ProtectedRoute role="admin">
            <AdminInvoices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute role="admin">
            <AdminBilling />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute role="admin">
            <AdminPayments />
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
        path="/supplier/stock-list"
        element={
          <ProtectedRoute role="supplier">
            <SupplierStockList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/add-product"
        element={
          <ProtectedRoute role="supplier">
            <SupplierAddProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/bulk-upload"
        element={
          <ProtectedRoute role="supplier">
            <SupplierBulkUpload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/vendor-requests"
        element={
          <ProtectedRoute role="supplier">
            <SupplierVendorRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/orders"
        element={
          <ProtectedRoute role="supplier">
            <SupplierOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/profile"
        element={
          <ProtectedRoute role="supplier">
            <ProfilePage role="supplier" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute role="admin">
            <AdminOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="admin">
            <AdminReports />
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

      <Route
        path="/vendor/browse-products"
        element={
          <ProtectedRoute role="vendor">
            <VendorBrowseProducts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/request-product"
        element={
          <ProtectedRoute role="vendor">
            <VendorRequestProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/my-orders"
        element={
          <ProtectedRoute role="vendor">
            <VendorMyOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/profile"
        element={
          <ProtectedRoute role="vendor">
            <ProfilePage role="vendor" />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;
