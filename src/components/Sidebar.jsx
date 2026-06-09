
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const supplierMenu = [
    { label: "Dashboard", path: "/supplier/dashboard" },
    { label: "Stock List", path: "/supplier/stock-list" },
    { label: "Add Product", path: "/supplier/add-product" },
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

  const menu = role === "supplier" ? supplierMenu : vendorMenu;

  return (
    <div className="sidebar">
      <h2>{role.toUpperCase()}</h2>

      <div className="sidebar-menu">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? "sidebar-link active" : "sidebar-link"}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <button className="sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
