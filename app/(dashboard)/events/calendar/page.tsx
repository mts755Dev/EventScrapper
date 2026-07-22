import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  EventFilters,
  type EventFilterValues,
} from "@/components/events/event-filters";
import { EventsCalendar } from "@/components/events/events-calendar";
import { Button } from "@/components/ui/button";
import { getEventsInRange } from "@/services/dashboard";
import { EVENT_TYPES } from "@/lib/constants/event-types";

export default async function EventsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    q?: string;
    state?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const monthNum = Number(params.month) || now.getMonth() + 1;
  const monthIndex = Math.min(11, Math.max(0, monthNum - 1));

  const filters: EventFilterValues = {
    q: params.q?.trim() || undefined,
    state:
      params.state?.toUpperCase() === "NC" || params.state?.toUpperCase() === "FL"
        ? params.state.toUpperCase()
        : undefined,
    type:
      params.type && (EVENT_TYPES as readonly string[]).includes(params.type)
        ? params.type
        : undefined,
  };

  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 1);

  // Only show today and future events (match Events list behavior)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const start = monthStart < todayStart ? todayStart : monthStart;

  const events =
    start >= monthEnd
      ? []
      : await getEventsInRange({
          start: start.toISOString(),
          end: monthEnd.toISOString(),
          state: filters.state,
          eventType: filters.type,
          q: filters.q,
        });

  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.state) query.set("state", filters.state);
  if (filters.type) query.set("type", filters.type);
  const querySuffix = query.toString();

  return (
    <div>
      <PageHeader
        title="Calendar"
        description={`${events.length} events in this month`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/events">List view</Link>
          </Button>
        }
      />

      <EventFilters
        values={filters}
        action="/events/calendar"
        showDateRange={false}
        hiddenFields={{
          year: String(year),
          month: String(monthIndex + 1),
        }}
      />

      <EventsCalendar
        year={year}
        month={monthIndex}
        events={events}
        querySuffix={querySuffix}
      />
    </div>
  );
}
