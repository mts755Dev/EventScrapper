import Link from "next/link";
import { PageHeader, DataTable } from "@/components/dashboard/page-header";
import {
  EventFilters,
  buildEventsQuery,
  type EventFilterValues,
} from "@/components/events/event-filters";
import { SalesTagBadges } from "@/components/sales/sales-tag-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listEvents } from "@/services/dashboard";
import { formatDate } from "@/utils/format";
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  type EventType,
} from "@/lib/constants/event-types";

function eventTypeLabel(value: string | null): string {
  if (!value) return "—";
  return EVENT_TYPE_LABELS[value as EventType] ?? value;
}

function toIsoDateStart(value?: string): string | undefined {
  if (!value) return undefined;
  return `${value}T00:00:00.000Z`;
}

function toIsoDateEnd(value?: string): string | undefined {
  if (!value) return undefined;
  return `${value}T23:59:59.999Z`;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    state?: string;
    q?: string;
    type?: string;
    from?: string;
    to?: string;
    contacted?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const filters: EventFilterValues = {
    q: params.q?.trim() || undefined,
    state:
      params.state?.toUpperCase() === "NC" || params.state?.toUpperCase() === "FL"
        ? params.state.toUpperCase()
        : undefined,
    type:
      params.type && (EVENT_TYPES as readonly string[]).includes(params.type)
        ? params.type
        : undefined,
    from: params.from || undefined,
    to: params.to || undefined,
    contacted:
      params.contacted === "1" || params.contacted === "0"
        ? params.contacted
        : undefined,
  };

  const { rows, total } = await listEvents({
    limit,
    offset,
    state: filters.state,
    q: filters.q,
    eventType: filters.type,
    dateFrom: toIsoDateStart(filters.from),
    dateTo: toIsoDateEnd(filters.to),
    // Crawl only stores upcoming events; hide any legacy past rows.
    upcomingOnly: true,
    contacted:
      filters.contacted === "1"
        ? true
        : filters.contacted === "0"
          ? false
          : undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const filterQuery = buildEventsQuery(filters);

  return (
    <div>
      <PageHeader
        title="Events"
        description={`${total.toLocaleString()} matching events`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/calendar${filterQuery}`}>Calendar view</Link>
          </Button>
        }
      />

      <EventFilters values={filters} />

      <DataTable
        headers={["Title", "Date", "State", "Type", "Sales tags", "Venue"]}
        empty={rows.length === 0}
      >
        {rows.map((event) => (
          <tr key={event.id} className="hover:bg-muted/40">
            <td className="w-full max-w-[280px] px-3 py-2.5">
              <Link
                href={`/events/${event.id}`}
                className="line-clamp-2 font-medium hover:underline"
              >
                {event.title}
              </Link>
            </td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5 text-muted-foreground">
              {formatDate(event.start_date)}
            </td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5">{event.state ?? "—"}</td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5">
              <Badge variant="outline">{eventTypeLabel(event.event_type)}</Badge>
            </td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5">
              <SalesTagBadges
                contacted={event.contacted}
                disposition={event.disposition}
              />
            </td>
            <td className="w-[1%] max-w-[160px] truncate px-3 py-2.5 text-muted-foreground" title={event.venue ?? ""}>
              {event.venue ?? "—"}
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
                href={`/events${buildEventsQuery(filters, { page: String(page - 1) })}`}
                className="hover:underline"
              >
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/events${buildEventsQuery(filters, { page: String(page + 1) })}`}
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
