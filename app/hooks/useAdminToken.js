// hooks/useAdminToken.js
import { useState, useEffect } from "react";

export const useAdminToken = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const login = async () => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "admin",
            password: "Admin@123",
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        if (data.token) {
          setToken(data.token);
          // Store token in sessionStorage for persistence
          sessionStorage.setItem("adminToken", data.token);
        } else {
          throw new Error("Token not received");
        }
      } catch (err) {
        setError(err.message);
        console.error("Login error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Check if we already have a token
    const storedToken = sessionStorage.getItem("adminToken");
    if (storedToken) {
      setToken(storedToken);
      setLoading(false);
    } else {
      login();
    }
  }, []);

  return { token, loading, error };
};
