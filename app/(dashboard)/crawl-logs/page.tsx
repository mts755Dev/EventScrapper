import Link from "next/link";
import { PageHeader, DataTable } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { listCrawlLogs } from "@/services/dashboard";
import { formatDateTime } from "@/utils/format";

export default async function CrawlLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; job?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const limit = 50;
  const offset = (page - 1) * limit;
  const status =
    params.status === "error" ||
    params.status === "success" ||
    params.status === "skipped"
      ? params.status
      : undefined;

  const { rows, total } = await listCrawlLogs({
    limit,
    offset,
    status,
    jobId: params.job,
  });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const queryBase = new URLSearchParams();
  if (status) queryBase.set("status", status);
  if (params.job) queryBase.set("job", params.job);

  return (
    <div>
      <PageHeader
        title="Crawl Logs"
        description={`${total.toLocaleString()} per-site crawl results`}
        actions={
          <div className="flex gap-1">
            <Link
              href="/crawl-logs"
              className={
                !status
                  ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm"
                  : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent hover:text-foreground"
              }
            >
              All
            </Link>
            <Link
              href="/crawl-logs?status=error"
              className={
                status === "error"
                  ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm"
                  : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent hover:text-foreground"
              }
            >
              Errors
            </Link>
            <Link
              href="/crawl-logs?status=success"
              className={
                status === "success"
                  ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm"
                  : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border hover:bg-accent hover:text-foreground"
              }
            >
              Success
            </Link>
          </div>
        }
      />

      <DataTable
        headers={["Website", "Status", "Events", "Crawled", "Message"]}
        empty={rows.length === 0}
      >
        {rows.map((log) => (
          <tr key={log.id} className="hover:bg-muted/40">
            <td className="max-w-[260px] truncate px-4 py-3 font-medium" title={log.website}>
              {log.website}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <Badge
                variant={
                  log.status === "success"
                    ? "success"
                    : log.status === "error"
                      ? "destructive"
                      : "outline"
                }
              >
                {log.status}
              </Badge>
            </td>
            <td className="whitespace-nowrap px-4 py-3">{log.events_found}</td>
            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
              {formatDateTime(log.crawled_at)}
            </td>
            <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground" title={log.message ?? ""}>
              {log.message ?? "—"}
            </td>
          </tr>
        ))}
      </DataTable>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-3">
            {page > 1 ? (
              <Link
                href={`/crawl-logs?page=${page - 1}${
                  queryBase.toString() ? `&${queryBase}` : ""
                }`}
                className="hover:underline"
              >
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/crawl-logs?page=${page + 1}${
                  queryBase.toString() ? `&${queryBase}` : ""
                }`}
                className="hover:underline"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
