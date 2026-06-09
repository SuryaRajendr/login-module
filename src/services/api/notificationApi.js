import api from "./apiClient";

export const getNotifications = async () => {
  const resp = await api.get("/api/notifications");
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to fetch notifications.");
  }
  return resp.data.data || [];
};

export const markNotificationRead = async (id) => {
  const resp = await api.put(`/api/notifications/${id}/read`);
  if (!resp.data?.success) {
    throw new Error(resp.data?.message || "Failed to mark notification as read.");
  }
  return resp.data.data;
};

export default { getNotifications, markNotificationRead };
