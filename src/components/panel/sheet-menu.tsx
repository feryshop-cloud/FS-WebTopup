import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/panel/menu";
import { Sheet, SheetHeader, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
import { useSettings } from "@/context/settings-context";

export function SheetMenu() {
  interface Settings {
    data: {
      ["general.logo"]?: string;
    };
  }
  const settings = useSettings() as unknown as Settings | null;
  const logoUrl = settings?.data?.["general.logo"] ?? "/default-logo.png";

  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-3 sm:w-72" side="left">
        <SheetHeader>
          <Button className="flex items-center justify-center pb-2 pt-1" variant="link" asChild>
            <Link href="/" className="flex items-center gap-2">
              <SheetTitle className="flex items-center gap-2">
                <span className="ring-border/70 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F0F0F] p-1.5 shadow-sm ring-1 sm:hidden">
                  <Image
                    src={logoUrl || "/logo-2.png"}
                    alt="Feryshop Logo"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="text-foreground text-lg font-extrabold tracking-tight sm:hidden">
                  Feryshop
                </span>
              </SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
