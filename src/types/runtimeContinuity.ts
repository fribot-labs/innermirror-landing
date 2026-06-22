export type ReflectionContinuitySurfaceData = {
  visible: boolean;

  message: string;

  relatedReflection?: {
    summary: string;
    timeLabel: string;
  };

  continuityStrength?: number;

  bridgeKind?:
    | "direct-theme"
    | "weak-signal"
    | "long-gap"
    | "returning-theme";
};