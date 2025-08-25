import React, { useState, useEffect } from "react";
import api from "../service/api"; // axios instance oo leh token

export default function Profile() {
  const [user, setUser] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me/");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
      };
      // Update backend
      const res = await api.patch("/users/me/", payload);
      alert("Profile updated successfully!");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p className="p-6">Loading profile...</p>;
  if (!user) return <p className="p-6 text-red-500">No user data found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile Information</h1>

        {/* Photo Upload */}
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

        {/* Profile Form */}
        <div className="space-y-4">
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
          <input
            type="email"
            value={user.email || ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Email"
            className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="tel"
            value={user.phone || ""}
            onChange={(e) => setUser({ ...user, phone: e.target.value })}
            placeholder="Phone"
            className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
