import axios from "axios"
import { toast } from "sonner"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://real-estate-api-cyan.vercel.app/api"
).replace(/\/+$/, "")

export const api = axios.create({
  baseURL: `${API_BASE_URL}/`,
  withCredentials: true,
})

// Request interceptor to handle FormData
api.interceptors.request.use((config) => {
  // Only set Content-Type for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json"
  }
  return config
})

// Response interceptor for auth tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once for 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.get("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please log in again.");
        return Promise.reject(refreshError);
      }
    }

    // Generic error handling
    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
    
    // Only show toast if it's not a 401 (which we either retry or handle above)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);
