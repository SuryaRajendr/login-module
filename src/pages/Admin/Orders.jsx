import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import useAsync from "../../hooks/useAsync";
import orderApi from "../../services/api/orderApi";
import OrderManagementTable from "../../components/OrderManagementTable";

const AdminOrders = () => {
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
    <DashboardLayout role="admin">
      <div className="page-shell">
        <OrderManagementTable
          title="Order Operations"
          description="Manage order status and review recent order fulfillment across vendors and suppliers."
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

export default AdminOrders;
