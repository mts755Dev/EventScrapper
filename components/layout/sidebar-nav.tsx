"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Building2,
  Star,
  Zap,
  FileText,
  Globe,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/events/calendar", label: "Calendar", icon: Calendar },
  { href: "/organizations", label: "Organizations", icon: Building2 },
  { href: "/leads", label: "Leads", icon: Star },
  { href: "/crawl-jobs", label: "Crawl Jobs", icon: Zap },
  { href: "/crawl-logs", label: "Crawl Logs", icon: FileText },
  { href: "/sources", label: "Sources", icon: Globe },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/"
            ? pathname === "/"
            : item.href === "/events"
              ? pathname === "/events" || pathname.startsWith("/events/") && !pathname.startsWith("/events/calendar")
              : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 font-semibold text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
