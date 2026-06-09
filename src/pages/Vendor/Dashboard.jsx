
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import SummaryCard from "../../components/SummaryCard";
import useAsync from "../../hooks/useAsync";
import vendorApi from "../../services/api/vendorApi";
import { getErrorMessage } from "../../utils/errorParser";

const Dashboard = () => {
  const { loading, error, run } = useAsync();
  const [stats, setStats] = useState({});

  useEffect(() => {
    const loadStats = async () => {
      const { data, error: loadError } = await run(vendorApi.getVendorDashboardSummary);
      if (data) {
        setStats(data);
      }
      if (loadError) {
        // optional
      }
    };

    loadStats();
  }, [run]);

  const statItems = [
    {
      title: "Available Products",
      value: stats.available_products ?? "0",
      description: "Supplier inventory items you can request.",
      icon: "🛒",
      color: "#0ea5e9",
    },
    {
      title: "Open Requests",
      value: stats.open_requests ?? "0",
      description: "Requests waiting on supplier confirmation.",
      icon: "📩",
      color: "#f59e0b",
    },
    {
      title: "Fulfilled Orders",
      value: stats.fulfilled_orders ?? "0",
      description: "Approved requests that are ready to ship.",
      icon: "✅",
      color: "#22c55e",
    },
    {
      title: "Suppliers Connected",
      value: stats.favorite_suppliers ?? "0",
      description: "Different suppliers you have worked with.",
      icon: "🤝",
      color: "#8b5cf6",
    },
  ];

  return (
    <DashboardLayout role="vendor">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Vendor Dashboard</p>
            <h1>Welcome back</h1>
            <p className="page-description">
              Review product availability, track orders, and keep your vendor workflow moving.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-card">Loading dashboard metrics...</div>
        ) : error ? (
          <div className="dashboard-card">{getErrorMessage(error)}</div>
        ) : (
          <>
            <div className="summary-grid">
              {statItems.map((item) => (
                <SummaryCard key={item.title} {...item} />
              ))}
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent activity</h2>
                <p>Track the latest vendor requests and supplier interactions.</p>
              </div>

              <div className="activity-list">
                {(stats.recent_activity || []).map((event) => (
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
