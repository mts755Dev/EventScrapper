import Link from "next/link";
import { PageHeader, DataTable } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { listCrawlJobs } from "@/services/dashboard";
import { formatDateTime } from "@/utils/format";

export default async function CrawlJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const limit = 30;
  const offset = (page - 1) * limit;
  const { rows, total } = await listCrawlJobs({ limit, offset });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <PageHeader
        title="Crawl Jobs"
        description={`${total.toLocaleString()} crawl runs`}
      />

      <DataTable
        headers={["Started", "Finished", "Status", "Sites", "Events", "Errors", ""]}
        empty={rows.length === 0}
      >
        {rows.map((job) => (
          <tr key={job.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5 text-muted-foreground">
              {formatDateTime(job.started_at)}
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {formatDateTime(job.finished_at)}
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
            <td className="px-3 py-2.5">
              {Array.isArray(job.errors) ? job.errors.length : 0}
            </td>
            <td className="px-3 py-2.5">
              <Link
                href={`/crawl-logs?job=${job.id}`}
                className="text-sm hover:underline"
              >
                Logs
              </Link>
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
              <Link href={`/crawl-jobs?page=${page - 1}`} className="hover:underline">
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link href={`/crawl-jobs?page=${page + 1}`} className="hover:underline">
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
