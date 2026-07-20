import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, DataTable } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { SalesTagBadges } from "@/components/sales/sales-tag-badges";
import { SalesTagControls } from "@/components/sales/sales-tag-controls";
import {
  getEventsForOrganization,
  getOrganizationById,
} from "@/services/dashboard";
import { formatDate } from "@/utils/format";
import {
  ORG_CATEGORY_LABELS,
  type OrgCategory,
} from "@/lib/constants/org-categories";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getOrganizationById(id);
  if (!org) notFound();

  const events = await getEventsForOrganization(org.id);

  return (
    <div>
      <PageHeader
        title={org.name}
        description="Organization detail and linked events"
        actions={
          <Link
            href="/organizations"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back
          </Link>
        }
      />

      <div className="mb-8 rounded-lg border p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline">
            {ORG_CATEGORY_LABELS[org.category as OrgCategory] ?? org.category}
          </Badge>
          <Badge>{org.state}</Badge>
          <SalesTagBadges
            contacted={org.contacted}
            disposition={org.disposition}
          />
        </div>

        <div className="mb-6 rounded-md border bg-muted/20 p-4">
          <h2 className="mb-3 text-sm font-medium">Sales tags</h2>
          <SalesTagControls
            entity="organization"
            id={org.id}
            contacted={org.contacted}
            disposition={org.disposition}
          />
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              City
            </dt>
            <dd className="mt-1">{org.city ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Discovered via
            </dt>
            <dd className="mt-1">{org.source ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Website
            </dt>
            <dd className="mt-1">
              {org.website ? (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all hover:underline"
                >
                  {org.website}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </div>

      <h2 className="mb-3 text-lg font-medium">Events ({events.length})</h2>
      <DataTable
        headers={["Title", "Date", "Type", "Sales tags", "Venue"]}
        empty={events.length === 0}
      >
        {events.map((event) => (
          <tr key={event.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5">
              <Link
                href={`/events/${event.id}`}
                className="font-medium hover:underline"
              >
                {event.title}
              </Link>
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {formatDate(event.start_date)}
            </td>
            <td className="px-3 py-2.5">{event.event_type ?? "—"}</td>
            <td className="px-3 py-2.5">
              <SalesTagBadges
                contacted={event.contacted}
                disposition={event.disposition}
              />
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {event.venue ?? "—"}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
