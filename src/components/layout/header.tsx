"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/medicines": "Medicine Master",
  "/receive": "Receive Medicine",
  "/dispense": "Dispense Medicine",
  "/inventory": "Drug Inventory",
  "/history": "History",
  "/reports": "Reports",
  "/scan": "Barcode Scan",
};

export function Header() {
  const pathname = usePathname();
  const title =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ??
    "PharmaCare";

  return (
    <header className="h-14 flex items-center px-6 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
    </header>
  );
}
