import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  // form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);

  // handle reset request (email)
  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/users/reset-password/", { email });
      if (res.data.status === "email_sent") {
        toast.success("Reset link sent! Check your inbox.");
        setEmail("");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  // handle confirm reset (new password)
  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!password || !confirmPwd) {
      toast.error("Please fill all fields");
      return;
    }
    if (password !== confirmPwd) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/users/reset-password-confirm/", {
        uid,
        token,
        password,
      });
      if (res.data.status === "password_changed") {
        toast.success("Password successfully reset! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000); // redirect after 2s
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        {uid && token ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">Set New Password</h1>
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-1 block w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter new password"
                  className="mt-1 block w-full rounded-xl border px-3 py-2"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
            <p className="text-gray-600 text-sm text-center mb-6">
              Enter your email and we’ll send you a reset link.
            </p>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 block w-full rounded-xl border px-3 py-2"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
