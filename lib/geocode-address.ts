"use client";

export interface GeocodeAddressInput {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const buildQuery = (address: GeocodeAddressInput) =>
  [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");

export async function geocodeAddress(address: GeocodeAddressInput) {
  const query = buildQuery(address);
  if (!query) {
    throw new Error("Address is required to find map coordinates.");
  }

  const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Geocoding service is unavailable right now.");
  }

  const results = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
  }>;

  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const lat = Number.parseFloat(results[0].lat || "");
  const lng = Number.parseFloat(results[0].lon || "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    lat,
    lng,
    displayName: results[0].display_name || query,
  } as GeocodedLocation;
}
