export const DISPOSITIONS = ["none", "accepted", "declined"] as const;

export type Disposition = (typeof DISPOSITIONS)[number];

export const DISPOSITION_LABELS: Record<Disposition, string> = {
  none: "No decision",
  accepted: "Accepted",
  declined: "Declined",
};
