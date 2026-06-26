"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Pill,
  PackagePlus,
  PackageMinus,
  Archive,
  History,
  BarChart3,
  ScanBarcode,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/medicines", label: "Medicines", icon: Pill },
  { href: "/receive", label: "Receive", icon: PackagePlus },
  { href: "/dispense", label: "Dispense", icon: PackageMinus },
  { href: "/inventory", label: "Inventory", icon: Archive },
  { href: "/history", label: "History", icon: History },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/scan", label: "Scan", icon: ScanBarcode },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-white border-r border-border shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Pill className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">
            PharmaCare
          </p>
          <p className="text-xs text-muted-foreground">Inventory</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
