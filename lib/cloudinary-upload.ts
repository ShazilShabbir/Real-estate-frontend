"use client";

import { api } from "@/lib/axios";

export type UploadResourceType = "image" | "video";

export interface UploadedMedia {
  url: string;
  public_id: string;
}

interface SignedUploadResponse {
  timestamp: number;
  signature: string;
  cloudName?: string;
  apiKey?: string;
  folder: string;
  resourceType: UploadResourceType;
}

const getCloudinaryConfig = (data: SignedUploadResponse) => {
  const cloudName = data.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = data.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    throw new Error("Cloudinary configuration is missing.");
  }

  return { cloudName, apiKey };
};

export async function getSignedUpload(resourceType: UploadResourceType) {
  const { data } = await api.post("/properties/upload-signature", { resourceType });
  return data?.data as SignedUploadResponse;
}

export async function uploadFileToCloudinary(
  file: File,
  resourceType: UploadResourceType,
  onProgress?: (progress: number) => void,
) {
  const signedUpload = await getSignedUpload(resourceType);
  const { cloudName, apiKey } = getCloudinaryConfig(signedUpload);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(signedUpload.timestamp));
  formData.append("signature", signedUpload.signature);
  formData.append("folder", signedUpload.folder);

  return new Promise<UploadedMedia>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let parsed = null;
      try {
        parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        parsed = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && parsed?.secure_url) {
        onProgress?.(100);
        resolve({
          url: parsed.secure_url,
          public_id: parsed.public_id || "",
        });
        return;
      }

      reject(new Error(parsed?.error?.message || "Cloudinary upload failed."));
    };

    xhr.onerror = () => reject(new Error("Unable to upload file to Cloudinary."));
    xhr.send(formData);
  });
}
