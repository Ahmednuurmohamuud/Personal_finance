import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // JWT token
        if (!token) {
          toast.error("You are not logged in");
          setLoading(false);
          return;
        }

        const res = await api.get("/notifications/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNotifications(res.data.results || []);
      } catch (err) {
        console.error("Notification fetch failed:", err);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark all as read
  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You are not logged in");
        return;
      }

      await Promise.all(
        notifications.map((n) =>
          api.patch(`/notifications/${n.id}/mark_read/`, null, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark all read failed:", err);
      toast.error("Failed to mark all as read");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">
          Mark all read
        </button>
      </div>

      <ul className="space-y-4">
        {notifications.length === 0 ? (
          <li className="text-gray-500">No notifications</li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className={`p-3 rounded-xl ${n.is_read ? "bg-gray-50" : "bg-blue-50"}`}
            >
              <p className="font-medium">{n.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(n.timestamp).toLocaleString()}
              </p>
            </li>
          ))
        )}
      </ul>

      <div className="mt-4 text-center">
        <button className="text-blue-600 hover:underline text-sm">
          View all notifications
        </button>
      </div>
    </div>
  );
}
