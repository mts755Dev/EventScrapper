import { eventDedupeHash, normalizeText } from "@/utils/hash";
import type { RawEvent } from "@/types/crawler";

export function buildEventHash(
  event: RawEvent,
  organizationId?: string | null
): string {
  return eventDedupeHash({
    organizationId,
    title: event.title,
    startDate: event.start_date,
    venue: event.venue,
  });
}

/**
 * Simple title similarity for near-duplicate detection (Phase 3).
 * Returns 0–1 (1 = identical normalized titles).
 */
export function titleSimilarity(a: string, b: string): number {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return 0;
  if (left === right) return 1;

  const longer = left.length >= right.length ? left : right;
  const shorter = left.length >= right.length ? right : left;
  if (longer.includes(shorter) && shorter.length >= 8) {
    return shorter.length / longer.length;
  }

  return levenshteinRatio(left, right);
}

function levenshteinRatio(a: string, b: string): number {
  if (a.length > 80 || b.length > 80) {
    // Skip expensive compare on very long titles
    return a === b ? 1 : 0;
  }

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[a.length][b.length];
  return 1 - distance / Math.max(a.length, b.length);
}
