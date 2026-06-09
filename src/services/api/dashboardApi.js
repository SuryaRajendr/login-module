import api from "./apiClient";

export const getDashboardStats = async () => {
  const resp = await api.get("/api/supplier/dashboard/stats");
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch dashboard stats.");
  }
  return resp.data.data;
};

export default { getDashboardStats };
