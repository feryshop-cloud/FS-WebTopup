"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

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
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggle}
            className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-input bg-card shadow-sm transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:border-primary/40 hover:bg-accent hover:text-accent-foreground hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            aria-label="Ganti mode tampilan"
            aria-pressed={mounted ? resolvedTheme === "dark" : false}
            disabled={!mounted}
          >
            <span
              aria-hidden="true"
              className="absolute inset-1 rounded-md bg-primary/10 opacity-0 blur-sm transition-all duration-300 ease-out dark:scale-100 dark:opacity-100 motion-reduce:transition-none"
            />
            <Sun
              aria-hidden="true"
              className="absolute h-5 w-5 translate-y-0 rotate-0 scale-100 text-primary opacity-100 blur-0 transition-[transform,opacity,filter] duration-300 ease-out dark:-translate-y-2 dark:rotate-90 dark:scale-75 dark:opacity-0 dark:blur-sm motion-reduce:transition-none"
            />
            <Moon
              aria-hidden="true"
              className="absolute h-5 w-5 translate-y-2 -rotate-90 scale-75 text-foreground opacity-0 blur-sm transition-[transform,opacity,filter] duration-300 ease-out dark:translate-y-0 dark:rotate-0 dark:scale-100 dark:opacity-100 dark:blur-0 motion-reduce:transition-none"
            />
            <span className="sr-only">Ganti mode tampilan</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Ganti mode tampilan</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
