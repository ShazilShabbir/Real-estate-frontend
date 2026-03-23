"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaFile {
  url?: string;
  public_id?: string;
}

interface PropertyGalleryProps {
  images?: Array<string | MediaFile>;
  videos?: Array<string | MediaFile>;
  title: string;
}

export function PropertyGallery({ images = [], videos = [], title }: PropertyGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const getMediaUrl = (media: string | MediaFile | undefined): string => {
    if (!media) return "/placeholder.svg";
    if (typeof media === "string") return media.trim();
    if (typeof media === "object" && media.url) return media.url.trim();
    return "/placeholder.svg";
  };

  const allMedia = [
    ...(images?.map((img) => ({ type: "image", url: getMediaUrl(img) })) || []),
    ...(videos?.map((vid) => ({ type: "video", url: getMediaUrl(vid) })) || []),
  ];

  if (allMedia.length === 0) {
    return (
      <div className="relative w-full aspect-video bg-muted flex items-center justify-center rounded-2xl">
        <Image src="/placeholder.svg" alt={title} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-3xl bg-black aspect-video" ref={emblaRef}>
        <div className="flex">
          {allMedia.map((media, index) => (
            <div className="relative flex-[0_0_100%] min-w-0 aspect-video" key={index}>
              {media.type === "image" ? (
                <Image
                  src={media.url}
                  alt={`${title} - ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    controls
                    muted={isMuted}
                     disablePictureInPicture
                     controlsList="nodownload nofullscreen noremoteplayback"
                     autoPlay
                     loop
                    playsInline
                  />
                 
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {allMedia.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Thumbnails/Dots */}
      <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2 px-4 no-scrollbar">
        {allMedia.map((media, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              selectedIndex === index ? "border-primary scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            {media.type === "image" ? (
              <Image src={media.url} alt="thumbnail" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play size={16} className="text-primary fill-primary" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
