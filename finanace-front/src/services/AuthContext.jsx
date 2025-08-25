// src/services/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "./api"; // Ensure api.ts is in the same folder

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const login = async (username, password) => {
    try {
      setError(null);
      const res = await api.post("/users/login/", { username, password });
      localStorage.setItem("accessToken", res.data.access);

      const userRes = await api.get("/users/me/");
      setUser(userRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Login failed");
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
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
      value={{ user, loading, error, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}
