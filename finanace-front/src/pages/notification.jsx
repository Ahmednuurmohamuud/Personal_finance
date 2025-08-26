// src/components/Notifications.jsx
import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Notifications({ onRefreshBadge }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You are not logged in");
        setLoading(false);
        return;
      }

      const res = await api.get("/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data.results || []);
      onRefreshBadge?.();
    } catch (err) {
      console.error("Notification fetch failed:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [onRefreshBadge]);

  const markAllRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await api.post("/notifications/mark_all_read/", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
      onRefreshBadge?.();
    } catch (err) {
      console.error("Failed to mark all read:", err);
      toast.error("Failed to mark all read");
    }
  }, [onRefreshBadge]);

  // Open confirmation modal
  const confirmDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await api.delete(`/notifications/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
      onRefreshBadge?.();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete notification");
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  }, [onRefreshBadge]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button
          onClick={markAllRead}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark all read
        </button>
      </div>

      <ul className="space-y-4">
        {notifications.length === 0 ? (
          <li className="text-gray-500">No notifications</li>
        ) : (
          notifications.map(n => (
            <li
              key={n.id}
              className={`p-3 rounded-xl flex justify-between items-start ${
                n.is_read ? "bg-gray-50" : "bg-blue-50"
              }`}
            >
              <div>
                <p className="font-medium">{n.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(n.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => confirmDelete(n.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this notification?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => { setConfirmOpen(false); setSelectedId(null); }}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteNotification(selectedId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
