import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import orderApi from "../../services/api/orderApi";
import OrderManagementTable from "../../components/OrderManagementTable";

const SupplierOrders = () => {
  const { loading, error, run, setError } = useAsync();
  const [orders, setOrders] = useState([]);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      const { data, error: loadError } = await run(orderApi.getOrders);
      if (data) {
        setOrders(data);
      }
      if (loadError) {
        setError(loadError);
      }
    };

    loadOrders();
  }, [run, setError]);

  const handleStatusChange = async (orderId, status) => {
    setStatusUpdatingId(orderId);
    setError(null);
    try {
      const updatedOrder = await orderApi.updateOrderStatus(orderId, status);
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? updatedOrder : order)));
    } catch (err) {
      setError(err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <DashboardLayout role="supplier">
      <div className="page-shell">
        <OrderManagementTable
          title="Supplier Orders"
          description="Monitor and update order progress for requests placed against your product inventory."
          orders={orders}
          loading={loading}
          error={error}
          onStatusChange={handleStatusChange}
          statusUpdatingId={statusUpdatingId}
        />
      </div>
    </DashboardLayout>
  );
};

export default SupplierOrders;
