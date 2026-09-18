import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Game {
  id: number | string;
  title: string;
  developers?: string | null;
  image: string;
  slug: string;
}

interface GameListProps {
  isLoading: boolean;
  filteredGames?: Game[];
}

export function GameList({ isLoading, filteredGames }: GameListProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  const games = useMemo(() => {
    return Array.isArray(filteredGames) ? filteredGames : [];
  }, [filteredGames]);

  const visibleGames = useMemo(() => {
    return games.slice(0, visibleCount);
  }, [games, visibleCount]);

  const loadMoreGames = () => setVisibleCount((prev) => prev + 6);

  if (!isLoading && games.length === 0) {
    return (
      <div className="border-border bg-muted/30 rounded-xl border p-6 text-center">
        <div className="text-sm font-medium">Game belum tersedia</div>
        <div className="text-muted-foreground mt-1 text-xs">
          Coba pilih kategori lain atau refresh halaman.
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.ul
        className="mb-4 grid grid-cols-3 gap-2.5 sm:mb-8 sm:grid-cols-4 sm:gap-4 md:gap-x-6 md:gap-y-8 lg:grid-cols-5 xl:grid-cols-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
      >
        {isLoading
          ? [...Array(9)].map((_, index) => (
              <li
                key={`skeleton-${index}`}
                className="border-border/50 bg-card relative overflow-hidden rounded-xl border"
              >
                <Skeleton className="aspect-square w-full rounded-t-xl" />
                <div className="space-y-1.5 p-2 sm:p-3">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-2.5 w-1/2 rounded" />
                </div>
              </li>
            ))
          : visibleGames.map((game: any, index: number) => (
              <motion.li
                key={String(game.id)}
                className="group relative"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02, ease: [0.4, 0.0, 0.2, 1] }}
                layout
              >
                <Link prefetch href={`/order/${game.slug}`} className="block">
                  <div className="border-border/70 bg-card hover:border-primary/50 relative overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]">
                    <div className="bg-muted/40 aspect-square w-full overflow-hidden rounded-t-xl">
                      <Image
                        src={game.image}
                        alt={game.title}
                        width={192}
                        height={288}
                        className="aspect-square rounded-t-xl object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        priority={index < 6}
                      />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="group-hover:text-primary text-foreground truncate text-xs font-semibold transition-colors sm:text-sm">
                        {game.title}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 truncate text-[10px] sm:text-xs">
                        {game.developers || "Top-Up Instan"}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
      </motion.ul>

      {!isLoading && games.length > 0 && visibleCount < games.length && (
        <div className="mt-4 flex justify-center">
          <motion.button
            onClick={loadMoreGames}
            className="border-border/80 bg-muted/60 text-foreground hover:bg-muted hover:border-primary/40 inline-flex h-10 items-center justify-center rounded-xl border px-6 text-xs font-semibold shadow-sm transition-all sm:text-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
          >
            Tampilkan Lainnya ({games.length - visibleCount} lagi)
          </motion.button>
        </div>
      )}
    </>
  );
}
