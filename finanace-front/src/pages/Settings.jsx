import React, { useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-6 md:p-12">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <p className="mb-8 text-gray-600">
        Manage your account preferences and settings
      </p>

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
      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">
              Profile Information
            </h2>
            <div>
              <label className="block mb-1 font-medium">Change Photo</label>
              <input type="file" accept="image/*" className="border px-3 py-2 rounded-lg w-full" />
              <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="border px-3 py-2 rounded-lg" defaultValue="John"/>
              <input type="text" placeholder="Last Name" className="border px-3 py-2 rounded-lg" defaultValue="Doe"/>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="email" placeholder="Email Address" className="border px-3 py-2 rounded-lg" defaultValue="john.doe@example.com"/>
              <input type="tel" placeholder="Phone Number" className="border px-3 py-2 rounded-lg" defaultValue="+1 (555) 123-4567"/>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
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

            <div className="space-y-2 mt-4">
              <h3 className="font-medium">Active Sessions</h3>
              <ul className="border rounded-lg divide-y">
                <li className="px-3 py-2 flex justify-between items-center">
                  <span>Desktop - Chrome (Current session • New York, NY)</span>
                  <button className="text-red-500 hover:underline">Revoke</button>
                </li>
                <li className="px-3 py-2 flex justify-between items-center">
                  <span>iPhone - Safari (2 hours ago • New York, NY)</span>
                  <button className="text-red-500 hover:underline">Revoke</button>
                </li>
              </ul>
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
