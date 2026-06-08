
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

  return (
    <div className="sidebar">
      <h2>{role.toUpperCase()}</h2>

      <div className="sidebar-menu">
        {role === "supplier"
          ? supplierMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={isActive(item.path) ? "sidebar-link active" : "sidebar-link"}
              >
                {item.label}
              </Link>
            ))
          : (
            <>
              <Link
                to={`/${role}/dashboard`}
                className={isActive(`/${role}/dashboard`) ? "sidebar-link active" : "sidebar-link"}
              >
                Dashboard
              </Link>
              <Link
                to={`/${role}/profile`}
                className={isActive(`/${role}/profile`) ? "sidebar-link active" : "sidebar-link"}
              >
                Profile
              </Link>
            </>
          )}
      </div>

      <button className="sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
