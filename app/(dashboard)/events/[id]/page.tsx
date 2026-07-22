import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventById, getOrganizationById } from "@/services/dashboard";
import { addToLead, removeFromLead, deleteEvent } from "@/app/(dashboard)/lead-actions";
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
    <div className="max-w-3xl">
      <PageHeader
        title={event.title}
        description="Event opportunity detail"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/events">← Back to events</Link>
          </Button>
        }
      />

      <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{typeLabel}</Badge>
          {event.state ? <Badge>{event.state}</Badge> : null}
          {event.is_lead ? (
            <Badge variant="success">Lead</Badge>
          ) : null}
          {event.contacted ? (
            <Badge variant="warning">Contacted</Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {event.is_lead ? (
            <form action={removeFromLead}>
              <input type="hidden" name="id" value={event.id} />
              <Button type="submit" variant="outline" size="sm">
                Remove from Leads
              </Button>
            </form>
          ) : (
            <form action={addToLead}>
              <input type="hidden" name="id" value={event.id} />
              <Button type="submit" size="sm">
                Add to Lead
              </Button>
            </form>
          )}
          <form action={deleteEvent}>
            <input type="hidden" name="id" value={event.id} />
            <input type="hidden" name="redirect" value="/events" />
            <Button type="submit" variant="destructive" size="sm">
              Delete
            </Button>
          </form>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Start
            </dt>
            <dd className="mt-1 text-sm text-foreground">{formatDateTime(event.start_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              End
            </dt>
            <dd className="mt-1 text-sm text-foreground">{formatDateTime(event.end_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Venue
            </dt>
            <dd className="mt-1 text-sm text-foreground">{event.venue ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {[event.city, event.state].filter(Boolean).join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Organization
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {org ? (
                <Link
                  href={`/organizations/${org.id}`}
                  className="text-primary hover:underline"
                >
                  {org.name}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Discovered
            </dt>
            <dd className="mt-1 text-sm text-foreground">{formatDate(event.created_at)}</dd>
          </div>
        </dl>

        {event.description ? (
          <div>
            <h2 className="text-sm font-semibold text-foreground">Description</h2>
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
