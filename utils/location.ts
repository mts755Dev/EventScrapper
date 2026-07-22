/**
 * Best-effort venue / city / state extraction from structured and free-text locations.
 */

export type ParsedLocation = {
  venue?: string;
  city?: string;
  state?: string;
};

function stringValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function cleanCity(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const city = value.replace(/\s+/g, " ").trim();
  if (city.length < 2 || city.length > 80) return undefined;
  // Skip values that are clearly not cities
  if (/^\d+$/.test(city)) return undefined;
  if (/^(united states|usa|us)$/i.test(city)) return undefined;
  return city;
}

/** Extract city/state from PostalAddress-like objects (JSON-LD / microdata). */
export function parsePostalAddress(address: unknown): ParsedLocation {
  if (!address) return {};
  if (typeof address === "string") return parseLocationText(address);

  if (typeof address !== "object") return {};
  const addr = address as Record<string, unknown>;

  const city = cleanCity(
    stringValue(addr.addressLocality) ||
      stringValue(addr.city) ||
      stringValue(addr.locality)
  );

  const region = stringValue(addr.addressRegion) || stringValue(addr.state);
  const state = region?.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);

  const street =
    stringValue(addr.streetAddress) ||
    stringValue(addr.name) ||
    [stringValue(addr.streetAddress), city, state].filter(Boolean).join(", ");

  const venueParts = [stringValue(addr.streetAddress), stringValue(addr.name)]
    .filter(Boolean)
    .join(", ");

  return {
    venue: venueParts || street || undefined,
    city,
    state: state === "NC" || state === "FL" ? state : undefined,
  };
}

/** Extract venue/city/state from schema.org Place / location objects. */
export function parseLocationObject(location: unknown): ParsedLocation {
  if (!location) return {};
  if (typeof location === "string") return parseLocationText(location);

  if (Array.isArray(location)) {
    for (const item of location) {
      const parsed = parseLocationObject(item);
      if (parsed.venue || parsed.city) return parsed;
    }
    return {};
  }

  if (typeof location !== "object") return {};
  const loc = location as Record<string, unknown>;

  const fromAddress = parsePostalAddress(loc.address);
  const name = stringValue(loc.name);

  return {
    venue: name || fromAddress.venue,
    city: fromAddress.city || cleanCity(stringValue(loc.addressLocality)),
    state: fromAddress.state,
  };
}

/**
 * Parse free-text location strings like:
 * - "Shaffner Park, Winston-Salem, NC"
 * - "Winston-Salem, NC 27101"
 * - "123 Main St, Raleigh, NC"
 */
export function parseLocationText(text: string): ParsedLocation {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length < 2) return {};

  // "... City, ST" or "... City, ST 12345"
  const withState = cleaned.match(
    /^(.*?),\s*([A-Za-z .'-]{2,60}),\s*(NC|FL)(?:\s+\d{5}(?:-\d{4})?)?\.?$/i
  );
  if (withState) {
    const venue = withState[1].trim();
    const city = cleanCity(withState[2]);
    const state = withState[3].toUpperCase();
    return {
      venue: venue && venue.length >= 2 ? venue : undefined,
      city,
      state: state === "NC" || state === "FL" ? state : undefined,
    };
  }

  // "City, ST"
  const cityState = cleaned.match(
    /^([A-Za-z .'-]{2,60}),\s*(NC|FL)(?:\s+\d{5}(?:-\d{4})?)?\.?$/i
  );
  if (cityState) {
    return {
      city: cleanCity(cityState[1]),
      state: cityState[2].toUpperCase() as "NC" | "FL",
    };
  }

  // No clear city — treat whole string as venue if it looks like a place name
  if (cleaned.length <= 300 && !/https?:\/\//i.test(cleaned)) {
    return { venue: cleaned };
  }

  return {};
}

/** Merge location fields, preferring existing values. */
export function mergeLocation(
  base: ParsedLocation,
  extra: ParsedLocation
): ParsedLocation {
  return {
    venue: base.venue || extra.venue,
    city: base.city || extra.city,
    state: base.state || extra.state,
  };
}

/** Pick the most common non-empty city from a list of events. */
export function mostCommonCity(
  cities: Array<string | undefined | null>
): string | undefined {
  const counts = new Map<string, number>();
  for (const city of cities) {
    const key = city?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [city, count] of counts) {
    if (count > bestCount) {
      best = city;
      bestCount = count;
    }
  }
  return best;
}
