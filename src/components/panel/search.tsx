"use client";

import { useState, useEffect, useRef } from "react";
import { SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { apiPath } from "@/lib/routes";

interface Game {
  id: number;
  slug: string;
  title: string;
  developers: string;
  image: string;
}

export function Search() {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showSearch) inputRef.current?.focus();
  }, [showSearch]);

  useEffect(() => {
    const fetchGames = async () => {
      const q = query.trim();

      if (q.length < 2) {
        setGames([]);
        return;
      }

      try {
        const res = await fetch(apiPath(`/api/search-games?search=${encodeURIComponent(q)}`), {
          cache: "no-store",
        });

        if (!res.ok) {
          setGames([]);
          return;
        }

        const data = await res.json().catch(() => null);
        setGames(Array.isArray(data?.games) ? data.games : []);
      } catch {
        setGames([]);
      }
    };

    const delayDebounce = setTimeout(fetchGames, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <>
      <div className="relative hidden w-full flex-col space-y-2 px-16 sm:flex">
        <div className="relative w-full">
          <div className="border-input bg-background/90 focus-within:border-brand-blue supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary group relative w-full rounded-xl border backdrop-blur transition-[border-color,box-shadow] focus-within:shadow-[0_0_0_3px_hsl(var(--brand-blue)/0.16)]">
            <SearchIcon className="text-muted-foreground group-focus-within:text-brand-blue absolute left-3 top-2.5 h-5 w-5 transition-colors" />

            <Input
              type="text"
              placeholder="Cari game..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border-none bg-transparent py-2.5 pl-10 pr-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground absolute right-3 top-2.5"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {games.length > 0 && (
            <div className="bg-background border-brand-blue/25 absolute left-0 top-full z-10 mt-2 w-full overflow-hidden rounded-xl border shadow-sm">
              <div className="max-h-[60vh] overflow-y-auto">
                {games.map((game) => (
                  <Link
                    key={game.id}
                    href={`/order/${game.slug}`}
                    className="hover:bg-brand-blue/10 focus-visible:bg-brand-blue/10 flex items-center gap-4 px-4 py-3 transition-all duration-200 focus-visible:outline-none"
                    onClick={() => {
                      setQuery("");
                      setGames([]);
                    }}
                  >
                    <Image
                      src={game.image}
                      alt={game.title}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-lg object-cover shadow"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium">{game.title}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {game.developers}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowSearch(!showSearch)}
        className="border-input bg-background hover:border-brand-blue/50 hover:bg-brand-blue/10 hover:text-brand-blue focus-visible:ring-brand-blue focus-visible:ring-offset-background flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:hidden"
      >
        {showSearch ? <X className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
      </button>

      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-background absolute left-0 top-full z-20 w-full border-b p-3 shadow-sm"
        >
          <div className="border-input bg-background/95 focus-within:border-brand-blue supports-[backdrop-filter]:bg-background/60 group relative w-full rounded-xl border backdrop-blur transition-[border-color,box-shadow] focus-within:shadow-[0_0_0_3px_hsl(var(--brand-blue)/0.16)]">
            <SearchIcon className="text-muted-foreground group-focus-within:text-brand-blue absolute left-3 top-2.5 h-5 w-5 transition-colors" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Cari game..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border-none bg-transparent py-2 pl-10 pr-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-2.5">
                <X className="text-muted-foreground h-5 w-5" />
              </button>
            )}
          </div>

          {games.length > 0 && (
            <div className="border-brand-blue/25 bg-background mt-4 max-h-[60vh] overflow-y-auto rounded-xl border shadow-sm">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/order/${game.slug}`}
                  className="hover:bg-brand-blue/10 focus-visible:bg-brand-blue/10 flex items-center gap-4 px-4 py-3 transition focus-visible:outline-none"
                  onClick={() => {
                    setShowSearch(false);
                    setQuery("");
                    setGames([]);
                  }}
                >
                  <Image
                    src={game.image}
                    alt={game.title}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-lg object-cover shadow"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">{game.title}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {game.developers}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
