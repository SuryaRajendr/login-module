import { useEffect, useState } from "react";

const VendorRequestModal = ({ product, isOpen, onClose, onSubmit, loading, error }) => {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
      setMessage("");
    }
  }, [isOpen]);

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Request Product</h2>
            <p>{product.name} from {product.supplier_name}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="request-form">
          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </label>

          <label>
            Notes (optional)
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Add delivery preferences or a short request note..."
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button
            className="save-profile-btn"
            onClick={() => onSubmit({ product_id: product.id, quantity, message })}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorRequestModal;
