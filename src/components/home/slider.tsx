"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SliderProps {
  slides: {
    id: number | string;
    image?: string;
    images?: string;
    title?: string;
    url?: string;
  }[];
}

export function Slider({ slides }: SliderProps) {
  if (!slides || !Array.isArray(slides) || slides.length === 0) return null;

  return (
    <div className="mx-auto w-full">
      <Carousel
        opts={{
          loop: true,
        }}
        className="relative group"
      >
        <CarouselContent>
          {slides.map((slide, index) => {
            const rawImg = slide.image || slide.images || "/default-og-image.jpg";
            const imgSrc = typeof rawImg === "string" && rawImg.trim() ? rawImg.trim() : "/default-og-image.jpg";
            const title = slide.title || "Promo Banner";
            const targetUrl = slide.url && typeof slide.url === "string" && slide.url.trim() ? slide.url.trim() : null;

            const BannerImage = (
              <div className="relative w-full h-[150px] sm:h-[220px] md:h-[280px] lg:h-[340px] overflow-hidden rounded-2xl border border-border/40 bg-muted/20 shadow-sm transition-all duration-300">
                <Image
                  src={imgSrc}
                  alt={title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1200px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
            );

            return (
              <CarouselItem key={slide.id ?? index}>
                {targetUrl ? (
                  <Link href={targetUrl} className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
                    {BannerImage}
                  </Link>
                ) : (
                  BannerImage
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/70 backdrop-blur-md border border-border/40 text-foreground shadow-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hover:bg-background hover:scale-105" />
        <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/70 backdrop-blur-md border border-border/40 text-foreground shadow-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hover:bg-background hover:scale-105" />
      </Carousel>
    </div>
  );
}