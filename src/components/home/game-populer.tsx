import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
      <motion.div
        className="text-foreground mb-3 sm:mb-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className="mb-1 flex items-center gap-1.5">
          <Image
            src="/promo.gif"
            alt="Promo"
            width={24}
            height={24}
            unoptimized
            className="h-6 w-6 brightness-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] filter transition-all sm:h-7 sm:w-7"
          />
          <h3 className="text-foreground text-base font-bold uppercase tracking-wider sm:text-lg">
            TRENDING
          </h3>
        </div>
        <p className="text-muted-foreground text-xs">
          Produk paling populer dengan transaksi tercepat saat ini.
        </p>
      </motion.div>

      <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <li key={index} className="relative rounded-xl sm:rounded-2xl">
                <div className="border-border/40 bg-muted/50 h-16 w-full animate-pulse rounded-xl border sm:h-20 sm:rounded-2xl" />
              </li>
            ))
          : popularGames?.map((gamePopuler: Game, index: number) => (
              <motion.li
                key={gamePopuler.id}
                className="border-border/70 bg-card text-card-foreground hover:border-primary/50 group relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] sm:rounded-2xl dark:border-white/10 dark:bg-zinc-900/80"
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
              >
                {/* Ambient Subtle Glow */}
                <div className="bg-primary/10 group-hover:bg-primary/20 pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full blur-xl transition-all duration-300" />

                <Link
                  prefetch={true}
                  href={`/order/${gamePopuler.slug}`}
                  className="focus-visible:ring-primary focus-visible:ring-offset-background relative z-10 flex items-center gap-2 p-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-3 sm:p-3"
                >
                  {/* Game Thumbnail */}
                  <div className="relative shrink-0 overflow-hidden rounded-lg sm:rounded-xl">
                    <Image
                      alt={gamePopuler.title || "Game"}
                      priority={index < 4}
                      width={64}
                      height={64}
                      className="aspect-square h-11 w-11 object-cover shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 sm:h-14 sm:w-14 md:h-16 md:w-16"
                      src={
                        typeof gamePopuler.image === "string" && gamePopuler.image.trim()
                          ? gamePopuler.image.trim()
                          : "/default-og-image.jpg"
                      }
                    />
                  </div>

                  {/* Game Details */}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h2 className="group-hover:text-primary text-foreground truncate text-xs font-bold transition-colors duration-200 sm:text-sm">
                      {gamePopuler.title}
                    </h2>
                    <div className="mt-0.5 flex items-center gap-1">
                      <p className="text-muted-foreground truncate text-[10px] sm:text-xs">
                        {gamePopuler.developers || "Game Sultan"}
                      </p>
                      <TrendingUp
                        size={12}
                        className="text-primary shrink-0 opacity-60 transition-transform duration-200 group-hover:scale-110 sm:opacity-0 sm:group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
      </ul>
    </div>
  );
}
