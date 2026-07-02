
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const normalizeRole = (value) => String(value || "").toLowerCase();

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedRole = normalizeRole(role);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const adminMenu = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Orders", path: "/admin/orders" },
    { label: "Reports", path: "/admin/reports" },
    { label: "Profile", path: "/admin/profile" },
  ];

  const financeMenu = [
    { label: "Invoices", path: "/admin/invoices" },
    { label: "Billing", path: "/admin/billing" },
    { label: "Payments", path: "/admin/payments" },
  ];

  const supplierMenu = [
    { label: "Dashboard", path: "/supplier/dashboard" },
    { label: "Stock List", path: "/supplier/stock-list" },
    { label: "Add Product", path: "/supplier/add-product" },
    { label: "Bulk Upload Products", path: "/supplier/bulk-upload" },
    { label: "Orders", path: "/supplier/orders" },
    { label: "Vendor Requests", path: "/supplier/vendor-requests" },
    { label: "Profile", path: "/supplier/profile" },
  ];

  const vendorMenu = [
    { label: "Dashboard", path: "/vendor/dashboard" },
    { label: "Browse Products", path: "/vendor/browse-products" },
    { label: "Request Product", path: "/vendor/request-product" },
    { label: "My Orders", path: "/vendor/my-orders" },
    { label: "Profile", path: "/vendor/profile" },
  ];

  const menu = normalizedRole === "supplier" ? supplierMenu : normalizedRole === "admin" ? adminMenu : vendorMenu;

  return (
    <div className="sidebar">
      <h2>{normalizedRole.toUpperCase()}</h2>

      <div className="sidebar-menu">
        {normalizedRole === "admin" ? (
          <>
            <div className="sidebar-section-label">Main</div>
            {adminMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={isActive(item.path) ? "sidebar-link active" : "sidebar-link"}
              >
                {item.label}
              </Link>
            ))}

            <div className="sidebar-section-label sidebar-section-label-finance">
              Finance <span>New</span>
            </div>
            {financeMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={isActive(item.path) ? "sidebar-link active" : "sidebar-link"}
              >
                {item.label}
              </Link>
            ))}
          </>
        ) : (
          menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? "sidebar-link active" : "sidebar-link"}
            >
              {item.label}
            </Link>
          ))
        )}
      </div>

      <button className="sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
