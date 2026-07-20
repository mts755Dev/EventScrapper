import { Button } from "@/components/ui/button";
import {
  setEventContacted,
  setEventDisposition,
  setOrganizationContacted,
  setOrganizationDisposition,
} from "@/app/(dashboard)/sales-actions";
import type { Disposition } from "@/types/database";

export function SalesTagControls({
  entity,
  id,
  contacted,
  disposition,
  compact = false,
}: {
  entity: "event" | "organization";
  id: string;
  contacted: boolean;
  disposition: Disposition;
  compact?: boolean;
}) {
  const contactAction =
    entity === "event" ? setEventContacted : setOrganizationContacted;
  const dispositionAction =
    entity === "event" ? setEventDisposition : setOrganizationDisposition;

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-1.5"
          : "flex flex-wrap items-center gap-2"
      }
    >
      <form action={contactAction}>
        <input type="hidden" name="id" value={id} />
        <input
          type="hidden"
          name="contacted"
          value={contacted ? "true" : "false"}
        />
        <Button
          type="submit"
          size="sm"
          variant={contacted ? "secondary" : "outline"}
        >
          {contacted ? "Mark not contacted" : "Mark contacted"}
        </Button>
      </form>

      <form action={dispositionAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="disposition" value="accepted" />
        <Button
          type="submit"
          size="sm"
          variant={disposition === "accepted" ? "default" : "outline"}
        >
          Accept
        </Button>
      </form>

      <form action={dispositionAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="disposition" value="declined" />
        <Button
          type="submit"
          size="sm"
          variant={disposition === "declined" ? "destructive" : "outline"}
        >
          Decline
        </Button>
      </form>

      {disposition !== "none" ? (
        <form action={dispositionAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="disposition" value="none" />
          <Button type="submit" size="sm" variant="ghost">
            Clear decision
          </Button>
        </form>
      ) : null}
    </div>
  );
}
