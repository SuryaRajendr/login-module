
import DashboardLayout from "../../layouts/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout role="admin">
      <div className="dashboard-card">
        <h1>Admin Dashboard</h1>
        <p>Welcome Admin User</p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
