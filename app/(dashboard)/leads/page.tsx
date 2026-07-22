import Link from "next/link";
import { PageHeader, DataTable } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listLeads } from "@/services/dashboard";
import { markLeadContacted, deleteEvent } from "@/app/(dashboard)/lead-actions";
import { formatDate } from "@/utils/format";
import { EVENT_TYPE_LABELS, type EventType } from "@/lib/constants/event-types";

function eventTypeLabel(value: string | null): string {
  if (!value) return "—";
  return EVENT_TYPE_LABELS[value as EventType] ?? value;
}

export default async function LeadsPage() {
  const leads = await listLeads();

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${leads.length} events in your pipeline`}
      />

      <DataTable
        headers={["Title", "Date", "State", "Type", "Status", "Actions"]}
        empty={leads.length === 0}
      >
        {leads.map((event) => (
          <tr key={event.id} className="hover:bg-muted/40">
            <td className="w-full max-w-[280px] truncate px-3 py-2.5" title={event.title}>
              <Link
                href={`/events/${event.id}`}
                className="font-medium hover:underline"
              >
                {event.title}
              </Link>
            </td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5 text-muted-foreground">
              {formatDate(event.start_date)}
            </td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5">
              {event.state ?? "—"}
            </td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5">
              <Badge variant="outline">{eventTypeLabel(event.event_type)}</Badge>
            </td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5">
              {event.contacted ? (
                <Badge variant="success">Contacted</Badge>
              ) : (
                <Badge variant="warning">Not contacted</Badge>
              )}
            </td>
            <td className="w-[1%] whitespace-nowrap px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                {!event.contacted ? (
                  <form action={markLeadContacted}>
                    <input type="hidden" name="id" value={event.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Contacted
                    </Button>
                  </form>
                ) : null}
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={event.id} />
                  <input type="hidden" name="redirect" value="/leads" />
                  <Button type="submit" size="sm" variant="destructive">
                    Delete
                  </Button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
