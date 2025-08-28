// src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState(""); // email user enters for resend

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Verification token is missing.");
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      setLoading(true);
      try {
        const res = await api.post("/users/verify_email/", { token });
        setSuccess(res.data.message || "Email verified successfully!");
        toast.success(res.data.message || "Email verified successfully!");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error || "Failed to verify email. Token may be expired."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email to resend verification.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/resend-verification/", { email });
      toast.success(res.data.detail || "Verification email resent! 📧");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4 text-center">
        {loading && <p className="text-gray-600">Verifying your email...</p>}
        {success && <p className="text-green-500">{success}</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && error && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleResendVerification}
              className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              Resend Verification Email
            </button>
            <button
              onClick={() => navigate("/register")}
              className="mt-2 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Back to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}
