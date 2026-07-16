import type {
  RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

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

      driftStrength: "none",
      driftDirection: "stable",
      driftFromLabel:
        "Previous perspective",
      driftToLabel:
        "Current perspective",
    },
  };
}

function createOptimisticSummary(
  content: string
): string {
  const trimmed =
    content.trim();

  if (trimmed.length <= 72) {
    return trimmed;
  }

  return `${trimmed.slice(0, 72)}...`;
}