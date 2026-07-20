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
    <span className="inline-flex flex-wrap gap-1">
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
      {disposition === "none" ? (
        <Badge variant="outline">No decision</Badge>
      ) : null}
    </span>
  );
}
