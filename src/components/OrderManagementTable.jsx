import { useMemo, useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import { getErrorMessage } from "../utils/errorParser";

const statusOptions = ["Pending", "Approved", "Rejected", "Processing", "Completed"];

const OrderManagementTable = ({
  title,
  description,
  orders,
  loading,
  error,
  onStatusChange,
  statusUpdatingId,
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orderRows = useMemo(
    () =>
      orders.map((order) => (
        <tr key={order.id}>
          <td>{order.order_number}</td>
          <td>{order.product_name}</td>
          <td>{order.vendor_name}</td>
          <td>{order.supplier_name}</td>
          <td>{order.quantity}</td>
          <td>
            <select
              className="status-select"
              value={order.status}
              onChange={(event) => onStatusChange(order.id, event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </td>
          <td>{new Date(order.requested_date).toLocaleDateString()}</td>
          <td>
            <div className="table-actions">
              <button type="button" onClick={() => setSelectedOrder(order)}>
                View
              </button>
              {statusUpdatingId === order.id && <span className="status-loading">Updating...</span>}
            </div>
          </td>
        </tr>
      )),
    [orders, onStatusChange, statusUpdatingId]
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{title}</p>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card">Loading orders...</div>
      ) : error ? (
        <div className="dashboard-card">{getErrorMessage(error)}</div>
      ) : orders.length === 0 ? (
        <div className="dashboard-card">No orders available.</div>
      ) : (
        <div className="dashboard-section">
          <div className="table-panel-header">
            <h2>Order management</h2>
            <p>Review and update order statuses across the platform.</p>
          </div>
          <div className="table-responsive">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Product</th>
                  <th>Vendor</th>
                  <th>Supplier</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{orderRows}</tbody>
            </table>
          </div>
        </div>
      )}

      <OrderDetailsModal order={selectedOrder} isOpen={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} />
    </>
  );
};

export default OrderManagementTable;
