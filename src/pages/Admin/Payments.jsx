import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import paymentApi from "../../services/api/paymentApi";
import { getErrorMessage } from "../../utils/errorParser";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const paymentStatusClass = (status) => `status-badge payment-status ${String(status || "").toLowerCase()}`;

const AdminPayments = () => {
  const { loading, error, run, setError } = useAsync();
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("All");

  const loadPayments = async () => {
    const { data, error: paymentError } = await run(() => paymentApi.getPayments());
    if (data) setPayments(data);
    if (paymentError) setError(paymentError);
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPayments = useMemo(() => {
    if (filter === "All") return payments;
    return payments.filter((payment) => payment.payment_status === filter);
  }, [filter, payments]);

  return (
    <DashboardLayout role="admin">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Payments</p>
            <h1>Payment history and transaction details</h1>
            <p className="page-description">
              Track paid, pending, and failed transactions with invoice references and payment notes.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-card">Loading payments...</div>
        ) : error ? (
          <div className="dashboard-card">{getErrorMessage(error)}</div>
        ) : (
          <div className="dashboard-section">
            <div className="section-header">
              <div>
                <h2>Payment history</h2>
                <p>Filter transactions by their current status to inspect payment progress.</p>
              </div>
              <div className="payment-filter-row">
                {['All', 'Paid', 'Pending', 'Failed'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={filter === option ? "inline-btn payment-filter active" : "inline-btn payment-filter"}
                    onClick={() => setFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="product-table payment-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Invoice</th>
                    <th>Vendor</th>
                    <th>Supplier</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Details</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.transaction_number || `TXN-${payment.id}`}</td>
                      <td>{payment.invoice_number}</td>
                      <td>{payment.vendor_name}</td>
                      <td>{payment.supplier_name}</td>
                      <td>{money.format(payment.amount)}</td>
                      <td><span className={paymentStatusClass(payment.payment_status)}>{payment.payment_status}</span></td>
                      <td>{payment.transaction_details || payment.payment_method || "N/A"}</td>
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPayments;