import { CRAWLER_CONFIG } from "@/crawler/config";
import { crawlLogger } from "@/crawler/logger";
import { fetchWithCheerio } from "@/crawler/fetchers/cheerio";
import { fetchWithPlaywright } from "@/crawler/fetchers/playwright";
import type { FetchResult } from "@/types/crawler";

function looksLikeUsefulStaticHtml(html: string): boolean {
  if (html.length < CRAWLER_CONFIG.minUsefulHtmlLength) return false;

  const lower = html.toLowerCase();
  return CRAWLER_CONFIG.eventContentHints.some((hint) =>
    lower.includes(hint)
  );
}

function looksLikeSpaShell(html: string): boolean {
  const lower = html.toLowerCase();
  const rootMarkers = [
    'id="__next"',
    'id="root"',
    'id="app"',
    "ng-version=",
    "data-reactroot",
  ];
  const hasRoot = rootMarkers.some((m) => lower.includes(m));
  const thinBody = html.length < CRAWLER_CONFIG.minUsefulHtmlLength * 2;
  return hasRoot && (thinBody || !looksLikeUsefulStaticHtml(html));
}

export type FetchStrategy = "auto" | "cheerio" | "playwright";

/**
 * Cheerio-first strategy:
 * 1. Fetch static HTML
 * 2. If content looks useful → done
 * 3. If SPA shell / empty → Playwright fallback
 */
export async function fetchPage(
  url: string,
  strategy: FetchStrategy = "auto"
): Promise<FetchResult> {
  if (strategy === "playwright") {
    return fetchWithPlaywright(url);
  }

  const staticResult = await fetchWithCheerio(url);

  if (strategy === "cheerio") {
    return staticResult;
  }

  if (
    looksLikeUsefulStaticHtml(staticResult.html) &&
    !looksLikeSpaShell(staticResult.html)
  ) {
    return staticResult;
  }

  crawlLogger.info("fetcher_fallback_playwright", {
    url,
    htmlLength: staticResult.html.length,
  });

  try {
    return await fetchWithPlaywright(url);
  } catch (error) {
    crawlLogger.warn("playwright_fallback_failed_using_cheerio", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return staticResult;
  }
}
