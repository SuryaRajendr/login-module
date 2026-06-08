import DashboardLayout from "../../layouts/DashboardLayout";
import ProductTable from "../../components/ProductTable";

const AddProduct = () => {
  const products = [
    {
      id: 1,
      image: "https://via.placeholder.com/64?text=Oil",
      name: "Olive Oil - 1L",
      sku: "OIL-001",
      category: "Cooking",
      stock: 54,
      price: "$18.50",
      status: "In Stock",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/64?text=Flour",
      name: "Premium Wheat Flour",
      sku: "FLR-009",
      category: "Bakery",
      stock: 22,
      price: "$12.95",
      status: "Low Stock",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/64?text=Spice",
      name: "Mixed Spice Pack",
      sku: "SPC-004",
      category: "Spices",
      stock: 128,
      price: "$7.40",
      status: "In Stock",
    },
    {
      id: 4,
      image: "https://via.placeholder.com/64?text=Juice",
      name: "Mango Juice",
      sku: "JCE-013",
      category: "Beverages",
      stock: 8,
      price: "$3.20",
      status: "Low Stock",
    },
  ];

  return (
    <DashboardLayout role="supplier">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Add Product</p>
            <h1>Manage your catalog</h1>
            <p className="page-description">
              The table below shows product details for the supplier inventory. Use the actions to update or review each item.
            </p>
          </div>
        </div>
        <ProductTable products={products} />
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
