"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ellipsis,
  LogOut,
  LogIn,
  UserPlus,
  Calculator,
  ChevronDown,
  Percent,
  Sparkles,
  Star,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/panel/collapse-menu-button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSettings } from "@/context/settings-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  interface Settings {
    data: Record<string, any>;
  }

  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const pathname = usePathname();
  const menuList = getMenuList(pathname, isLoggedIn);

  const settings = useSettings() as unknown as Settings | null;
  const enableWinrate = Boolean(settings?.data?.["enable_kalkulator_winrate"]);
  const enableMagicWheel = Boolean(settings?.data?.["enable_kalkulator_magic_wheel"]);
  const enableZodiac = Boolean(settings?.data?.["enable_kalkulator_zodiac"]);

  const kalkulatorItems = [
    { href: "/kalkulator/winrate", label: "Cek Winrate", icon: Percent, enabled: enableWinrate },
    { href: "/kalkulator/magic-wheel", label: "Cek Magic Wheel", icon: Sparkles, enabled: enableMagicWheel },
    { href: "/kalkulator/zodiac", label: "Cek Zodiac", icon: Star, enabled: enableZodiac },
  ].filter((x) => x.enabled);

  const kalkulatorActive = pathname === "/kalkulator" || pathname.startsWith("/kalkulator/");

  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {menuList.map(({ groupLabel, menus }, groupIndex) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={groupIndex}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}

              {menus.flatMap(({ href, label, icon: Icon, active, submenus }, index) => {
                const nodes: React.ReactNode[] = [];

                if (!submenus || submenus.length === 0) {
                  nodes.push(
                    <div className="w-full" key={href}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start h-10 mb-1 hover:bg-white/5 transition-colors",
                                ((active === undefined && (pathname === href || pathname.startsWith(`${href}/`))) || active)
                                  ? "text-primary font-bold bg-transparent hover:bg-transparent"
                                  : "text-muted-foreground hover:text-primary"
                              )}
                              asChild
                            >
                              <Link href={href}>
                                <span className={cn(isOpen === false ? "" : "mr-4")}>
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "max-w-[200px] truncate",
                                    isOpen === false ? "-translate-x-96 opacity-0" : "translate-x-0 opacity-100"
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && <TooltipContent side="right">{label}</TooltipContent>}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );

                  if (href === "/price-list" && kalkulatorItems.length > 0) {
                    nodes.push(
                      <div className="w-full" key="kalkulator-dropdown-mobile">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start h-10 mb-1 gap-2 hover:bg-white/5 transition-colors",
                                kalkulatorActive ? "text-primary font-bold bg-transparent hover:bg-transparent" : "text-muted-foreground hover:text-primary"
                              )}
                            >
                              <span className={cn(isOpen === false ? "" : "mr-2")}>
                                <Calculator size={18} />
                              </span>
                              <p
                                className={cn(
                                  "max-w-[200px] truncate",
                                  isOpen === false ? "-translate-x-96 opacity-0" : "translate-x-0 opacity-100"
                                )}
                              >
                                Kalkulator
                              </p>
                              <span className={cn("ml-auto", isOpen === false ? "hidden" : "block")}>
                                <ChevronDown size={16} className="opacity-70" />
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
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
                      </div>
                    );
                  }
                } else {
                  nodes.push(
                    <div className="w-full" key={href}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active ?? false}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  );
                }

                return nodes;
              })}
            </li>
          ))}

          {!isLoggedIn && (
            <li className={cn("w-full pt-4", isOpen === false ? "flex flex-col gap-2" : "grid grid-cols-2 gap-2.5")}>
              <TooltipProvider disableHoverableContent>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="w-full justify-center h-10 px-2" asChild>
                      <Link href="/signin" className="flex items-center justify-center gap-1.5 w-full">
                        <LogIn size={18} className="shrink-0" />
                        <span className={cn("font-medium text-sm truncate", isOpen === false ? "hidden" : "inline")}>
                          Masuk
                        </span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {isOpen === false && <TooltipContent side="right">Masuk</TooltipContent>}
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider disableHoverableContent>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button className="w-full justify-center h-10 px-2" asChild>
                      <Link href="/signup" className="flex items-center justify-center gap-1.5 w-full">
                        <UserPlus size={18} className="shrink-0" />
                        <span className={cn("font-medium text-sm truncate", isOpen === false ? "hidden" : "inline")}>
                          Daftar
                        </span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {isOpen === false && <TooltipContent side="right">Daftar</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            </li>
          )}

          {isLoggedIn && (
            <li className="w-full grow flex flex-col justify-end">
              <TooltipProvider disableHoverableContent>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setOpen(true)}
                      variant="destructive"
                      className="w-full justify-center h-10 mt-5"
                    >
                      <span className={cn(isOpen === false ? "" : "mr-4")}>
                        <LogOut size={18} />
                      </span>
                      <p className={cn("whitespace-nowrap", isOpen === false ? "opacity-0 hidden" : "opacity-100")}>
                        Keluar
                      </p>
                    </Button>
                  </TooltipTrigger>
                  {isOpen === false && <TooltipContent side="right">Keluar</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            </li>
          )}
        </ul>
      </nav>

      {isLoggedIn &&
        (isDesktop ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Keluar</DialogTitle>
                <DialogDescription>Apakah Anda yakin ingin keluar?</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4">
                <Button variant="destructive" onClick={() => signOut()}>
                  Keluar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Keluar</DrawerTitle>
                <DrawerDescription>Apakah Anda yakin ingin keluar?</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter className="pt-2">
                <Button variant="destructive" onClick={() => signOut()}>
                  Keluar
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Tutup</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}
    </ScrollArea>
  );
}