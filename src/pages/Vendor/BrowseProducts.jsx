import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import VendorProductDetailsModal from "../../components/VendorProductDetailsModal";
import VendorRequestModal from "../../components/VendorRequestModal";
import useAsync from "../../hooks/useAsync";
import vendorApi from "../../services/api/vendorApi";
import { getErrorMessage } from "../../utils/errorParser";

const BrowseProducts = () => {
  const { loading, error, run, setError } = useAsync();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [requestStatus, setRequestStatus] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error: loadError } = await run(vendorApi.getVendorProducts);
      if (data) {
        setProducts(data);
      }
      if (loadError) {
        setError(loadError);
      }
    };

    loadProducts();
  }, [run, setError]);

  const handleRequestClick = (product) => {
    setSelectedProduct(product);
    setRequestStatus("");
    setError(null);
  };

  const handleSubmitRequest = async (payload) => {
    const { data, error: submitError } = await run(() => vendorApi.submitProductRequest(payload));
    if (data) {
      setSelectedProduct(null);
      setRequestStatus("Request submitted successfully.");
    }
    if (submitError) {
      setError(submitError);
    }
  };

  const statusMessage = requestStatus || (error ? getErrorMessage(error) : null);

  const productRows = useMemo(
    () => products.map((product) => (
      <tr key={product.id}>
        <td>{product.name}</td>
        <td>{product.sku}</td>
        <td>{product.category}</td>
        <td>{product.stock}</td>
        <td>₹{product.price.toFixed(2)}</td>
        <td>{product.status}</td>
        <td>{product.supplier_name}</td>
        <td>
          <div className="table-actions">
            <button onClick={() => setSelectedProductDetails(product)}>View</button>
            <button onClick={() => handleRequestClick(product)}>Request</button>
          </div>
        </td>
      </tr>
    )),
    [products]
  );

  return (
    <DashboardLayout role="vendor">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Browse Products</p>
            <h1>Market-ready supplier inventory</h1>
            <p className="page-description">
              Find products from verified suppliers, compare prices, and send purchase requests directly.
            </p>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Available Products</h2>
            <p>Browse a curated list of products you can request from suppliers.</p>
          </div>

          {loading ? (
            <div className="dashboard-card">Loading product catalog...</div>
          ) : (
            <div className="table-responsive">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Supplier</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>{productRows}</tbody>
              </table>
            </div>
          )}

          {statusMessage && <div className="dashboard-card">{statusMessage}</div>}
        </div>
      </div>

      <VendorRequestModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onSubmit={handleSubmitRequest}
        loading={loading}
        error={error?.message}
      />

      <VendorProductDetailsModal
        product={selectedProductDetails}
        isOpen={Boolean(selectedProductDetails)}
        onClose={() => setSelectedProductDetails(null)}
      />
    </DashboardLayout>
  );
};

export default BrowseProducts;
