import api from "./apiClient";

export const getOrders = async () => {
  const resp = await api.get("/api/orders");
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch orders.");
  }
  return resp.data.data || [];
};

export const updateOrderStatus = async (orderId, status) => {
  const resp = await api.put(`/api/orders/${orderId}/status`, { status });
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to update order status.");
  }
  return resp.data.data;
};

export const createOrder = async (payload) => {
  const resp = await api.post("/api/orders", payload);
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to create order.");
  }
  return resp.data.data;
};

export default { getOrders, updateOrderStatus, createOrder };
