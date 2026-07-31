import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

interface Game {
  id: string;
  title: string;
  developers: string;
  image: string;
  slug: string;
}

interface PopularGamesProps {
  isLoading: boolean;
  popularGames?: Game[];
}

export function PopularGames({ isLoading, popularGames }: PopularGamesProps) {
  return (
        <div>
          <motion.div className="mb-5 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}>
            <div className="flex items-center gap-1 mb-2">
              <Image 
                src="/promo.gif"
                alt="Promo"
                width={28} 
                height={28} 
                unoptimized
                className="w-7 h-7 filter sepia-[0.3] saturate-[250%] hue-rotate-[-10deg] brightness-110 drop-shadow-[0_0_10px_rgba(249,115,22,0.9)] transition-all duration-300" />
              <h3 className="text-lg font-semibold uppercase leading-relaxed tracking-wider">
                TRENDING
              </h3>
            </div>
            <p className="pl-6 text-xs">
              Berikut adalah beberapa produk yang paling populer saat ini.
            </p>
          </motion.div>
    
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {isLoading
              ?
                Array.from({ length: 6 }).map((_, index) => (
                  <li key={index} className="relative rounded-2xl">
                    <div className="w-full h-20 rounded-2xl animate-pulse bg-zinc-800/80 border border-white/5" />
                  </li>
                ))
              :
                popularGames?.map((gamePopuler: Game, index: number) => (
                  <motion.li
                    key={gamePopuler.id}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-my-color/60 hover:bg-accent hover:shadow-md dark:border-white/10 dark:bg-gradient-to-br dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950/90 dark:hover:from-zinc-800/90 dark:hover:to-zinc-900/90 dark:hover:shadow-[0_8px_25px_rgba(249,115,22,0.25)]"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                  >
                    {/* Ambient Neon Glow Spot on Hover */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-my-color/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-my-color/20 dark:bg-my-color/15 dark:group-hover:bg-my-color/30" />

                    <Link prefetch={true}
                      href={`/order/${gamePopuler.slug}`}
                      className="relative z-10 flex items-center gap-3 p-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-my-color focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {/* Gambar Game dengan Zoom & Shine Effect */}
                      <div className="relative overflow-hidden rounded-xl shrink-0">
                        <Image
                          alt={gamePopuler.title || "Game"}
                          priority={index < 4}
                          width={64}
                          height={64}
                          className="aspect-square h-14 w-14 object-cover shadow-md transition-transform duration-500 ease-out group-hover:scale-110 md:h-16 md:w-16"
                          src={typeof gamePopuler.image === "string" && gamePopuler.image.trim() ? gamePopuler.image.trim() : "/default-og-image.jpg"}
                          crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </div>

                      {/* Informasi Game dengan Hover Badge/Arrow */}
                      <div className="flex-1 overflow-hidden">
                        <h2 className="truncate text-xs font-bold transition-colors duration-300 group-hover:text-my-color sm:max-w-[125px] md:max-w-[150px] md:text-base lg:max-w-[175px]">
                          {gamePopuler.title}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="truncate text-xs text-muted-foreground md:text-sm">
                            {gamePopuler.developers || "Game Sultan"}
                          </p>
                          <TrendingUp size={13} className="text-my-color opacity-0 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 shrink-0" />
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
          </ul>
        </div>
  );
}
