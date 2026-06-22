export type IdentityDriftSurfaceData = {
  visible: boolean;
  title: string;
  message: string;

  driftLabel?: string;
  fromLabel?: string;
  toLabel?: string;

  driftCue?: string;

  driftStrength?:
    | "minor"
    | "moderate"
    | "strong";

  driftDirection?:
    | "stable"
    | "branching"
    | "fragmenting"
    | "resetting";
};