"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";

interface Filters {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  state?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  sort?: string;
  page?: number;
  limit?: number;
  postedBy?: string;
}

interface Address {
  street?: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface MediaFile {
  url: string;
  public_id: string;
}

interface PropertyData {
  title: string;
  description: string;
  price: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  propertyType?: string;
  status?: string;
  address: Address | string;
  lat?: number;
  lng?: number;
  amenities?: string[];
  isFeatured?: boolean;
  images?: MediaFile[];
  videos?: MediaFile[];
  [key: string]: any;
}

export function useProperties() {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    const timer = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const fetchProperties = useCallback(async (filters: Filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/properties", { params: filters });
      const properties = data?.data?.properties || data?.properties || data?.data || [];
      return Array.isArray(properties) ? properties : [];
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch properties");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getProperty = useCallback(async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/properties/${id}`);
      return data.data || data || {};
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch property");
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const createProperty = useCallback(async (formData: FormData) => {
    try {
      setActionLoading(true);
      setError(null);
      const { data } = await api.post("/properties/create", formData);
      const msg = data?.message || "Property created successfully";
      setSuccess(msg);
      toast.success(msg);
      clearMessages();
      return data?.data || data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create property";
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [clearMessages]);

  const updateProperty = useCallback(async (id: string | number, payload: FormData | PropertyData) => {
    try {
      setActionLoading(true);
      setError(null);
      const { data } = await api.patch(`/properties/${id}`, payload);
      const msg = data?.message || "Property updated successfully";
      setSuccess(msg);
      toast.success(msg);
      clearMessages();
      return data?.data || data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update property";
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [clearMessages]);

  const deleteProperty = useCallback(async (id: string | number) => {
    try {
      setActionLoading(true);
      setError(null);
      const { data } = await api.delete(`/properties/${id}`);
      const msg = data?.message || "Property deleted successfully";
      setSuccess(msg);
      toast.success(msg);
      clearMessages();
      return data?.data || data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete property";
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [clearMessages]);

  const toggleLike = useCallback(async (id: string | number) => {
    try {
      setActionLoading(true);
      setError(null);
      const { data } = await api.post(`/properties/${id}/like`);
      const msg = data?.message || "Preference updated";
      setSuccess(msg);
      toast.success(msg);
      clearMessages();
      return data?.data || data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to toggle like";
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [clearMessages]);

  const getNearbyProperties = useCallback(async (lat: number, lng: number, radius = 10, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/properties/nearby", {
        params: { lat, lng, radius, limit },
      });
      const properties = data.data || data.properties || data.data?.properties || data.data?.items || data;
      return Array.isArray(properties) ? properties : [];
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch nearby properties");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    actionLoading,
    error,
    success,
    fetchProperties,
    getProperty,
    getNearbyProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    toggleLike,
  };
}
