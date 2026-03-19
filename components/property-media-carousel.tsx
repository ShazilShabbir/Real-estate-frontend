"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX } from "lucide-react";

// ===== TYPES =====
interface MediaFile {
  url?: string;
  public_id?: string;
}

interface PropertyMediaCarouselProps {
  images?: Array<string | MediaFile>;
  videos?: Array<string | MediaFile>;
  title: string;
}

// ===== COMPONENT =====
export function PropertyMediaCarousel({
  images = [],
  videos = [],
  title,
}: PropertyMediaCarouselProps) {
  // State Management
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ===== HELPER FUNCTIONS =====

  // Extract URL from string or MediaFile object
  function getMediaUrl(media: string | MediaFile | undefined): string {
    if (!media) return "/placeholder.svg";
    if (typeof media === "string") return media.trim();
    if (typeof media === "object" && media.url) return media.url.trim();
    return "/placeholder.svg";
  }

  // Optimize Cloudinary video URLs for preview
  function optimizeCloudinaryVideo(url: string): string {
    if (!url.includes("cloudinary.com")) return url;
    // Add quality and size optimization to the URL
    return url.replace("/upload/", "/upload/q_auto,w_500,h_281,c_fill/");
  }

  // ===== DATA PREPARATION =====

  const firstImageUrl = getMediaUrl(images?.[0]);
  const firstVideoUrl = getMediaUrl(videos?.[0]);
  const hasVideo = videos && videos.length > 0;
  const videoUrl = hasVideo ? optimizeCloudinaryVideo(firstVideoUrl) : null;

  // ===== EFFECTS =====

  // Handle video play/pause on hover
  useEffect(() => {
    if (!videoRef.current) return;

    if (isHovering) {
      videoRef.current.play().catch(() => {
        // Silently fail if video play is prevented by browser
      });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovering]);

  // ===== RENDER =====

  return (
    <div
      className="relative w-full h-full  overflow-hidden bg-gray-900 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      
    >
      {/* LAYER 1: Thumbnail Image (Always present) */}
      <Image
        src={firstImageUrl || "/placeholder.svg"}
        alt={title}
        fill
        className="object-cover transition-opacity duration-300"
        style={{
          opacity: isHovering && hasVideo ? 0 : 1,
        }}
        sizes="(max-width: 768px) 100vw, 33vw"
        priority
      />

      {/* LAYER 2: Video (Shows when hovering) */}
      {hasVideo && videoUrl && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? 1 : 0,
            pointerEvents: isHovering ? "auto" : "none",
          }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            muted={isMuted}
            loop
            playsInline
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            className="w-full h-full object-cover "
             
          />
        </div>
      )}

      {/* CONTROL: Mute button (shown only when video is playing) */}
      {hasVideo && isHovering && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 transition-colors z-20"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}
    </div>
  );
}
