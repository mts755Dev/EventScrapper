import { PageHeader } from "@/components/dashboard/page-header";
import { TARGET_STATES, STATE_NAMES } from "@/lib/constants/states";

export default function SettingsPage() {
  const crawlHours = process.env.CRAWL_INTERVAL_HOURS ?? "6";
  const targetStates = (process.env.TARGET_STATES ?? "NC,FL")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Settings"
        description="Runtime configuration for crawls. Edit via environment variables for now."
      />

      <div className="space-y-4 rounded-xl border p-6">
        <div>
          <h2 className="text-sm font-medium">Target states</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {targetStates
              .map(
                (code) =>
                  STATE_NAMES[code as (typeof TARGET_STATES)[number]] ?? code
              )
              .join(", ")}{" "}
            ({targetStates.join(", ")})
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Env: <code>TARGET_STATES</code>
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium">Crawl interval</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every {crawlHours} hours (when Supabase cron is configured)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Env: <code>CRAWL_INTERVAL_HOURS</code>
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium">Manual crawl</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Trigger with{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              POST /api/cron/crawl
            </code>{" "}
            and your <code>CRON_SECRET</code>.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium">Seed sources</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Refresh curated sources via{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              POST /api/cron/seed-sources
            </code>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
