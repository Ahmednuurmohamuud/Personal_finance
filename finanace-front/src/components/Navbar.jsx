// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, Settings, Archive, LogOut } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import NotificationBadge from "./NotificationBadge";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await api.get("/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.results || []);
    } catch (err) {
      console.error("Notification fetch failed:", err);
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [refreshFlag]);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await api.post("/notifications/mark_all_read/", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setRefreshFlag(prev => prev + 1); // trigger badge refresh
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    setAccountOpen(false);
    if (!notifOpen) markAllRead();
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-200 bg-white relative">
      {/* Logo */}
      <div className="logo font-bold text-lg text-indigo-600">
        <Link to="/dashboard">💰 Finance Manager</Link>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden sm:flex items-center gap-8">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/accounts">Accounts</Link>
        <Link to="/budgets">Budgets</Link>
        <Link to="/recurring">Bills</Link>
        <Link to="/reports">Reports</Link>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            type="text"
            placeholder="Search..."
          />
          <Search size={16} className="text-gray-500" />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <NotificationBadge onClick={handleNotifClick} refreshFlag={refreshFlag} />
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border p-3 z-50">
              <h3 className="font-semibold mb-2 flex justify-between items-center">
                Notifications
                <Link to="/notifications" className="text-sm text-indigo-600 hover:underline">
                  View all
                </Link>
              </h3>
              <ul className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <li className="text-gray-500 text-sm">No notifications yet</li>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <li key={n.id} className={`p-2 rounded-lg ${n.is_read ? "bg-gray-50" : "bg-blue-50"}`}>
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleString()}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Account Menu */}
        <div className="relative">
          <button onClick={() => { setAccountOpen(!accountOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100">
            <User className="w-6 h-6" />
          </button>
          {accountOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl border p-2 z-50">
              <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                <User className="w-4 h-4" /> Profile
              </Link>
              <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <Link to="/archive" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                <Archive className="w-4 h-4" /> Archive Items
              </Link>
              <button onClick={() => { localStorage.removeItem("accessToken"); window.location.reload(); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-100 text-red-600">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" className="sm:hidden">
        <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="21" height="1.5" rx=".75" fill="#426287" />
          <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
          <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
        </svg>
      </button>
    </header>
  );
}

export default Navbar;
