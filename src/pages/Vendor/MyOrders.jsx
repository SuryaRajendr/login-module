import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import vendorApi from "../../services/api/vendorApi";
import { getErrorMessage } from "../../utils/errorParser";

const MyOrders = () => {
  const { loading, error, run, setError } = useAsync();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const { data, error: loadError } = await run(vendorApi.getVendorOrders);
      if (data) {
        setOrders(data);
      }
      if (loadError) {
        setError(loadError);
      }
    };

    loadOrders();
  }, [run, setError]);

  const orderRows = useMemo(
    () => orders.map((order) => (
      <tr key={order.id}>
        <td>{order.product_name}</td>
        <td>{order.supplier_name}</td>
        <td>{order.quantity}</td>
        <td>{order.status}</td>
        <td>{new Date(order.created_at).toLocaleDateString()}</td>
      </tr>
    )),
    [orders]
  );

  return (
    <DashboardLayout role="vendor">
      <div className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">My Orders</p>
            <h1>Your recent order requests</h1>
            <p className="page-description">
              Track your purchase requests and view supplier responses in one place.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-card">Loading orders...</div>
        ) : error ? (
          <div className="dashboard-card">{getErrorMessage(error)}</div>
        ) : (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Order history</h2>
              <p>Orders and requests you have submitted to suppliers.</p>
            </div>

            <div className="table-responsive">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Requested On</th>
                  </tr>
                </thead>
                <tbody>{orderRows}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyOrders;
