import api from "./apiClient";

export const getProducts = async () => {
  const resp = await api.get("/api/supplier/products");
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch products.");
  }
  return resp.data.data || [];
};

export const createProduct = async (payload) => {
  const resp = await api.post("/api/supplier/products", payload);
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to create product.");
  }
  return resp.data.data;
};

export const updateProduct = async (id, payload) => {
  const resp = await api.put(`/api/supplier/products/${id}`, payload);
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to update product.");
  }
  return resp.data.data;
};

export const deleteProduct = async (id) => {
  const resp = await api.delete(`/api/supplier/products/${id}`);
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to delete product.");
  }
  return resp.data.data;
};

export const bulkUploadProducts = async (payload) => {
  const resp = await api.post("/api/supplier/products/bulk", payload);
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to upload products.");
  }
  return resp.data.data;
};

export default { getProducts, createProduct, updateProduct, deleteProduct, bulkUploadProducts };
