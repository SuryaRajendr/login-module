import api from "./apiClient";

const unwrap = (response, fallbackMessage) => {
  if (!response.data?.success) {
    throw new Error(response.data?.message || fallbackMessage);
  }
  return response.data.data;
};

export const getInvoiceFormData = async () => {
  const response = await api.get("/api/invoices/form-data");
  return unwrap(response, "Failed to fetch invoice form data.");
};

export const getInvoices = async () => {
  const response = await api.get("/api/invoices");
  return unwrap(response, "Failed to fetch invoices.");
};

export const getInvoice = async (invoiceId) => {
  const response = await api.get(`/api/invoices/${invoiceId}`);
  return unwrap(response, "Failed to fetch invoice details.");
};

export const createInvoice = async (payload) => {
  const response = await api.post("/api/invoices", payload);
  return unwrap(response, "Failed to create invoice.");
};

export const updateInvoice = async (invoiceId, payload) => {
  const response = await api.put(`/api/invoices/${invoiceId}`, payload);
  return unwrap(response, "Failed to update invoice.");
};

export default {
  getInvoiceFormData,
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
};