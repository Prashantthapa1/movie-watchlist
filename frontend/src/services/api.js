// api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api";

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // allows cookies if your backend sets HttpOnly cookies
});

// Attach token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired (401) and request is not retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // ✅ Don't try to refresh token if this IS the refresh request
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.error("Refresh token is invalid/expired");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.common["Authorization"];
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await api.post("/auth/refresh", {
          refreshToken: refreshToken
        });
        
        // Handle nested data structure from backend
        const newToken = res.data?.data?.token || res.data?.token || res.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;

        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return api(originalRequest); // retry request
        } else {
          throw new Error("No new token received");
        }
      } catch (err) {
        console.error("[API] Refresh token failed:", err.response?.data || err.message);
        
        // ✅ Clear all tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.common["Authorization"];
        
        // ✅ Redirect to login page
        window.location.href = "/login";
        
        return Promise.reject(err);
      }
    }

    // ✅ For other 401 errors without retry, redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
