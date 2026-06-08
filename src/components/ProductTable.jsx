const ProductTable = ({ products }) => {
  const getStatusClass = (status) => {
    return `status-badge ${status.toLowerCase().replace(/\s+/g, "-")}`;
  };

  return (
    <div className="table-panel">
      <div className="table-panel-header">
        <div>
          <h2>Product Catalog</h2>
          <p>Review inventory and manage active stock items.</p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="product-name-cell">
                  <img src={product.image} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.sku}</span>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>{product.price}</td>
                <td>
                  <span className={getStatusClass(product.status)}>{product.status}</span>
                </td>
                <td className="table-actions">
                  <button>Edit</button>
                  <button>Delete</button>
                  <button>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
