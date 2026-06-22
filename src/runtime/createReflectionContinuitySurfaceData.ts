import type {
    ReflectionContinuitySurfaceData,
} from "../types/runtimeContinuity";

export function createReflectionContinuitySurfaceData(
  runtimeResult: any
): ReflectionContinuitySurfaceData {
  const continuity =
    runtimeResult?.continuitySignal;

  if (!continuity) {
    return {
      visible: false,
      message: "",
    };
  }

  const strength =
    continuity.strength ?? 0;

  if (strength < 60) {
    return {
      visible: false,
      message: "",
    };
  }

  return {
    visible: true,

    message:
      continuity.message ??
      "이전 흐름과 연결됩니다.",

    relatedReflection: {
      summary:
        continuity.relatedSummary ??
        "이전에 비슷한 흐름이 있었습니다.",
      timeLabel:
        continuity.relatedTimeLabel ??
        "최근 reflection",
    },

    continuityStrength:
      strength,

    bridgeKind:
      continuity.bridgeKind ??
      "weak-signal",
  };
}