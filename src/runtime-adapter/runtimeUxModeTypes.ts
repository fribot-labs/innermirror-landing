export type RuntimeUxMode =
  | "full-runtime"
  | "partial-runtime"
  | "local-only";

export type RuntimeUxModeReason =
  | "runtime-healthy"
  | "runtime-degraded"
  | "runtime-unavailable"
  | "runtime-checking";

export type RuntimeUxModeResult = {
  mode: RuntimeUxMode;
  reason: RuntimeUxModeReason;
  canUseFastReflection: boolean;
  canUseStreamingMerge: boolean;
  canUseMemoryTimeline: boolean;
  canUseContinuitySurfaces: boolean;
  message: string;
};