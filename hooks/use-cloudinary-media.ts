"use client";

import { useCallback, useState } from "react";
import {
  type UploadedMedia,
  type UploadResourceType,
  uploadFileToCloudinary,
} from "@/lib/cloudinary-upload";

export interface MediaUploadItem {
  id: string;
  name: string;
  previewUrl?: string;
  progress: number;
  status: "queued" | "uploading" | "uploaded" | "error";
  error?: string;
  file?: File;
  uploaded?: UploadedMedia;
  source: "new" | "existing";
}

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const toExistingItem = (media: UploadedMedia): MediaUploadItem => ({
  id: createId(),
  name: media.public_id || media.url.split("/").pop() || "Uploaded media",
  previewUrl: media.url,
  progress: 100,
  status: "uploaded",
  uploaded: media,
  source: "existing",
});

export function useCloudinaryMediaUpload({
  resourceType,
  maxCount,
}: {
  resourceType: UploadResourceType;
  maxCount: number;
}) {
  const [items, setItems] = useState<MediaUploadItem[]>([]);

  const addFiles = useCallback((files: File[]) => {
    const remaining = maxCount - items.length;
    if (remaining <= 0) {
      return `Maximum ${maxCount} ${resourceType}${maxCount === 1 ? "" : "s"} allowed.`;
    }

    const filesToAdd = files.slice(0, remaining);
    if (filesToAdd.length === 0) return null;

    const nextItems = filesToAdd.map((file) => ({
      id: createId(),
      name: file.name,
      previewUrl: resourceType === "image" ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: "queued" as const,
      file,
      source: "new" as const,
    }));

    setItems((current) => [...current, ...nextItems]);

    if (files.length > filesToAdd.length) {
      return `Only ${maxCount} ${resourceType}${maxCount === 1 ? "" : "s"} can be attached.`;
    }

    return null;
  }, [items.length, maxCount, resourceType]);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const reset = useCallback(() => {
    setItems([]);
  }, []);

  const loadExisting = useCallback((media: UploadedMedia[]) => {
    setItems(media.map(toExistingItem));
  }, []);

  const uploadPending = useCallback(async () => {
    const currentItems = [...items];
    const processedItems: MediaUploadItem[] = [];
    let hasFailures = false;

    for (const item of currentItems) {
      if (item.status === "uploaded" && item.uploaded) {
        processedItems.push(item);
        continue;
      }

      if (!item.file) continue;

      setItems((state) =>
        state.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "uploading", progress: 0, error: undefined }
            : entry,
        ),
      );

      try {
        const uploaded = await uploadFileToCloudinary(
          item.file,
          resourceType,
          (progress) => {
            setItems((state) =>
              state.map((entry) =>
                entry.id === item.id
                  ? { ...entry, progress, status: "uploading" }
                  : entry,
              ),
            );
          },
        );

        processedItems.push({
          ...item,
          progress: 100,
          status: "uploaded",
          uploaded,
          error: undefined,
          previewUrl: item.previewUrl || uploaded.url,
        });
        setItems((state) =>
          state.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  progress: 100,
                  status: "uploaded",
                  uploaded,
                  error: undefined,
                  previewUrl: entry.previewUrl || uploaded.url,
                }
              : entry,
          ),
        );
      } catch (error) {
        hasFailures = true;
        const message =
          error instanceof Error ? error.message : "Media upload failed.";
        processedItems.push({
          ...item,
          status: "error",
          progress: 0,
          error: message,
        });
        setItems((state) =>
          state.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: "error", progress: 0, error: message }
              : entry,
          ),
        );
      }
    }

    if (hasFailures) {
      throw new Error(`One or more ${resourceType} uploads failed.`);
    }

    return processedItems;
  }, [items, resourceType]);

  return {
    items,
    addFiles,
    removeItem,
    reset,
    loadExisting,
    uploadPending,
    hasUploading: items.some((item) => item.status === "uploading"),
    hasErrors: items.some((item) => item.status === "error"),
  };
}
