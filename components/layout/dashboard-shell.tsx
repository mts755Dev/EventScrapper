import { logout } from "@/app/(auth)/actions";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="border-b px-4 py-5">
          <p className="text-sm font-semibold leading-tight">Event Scrapper</p>
          <p className="text-xs text-muted-foreground">Internal sales tool</p>
        </div>
        <SidebarNav />
        <div className="space-y-2 border-t p-3">
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
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm font-semibold md:hidden">Event Scrapper</p>
            <div className="hidden min-w-0 flex-1 md:block">
              <DashboardSearch />
            </div>
            <div className="flex items-center gap-2">
              <div className="md:hidden">
                <ThemeToggle />
              </div>
              <form action={logout} className="md:hidden">
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
          <div className="border-t px-4 py-2 md:hidden">
            <DashboardSearch />
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
