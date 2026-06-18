import api from "./apiClient";

const unwrap = (response, fallbackMessage) => {
  if (!response.data?.success) {
    throw new Error(response.data?.message || fallbackMessage);
  }
  return response.data.data;
};

export const getPayments = async () => {
  const response = await api.get("/api/payments");
  return unwrap(response, "Failed to fetch payments.");
};

export default { getPayments };