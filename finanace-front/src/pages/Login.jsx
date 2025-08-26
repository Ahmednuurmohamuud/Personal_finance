import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login, otpPending, verifyOtp } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(form.username, form.password);
      if (res.otp_required) {
        toast("OTP sent! Please check your email.", { icon: "🔐" });
      } else {
        toast.success(res.message);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpPending) return;
    setLoading(true);
    setError("");
    try {
      const message = await verifyOtp(otpPending.user_id, otp);
      toast.success(message);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <form
        onSubmit={otpPending ? handleOtpSubmit : handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Sign in
        </h2>
        <p className="text-sm text-gray-500/90 text-center">
          {otpPending
            ? "Enter the OTP sent to your email"
            : "Welcome back! Please sign in to continue"}
        </p>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {!otpPending && (
          <>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username or Email"
              required
              className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Forgot password link */}
            <div className="text-right">
              <Link
                to="/reset-password"
                className="text-sm text-indigo-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </>
        )}

        {otpPending && (
          <input
            type="text"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            required
            className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
        >
          {loading
            ? "Processing..."
            : otpPending
            ? "Verify OTP"
            : "Sign In"}
        </button>

        {!otpPending && (
          <p className="text-gray-500/90 text-sm mt-4 text-center">
            Don’t have an account?{" "}
            <Link to="/register" className="text-indigo-500 hover:underline">
              Sign up
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
