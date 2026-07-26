"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "./settings-context";

const LogoContext = createContext<string | null>(null);

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let logo = settings?.data?.general?.logo || "/logo.png";
    
    if (!logo.startsWith("http") && !logo.startsWith("/")) {
      logo = `/api/proxy-image?path=${encodeURIComponent(logo)}`;
    }
    
    setLogoUrl(logo);
  }, [settings]);

  if (logoUrl === null) return null;

  return <LogoContext.Provider value={logoUrl}>{children}</LogoContext.Provider>;
}

export function useLogo() {
  return useContext(LogoContext);
}