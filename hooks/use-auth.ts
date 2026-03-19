"use client";
import { useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth-context";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const { setUser } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 🟢 REGISTER
  const register = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(data.message);
      router.push("/login");

      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 LOGIN — Server sets token cookies automatically
  const login = async (credentials: Record<string, string>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/auth/login", credentials, {
        withCredentials: true,
      });

      if (data.data.loggedInUser) {
        setUser(data.data.loggedInUser);
      }

      setMessage(data.message);
      router.push("/");

      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 Update Profile
  const updateProfile = async (values: {
    email: string;
    username: string;
    phone: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.patch("/auth/account", values, {
        withCredentials: true,
      });
      setUser(data.data);
      toast.success(data.message || "Profile updated successfully");
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update profile";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 Update Avatar
  const updateAvatar = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.patch("/auth/update-avatar", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setUser(data.data);
      toast.success(data.message || "Avatar updated successfully");
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update avatar";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 Change Password
  const changePassword = async (values: {
    oldPassword: string;
    newPassword: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.patch("/auth/change-password", values, {
        withCredentials: true,
      });
      toast.success(data.message || "Password changed successfully");
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to change password";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    login,
    updateProfile,
    updateAvatar,
    changePassword,
    isLoading,
    error,
    message,
  };
}
