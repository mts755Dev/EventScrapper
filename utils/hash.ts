import { createHash } from "crypto";

/** Normalize free text before hashing / fuzzy compare */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Stable dedupe key for events.
 * organizationId may be empty for orphan discoveries.
 */
export function eventDedupeHash(parts: {
  organizationId?: string | null;
  title: string;
  startDate?: string | null;
  venue?: string | null;
}): string {
  const payload = [
    parts.organizationId ?? "",
    normalizeText(parts.title),
    parts.startDate ? parts.startDate.slice(0, 10) : "",
    normalizeText(parts.venue ?? ""),
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}
