import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, DataTable } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalesTagBadges } from "@/components/sales/sales-tag-badges";
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
          <Button asChild variant="outline" size="sm">
            <Link href="/organizations">← Back</Link>
          </Button>
        }
      />

      <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline">
            {ORG_CATEGORY_LABELS[org.category as OrgCategory] ?? org.category}
          </Badge>
          <Badge>{org.state}</Badge>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              City
            </dt>
            <dd className="mt-1 text-sm text-foreground">{org.city ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Discovered via
            </dt>
            <dd className="mt-1 text-sm text-foreground">{org.source ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Website
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {org.website ? (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary hover:underline"
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
          <tr key={event.id} className="hover:bg-muted/40">
            <td className="px-4 py-3">
              <Link
                href={`/events/${event.id}`}
                className="font-medium hover:underline"
              >
                {event.title}
              </Link>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
              {formatDate(event.start_date)}
            </td>
            <td className="whitespace-nowrap px-4 py-3">{event.event_type ?? "—"}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <SalesTagBadges
                contacted={event.contacted}
                disposition={event.disposition}
              />
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {event.venue ?? "—"}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
