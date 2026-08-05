"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((seg) => seg);

  return (
    <div className="text-muted-foreground mb-6 flex items-center space-x-1 text-sm">
      <Link href="/" className="hover:text-primary flex text-xs font-medium transition-colors">
        <ArrowLeft className="text-muted-foreground mr-2 h-4 w-4" /> Beranda
      </Link>

      {segments.map((seg, index) => {
        const label = decodeURIComponent(seg.replace(/-/g, " "));

        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground text-xs capitalize">{label}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
