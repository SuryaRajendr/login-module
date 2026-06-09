import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import vendorApi from "../../services/api/vendorApi";
import { getErrorMessage } from "../../utils/errorParser";

const RequestProduct = () => {
  const { loading, error, run, setError } = useAsync();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error: loadError } = await run(vendorApi.getVendorProducts);
      if (data) {
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0].id);
        }
      }
      if (loadError) {
        setError(loadError);
      }
    };

    loadProducts();
  }, [run, setError]);

  const selectedProduct = products.find((product) => product.id === selectedProductId);

  const handleSubmit = async () => {
    if (!selectedProductId || quantity < 1) {
      setError(new Error("Please select a product and enter a valid quantity."));
      return;
    }

    const { data, error: submitError } = await run(() =>
      vendorApi.submitProductRequest({
        product_id: selectedProductId,
        quantity,
        message,
      })
    );

    if (data) {
      setSuccessMessage("Your request has been submitted.");
      setMessage("");
    }
    if (submitError) {
      setError(submitError);
    }
  };

  const productOptions = useMemo(
    () =>
      products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.name} — {product.supplier_name}
        </option>
      )),
    [products]
  );

  return (
    <DashboardLayout role="vendor">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Request Product</p>
            <h1>Create a new purchase request</h1>
            <p className="page-description">
              Choose a supplier product, set the quantity, and send a request directly from your dashboard.
            </p>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>New Request</h2>
            <p>Submit a request to suppliers and monitor order status from your account.</p>
          </div>

          <div className="profile-form">
            <label>
              Product
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(Number(event.target.value))}
              >
                {productOptions}
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </label>

            <label className="full-width">
              Notes
              <textarea
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Add special instructions or delivery details."
              />
            </label>

            {error && <div className="form-error">{getErrorMessage(error)}</div>}
            {successMessage && <div className="form-success">{successMessage}</div>}

            <button className="save-profile-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Sending request..." : "Send Request"}
            </button>
          </div>

          {selectedProduct && (
            <div className="request-card">
              <h3>Selected product</h3>
              <p>
                <strong>{selectedProduct.name}</strong> from {selectedProduct.supplier_name}
              </p>
              <p>Stock available: {selectedProduct.stock}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestProduct;
