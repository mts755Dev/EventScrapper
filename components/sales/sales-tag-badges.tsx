import { Badge } from "@/components/ui/badge";
import type { Disposition } from "@/types/database";

export function SalesTagBadges({
  contacted,
  disposition,
}: {
  contacted: boolean;
  disposition: Disposition;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {contacted ? (
        <Badge variant="warning">Contacted</Badge>
      ) : (
        <Badge variant="outline">Not contacted</Badge>
      )}
      {disposition === "accepted" ? (
        <Badge variant="success">Accepted</Badge>
      ) : null}
      {disposition === "declined" ? (
        <Badge variant="destructive">Declined</Badge>
      ) : null}
    </span>
  );
}
