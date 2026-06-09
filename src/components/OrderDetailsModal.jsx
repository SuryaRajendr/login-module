const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Order {order.order_number}</h2>
            <p>{order.product_name}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="request-form">
          <div className="profile-panel">
            <p><strong>Vendor:</strong> {order.vendor_name}</p>
            <p><strong>Supplier:</strong> {order.supplier_name}</p>
            <p><strong>Quantity:</strong> {order.quantity}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Requested:</strong> {new Date(order.requested_date).toLocaleString()}</p>
            {order.updated_at && <p><strong>Updated:</strong> {new Date(order.updated_at).toLocaleString()}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
