"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/events/calendar", label: "Calendar" },
  { href: "/organizations", label: "Orgs" },
  { href: "/leads", label: "Leads" },
  { href: "/crawl-jobs", label: "Jobs" },
  { href: "/crawl-logs", label: "Logs" },
  { href: "/sources", label: "Sources" },
  { href: "/settings", label: "Settings" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-t px-3 py-2">
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : item.href === "/events"
              ? pathname === "/events" ||
                (pathname.startsWith("/events/") &&
                  !pathname.startsWith("/events/calendar"))
              : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
