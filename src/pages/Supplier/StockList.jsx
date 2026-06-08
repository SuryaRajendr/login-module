import DashboardLayout from "../../layouts/DashboardLayout";

const StockList = () => {
  const stockItems = [
    { id: 1, name: "Olive Oil - 1L", stock: 54, warehouse: "Zone A" },
    { id: 2, name: "Premium Wheat Flour", stock: 22, warehouse: "Zone B" },
    { id: 3, name: "Mixed Spice Pack", stock: 128, warehouse: "Zone A" },
    { id: 4, name: "Mango Juice", stock: 8, warehouse: "Zone C" },
  ];

  return (
    <DashboardLayout role="supplier">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Stock List</p>
            <h1>Current inventory</h1>
            <p className="page-description">
              Review active stock items and check availability across storage locations.
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.stock}</td>
                  <td>{item.warehouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockList;
