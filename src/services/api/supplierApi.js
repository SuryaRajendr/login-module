import api from "./apiClient";

export const getVendorRequests = async () => {
  const resp = await api.get("/api/supplier/vendor-requests");
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch vendor requests.");
  }
  return resp.data.data || [];
};

export const updateVendorRequestStatus = async (requestId, status) => {
  const resp = await api.put(`/api/supplier/vendor-requests/${requestId}/status`, { status });
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to update request status.");
  }
  return resp.data.data;
};

export default { getVendorRequests, updateVendorRequestStatus };
