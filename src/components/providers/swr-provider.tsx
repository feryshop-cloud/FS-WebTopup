"use client";

import React from "react";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        dedupingInterval: 300000, // 5 minutes cache deduping
        keepPreviousData: true, // Serve cached data instantly during navigation without showing loading skeletons
      }}
    >
      {children}
    </SWRConfig>
  );
}
