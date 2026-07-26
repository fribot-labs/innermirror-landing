import type {
  RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

/**
 * Private Runtime 응답을 기다리는 동안 Landing에서 사용하는
 * 낙관적 Reflection 결과를 생성합니다.
 *
 * 이 시점에는 Recommendation Integration Pipeline이 아직
 * 실행되지 않았으므로 recommendationIntegration은 null입니다.
 */
export function createOptimisticReflectionResult(
  content: string
): RuntimeReflectionResult {
  return {
    contractVersion: "v1",

    reflectionId:
      `local_reflection_${Date.now()}`,

    summary: {
      text:
        createOptimisticSummary(content),

      confidence: 0.3,
    },

    pacing: {
      level: "medium",

      message:
        "Reflection recorded. Runtime is reading the current Reflection.",
    },

    nextQuestion: {
      question:
        "What part of this thought still feels unfinished?",

      reason:
        "Immediate optimistic response before private Runtime analysis completes.",
    },

    continuitySignal: {
      status: "forming",

      strength: 50,

      message:
        "Runtime is connecting this Reflection with earlier Reflection Memory.",

      relatedSummary:
        "Recently recorded Reflection",

      relatedTimeLabel:
        "Just now",

      bridgeKind:
        "weak-signal",

      longGapDays: 0,

      driftStrength:
        "none",

      driftDirection:
        "stable",

      driftFromLabel:
        "Previous perspective",

      driftToLabel:
        "Current perspective",
    },

    /**
     * null means the Recommendation Integration Pipeline has not yet
     * executed for this optimistic local result.
     *
     * This is different from a non-null Integration Result whose
     * diagnostics.status is "insufficient-data".
     */
    recommendationIntegration: null,
  };
}

function createOptimisticSummary(
  content: string
): string {
  const trimmed =
    content.trim();

  if (
    trimmed.length <= 72
  ) {
    return trimmed;
  }

  return `${trimmed.slice(0, 72)}...`;
}