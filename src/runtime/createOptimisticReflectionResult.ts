import type {
    RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

export function createOptimisticReflectionResult(
  content: string
): RuntimeReflectionResult {
  const now =
    new Date().toISOString();

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
        "생각을 기록했습니다. 지금 흐름을 읽고 있습니다.",
    },

    nextQuestion: {
      question:
        "이 생각에서 아직 끝나지 않은 부분은 무엇인가요?",
      reason:
        "Immediate optimistic response before private runtime analysis completes.",
    },

    continuitySignal: {
      status: "forming",
      strength: 50,
      message:
        "이 흐름을 이전 reflection과 연결하고 있습니다.",

      relatedSummary:
        "방금 기록된 reflection 흐름",

      relatedTimeLabel:
        "방금 전",

      bridgeKind:
        "weak-signal",

      longGapDays: 0,

      driftStrength: "none",
      driftDirection: "stable",
      driftFromLabel: "기존 생각 흐름",
      driftToLabel: "현재 생각 흐름",
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