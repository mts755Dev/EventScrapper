import { logout } from "@/app/(auth)/actions";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: fixed left sidebar — does not scroll with page */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r bg-card md:flex">
        <div className="shrink-0 border-b px-4 py-5">
          <p className="text-sm font-semibold leading-tight">Event Scrapper</p>
          <p className="text-xs text-muted-foreground">Internal sales tool</p>
        </div>
        <SidebarNav />
        <div className="mt-auto shrink-0 space-y-2 border-t p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Right column: header fixed in pane, main scrolls */}
      <div className="flex min-h-screen flex-col md:ml-56 md:h-screen md:overflow-hidden">
        <header className="shrink-0 border-b bg-background md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm font-semibold">Event Scrapper</p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
          <MobileNav />
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:overflow-y-auto md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
