import { NextResponse } from "next/server";
import { runSourceDiscovery } from "@/crawler/discovery/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Discovery probes many URLs; allow a longer serverless window when hosted. */
export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice("Bearer ".length) === secret;
}

/**
 * Free automatic source discovery (no paid search APIs).
 * Probes known NC/FL origins + org websites for calendar paths,
 * then inserts only pages that look like event calendars.
 *
 * POST /api/cron/discover-sources
 * Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSourceDiscovery();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
