import React, { useState, useEffect } from "react";

import { AuthContext } from "../services/AuthContext";



import api from "../services/api"; // Vite/TS si otomaatig ah wuu aqoonsanayaa api.ts


export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me/");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <p className="p-6">Loading profile...</p>;
  if (!user) return <p className="p-6 text-red-500">No user data found.</p>;

  // Handlers
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfileSave = async () => {
    try {
      const payload = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
      };
      const res = await api.patch("/users/me/", payload);
      setUser(res.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="p-6 md:p-12">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <p className="mb-8 text-gray-600">Manage your account preferences and settings</p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["profile", "security", "notifications", "privacy"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab === "profile" && "Profile"}
            {tab === "security" && "Security"}
            {tab === "notifications" && "Notifications"}
            {tab === "privacy" && "Data & Privacy"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Profile Information</h2>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                {photo ? (
                  <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No Photo
                  </div>
                )}
              </div>
              <label className="cursor-pointer text-blue-600 hover:underline">
                Change Photo
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              <p className="text-xs text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                value={user.first_name || ""}
                onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                placeholder="First Name"
                className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={user.last_name || ""}
                onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                placeholder="Last Name"
                className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="email"
                value={user.email || ""}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Email Address"
                className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="tel"
                value={user.phone || ""}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                placeholder="Phone Number"
                className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleProfileSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-indigo-600">Security Settings</h2>
            <p>Your account is protected by Google's secure authentication.</p>
            <div className="space-y-2">
              <label className="block font-medium">Change Password</label>
              <input type="password" placeholder="Current Password" className="border px-3 py-2 rounded-lg w-full"/>
              <input type="password" placeholder="New Password" className="border px-3 py-2 rounded-lg w-full"/>
              <input type="password" placeholder="Confirm New Password" className="border px-3 py-2 rounded-lg w-full"/>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Update Password
              </button>
            </div>
            <div className="space-y-2 mt-4">
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Enable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-600">Notification Settings</h2>
            <div className="space-y-2">
              <h3 className="font-medium">Alert Types</h3>
              <label className="flex items-center gap-2">
                <input type="checkbox"/> Budget Alerts
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox"/> Bill Reminders
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox"/> Financial Tips
              </label>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Delivery Methods</h3>
              <label className="flex items-center gap-2">
                <input type="checkbox"/> Email Notifications
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox"/> Push Notifications
              </label>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Save Notification Settings
            </button>
          </div>
        )}

        {/* Data & Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-600">Data & Privacy</h2>
            <div className="space-y-2">
              <h3 className="font-medium">Export Your Data</h3>
              <p>Download a copy of all your financial data</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Download Data Export
              </button>
            </div>
            <div className="space-y-2 mt-4">
              <h3 className="font-medium">Data Retention</h3>
              <p>Control how long your data is stored</p>
              <select className="border px-3 py-2 rounded-lg">
                <option>Keep indefinitely</option>
                <option>Delete after 1 year</option>
                <option>Delete after 5 years</option>
              </select>
            </div>
            <div className="space-y-2 mt-4">
              <h3 className="font-medium text-red-600">Delete Account</h3>
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
