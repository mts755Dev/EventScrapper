import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  ORG_CATEGORIES,
  ORG_CATEGORY_LABELS,
} from "@/lib/constants/org-categories";

export type OrgFilterValues = {
  q?: string;
  state?: string;
  category?: string;
  contacted?: string;
  disposition?: string;
};

export function OrganizationFilters({ values }: { values: OrgFilterValues }) {
  return (
    <form
      method="get"
      action="/organizations"
      className="mb-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          defaultValue={values.q ?? ""}
          placeholder="Name, city, website…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="state">State</Label>
        <Select id="state" name="state" defaultValue={values.state ?? ""}>
          <option value="">All states</option>
          <option value="NC">North Carolina</option>
          <option value="FL">Florida</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          name="category"
          defaultValue={values.category ?? ""}
        >
          <option value="">All categories</option>
          {ORG_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {ORG_CATEGORY_LABELS[category]}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contacted">Contacted</Label>
        <Select
          id="contacted"
          name="contacted"
          defaultValue={values.contacted ?? ""}
        >
          <option value="">Any</option>
          <option value="1">Contacted</option>
          <option value="0">Not contacted</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="disposition">Decision</Label>
        <Select
          id="disposition"
          name="disposition"
          defaultValue={values.disposition ?? ""}
        >
          <option value="">Any</option>
          <option value="none">No decision</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </Select>
      </div>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline">
          <Link href="/organizations">Clear</Link>
        </Button>
      </div>
    </form>
  );
}

export function buildOrgQuery(
  values: OrgFilterValues,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.state) params.set("state", values.state);
  if (values.category) params.set("category", values.category);
  if (values.contacted === "1" || values.contacted === "0") {
    params.set("contacted", values.contacted);
  }
  if (values.disposition) params.set("disposition", values.disposition);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
