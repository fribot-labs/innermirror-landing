export type LongGapRecoverySurfaceData = {
  visible: boolean;
  title: string;
  message: string;

  timeGapLabel?: string;
  recoveredTheme?: string;
  previousReflectionSummary?: string;

  recoveryCue?: string;

  gapKind?:
    | "weeks"
    | "months"
    | "quarter"
    | "unknown";
};