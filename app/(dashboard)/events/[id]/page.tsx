import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { SalesTagBadges } from "@/components/sales/sales-tag-badges";
import { SalesTagControls } from "@/components/sales/sales-tag-controls";
import { getEventById, getOrganizationById } from "@/services/dashboard";
import { formatDate, formatDateTime } from "@/utils/format";
import { EVENT_TYPE_LABELS, type EventType } from "@/lib/constants/event-types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const org = event.organization_id
    ? await getOrganizationById(event.organization_id)
    : null;

  const typeLabel = event.event_type
    ? (EVENT_TYPE_LABELS[event.event_type as EventType] ?? event.event_type)
    : "—";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={event.title}
        description="Event opportunity detail"
        actions={
          <Link
            href="/events"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to events
          </Link>
        }
      />

      <div className="space-y-6 rounded-lg border p-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{typeLabel}</Badge>
          {event.state ? <Badge>{event.state}</Badge> : null}
          <SalesTagBadges
            contacted={event.contacted}
            disposition={event.disposition}
          />
        </div>

        <div className="rounded-md border bg-muted/20 p-4">
          <h2 className="mb-3 text-sm font-medium">Sales tags</h2>
          <SalesTagControls
            entity="event"
            id={event.id}
            contacted={event.contacted}
            disposition={event.disposition}
          />
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Start
            </dt>
            <dd className="mt-1">{formatDateTime(event.start_date)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              End
            </dt>
            <dd className="mt-1">{formatDateTime(event.end_date)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Venue
            </dt>
            <dd className="mt-1">{event.venue ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Location
            </dt>
            <dd className="mt-1">
              {[event.city, event.state].filter(Boolean).join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Organization
            </dt>
            <dd className="mt-1">
              {org ? (
                <Link
                  href={`/organizations/${org.id}`}
                  className="hover:underline"
                >
                  {org.name}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Discovered
            </dt>
            <dd className="mt-1">{formatDate(event.created_at)}</dd>
          </div>
        </dl>

        {event.description ? (
          <div>
            <h2 className="text-sm font-medium">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {event.description}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 text-sm">
          {event.source_url ? (
            <a
              href={event.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Source page
            </a>
          ) : null}
          {event.ticket_url ? (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Tickets
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
