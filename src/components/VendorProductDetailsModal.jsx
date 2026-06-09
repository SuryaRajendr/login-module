const VendorProductDetailsModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{product.name}</h2>
            <p>{product.category} · {product.supplier_name}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="request-form">
          <div className="profile-panel">
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Stock:</strong> {product.stock}</p>
            <p><strong>Price:</strong> ₹{product.price.toFixed(2)}</p>
            <p><strong>Status:</strong> {product.status}</p>
            <p><strong>Supplier:</strong> {product.supplier_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductDetailsModal;
