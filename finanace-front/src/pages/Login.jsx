import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
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
      const res = await axios.post("http://localhost:8000/api/users/login/", {
        username: form.usernameOrEmail,
        password: form.password,
      });
      setSuccess("Login successful!");
      console.log(res.data); // Halkan waxaad kaydin kartaa token ama user info
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Placeholder: Halkan backend endpoint Google OAuth wici karo
    alert("Google Sign-In clicked");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Sign in
        </h2>
        <p className="text-sm text-gray-500/90 text-center">
          Welcome back! Please sign in to continue
        </p>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}

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
          <p className="text-sm text-gray-500/90">or sign in with username/email</p>
          <div className="w-full h-px bg-gray-300/90"></div>
        </div>

        <input
          type="text"
          name="usernameOrEmail"
          value={form.usernameOrEmail}
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

        <div className="w-full flex items-center justify-between mt-2 text-gray-500/80">
          <div className="flex items-center gap-2">
            <input className="h-5" type="checkbox" id="remember" />
            <label className="text-sm" htmlFor="remember">
              Remember me
            </label>
          </div>
          <a className="text-sm underline" href="/forgot-password">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-gray-500/90 text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <a href="/register" className="text-indigo-500 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
