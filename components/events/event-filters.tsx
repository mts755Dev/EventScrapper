import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/constants/event-types";

export type EventFilterValues = {
  q?: string;
  state?: string;
  type?: string;
  from?: string;
  to?: string;
  upcoming?: string;
  contacted?: string;
  disposition?: string;
};

export function EventFilters({
  values,
  action = "/events",
  hiddenFields,
}: {
  values: EventFilterValues;
  action?: string;
  hiddenFields?: Record<string, string>;
}) {
  return (
    <form
      method="get"
      action={action}
      className="mb-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      {hiddenFields
        ? Object.entries(hiddenFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          defaultValue={values.q ?? ""}
          placeholder="Title, venue, city…"
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
        <Label htmlFor="type">Event type</Label>
        <Select id="type" name="type" defaultValue={values.type ?? ""}>
          <option value="">All types</option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EVENT_TYPE_LABELS[type]}
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

      <div className="space-y-1.5">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          type="date"
          defaultValue={values.from ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="to">To</Label>
        <Input id="to" name="to" type="date" defaultValue={values.to ?? ""} />
      </div>

      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-6">
        <label className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="upcoming"
            value="1"
            defaultChecked={values.upcoming === "1"}
            className="size-4 rounded border-input"
          />
          Upcoming only
        </label>
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline">
          <Link href={action}>Clear</Link>
        </Button>
      </div>
    </form>
  );
}

export function buildEventsQuery(
  values: EventFilterValues,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.state) params.set("state", values.state);
  if (values.type) params.set("type", values.type);
  if (values.from) params.set("from", values.from);
  if (values.to) params.set("to", values.to);
  if (values.upcoming === "1") params.set("upcoming", "1");
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
