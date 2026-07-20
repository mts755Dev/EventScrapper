/**
 * Flexible date parsing for crawler extraction.
 * Prefer storing ISO when possible; return undefined if unparseable.
 */

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

export function toIsoDate(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;

  const trimmed = value.trim();

  // Already ISO-ish
  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime()) && looksLikeDateString(trimmed)) {
    return direct.toISOString();
  }

  // MM/DD/YYYY or M/D/YY
  const slash = trimmed.match(
    /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?:\s*(am|pm))?)?/i
  );
  if (slash) {
    const month = Number(slash[1]) - 1;
    const day = Number(slash[2]);
    let year = Number(slash[3]);
    if (year < 100) year += 2000;
    const hour = parseHour(slash[4], slash[6]);
    const minute = slash[5] ? Number(slash[5]) : 0;
    const date = new Date(Date.UTC(year, month, day, hour, minute));
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  // Month DD, YYYY [time]
  const named = trimmed.match(
    /\b([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})(?:\s+[–-]?\s*(\d{1,2}):(\d{2})\s*(am|pm)?)?/i
  );
  if (named) {
    const month = MONTHS[named[1].toLowerCase()];
    if (month !== undefined) {
      const day = Number(named[2]);
      const year = Number(named[3]);
      const hour = parseHour(named[4], named[6]);
      const minute = named[5] ? Number(named[5]) : 0;
      const date = new Date(Date.UTC(year, month, day, hour, minute));
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
  }

  // YYYY-MM-DD
  const isoDay = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDay) {
    const date = new Date(
      Date.UTC(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]))
    );
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  return undefined;
}

function parseHour(hour?: string, ampm?: string): number {
  if (!hour) return 12; // noon default for date-only display events
  let h = Number(hour);
  if (ampm?.toLowerCase() === "pm" && h < 12) h += 12;
  if (ampm?.toLowerCase() === "am" && h === 12) h = 0;
  return h;
}

function looksLikeDateString(value: string): boolean {
  return /\d/.test(value) && value.length >= 6;
}

/** Pull the first date-like substring from free text */
export function extractFirstDate(text: string): string | undefined {
  const patterns = [
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/i,
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/,
    /\b\d{4}-\d{2}-\d{2}\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const iso = toIsoDate(match[0]);
      if (iso) return iso;
    }
  }
  return undefined;
}
