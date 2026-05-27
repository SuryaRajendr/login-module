
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ role, children }) => {
  return (
    <div className="layout">
      <Sidebar role={role} />

      <div className="main">
        <Navbar />

        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
