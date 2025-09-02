// lib/api.js
import { getAuthToken, initializeAuth } from "./auth";

export const fetchWithAuth = async (endpoint, options = {}) => {
  // Skip auth for GET requests
  if (options.method?.toUpperCase() !== "POST") {
    return fetch(
      `https://marketplace.betalearnings.com/api/v1${endpoint}`,
      options
    );
  }

  let token = getAuthToken();

  // If no token, try to authenticate first
  if (!token) {
    try {
      await initializeAuth();
      token = getAuthToken();
    } catch (error) {
      throw new Error("Authentication failed: " + error.message);
    }
  }

  const response = await fetch(
    `https://marketplace.betalearnings.com/api/v1${endpoint}`,
    {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    throw new Error("Session expired - please refresh the page");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`
    );
  }

  return response.json();
};
