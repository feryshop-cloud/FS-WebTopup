"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "./settings-context";
import { apiPath } from "@/lib/routes";

const LogoContext = createContext<string | null>(null);

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();
  const settingsLogo = settings?.data?.general?.logo || "/logo.png";
  const logo =
    !settingsLogo.startsWith("http") && !settingsLogo.startsWith("/")
      ? apiPath(`/api/proxy-image?path=${encodeURIComponent(settingsLogo)}`)
      : settingsLogo;

  const [logoUrl, setLogoUrl] = useState<string | null>(logo);

  useEffect(() => {
    setLogoUrl((prev) => (prev !== logo ? logo : prev));
  }, [logo]);

  if (logoUrl === null) return null;

  return <LogoContext.Provider value={logoUrl}>{children}</LogoContext.Provider>;
}

export function useLogo() {
  return useContext(LogoContext);
}
