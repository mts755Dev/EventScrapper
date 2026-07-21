"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/events/calendar", label: "Calendar" },
  { href: "/organizations", label: "Orgs" },
  { href: "/crawl-jobs", label: "Jobs" },
  { href: "/crawl-logs", label: "Logs" },
  { href: "/sources", label: "Sources" },
  { href: "/settings", label: "Settings" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 px-2 pb-2">
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
              "shrink-0 rounded-md px-2.5 py-1.5 text-xs",
              active
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
