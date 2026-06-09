
import DashboardLayout from "../../layouts/DashboardLayout";
import SummaryCard from "../../components/SummaryCard";
import { useEffect, useState } from "react";
import useAsync from "../../hooks/useAsync";
import dashboardApi from "../../services/api/dashboardApi";

const Dashboard = () => {
  const { loading, error, run } = useAsync();
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data, error: err } = await run(() => dashboardApi.getDashboardStats());
      if (data) {
        setStats(data);
        setActivity(data.recent_activity || []);
      }
      if (err) {
        // optional: console.error(err);
      }
    };

    load();
  }, [run]);

  const statItems = [
    {
      title: "Total Products",
      value: stats.total_products ?? "0",
      description: "Live SKUs currently available",
      icon: "📦",
      color: "#0ea5e9",
    },
    {
      title: "Overall Stock",
      value: stats.overall_stock ?? "0",
      description: "Total units across all categories",
      icon: "📊",
      color: "#14b8a6",
    },
    {
      title: "Pending Vendor Requests",
      value: stats.pending_vendor_requests ?? "0",
      description: "Requests awaiting your review",
      icon: "📝",
      color: "#f59e0b",
    },
    {
      title: "Recent Activity",
      value: activity.length ? `${activity.length} items` : "0 items",
      description: "Changes and requests in the last 24 hours",
      icon: "⚡",
      color: "#8b5cf6",
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

        {loading ? (
          <div className="dashboard-card">Loading dashboard...</div>
        ) : error ? (
          <div className="dashboard-card">Failed to load dashboard.</div>
        ) : (
          <>
            <div className="summary-grid">
              {statItems.map((item) => (
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
