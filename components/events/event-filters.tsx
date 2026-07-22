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
  contacted?: string;
};

export function EventFilters({
  values,
  action = "/events",
  hiddenFields,
  showDateRange = true,
}: {
  values: EventFilterValues;
  action?: string;
  hiddenFields?: Record<string, string>;
  /** From/To dates — useful on list view, redundant on calendar */
  showDateRange?: boolean;
}) {
  return (
    <form
      method="get"
      action={action}
      className={
        showDateRange
          ? "mb-6 grid gap-3 rounded-xl border bg-card p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-12"
          : "mb-6 grid gap-3 rounded-xl border bg-card p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-6"
      }
    >
      {hiddenFields
        ? Object.entries(hiddenFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <div
        className={
          showDateRange
            ? "space-y-1.5 sm:col-span-2 lg:col-span-6"
            : "space-y-1.5 sm:col-span-2 lg:col-span-3"
        }
      >
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          defaultValue={values.q ?? ""}
          placeholder="Title, venue, city…"
        />
      </div>

      <div
        className={
          showDateRange
            ? "space-y-1.5 lg:col-span-2"
            : "space-y-1.5 lg:col-span-1"
        }
      >
        <Label htmlFor="state">State</Label>
        <Select id="state" name="state" defaultValue={values.state ?? ""}>
          <option value="">All states</option>
          <option value="NC">North Carolina</option>
          <option value="FL">Florida</option>
        </Select>
      </div>

      <div
        className={
          showDateRange
            ? "space-y-1.5 lg:col-span-2"
            : "space-y-1.5 lg:col-span-2"
        }
      >
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

      {showDateRange ? (
        <>
          <div className="space-y-1.5 lg:col-span-2">
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

          <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-4">
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
              <Input
                id="to"
                name="to"
                type="date"
                defaultValue={values.to ?? ""}
              />
            </div>
          </div>
        </>
      ) : null}

      <div
        className={
          showDateRange
            ? "flex flex-wrap items-end gap-2 pt-1 sm:col-span-2 lg:col-span-12"
            : "flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-6 lg:items-end"
        }
      >
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
  if (values.contacted === "1" || values.contacted === "0") {
    params.set("contacted", values.contacted);
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
