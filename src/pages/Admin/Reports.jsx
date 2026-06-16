import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import reportApi from "../../services/api/reportApi";
import { getErrorMessage } from "../../utils/errorParser";

const AdminReports = () => {
  const { loading, error, run, setError } = useAsync();
  const [summary, setSummary] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadSummary = async (params = {}) => {
    const { data, error: loadError } = await run(() => reportApi.getReportSummary(params));
    if (data) {
      setSummary(data);
    }
    if (loadError) {
      setError(loadError);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [run]);

  const filteredProducts = useMemo(
    () =>
      summary?.top_products.filter((product) =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [],
    [summary, searchTerm]
  );

  const handleApplyFilters = () => {
    loadSummary({ start_date: startDate || undefined, end_date: endDate || undefined });
  };

  const handleExportCsv = () => {
    if (!summary) return;

    const rows = [
      ["Metric", "Value"],
      ["Total orders", summary.total_orders],
      ["Completed orders", summary.completed_orders],
      ["Pending orders", summary.pending_orders],
      ["Total revenue", summary.sales_summary.total_revenue.toFixed(2)],
      [],
      ["Top product", "Orders", "Revenue"],
      ...summary.top_products.map((product) => [product.product_name, product.order_count, product.total_revenue.toFixed(2)]),
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "order-report-summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

        <div className="report-filters">
          <div className="filter-row">
            <label>
              Start date
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label>
              End date
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </label>
            <button className="btn-primary" type="button" onClick={handleApplyFilters}>
              Apply filters
            </button>
          </div>
          <div className="filter-row">
            <label>
              Search products
              <input
                type="search"
                placeholder="Search top products"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <button className="btn-secondary" type="button" onClick={handleExportCsv}>
              Export report
            </button>
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
                    {filteredProducts.map((product) => (
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
