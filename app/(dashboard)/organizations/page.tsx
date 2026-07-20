import Link from "next/link";
import { PageHeader, DataTable } from "@/components/dashboard/page-header";
import {
  OrganizationFilters,
  buildOrgQuery,
  type OrgFilterValues,
} from "@/components/organizations/org-filters";
import { SalesTagBadges } from "@/components/sales/sales-tag-badges";
import { Badge } from "@/components/ui/badge";
import { listOrganizations } from "@/services/dashboard";
import { formatDate } from "@/utils/format";
import {
  ORG_CATEGORIES,
  ORG_CATEGORY_LABELS,
  type OrgCategory,
} from "@/lib/constants/org-categories";
import type { Disposition } from "@/types/database";

function categoryLabel(value: string): string {
  return ORG_CATEGORY_LABELS[value as OrgCategory] ?? value;
}

function parseDisposition(value?: string): Disposition | undefined {
  if (value === "none" || value === "accepted" || value === "declined") {
    return value;
  }
  return undefined;
}

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    state?: string;
    category?: string;
    contacted?: string;
    disposition?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const filters: OrgFilterValues = {
    q: params.q?.trim() || undefined,
    state:
      params.state?.toUpperCase() === "NC" || params.state?.toUpperCase() === "FL"
        ? params.state.toUpperCase()
        : undefined,
    category:
      params.category &&
      (ORG_CATEGORIES as readonly string[]).includes(params.category)
        ? params.category
        : undefined,
    contacted:
      params.contacted === "1" || params.contacted === "0"
        ? params.contacted
        : undefined,
    disposition: parseDisposition(params.disposition),
  };

  const { rows, total } = await listOrganizations({
    limit,
    offset,
    q: filters.q,
    state: filters.state,
    category: filters.category,
    contacted:
      filters.contacted === "1"
        ? true
        : filters.contacted === "0"
          ? false
          : undefined,
    disposition: parseDisposition(filters.disposition),
  });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <PageHeader
        title="Organizations"
        description={`${total.toLocaleString()} matching organizations`}
      />

      <OrganizationFilters values={filters} />

      <DataTable
        headers={["Name", "Category", "State", "Sales tags", "Source", "Added"]}
        empty={rows.length === 0}
      >
        {rows.map((org) => (
          <tr key={org.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5">
              <Link
                href={`/organizations/${org.id}`}
                className="font-medium hover:underline"
              >
                {org.name}
              </Link>
              {org.website ? (
                <p className="truncate text-xs text-muted-foreground">
                  {org.website}
                </p>
              ) : null}
            </td>
            <td className="px-3 py-2.5">
              <Badge variant="outline">{categoryLabel(org.category)}</Badge>
            </td>
            <td className="px-3 py-2.5">{org.state}</td>
            <td className="px-3 py-2.5">
              <SalesTagBadges
                contacted={org.contacted}
                disposition={org.disposition}
              />
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {org.source ?? "—"}
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {formatDate(org.created_at)}
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
                href={`/organizations${buildOrgQuery(filters, { page: String(page - 1) })}`}
                className="hover:underline"
              >
                Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/organizations${buildOrgQuery(filters, { page: String(page + 1) })}`}
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
