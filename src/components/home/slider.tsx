"use client";

import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type SliderAutoplayConfig = {
  enabled?: boolean;
  delay?: number;
  stopOnInteraction?: boolean;
  stopOnMouseEnter?: boolean;
  stopOnFocusIn?: boolean;
};

interface SliderProps {
  slides: {
    id: number | string;
    image?: string;
    images?: string;
    title?: string;
    url?: string;
  }[];
  autoplay?: boolean | SliderAutoplayConfig;
}

export function Slider({ slides, autoplay = true }: SliderProps) {
  if (!slides || !Array.isArray(slides) || slides.length === 0) return null;

  const autoplayConfig: SliderAutoplayConfig =
    typeof autoplay === "boolean" ? { enabled: autoplay } : autoplay;
  const autoplayEnabled = autoplayConfig.enabled !== false && slides.length > 1;
  const autoplayDelay = Math.max(2000, autoplayConfig.delay ?? 3000);
  const autoplayPlugin = autoplayEnabled
    ? [
        Autoplay({
          delay: autoplayDelay,
          stopOnInteraction: autoplayConfig.stopOnInteraction ?? true,
          stopOnMouseEnter: autoplayConfig.stopOnMouseEnter ?? true,
          stopOnFocusIn: autoplayConfig.stopOnFocusIn ?? true,
        }),
      ]
    : undefined;

  return (
    <div className="mx-auto w-full">
      <Carousel
        opts={{
          loop: true,
        }}
        plugins={autoplayPlugin}
        className="group relative"
        aria-label="Promo berjalan"
      >
        {autoplayEnabled && (
          <p className="sr-only">
            Slider promo bergulir otomatis setiap {Math.round(autoplayDelay / 1000)} detik dan
            berhenti sementara saat diarahkan, difokuskan, atau dikontrol manual.
          </p>
        )}

        <CarouselContent>
          {slides.map((slide, index) => {
            const rawImg = slide.image || slide.images || "/default-og-image.jpg";
            const imgSrc =
              typeof rawImg === "string" && rawImg.trim() ? rawImg.trim() : "/default-og-image.jpg";
            const title = slide.title || "Promo Banner";
            const targetUrl =
              slide.url && typeof slide.url === "string" && slide.url.trim()
                ? slide.url.trim()
                : null;

            const BannerImage = (
              <div className="border-border/40 bg-muted/20 relative h-[150px] w-full overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 sm:h-[220px] md:h-[280px] lg:h-[340px]">
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
                  <Link
                    href={targetUrl}
                    className="focus-visible:ring-primary block w-full rounded-2xl focus:outline-none focus-visible:ring-2"
                  >
                    {BannerImage}
                  </Link>
                ) : (
                  BannerImage
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious className="bg-background/70 border-border/40 text-foreground hover:bg-background left-2 h-8 w-8 rounded-full border opacity-0 shadow-md backdrop-blur-md transition-all hover:scale-105 disabled:opacity-0 group-hover:opacity-100 sm:left-4 sm:h-10 sm:w-10" />
        <CarouselNext className="bg-background/70 border-border/40 text-foreground hover:bg-background right-2 h-8 w-8 rounded-full border opacity-0 shadow-md backdrop-blur-md transition-all hover:scale-105 disabled:opacity-0 group-hover:opacity-100 sm:right-4 sm:h-10 sm:w-10" />
      </Carousel>
    </div>
  );
}
