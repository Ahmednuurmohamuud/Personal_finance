import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    preferred_currency: "USD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("http://localhost:8000/api/users/register/", form);
      setSuccess("Account created successfully!");
      console.log(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Placeholder: Backend Google OAuth endpoint ku wici karo
    alert("Google Sign-In clicked");
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

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full mt-4 bg-gray-100 flex items-center justify-center h-12 rounded-full gap-2 hover:bg-gray-200 transition"
        >
          <img
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
            alt="googleLogo"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <div className="flex items-center gap-4 w-full my-5">
          <div className="w-full h-px bg-gray-300/90"></div>
          <p className="text-sm text-gray-500/90">or sign in with email</p>
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
        <select
          name="preferred_currency"
          value={form.preferred_currency}
          onChange={handleChange}
          className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
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
          <a href="/login" className="text-indigo-500 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
