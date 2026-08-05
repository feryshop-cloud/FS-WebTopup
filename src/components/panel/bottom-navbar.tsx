"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getMenuList } from "@/lib/menu-list";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function BottomNavbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const pathname = usePathname();
  const menuList = getMenuList(pathname, isLoggedIn);

  return (
    <nav className="bg-background border-muted fixed inset-x-0 bottom-0 z-50 border-t shadow-md">
      <div className="h-13 flex items-center justify-around sm:h-16">
        {menuList
          .flatMap((group) => group.menus)
          .map(({ href, icon: Icon, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <motion.div key={href} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link href={href} className="flex flex-col items-center text-xs">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors sm:h-5 sm:w-5",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "mt-0.5 max-w-[60px] truncate text-center text-[9px] transition-colors sm:mt-1 sm:text-[10px]",
                      isActive ? "text-primary font-bold" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
      </div>
    </nav>
  );
}
