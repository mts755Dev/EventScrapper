import { CRAWLER_CONFIG } from "@/crawler/config";
import { crawlLogger } from "@/crawler/logger";
import { FetchError } from "@/crawler/fetchers/cheerio";
import type { FetchResult } from "@/types/crawler";

type Browser = Awaited<
  ReturnType<Awaited<typeof import("playwright-core")>["chromium"]["launch"]>
>;

let browserPromise: Promise<Browser> | null = null;

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/**
 * Launch Chromium once per warm serverless instance.
 * Local: full Playwright. Vercel: @sparticuz/chromium + playwright-core.
 */
async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      if (isServerless()) {
        const chromium = (await import("@sparticuz/chromium")).default;
        const { chromium: playwrightChromium } = await import("playwright-core");
        return playwrightChromium.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      }

      const { chromium } = await import("playwright");
      return chromium.launch({ headless: true });
    })().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }
  return browserPromise;
}

export async function closeBrowser(): Promise<void> {
  if (!browserPromise) return;
  try {
    const browser = await browserPromise;
    await browser.close();
  } catch {
    // ignore close errors
  } finally {
    browserPromise = null;
  }
}

/**
 * JS-rendered fetch for SPAs / athletics calendars.
 * Falls back gracefully if Chromium is not installed.
 */
export async function fetchWithPlaywright(url: string): Promise<FetchResult> {
  let browser: Browser;
  try {
    browser = await getBrowser();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Playwright unavailable";
    crawlLogger.warn("playwright_unavailable", { url, message });
    throw new FetchError(
      `Playwright unavailable: ${message}. Run: npx playwright install chromium`,
      undefined,
      url
    );
  }

  const context = await browser.newContext({
    userAgent: CRAWLER_CONFIG.userAgent,
    javaScriptEnabled: true,
  });

  try {
    const page = await context.newPage();
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: CRAWLER_CONFIG.playwrightTimeoutMs,
    });

    // Allow late calendar widgets a short settle time
    await new Promise((resolve) => setTimeout(resolve, 1_200));

    const html = await page.content();
    const finalUrl = page.url();
    const status = response?.status() ?? 0;

    if (status >= 400) {
      throw new FetchError(`HTTP ${status} (playwright) ${url}`, status, url);
    }

    const trimmed =
      html.length > CRAWLER_CONFIG.maxHtmlBytes
        ? html.slice(0, CRAWLER_CONFIG.maxHtmlBytes)
        : html;

    return {
      url: finalUrl,
      html: trimmed,
      status,
      fetcher: "playwright",
      contentType: "text/html",
    };
  } catch (error) {
    if (error instanceof FetchError) throw error;
    const message =
      error instanceof Error ? error.message : "Playwright navigation failed";
    throw new FetchError(message, undefined, url);
  } finally {
    await context.close();
  }
}
