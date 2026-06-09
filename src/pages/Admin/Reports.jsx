import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import reportApi from "../../services/api/reportApi";
import { getErrorMessage } from "../../utils/errorParser";

const AdminReports = () => {
  const { loading, error, run, setError } = useAsync();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      const { data, error: loadError } = await run(reportApi.getReportSummary);
      if (data) {
        setSummary(data);
      }
      if (loadError) {
        setError(loadError);
      }
    };

    loadSummary();
  }, [run, setError]);

  return (
    <DashboardLayout role="admin">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Reports</p>
            <h1>Order performance summary</h1>
            <p className="page-description">
              View a consolidated report of order volume, completion, and revenue data.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-card">Loading report summary...</div>
        ) : error ? (
          <div className="dashboard-card">{getErrorMessage(error)}</div>
        ) : summary ? (
          <div className="dashboard-grid">
            <div className="summary-card">
              <div className="summary-card-top">
                <div className="summary-card-icon">📦</div>
                <div>
                  <p className="summary-card-title">Total orders</p>
                  <p className="summary-card-value">{summary.total_orders}</p>
                </div>
              </div>
              <p className="summary-card-note">All orders recorded across the platform.</p>
            </div>

            <div className="summary-card">
              <div className="summary-card-top">
                <div className="summary-card-icon">✅</div>
                <div>
                  <p className="summary-card-title">Completed orders</p>
                  <p className="summary-card-value">{summary.completed_orders}</p>
                </div>
              </div>
              <p className="summary-card-note">Orders that reached a final completed state.</p>
            </div>

            <div className="summary-card">
              <div className="summary-card-top">
                <div className="summary-card-icon">⏳</div>
                <div>
                  <p className="summary-card-title">Pending orders</p>
                  <p className="summary-card-value">{summary.pending_orders}</p>
                </div>
              </div>
              <p className="summary-card-note">Orders still moving through fulfillment.</p>
            </div>

            <div className="summary-card">
              <div className="summary-card-top">
                <div className="summary-card-icon">💰</div>
                <div>
                  <p className="summary-card-title">Revenue</p>
                  <p className="summary-card-value">${summary.sales_summary.total_revenue.toFixed(2)}</p>
                </div>
              </div>
              <p className="summary-card-note">Total order revenue from product pricing.</p>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>Top selling products</h2>
                <p>Products with the highest order volume and revenue.</p>
              </div>

              <div className="table-responsive">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.top_products.map((product) => (
                      <tr key={product.product_name}>
                        <td>{product.product_name}</td>
                        <td>{product.order_count}</td>
                        <td>${product.total_revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-card">No report data available.</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
