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
      <div className="hidden sm:flex flex-col space-y-2 relative w-full px-16">
        <div className="relative w-full">
          <div className="group relative w-full rounded-xl border border-input bg-background/90 backdrop-blur transition-[border-color,box-shadow] focus-within:border-brand-blue focus-within:shadow-[0_0_0_3px_hsl(var(--brand-blue)/0.16)] supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
            <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-brand-blue" />

            <Input
              type="text"
              placeholder="Cari game..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 py-2.5 text-sm w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-2.5 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {games.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-background border border-brand-blue/25 rounded-xl shadow-sm z-10 overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                {games.map((game) => (
                  <Link
                    key={game.id}
                    href={`/order/${game.slug}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-brand-blue/10 focus-visible:bg-brand-blue/10 focus-visible:outline-none transition-all duration-200"
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
                      className="w-14 h-14 rounded-lg object-cover shadow"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-sm truncate">{game.title}</span>
                      <span className="text-muted-foreground text-xs truncate">{game.developers}</span>
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
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-input bg-background hover:border-brand-blue/50 hover:bg-brand-blue/10 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-200"
      >
        {showSearch ? <X className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
      </button>

      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full p-3 bg-background border-b shadow-sm z-20"
        >
          <div className="group relative w-full rounded-xl border border-input bg-background/95 backdrop-blur transition-[border-color,box-shadow] focus-within:border-brand-blue focus-within:shadow-[0_0_0_3px_hsl(var(--brand-blue)/0.16)] supports-[backdrop-filter]:bg-background/60">
            <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-brand-blue" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Cari game..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 w-full py-2 text-sm bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-2.5">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {games.length > 0 && (
            <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-brand-blue/25 bg-background shadow-sm">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/order/${game.slug}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-brand-blue/10 focus-visible:bg-brand-blue/10 focus-visible:outline-none transition"
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
                    className="w-14 h-14 rounded-lg object-cover shadow"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-sm truncate">{game.title}</span>
                    <span className="text-muted-foreground text-xs truncate">{game.developers}</span>
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
