"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id: string;
  username: string;
  email: string;
  preferredCurrency: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
    currency: string
  ) => Promise<boolean>;
  googleLogin: (token: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("finance-user");
    const token = localStorage.getItem("finance-token");

    if (savedUser) setUser(JSON.parse(savedUser));

    if (token) {
      axios
        .get(`${API_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("finance-user", JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem("finance-user");
          localStorage.removeItem("finance-token");
        });
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/users/login/`, { username: email, password });
      localStorage.setItem("finance-token", res.data.access);
      localStorage.setItem("finance-refresh", res.data.refresh);

      const me = await axios.get(`${API_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });

      setUser(me.data);
      localStorage.setItem("finance-user", JSON.stringify(me.data));
      router.push("/dashboard");
      return true;
    } catch (error) {
      console.error("Login error:", axios.isAxiosError(error) ? error.response?.data : error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    currency: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/users/register/`, {
        username,
        email,
        password,
        preferred_currency: currency,
      });

      const token = res.data.access || res.data.token;
      if (!token) return false;

      localStorage.setItem("finance-token", token);

      const me = await axios.get(`${API_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(me.data);
      localStorage.setItem("finance-user", JSON.stringify(me.data));
      router.push("/dashboard");
      return true;
    } catch (error) {
      console.error("Registration error:", axios.isAxiosError(error) ? error.response?.data : error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

    const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const googleLogin = async (googleToken: string): Promise<boolean> => {
  setIsLoading(true);
  try {
    // POST token to backend
    const res = await axios.post(`${API_URL}/users/google-oauth/`, {
      token: googleToken,
    });

    // Save tokens
    localStorage.setItem("finance-token", res.data.access);
    localStorage.setItem("finance-refresh", res.data.refresh);

    // Save user
    if (res.data.user) {
      setUser(res.data.user);
      localStorage.setItem("finance-user", JSON.stringify(res.data.user));
    } else {
      const me = await axios.get(`${API_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });
      setUser(me.data);
      localStorage.setItem("finance-user", JSON.stringify(me.data));
    }

    router.push("/dashboard");
    return true;
  } catch (error) {
    console.error(
      "Google login error:",
      axios.isAxiosError(error) ? error.response?.data : error
    );
    return false;
  } finally {
    setIsLoading(false);
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("finance-user");
    localStorage.removeItem("finance-token");
    localStorage.removeItem("finance-refresh");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
