
import DashboardLayout from "../../layouts/DashboardLayout";
import SummaryCard from "../../components/SummaryCard";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Products",
      value: "42",
      description: "Live SKUs currently available",
      icon: "📦",
      color: "#0ea5e9",
    },
    {
      title: "Overall Stock",
      value: "1,280",
      description: "Total units across all categories",
      icon: "📊",
      color: "#14b8a6",
    },
    {
      title: "Pending Vendor Requests",
      value: "6",
      description: "Requests awaiting your review",
      icon: "📝",
      color: "#f59e0b",
    },
    {
      title: "Recent Activity",
      value: "5 items",
      description: "Changes and requests in the last 24 hours",
      icon: "⚡",
      color: "#8b5cf6",
    },
  ];

  const activity = [
    {
      id: 1,
      title: "New request from SpiceHouse",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Stock alert: Mango Juice is low",
      time: "5 hours ago",
    },
    {
      id: 3,
      title: "Added 30 units of Olive Oil",
      time: "1 day ago",
    },
  ];

  return (
    <DashboardLayout role="supplier">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Supplier Dashboard</p>
            <h1>Welcome back</h1>
            <p className="page-description">
              Monitor inventory, vendor activity, and recent dashboard updates in one place.
            </p>
          </div>
        </div>

        <div className="summary-grid">
          {stats.map((item) => (
            <SummaryCard key={item.title} {...item} />
          ))}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <p>Track the latest supplier events and vendor interactions.</p>
          </div>

          <div className="activity-list">
            {activity.map((event) => (
              <div key={event.id} className="activity-item">
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
