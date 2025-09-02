"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async () => {
    try {
      const response = await axios.post("/api/login", {
        username: "admin",
        password: "Admin@123",
      });

      if (response.data.status === "success") {
        setToken(response.data.token);
        localStorage.setItem("authToken", response.data.token);
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      setLoading(false);
    } else {
      // If no token, perform login
      login();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
