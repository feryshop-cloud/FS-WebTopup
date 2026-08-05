"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="border-input bg-card hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-offset-background group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border shadow-sm transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
      aria-label="Ganti mode tampilan"
      aria-pressed={mounted ? resolvedTheme === "dark" : false}
      disabled={!mounted}
    >
      <span
        aria-hidden="true"
        className="bg-primary/10 absolute inset-1 rounded-md opacity-0 blur-sm transition-all duration-300 ease-out motion-reduce:transition-none dark:scale-100 dark:opacity-100"
      />
      <Sun
        aria-hidden="true"
        className="text-primary absolute h-5 w-5 translate-y-0 rotate-0 scale-100 opacity-100 blur-0 transition-[transform,opacity,filter] duration-300 ease-out motion-reduce:transition-none dark:-translate-y-2 dark:rotate-90 dark:scale-75 dark:opacity-0 dark:blur-sm"
      />
      <Moon
        aria-hidden="true"
        className="text-foreground absolute h-5 w-5 translate-y-2 -rotate-90 scale-75 opacity-0 blur-sm transition-[transform,opacity,filter] duration-300 ease-out motion-reduce:transition-none dark:translate-y-0 dark:rotate-0 dark:scale-100 dark:opacity-100 dark:blur-0"
      />
      <span className="sr-only">Ganti mode tampilan</span>
    </button>
  );
}
