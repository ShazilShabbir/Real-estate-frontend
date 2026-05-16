"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageLightbox } from "@/components/image-lightbox";

interface MediaFile { url?: string; public_id?: string; }

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
    ...(images?.map((img) => ({ type: "image" as const, url: getMediaUrl(img) })) || []),
    ...(videos?.map((vid) => ({ type: "video" as const, url: getMediaUrl(vid) })) || []),
  ];

  const imageOnlyMedia = allMedia.filter((m) => m.type === "image");

  const openLightbox = (index: number) => {
    const imgIndex = allMedia.slice(0, index).filter((m) => m.type === "image").length;
    setLightboxIndex(imgIndex);
    setLightboxOpen(true);
  };

  if (allMedia.length === 0) {
    return (
      <div className="relative w-full aspect-video bg-muted flex items-center justify-center rounded-2xl">
        <Image src="/placeholder.svg" alt={title} fill className="object-cover rounded-2xl" />
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
                <button onClick={() => openLightbox(index)} className="absolute inset-0 w-full h-full cursor-pointer" aria-label="View fullscreen">
                  <Image
                    src={media.url}
                    alt={`${title} - ${index + 1}`}
                    fill
                    className="object-cover pointer-events-none"
                    priority={index === 0}
                  />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={16} />
                  </div>
                </button>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    controls
                    muted={isMuted}
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    playsInline
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons — always visible on mobile */}
      {allMedia.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2.5 md:p-3 rounded-full transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2.5 md:p-3 rounded-full transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Thumbnails */}
      <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2 px-4 no-scrollbar">
        {allMedia.map((media, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "relative w-[72px] md:w-20 h-[50px] md:h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              selectedIndex === index
                ? "border-primary scale-105 shadow-md"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
            aria-label={`View ${media.type} ${index + 1}`}
          >
            {media.type === "image" ? (
              <Image src={media.url} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play size={16} className="text-primary fill-primary" />
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={imageOnlyMedia.map((m) => ({ url: m.url }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((i) => (i > 0 ? i - 1 : imageOnlyMedia.length - 1))}
          onNext={() => setLightboxIndex((i) => (i < imageOnlyMedia.length - 1 ? i + 1 : 0))}
        />
      )}
    </div>
  );
}
