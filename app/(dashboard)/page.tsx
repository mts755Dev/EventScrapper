import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardStats,
  getRecentCrawlJobs,
  getRecentEvents,
  getRecentFailedLogs,
  getUpcomingEvents,
} from "@/services/dashboard";
import { formatDate, formatDateTime, formatRelative } from "@/utils/format";
import { EVENT_TYPE_LABELS, type EventType } from "@/lib/constants/event-types";

function eventTypeLabel(value: string | null): string {
  if (!value) return "—";
  return EVENT_TYPE_LABELS[value as EventType] ?? value;
}

export default async function DashboardPage() {
  const [stats, upcoming, recent, failedLogs, jobs] = await Promise.all([
    getDashboardStats(),
    getUpcomingEvents(8),
    getRecentEvents(8),
    getRecentFailedLogs(6),
    getRecentCrawlJobs(5),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of discovered raffle opportunities across NC and FL."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Organizations" value={stats.totalOrganizations} />
        <StatCard label="Total Events" value={stats.totalEvents} />
        <StatCard
          label="New Events Today"
          value={stats.newEventsToday}
          hint="Created since midnight"
        />
        <StatCard label="Upcoming Events" value={stats.upcomingEvents} />
        <StatCard
          label="Failed Crawls"
          value={stats.failedCrawls}
          hint="Crawl jobs with status failed"
        />
        <StatCard label="Active Sources" value={stats.activeSources} />
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Upcoming events</h2>
            <Link href="/events" className="text-sm text-muted-foreground hover:underline">
              View all
            </Link>
          </div>
          <DataTable
            headers={["Title", "Date", "State", "Type"]}
            empty={upcoming.length === 0}
          >
            {upcoming.map((event) => (
              <tr key={event.id} className="hover:bg-muted/30">
                <td className="px-3 py-2.5">
                  <Link href={`/events/${event.id}`} className="font-medium hover:underline">
                    {event.title}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatDate(event.start_date)}
                </td>
                <td className="px-3 py-2.5">{event.state ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <Badge variant="outline">{eventTypeLabel(event.event_type)}</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recently discovered</h2>
            <Link href="/events" className="text-sm text-muted-foreground hover:underline">
              View all
            </Link>
          </div>
          <DataTable
            headers={["Title", "Found", "State"]}
            empty={recent.length === 0}
          >
            {recent.map((event) => (
              <tr key={event.id} className="hover:bg-muted/30">
                <td className="px-3 py-2.5">
                  <Link href={`/events/${event.id}`} className="font-medium hover:underline">
                    {event.title}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatRelative(event.created_at)}
                </td>
                <td className="px-3 py-2.5">{event.state ?? "—"}</td>
              </tr>
            ))}
          </DataTable>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent crawl jobs</h2>
            <Link
              href="/crawl-jobs"
              className="text-sm text-muted-foreground hover:underline"
            >
              View all
            </Link>
          </div>
          <DataTable
            headers={["Started", "Status", "Sites", "Events"]}
            empty={jobs.length === 0}
          >
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-muted/30">
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatDateTime(job.started_at)}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    variant={
                      job.status === "completed"
                        ? "success"
                        : job.status === "failed"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {job.status}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">{job.total_sites}</td>
                <td className="px-3 py-2.5">{job.total_events}</td>
              </tr>
            ))}
          </DataTable>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Failed site crawls</h2>
            <Link
              href="/crawl-logs?status=error"
              className="text-sm text-muted-foreground hover:underline"
            >
              View all
            </Link>
          </div>
          <DataTable
            headers={["Website", "When", "Message"]}
            empty={failedLogs.length === 0}
          >
            {failedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30">
                <td className="max-w-[220px] truncate px-3 py-2.5 font-medium">
                  {log.website}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatRelative(log.crawled_at)}
                </td>
                <td className="max-w-[240px] truncate px-3 py-2.5 text-muted-foreground">
                  {log.message ?? "—"}
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      </div>
    </div>
  );
}
