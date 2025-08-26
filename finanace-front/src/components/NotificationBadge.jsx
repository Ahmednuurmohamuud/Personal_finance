import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../services/api";

export default function NotificationBadge({ refreshFlag = 0, onClick }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await api.get("/notifications/unread_count/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUnreadCount(res.data.unread || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [refreshFlag]); // refreshFlag wuxuu trigger gareeyaa fetch mar kasta

  return (
    <button onClick={onClick} className="relative">
      <Bell size={20} className="text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 text-xs text-white bg-red-500 w-5 h-5 flex items-center justify-center rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
