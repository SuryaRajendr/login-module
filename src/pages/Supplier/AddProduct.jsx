import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import ProductTable from "../../components/ProductTable";
import productApi from "../../services/api/productApi";
import useAsync from "../../hooks/useAsync";
import { getErrorMessage } from "../../utils/errorParser";

const DEFAULT_FORM = {
  name: "",
  sku: "",
  category: "",
  stock: 0,
  price: 0,
  status: "In Stock",
  image_url: "",
};

const AddProduct = () => {
  const { loading, error, run } = useAsync();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editProductId, setEditProductId] = useState(null);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    const { data, error: err } = await run(() => productApi.getProducts());
    if (data) setProducts(Array.isArray(data) ? data : []);
    if (err) setMessage(getErrorMessage(err));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      if (editProductId) {
        await run(() => productApi.updateProduct(editProductId, form));
        setMessage("Product updated successfully.");
      } else {
        await run(() => productApi.createProduct(form));
        setMessage("Product added successfully.");
      }

      setForm(DEFAULT_FORM);
      setEditProductId(null);
      await loadProducts();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const handleEdit = (product) => {
    setEditProductId(product.id);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      stock: product.stock ?? 0,
      price: Number(product.price) || 0,
      status: product.status || "In Stock",
      image_url: product.image_url || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    setMessage("");

    try {
      await run(() => productApi.deleteProduct(id));
      setMessage("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setEditProductId(null);
    setMessage("");
  };

  return (
    <DashboardLayout role="supplier">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Add Product</p>
            <h1>Manage your catalog</h1>
            <p className="page-description">
              Use the form below to add or update supplier products, then review the inventory table.
            </p>
          </div>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Product name
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </label>
            <label>
              SKU
              <input
                value={form.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                required
              />
            </label>
            <label>
              Category
              <input
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                required
              />
            </label>
            <label>
              Stock quantity
              <input
                type="number"
                value={form.stock}
                onChange={(e) => handleChange("stock", Number(e.target.value))}
                required
              />
            </label>
            <label>
              Price
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange("price", Number(e.target.value))}
                required
              />
            </label>
            <label>
              Image URL
              <input
                value={form.image_url}
                onChange={(e) => handleChange("image_url", e.target.value)}
              />
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out Of Stock">Out Of Stock</option>
              </select>
            </label>
          </div>

          <div className="product-form-actions">
            <button type="submit" disabled={loading}>
              {editProductId ? "Update Product" : "Add Product"}
            </button>
            <button type="button" className="secondary" onClick={handleReset}>
              Reset
            </button>
          </div>

          {(message || error) && (
            <div className="form-message">
              {message || getErrorMessage(error)}
            </div>
          )}
        </form>

        {loading ? (
          <div className="dashboard-card">Loading products...</div>
        ) : (
          <ProductTable
            products={products.map((item) => ({
              ...item,
              image:
                item.image_url ||
                `https://via.placeholder.com/64?text=${encodeURIComponent(
                  item.name?.substring(0, 2) || "PR"
                )}`,
              price: `$${Number(item.price).toFixed(2)}`,
            }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
