export type ReturningThemeSurfaceData = {
  visible: boolean;
  title: string;
  message: string;

  themeLabel?: string;
  occurrenceLabel?: string;
  emotionalCue?: string;

  strength?:
    | "weak"
    | "emerging"
    | "strong";
};