"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX } from "lucide-react";

interface MediaFile { url?: string; public_id?: string; }

interface PropertyMediaCarouselProps {
  images?: Array<string | MediaFile>;
  videos?: Array<string | MediaFile>;
  title: string;
}

export function PropertyMediaCarousel({
  images = [], videos = [], title,
}: PropertyMediaCarouselProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mobilePlaying, setMobilePlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function getMediaUrl(media: string | MediaFile | undefined): string {
    if (!media) return "/placeholder.svg";
    if (typeof media === "string") return media.trim();
    if (typeof media === "object" && media.url) return media.url.trim();
    return "/placeholder.svg";
  }

  function optimizeCloudinaryVideo(url: string): string {
    if (!url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/q_auto,w_500,h_281,c_fill/");
  }

  const firstImageUrl = getMediaUrl(images?.[0]);
  const firstVideoUrl = getMediaUrl(videos?.[0]);
  const hasVideo = videos && videos.length > 0;
  const videoUrl = hasVideo ? optimizeCloudinaryVideo(firstVideoUrl) : null;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isHovering || mobilePlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovering, mobilePlaying]);

  const handleMobilePlay = useCallback(() => {
    if (hasVideo) {
      setMobilePlaying(prev => !prev);
    }
  }, [hasVideo]);

  const isMobile = typeof window !== "undefined" && "ontouchstart" in window;

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-gray-900"
      onMouseEnter={() => { setIsHovering(true); setMobilePlaying(false); }}
      onMouseLeave={() => { setIsHovering(false); setMobilePlaying(false); }}
      onClick={isMobile ? handleMobilePlay : undefined}
    >
      {/* Thumbnail */}
      <Image
        src={firstImageUrl || "/placeholder.svg"}
        alt={title}
        fill
        className="object-cover transition-opacity duration-300"
        style={{ opacity: (isHovering || mobilePlaying) && hasVideo ? 0 : 1 }}
        sizes="(max-width: 768px) 100vw, 33vw"
        priority
      />

      {/* Video */}
      {hasVideo && videoUrl && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: (isHovering || mobilePlaying) ? 1 : 0, pointerEvents: "none" }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            muted={isMuted}
            loop
            playsInline
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Mobile play button overlay */}
      {isMobile && hasVideo && !mobilePlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Play className="h-7 w-7 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Mute toggle */}
      {hasVideo && (isHovering || mobilePlaying) && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="absolute bottom-4 right-4 bg-white/80 hover:bg-white rounded-full p-2.5 transition-colors z-20 shadow-md"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}
    </div>
  )
}
