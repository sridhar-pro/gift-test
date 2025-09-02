// hooks/useAuthenticated.js
import { useAdminToken } from "./useAdminToken";

export const useAuthenticatedFetch = () => {
  const { token } = useAdminToken();

  const authenticatedFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Check for 401 specifically to handle token expiration
      if (response.status === 401) {
        // Clear stored token and reload
        sessionStorage.removeItem("adminToken");
        window.location.reload();
        throw new Error("Session expired. Please refresh.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return response;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  };

  return { authenticatedFetch };
};
