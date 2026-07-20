import Link from "next/link";
import { PageHeader, DataTable } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toggleSourceActive } from "@/app/(dashboard)/sources/actions";
import { listSources } from "@/services/dashboard";
import { formatDate } from "@/utils/format";
import {
  SOURCE_TYPE_LABELS,
  type SourceType,
} from "@/lib/constants/source-types";

function typeLabel(value: string): string {
  return SOURCE_TYPE_LABELS[value as SourceType] ?? value;
}

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; active?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const state =
    params.state?.toUpperCase() === "NC" || params.state?.toUpperCase() === "FL"
      ? params.state.toUpperCase()
      : undefined;
  const active =
    params.active === "1" ? true : params.active === "0" ? false : undefined;

  const sources = await listSources({ q, state, active });
  const activeCount = sources.filter((s) => s.active).length;

  return (
    <div>
      <PageHeader
        title="Sources"
        description={`${activeCount} active shown · ${sources.length} matching`}
      />

      <form
        method="get"
        action="/sources"
        className="mb-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Name or URL…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Select id="state" name="state" defaultValue={state ?? ""}>
            <option value="">All states</option>
            <option value="NC">NC</option>
            <option value="FL">FL</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="active">Status</Label>
          <Select
            id="active"
            name="active"
            defaultValue={
              active === true ? "1" : active === false ? "0" : ""
            }
          >
            <option value="">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </Select>
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
          <Button type="submit">Apply filters</Button>
          <Button asChild variant="outline">
            <Link href="/sources">Clear</Link>
          </Button>
        </div>
      </form>

      <DataTable
        headers={["Name", "Type", "State", "URL", "Status", "Added", ""]}
        empty={sources.length === 0}
      >
        {sources.map((source) => (
          <tr key={source.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5 font-medium">{source.name}</td>
            <td className="px-3 py-2.5">
              <Badge variant="outline">{typeLabel(source.type)}</Badge>
            </td>
            <td className="px-3 py-2.5">{source.state ?? "—"}</td>
            <td className="max-w-[240px] truncate px-3 py-2.5 text-muted-foreground">
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {source.url}
              </a>
            </td>
            <td className="px-3 py-2.5">
              <Badge variant={source.active ? "success" : "outline"}>
                {source.active ? "active" : "inactive"}
              </Badge>
            </td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {formatDate(source.created_at)}
            </td>
            <td className="px-3 py-2.5">
              <form action={toggleSourceActive}>
                <input type="hidden" name="id" value={source.id} />
                <input
                  type="hidden"
                  name="active"
                  value={source.active ? "true" : "false"}
                />
                <Button type="submit" variant="outline" size="sm">
                  {source.active ? "Disable" : "Enable"}
                </Button>
              </form>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
