import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database";
import { cn } from "@/lib/utils";

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseEventDay(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return toDayKey(date);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function EventsCalendar({
  year,
  month,
  events,
  querySuffix = "",
}: {
  year: number;
  month: number; // 0-indexed
  events: Event[];
  querySuffix?: string; // extra filters without leading ?
}) {
  const first = startOfMonth(year, month);
  const totalDays = daysInMonth(year, month);
  const startPad = first.getDay();
  const todayKey = toDayKey(new Date());

  const byDay = new Map<string, Event[]>();
  for (const event of events) {
    const key = parseEventDay(event.start_date);
    if (!key) continue;
    const list = byDay.get(key) ?? [];
    list.push(event);
    byDay.set(key, list);
  }

  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const suffix = querySuffix ? `&${querySuffix}` : "";

  const cells: Array<{ day: number | null; key: string | null }> = [];
  for (let i = 0; i < startPad; i++) cells.push({ day: null, key: null });
  for (let day = 1; day <= totalDays; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, key });
  }

  const title = first.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/events/calendar?year=${prev.getFullYear()}&month=${prev.getMonth() + 1}${suffix}`}
            >
              Previous
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/calendar?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}${suffix}`}>
              Today
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/events/calendar?year=${next.getFullYear()}&month=${next.getMonth() + 1}${suffix}`}
            >
              Next
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[minmax(88px,1fr)] sm:auto-rows-[minmax(110px,1fr)]">
          {cells.map((cell, index) => {
            if (!cell.day || !cell.key) {
              return (
                <div
                  key={`pad-${index}`}
                  className="border-b border-r bg-muted/10"
                />
              );
            }

            const dayEvents = byDay.get(cell.key) ?? [];
            const isToday = cell.key === todayKey;

            return (
              <div
                key={cell.key}
                className={cn(
                  "min-w-0 border-b border-r p-1.5 transition-colors hover:bg-muted/20",
                  isToday && "bg-accent/40"
                )}
              >
                <div
                  className={cn(
                    "mb-1 text-xs font-medium",
                    isToday ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {cell.day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block truncate rounded bg-primary/10 px-1.5 py-0.5 text-[11px] leading-tight text-foreground hover:bg-primary/20"
                      title={event.title}
                    >
                      {event.title}
                    </Link>
                  ))}
                  {dayEvents.length > 3 ? (
                    <p className="px-1 text-[10px] text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
