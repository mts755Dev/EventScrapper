import { NextResponse } from "next/server";
import { runCrawl } from "@/crawler";
import { crawlLogger } from "@/crawler/logger";

export const runtime = "nodejs";
/** Allow long crawls on Vercel Pro; Hobby max is lower and will truncate. */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    crawlLogger.error("cron_secret_missing");
    return false;
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice("Bearer ".length) === secret;
}

/**
 * Supabase Cron → POST /api/cron/crawl
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let sourceIds: string[] | undefined;
    try {
      const body = (await request.json()) as { sourceIds?: string[] };
      if (Array.isArray(body.sourceIds)) {
        sourceIds = body.sourceIds.filter((id) => typeof id === "string");
      }
    } catch {
      // empty body is fine
    }

    const result = await runCrawl({ sourceIds });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    crawlLogger.error("cron_route_error", { message });
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

/** Simple health check for manual verification */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    message: "Crawl endpoint ready. Use POST to start a crawl.",
  });
}
