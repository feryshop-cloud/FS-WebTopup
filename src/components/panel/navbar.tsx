"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calculator, ChevronDown, Percent, Sparkles, Star } from "lucide-react";

import { useSettings } from "@/context/settings-context";
import { UserNav } from "@/components/panel/user-nav";
import { SheetMenu } from "@/components/panel/sheet-menu";
import { Search } from "@/components/panel/search";
import { ModeToggle } from "@/components/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMenuList } from "@/lib/menu-list";
import { cn } from "@/lib/utils";

export function Navbar() {
  interface Settings {
    data: Record<string, any>;
  }

  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const settings = useSettings() as unknown as Settings | null;
  const logoUrl = settings?.data?.["general.logo"] as string | undefined;
  const logoTitle = settings?.data?.["general.title"] as string | undefined;

  const enableWinrate = Boolean(settings?.data?.["enable_kalkulator_winrate"]);
  const enableMagicWheel = Boolean(settings?.data?.["enable_kalkulator_magic_wheel"]);
  const enableZodiac = Boolean(settings?.data?.["enable_kalkulator_zodiac"]);

  const kalkulatorItems = [
    { href: "/kalkulator/winrate", label: "Cek Winrate", icon: Percent, enabled: enableWinrate },
    { href: "/kalkulator/magic-wheel", label: "Cek Magic Wheel", icon: Sparkles, enabled: enableMagicWheel },
    { href: "/kalkulator/zodiac", label: "Cek Zodiac", icon: Star, enabled: enableZodiac },
  ].filter((x) => x.enabled);

  const pathname = usePathname();
  const kalkulatorActive = pathname === "/kalkulator" || pathname.startsWith("/kalkulator/");
  const menuList = getMenuList(pathname, isLoggedIn);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 sm:mx-8 flex h-12 sm:h-16 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F0F0F] p-1.5 shadow-sm ring-1 ring-border/70">
              <Image
                src={logoUrl || "/logo-2.png"}
                alt="Feryshop Logo"
                width={40}
                height={40}
                priority
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-extrabold text-lg tracking-tight text-foreground">Feryshop</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Search />
          <div className="hidden lg:block">
            {!isLoggedIn && (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="shadow-none">
                  <Link href="/signin">Masuk</Link>
                </Button>
                <Button asChild size="sm" className="shadow-none bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/signup">Daftar</Link>
                </Button>
                <ModeToggle />
              </div>
            )}
          </div>
          {session && <UserNav />}
          {isLoggedIn && (
            <div className="hidden lg:block">
              <ModeToggle />
            </div>
          )}
        </div>
      </div>

      <nav className="mx-4 sm:mx-8 border-t border-border pt-2 pb-3 overflow-x-auto hidden md:flex items-center">
        <ul className="flex items-center gap-3">
          {menuList.flatMap(({ menus }) =>
            menus.flatMap(({ href, label, icon: Icon, active }) => {
              const nodes: React.ReactNode[] = [];

              nodes.push(
                <li key={href}>
                  <Link href={href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2 hover:bg-white/5 transition-colors",
                        pathname === href || pathname.startsWith(`${href}/`) ? "text-primary font-bold bg-transparent hover:bg-transparent" : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <Icon size={16} />
                      <span className="text-sm">{label}</span>
                    </Button>
                  </Link>
                </li>
              );

              if (href === "/price-list" && kalkulatorItems.length > 0) {
                nodes.push(
                  <li key="kalkulator-dropdown-desktop">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "gap-2 hover:bg-white/5 transition-colors",
                            kalkulatorActive ? "text-primary font-bold bg-transparent hover:bg-transparent" : "text-muted-foreground hover:text-primary"
                          )}
                        >
                          <Calculator size={16} />
                          <span className="text-sm">Kalkulator</span>
                          <ChevronDown size={14} className="opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[220px]">
                        {kalkulatorItems.map((item) => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="w-full px-2 py-1.5 text-sm flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              }

              return nodes;
            })
          )}
        </ul>
      </nav>

      <div className="relative h-[2.5px] w-full overflow-hidden bg-gradient-to-r from-brand-blue via-info to-cyan-400 bg-[length:200%_100%] animate-gradient-x shadow-[0_2px_10px_hsl(var(--brand-blue)/0.45)]">
        <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-90 animate-shimmer-slide" />
      </div>
    </header>
  );
}
