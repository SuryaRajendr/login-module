import api from "./apiClient";

const unwrap = (response, fallbackMessage) => {
  if (!response.data?.success) {
    throw new Error(response.data?.message || fallbackMessage);
  }
  return response.data.data;
};

export const getBillingSummary = async () => {
  const response = await api.get("/api/billing/summary");
  return unwrap(response, "Failed to fetch billing summary.");
};

export const getBillingHistory = async () => {
  const response = await api.get("/api/billing/history");
  return unwrap(response, "Failed to fetch billing history.");
};

export default { getBillingSummary, getBillingHistory };