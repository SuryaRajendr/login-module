import api from "./apiClient";

export const getReportSummary = async (params = {}) => {
  const resp = await api.get("/api/reports/summary", { params });
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch report summary.");
  }
  return resp.data.data;
};

export default { getReportSummary };
