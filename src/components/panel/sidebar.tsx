"use client";
import { Menu } from "@/components/panel/menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useSettings } from "@/context/settings-context";

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);

  interface SettingsLogo {
    data: {
      ["general.logo"]?: string;
    };
  }
  
  const settingsLogo = useSettings() as unknown as SettingsLogo | null;
  const logoUrl = settingsLogo?.data?.["general.logo"];

  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden"
      )}
    >
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800"
      >
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            !getOpenState() ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <Image src={logoUrl || "/logo-2.png"} alt="Feryshop Logo" width={40} height={40} className="h-8 sm:h-9 w-auto object-contain shrink-0" />
            <span className={cn("font-extrabold text-lg tracking-tight text-foreground transition-opacity duration-300", !getOpenState() ? "opacity-0 hidden" : "opacity-100")}>Feryshop</span>
          </Link>
        </Button>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}