"use client";

import { useState } from "react";
import { api } from "@/lib/axios";

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

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  properties?: any[];
  error?: string;
}

export function useProperties() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

 // Helper function to clear messages after timeout 
  const clearMessages = () => {
    const timer = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  };

  
   // GET ALL PROPERTIES (search, filter, pagination)
   
 const fetchProperties = async (filters: Filters = {}) => {
  try {
    setLoading(true);
    setError(null);

    const { data } = await api.get("/properties", { params: filters });

    // Backend response structure:
    // { statusCode, data: { properties: [...] } }
    const properties =
      data?.data?.properties ||
      data?.properties ||
      data?.data ||
      [];

    if (Array.isArray(properties)) {
      return properties;
    } else {
      setError("Invalid response format");
      return [];
    }
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to fetch properties";
    setError(errorMsg);
    return [];
  } finally {
    setLoading(false);
  }
};


  // GET PROPERTY BY ID
  
  const getProperty = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/properties/${id}`);
      return data.data || data || {};
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch property";
      setError(errorMsg);
      console.log("[v0] Error fetching property:", errorMsg);
      return {};
    } finally {
      setLoading(false);
    }
  };

  // CREATE PROPERTY (multipart/form-data with images & videos)
   // Backend: POST /properties/create
   // Supports up to 5 images and 2 videos
 
  const createProperty = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post("/properties/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setSuccess(data?.message || "Property created successfully");
      clearMessages();
      
      return data?.data || data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to create property";
      setError(errorMsg);
      console.log("[v0] Error creating property:", errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------
   * UPDATE PROPERTY (supports JSON or FormData)
   * ------------------------------------------------------ */
  const updateProperty = async (id: string | number, payload: FormData | PropertyData) => {
    try {
      setLoading(true);
      setError(null);

      const isMultipart = payload instanceof FormData;

      const { data } = await api.put(`/properties/${id}`, payload, {
        headers: isMultipart
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      setSuccess(data?.message || "Property updated successfully");
      clearMessages();

      return data?.data || data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to update property";
      setError(errorMsg);
      console.log("[v0] Error updating property:", errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  
   // DELETE PROPERTY
 
  const deleteProperty = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.delete(`/properties/${id}`);
      
      setSuccess(data?.message || "Property deleted successfully");
      clearMessages();
      
      return data?.data || data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to delete property";
      setError(errorMsg);
      console.log("[v0] Error deleting property:", errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE LIKE / FAVORITE
   
  const toggleLike = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post(`/properties/${id}/like`);
      
      setSuccess(data?.message || "Preference updated");
      clearMessages();
      
      return data?.data || data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to toggle like";
      setError(errorMsg);
      console.log("[v0] Error toggling like:", errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // GET NEARBY PROPERTIES
   
  const getNearbyProperties = async (lat: number, lng: number, radius = 10, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/properties/nearby", {
        params: { lat, lng, radius, limit },
      });
      
      let properties: any[] = [];
      
      if (Array.isArray(data.data)) {
        properties = data.data;
      } else if (Array.isArray(data.properties)) {
        properties = data.properties;
      } else if (data.data?.properties && Array.isArray(data.data.properties)) {
        properties = data.data.properties;
      } else if (data.data?.items && Array.isArray(data.data.items)) {
        properties = data.data.items;
      } else if (Array.isArray(data)) {
        properties = data;
      }
      
      if (Array.isArray(properties)) {
        return properties;
      }
      
      console.log("[v0] Nearby properties response is not an array:", data);
      return [];
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch nearby properties";
      setError(errorMsg);
      console.log("[v0] Error fetching nearby properties:", errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };



  return {
    // State
    loading,
    error,
    success,
    
    // Query Functions
    fetchProperties,
    getProperty,
    getNearbyProperties,
    
    // Mutation Functions
    createProperty,
    updateProperty,
    deleteProperty,
    toggleLike,
  };
}
