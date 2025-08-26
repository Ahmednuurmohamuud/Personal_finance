import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [currencies, setCurrencies] = useState([]);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  // -------- Fetch user + currencies --------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, currRes] = await Promise.all([
          api.get("/users/me/"),
          api.get("/currencies/")
        ]);

        setUser(userRes.data);
        setTwoFactor(userRes.data.two_factor_enabled || false);

        const currencyData = Array.isArray(currRes.data)
          ? currRes.data
          : currRes.data.results || [];
        setCurrencies(currencyData);

        if (userRes.data.photo) setPhoto(userRes.data.photo);
      } catch (err) {
        console.error("Error fetching user/currencies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Loading profile...</p>;
  if (!user) return <p className="p-6 text-red-500">No user data found.</p>;

  // -------- Handlers --------
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleProfileSave = async () => {
    try {
      const formData = new FormData();
      formData.append("first_name", user.first_name || "");
      formData.append("last_name", user.last_name || "");
      formData.append("email", user.email || "");
      formData.append("phone", user.phone || "");
      formData.append("preferred_currency", user.preferred_currency || "USD");
      formData.append("monthly_income_est", user.monthly_income_est || 0);
      formData.append("savings_goal", user.savings_goal || 0);
      if (photoFile) formData.append("photo", photoFile);

      const res = await api.patch("/users/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      setPhoto(res.data.photo);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err);
      alert("Failed to update profile");
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await api.post("/users/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      alert("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Password change failed:", err.response?.data || err);
      alert("Failed to update password");
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      const res = await api.patch("/users/me/", {
        two_factor_enabled: !twoFactor,
      });
      setTwoFactor(res.data.two_factor_enabled);
      alert(`2FA ${res.data.two_factor_enabled ? "enabled" : "disabled"}!`);
    } catch (err) {
      console.error("2FA toggle failed:", err.response?.data || err);
      alert("Failed to update 2FA setting");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await api.delete("/users/me/");
      alert("Account deleted.");
      // redirect to login or home
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err);
      alert("Failed to delete account");
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

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-indigo-600 mb-4">Profile Information</h2>

          {/* Photo */}
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

          {/* Name */}
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

          {/* Email + Phone */}
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

          {/* Currency + Income + Savings */}
          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={user.preferred_currency || "USD"}
              onChange={(e) => setUser({ ...user, preferred_currency: e.target.value })}
              className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              value={user.monthly_income_est || ""}
              onChange={(e) => setUser({ ...user, monthly_income_est: e.target.value })}
              placeholder="Monthly Income Estimate"
              className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="0.01"
              value={user.savings_goal || ""}
              onChange={(e) => setUser({ ...user, savings_goal: e.target.value })}
              placeholder="Savings Goal"
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
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-indigo-600 mb-4">Security</h2>

          {/* Password */}
          <div className="space-y-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handlePasswordUpdate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Update Password
            </button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={handleTwoFactorToggle}
            />
            <span>Enable Two-Factor Authentication (2FA)</span>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-indigo-600 mb-4">Notifications</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={() => setNotifEmail(!notifEmail)}
            />
            <span>Email Notifications</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifSMS}
              onChange={() => setNotifSMS(!notifSMS)}
            />
            <span>SMS Notifications</span>
          </div>
        </div>
      )}

      {/* Data & Privacy Tab */}
      {activeTab === "privacy" && (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Data & Privacy</h2>
          <p className="text-gray-600">
            You can download or delete your account data at any time.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete My Account
          </button>
        </div>
      )}
    </div>
  );
}
