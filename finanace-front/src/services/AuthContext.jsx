// src/services/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "./api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpPending, setOtpPending] = useState(null); // 2FA state

  // Check if user is logged in on app start
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await api.get("/users/me/");
          setUser(res.data);
        } catch (err) {
          console.error(err);
          setUser(null);
          localStorage.removeItem("accessToken");
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Login
  const login = async (usernameOrEmail, password) => {
    try {
      setError(null);
      const res = await api.post("/users/login/", {
        username: usernameOrEmail, // ✅ backend expects "username" (email also works)
        password,
      });

      if (res.data.otp_required) {
        // 2FA enabled → wait for OTP
        setOtpPending({ user_id: res.data.user_id });
        return { otp_required: true };
      } else {
        // Normal login
        localStorage.setItem("accessToken", res.data.access);
        const userRes = await api.get("/users/me/");
        setUser(userRes.data);
        return { otp_required: false, message: res.data.message };
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
      throw err;
    }
  };

  // Verify OTP
  const verifyOtp = async (user_id, otp) => {
    try {
      const res = await api.post("/users/verify-otp/", { user_id, otp });
      localStorage.setItem("accessToken", res.data.access);
      const userRes = await api.get("/users/me/");
      setUser(userRes.data);
      setOtpPending(null);
      return res.data.message;
    } catch (err) {
      setError(err.response?.data?.detail || "OTP verification failed");
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setOtpPending(null);
  };

  // Register
  const register = async (data) => {
    try {
      setError(null);
      const res = await api.post("/users/register/", data);
      localStorage.setItem("accessToken", res.data.access);

      const userRes = await api.get("/users/me/");
      setUser(userRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Registration failed");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        otpPending,
        login,
        verifyOtp,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
