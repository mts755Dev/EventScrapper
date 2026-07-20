/**
 * Normalize URLs for storage and comparison.
 * Strips tracking params, hashes, and trailing slashes (except origin).
 */
export function normalizeUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (!["http:", "https:"].includes(url.protocol)) return null;

    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "mc_cid",
      "mc_eid",
    ];
    for (const param of trackingParams) {
      url.searchParams.delete(param);
    }

    url.hash = "";
    let href = url.toString();
    if (href.endsWith("/") && url.pathname !== "/") {
      href = href.slice(0, -1);
    }
    return href;
  } catch {
    return null;
  }
}

export function absoluteUrl(href: string, base: string): string | null {
  try {
    return normalizeUrl(new URL(href, base).toString());
  } catch {
    return null;
  }
}

export function getHostname(input: string): string | null {
  try {
    return new URL(input).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
