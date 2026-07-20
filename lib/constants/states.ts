/** MVP target states — expand to all 50 later */
export const TARGET_STATES = ["NC", "FL"] as const;

export type TargetState = (typeof TARGET_STATES)[number];

export const STATE_NAMES: Record<TargetState, string> = {
  NC: "North Carolina",
  FL: "Florida",
};
