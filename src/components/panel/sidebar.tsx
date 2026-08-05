"use client";
import { Menu } from "@/components/panel/menu";
import { Button } from "@/components/ui/button";
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
  const { getOpenState, setIsHover, settings } = sidebar;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-screen -translate-x-full transition-[width] duration-300 ease-in-out lg:translate-x-0",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden",
      )}
    >
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative flex h-full flex-col overflow-y-auto px-3 py-4 shadow-md dark:shadow-zinc-800"
      >
        <Button
          className={cn(
            "mb-1 transition-transform duration-300 ease-in-out",
            !getOpenState() ? "translate-x-1" : "translate-x-0",
          )}
          variant="link"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="ring-border/70 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F0F0F] p-1.5 shadow-sm ring-1">
              <Image
                src={logoUrl || "/logo-2.png"}
                alt="Feryshop Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </span>
            <span
              className={cn(
                "text-foreground text-lg font-extrabold tracking-tight transition-opacity duration-300",
                !getOpenState() ? "hidden opacity-0" : "opacity-100",
              )}
            >
              Feryshop
            </span>
          </Link>
        </Button>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
