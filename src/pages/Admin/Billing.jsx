import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import billingApi from "../../services/api/billingApi";
import { getErrorMessage } from "../../utils/errorParser";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const AdminBilling = () => {
  const { loading, error, run, setError } = useAsync();
  const [summary, setSummary] = useState(null);

  const loadSummary = async () => {
    const { data, error: summaryError } = await run(() => billingApi.getBillingSummary());
    if (data) setSummary(data);
    if (summaryError) setError(summaryError);
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Billing</p>
            <h1>Billing summary and revenue overview</h1>
            <p className="page-description">
              Monitor billed revenue, pending balances, overdue exposure, and recent billing events in one place.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-card">Loading billing summary...</div>
        ) : error ? (
          <div className="dashboard-card">{getErrorMessage(error)}</div>
        ) : summary ? (
          <>
            <div className="billing-summary-grid">
              <div className="summary-card">
                <div className="summary-card-top">
                  <div className="summary-card-icon">📈</div>
                  <div>
                    <p className="summary-card-title">Revenue overview</p>
                    <p className="summary-card-value">{money.format(summary.total_revenue)}</p>
                  </div>
                </div>
                <p className="summary-card-note">Total invoice value across paid, pending, and overdue bills.</p>
              </div>

              <div className="summary-card">
                <div className="summary-card-top">
                  <div className="summary-card-icon">✅</div>
                  <div>
                    <p className="summary-card-title">Paid amount</p>
                    <p className="summary-card-value">{money.format(summary.paid_amount)}</p>
                  </div>
                </div>
                <p className="summary-card-note">Amounts successfully cleared through payment tracking.</p>
              </div>

              <div className="summary-card">
                <div className="summary-card-top">
                  <div className="summary-card-icon">⏳</div>
                  <div>
                    <p className="summary-card-title">Pending amount</p>
                    <p className="summary-card-value">{money.format(summary.pending_amount)}</p>
                  </div>
                </div>
                <p className="summary-card-note">Invoices that still require settlement or confirmation.</p>
              </div>

              <div className="summary-card">
                <div className="summary-card-top">
                  <div className="summary-card-icon">⚠️</div>
                  <div>
                    <p className="summary-card-title">Overdue amount</p>
                    <p className="summary-card-value">{money.format(summary.overdue_amount)}</p>
                  </div>
                </div>
                <p className="summary-card-note">Outstanding balances that passed their due date.</p>
              </div>
            </div>

            <div className="dashboard-grid billing-secondary-grid">
              <div className="dashboard-section">
                <div className="section-header">
                  <div>
                    <h2>Revenue overview</h2>
                    <p>Monthly income trend captured from paid invoice history.</p>
                  </div>
                </div>

                <div className="billing-revenue-list">
                  {summary.revenue_overview.length > 0 ? (
                    summary.revenue_overview.map((item) => (
                      <div key={item.label} className="billing-revenue-item">
                        <div>
                          <strong>{item.label}</strong>
                          <span>Paid revenue for this period</span>
                        </div>
                        <strong>{money.format(item.amount)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="invoice-empty-state">No paid revenue available yet.</div>
                  )}
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header">
                  <div>
                    <h2>Billing history</h2>
                    <p>Recent billing events, status changes, and reconciliation notes.</p>
                  </div>
                </div>

                <div className="billing-history-list">
                  {summary.recent_history.map((entry) => (
                    <div key={entry.id} className="billing-history-item">
                      <div>
                        <strong>{entry.event_type}</strong>
                        <span>{entry.invoice_number || "General"}</span>
                      </div>
                      <div>
                        <strong>{money.format(entry.amount)}</strong>
                        <span>{entry.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="dashboard-card">No billing summary available.</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminBilling;