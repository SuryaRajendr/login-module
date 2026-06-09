import { useEffect, useState } from "react";
import notificationApi from "../services/api/notificationApi";
import { getErrorMessage } from "../utils/errorParser";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const data = await notificationApi.getNotifications();
        setNotifications(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="notification-dropdown">
      <button className="notification-trigger" onClick={() => setIsOpen((open) => !open)}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h4>Notifications</h4>
          </div>

          {loading ? (
            <div className="notification-empty">Loading notifications...</div>
          ) : error ? (
            <div className="notification-empty">{getErrorMessage(error)}</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet.</div>
          ) : (
            <div className="notification-list">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  className={`notification-item ${item.is_read ? "read" : "unread"}`}
                  onClick={() => handleMarkRead(item.id)}
                >
                  <p className="notification-title">{item.title}</p>
                  {item.message && <p className="notification-message">{item.message}</p>}
                  <span className="notification-timestamp">{new Date(item.created_at).toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
