"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface GameHeaderProps {
  games: {
    image: string;
    banner: string;
    title: string;
    developers: string;
  } | null;
}

export default function GameHeader({ games }: GameHeaderProps) {
  return (
    <div className="relative w-full">
      <div className="relative -mx-4 -my-8 lg:-my-2">
        {games ? (
          <Image
            src={games.banner}
            alt={games.title}
            width={1280}
            height={400}
            className="h-48 w-full object-cover md:h-64 lg:h-80 lg:rounded-2xl"
            priority
          />
        ) : (
          <Skeleton className="bg-muted h-48 w-full md:h-64 lg:h-80" />
        )}
      </div>

      <section className="z-5 relative -mt-10 px-8 sm:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-background/90 ring-border flex flex-col gap-6 rounded-xl p-4 shadow-sm ring-1 backdrop-blur-md md:flex-row md:items-center md:p-6"
        >
          <div className="mx-auto -mt-12 md:mx-0 md:mt-0">
            {games ? (
              <Image
                src={games.image}
                alt={games.title}
                width={120}
                height={120}
                className="h-24 w-24 rounded-xl border object-cover shadow-md md:h-28 md:w-28"
              />
            ) : (
              <Skeleton className="h-24 w-24 rounded-xl md:h-28 md:w-28" />
            )}
          </div>

          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            {games ? (
              <>
                <h1 className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                  {games.title}
                </h1>
                <p className="text-muted-foreground text-sm">{games.developers}</p>
              </>
            ) : (
              <>
                <Skeleton className="mb-2 h-6 w-48" />
                <Skeleton className="mb-4 h-4 w-32" />
              </>
            )}

            <div className="mt-4 hidden gap-6 md:flex">
              {games ? (
                <>
                  <FeatureGif src="/voltage.gif" alt="Proses Cepat" text="Proses Cepat" size={24} />
                  <FeatureGif
                    src="/cs.gif"
                    alt="Layanan Bantuan 24/7"
                    text="Layanan Bantuan 24/7"
                    size={24}
                  />
                  <FeatureGif
                    src="/safe.gif"
                    alt="Pembayaran Aman"
                    text="Pembayaran Aman"
                    size={24}
                  />
                </>
              ) : (
                <>
                  <FeatureSkeleton />
                  <FeatureSkeleton />
                  <FeatureSkeleton />
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center md:hidden">
          {games ? (
            <>
              <FeatureGif
                src="/voltage.gif"
                alt="Proses Cepat"
                text="Proses Cepat"
                size={20}
                small
              />
              <FeatureGif
                src="/cs.gif"
                alt="Layanan Bantuan 24/7"
                text="Layanan Bantuan 24/7"
                size={20}
                small
              />
              <FeatureGif
                src="/safe.gif"
                alt="Pembayaran Aman"
                text="Pembayaran Aman"
                size={20}
                small
              />
            </>
          ) : (
            <>
              <FeatureSkeleton small />
              <FeatureSkeleton small />
              <FeatureSkeleton small />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function FeatureGif({
  src,
  alt,
  text,
  size,
  small,
}: {
  src: string;
  alt: string;
  text: string;
  size: number;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        unoptimized
      />
      <span className={`${small ? "text-[11px]" : "text-sm font-medium"} text-muted-foreground`}>
        {text}
      </span>
    </div>
  );
}

function FeatureSkeleton({ small = false }: { small?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Skeleton className={`rounded-full ${small ? "size-5" : "size-6"}`} />
      <Skeleton className={`${small ? "h-3 w-12" : "h-4 w-24"}`} />
    </div>
  );
}
