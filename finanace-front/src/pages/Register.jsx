// src/pages/Register.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";
import { useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google"; // React Google OAuth SDK

export default function Register() {
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    preferred_currency: "USD",
  });
  const [currencies, setCurrencies] = useState([]);// ✅ list of currencies
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Fetch currencies on mount
  // Fetch currencies on mount
useEffect(() => {
  const fetchCurrencies = async () => {
    try {
      const res = await api.get("/currencies/");
      setCurrencies(res.data.results || res.data); // ✅ ensure array
    } catch (err) {
      console.error("Failed to load currencies", err);
    }
  };
  fetchCurrencies();
}, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8000/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Registration failed");

      setSuccess("Account created successfully!");

      // Auto login user after register
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      login(data.user, data.access);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign-Up
  const handleGoogleSignUp = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      if (!credentialResponse.credential)
        throw new Error("Google Sign-Up failed");

      // Send Google token to backend (loginWithGoogle should handle it)
      await loginWithGoogle(credentialResponse.credential);

      toast.success("Signed up with Google!");
      navigate("/dashboard");
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
        {success && <p className="text-green-500 text-sm">{success}</p>}

        {/* Google Sign-Up button */}
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
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
          {/* ✅ Dynamic currency dropdown */}
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
