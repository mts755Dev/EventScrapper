"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!collapsed ? (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card md:flex">
          {/* Sidebar header: brand + theme + collapse */}
          <div className="flex h-14 shrink-0 items-center justify-between gap-1 border-b px-3">
            <div className="flex min-w-0 items-center gap-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-foreground">
                  Chaffle Sales
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Discovery Platform
                </p>
              </div>
              <ThemeToggle />
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Collapse sidebar"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>

          <SidebarNav />

          {/* Sidebar footer: sign out */}
          <div className="mt-auto shrink-0 border-t p-4">
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
                <LogOut className="size-3.5" />
                Sign out
              </Button>
            </form>
          </div>
        </aside>
      ) : null}

      <div
        className={cn(
          "flex min-h-screen flex-col md:h-screen md:overflow-hidden",
          collapsed ? "md:ml-0" : "md:ml-64"
        )}
      >
        {/* Mobile header */}
        <header className="shrink-0 border-b bg-card md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div>
              <p className="text-sm font-bold tracking-tight text-foreground">
                Chaffle Sales
              </p>
              <p className="text-[11px] text-muted-foreground">
                Discovery Platform
              </p>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
          <MobileNav />
        </header>

        {/* Desktop header — always visible, consistent layout */}
        <div className="hidden h-14 shrink-0 items-center border-b bg-card px-4 md:flex">
          {collapsed ? (
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Expand sidebar"
              onClick={() => setCollapsed(false)}
            >
              <PanelLeftOpen className="size-4" />
            </button>
          ) : null}
        </div>

        <main className="min-w-0 flex-1 overflow-x-hidden p-5 md:overflow-y-auto md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
