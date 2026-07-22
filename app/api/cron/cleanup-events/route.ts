import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice("Bearer ".length) === secret;
}

/**
 * Auto-cleanup: delete events whose start_date is more than 3 days in the past
 * AND that are NOT contacted. Contacted events are preserved for the sales team.
 *
 * Schedule via Supabase cron: daily at 03:00 UTC
 * POST /api/cron/cleanup-events  Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 3);
    const cutoffIso = cutoff.toISOString();

    const { data, error } = await supabase
      .from("events")
      .delete()
      .lt("start_date", cutoffIso)
      .eq("contacted", false)
      .select("id");

    if (error) throw new Error(error.message);

    const deleted = data?.length ?? 0;
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
