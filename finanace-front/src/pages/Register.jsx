// src/pages/Register.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const { register, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    preferred_currency: "USD",
  });
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await api.get("/currencies/");
        setCurrencies(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to load currencies", err);
      }
    };
    fetchCurrencies();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      setPasswordError(
        e.target.value.length < 8
          ? "Password must be at least 8 characters"
          : ""
      );
    }
  };

  // ===== Register with email =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setPasswordError("Password must be at least 8 characters");

    setLoading(true);
    setError("");

    try {
      const res = await register(form);

      if (!res.user.is_verified) {
        setEmailNotVerified(true);
        setUserId(res.user.id);
        toast("📧 Please check your email to verify your account.");
      } else {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.detail ||
        "Registration failed";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ===== Resend Verification Email =====
  const handleResendVerification = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/resend-verification/", { user_id: userId });
      toast.success(res.data.detail || "Verification email sent! Check your inbox 📧");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  // ===== Google Sign-Up =====
  const handleGoogleSignUp = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      if (!credentialResponse.credential) throw new Error("Google Sign-Up failed");

      const res = await loginWithGoogle(credentialResponse.credential);

      if (!res.user.is_verified) {
        setEmailNotVerified(true);
        setUserId(res.user.id);
        toast("📧 Please verify your email sent by Google before using the account.");
      } else {
        toast.success("Signed up successfully with Google!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Google Sign-Up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Create Account
        </h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-center mt-2">
          <GoogleLogin
            onSuccess={handleGoogleSignUp}
            onError={() => toast.error("Google Sign-Up failed")}
          />
        </div>

        <div className="flex items-center gap-4 w-full my-5">
          <div className="w-full h-px bg-gray-300/90"></div>
          <p className="text-sm text-gray-500/90">or sign up with email</p>
          <div className="w-full h-px bg-gray-300/90"></div>
        </div>

        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

        <select
          name="preferred_currency"
          value={form.preferred_currency}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>

        {emailNotVerified && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading}
            className="text-indigo-500 hover:underline self-end"
          >
            {loading ? "Resending..." : "Resend Verification Email"}
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
