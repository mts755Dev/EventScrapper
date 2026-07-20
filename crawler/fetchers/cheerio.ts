import { CRAWLER_CONFIG } from "@/crawler/config";
import type { FetchResult } from "@/types/crawler";

export class FetchError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly url?: string
  ) {
    super(message);
    this.name = "FetchError";
  }
}

/**
 * Static HTML fetch via fetch + returns raw HTML for Cheerio parsing.
 * Prefer this path — faster and cheaper than Playwright.
 */
export async function fetchWithCheerio(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    CRAWLER_CONFIG.fetchTimeoutMs
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": CRAWLER_CONFIG.userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml") &&
      !contentType.includes("application/xml") &&
      !contentType.includes("text/xml") &&
      !contentType.includes("application/rss") &&
      !contentType.includes("application/atom") &&
      !contentType.includes("text/plain")
    ) {
      throw new FetchError(
        `Unsupported content-type: ${contentType || "unknown"}`,
        response.status,
        url
      );
    }

    const buffer = await response.arrayBuffer();
    const slice = buffer.byteLength > CRAWLER_CONFIG.maxHtmlBytes
      ? buffer.slice(0, CRAWLER_CONFIG.maxHtmlBytes)
      : buffer;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);

    if (!response.ok) {
      throw new FetchError(
        `HTTP ${response.status} fetching ${url}`,
        response.status,
        url
      );
    }

    return {
      url: response.url || url,
      html,
      status: response.status,
      fetcher: "cheerio",
      contentType,
    };
  } catch (error) {
    if (error instanceof FetchError) throw error;
    const message =
      error instanceof Error ? error.message : "Unknown fetch error";
    throw new FetchError(message, undefined, url);
  } finally {
    clearTimeout(timeout);
  }
}
