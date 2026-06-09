import api from "./apiClient";

export const getVendorDashboardSummary = async () => {
  const resp = await api.get("/api/vendor/dashboard/summary");
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch vendor dashboard summary.");
  }
  return resp.data.data;
};

export const getVendorProducts = async () => {
  const resp = await api.get("/api/vendor/products");
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch vendor products.");
  }
  return resp.data.data || [];
};

export const submitProductRequest = async (payload) => {
  const resp = await api.post("/api/vendor/requests", payload);
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to submit product request.");
  }
  return resp.data.data;
};

export const getVendorOrders = async () => {
  const resp = await api.get("/api/vendor/orders");
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch vendor orders.");
  }
  return resp.data.data || [];
};

export default {
  getVendorDashboardSummary,
  getVendorProducts,
  submitProductRequest,
  getVendorOrders,
};
