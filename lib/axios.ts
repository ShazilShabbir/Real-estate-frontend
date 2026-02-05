import axios from "axios"
import Cookies from "js-cookie"


export const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})


api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Add interceptors if needed for auth tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        await api.get("/auth/refresh"); // backend sets new HttpOnly accessToken

        // Retry the original request (cookies automatically sent)
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → user must login again
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
