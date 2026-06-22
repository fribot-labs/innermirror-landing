import type {
    RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

import type {
    RuntimeMemoryTimelineItem,
} from "../types/runtimeMemoryTimeline";

export function createRuntimeMemoryTimelineItem(
  result: RuntimeReflectionResult
): RuntimeMemoryTimelineItem {
  return {
    id:
      result.reflectionId,
    summary:
      createSummary(result.summary.text),
    createdAt:
      new Date().toISOString(),
    timeLabel:
      "방금 전",

    continuityLabel:
      createContinuityLabel(
        result.continuitySignal.strength
      ),

    themeLabel:
      createThemeLabel(
        result.summary.text
      ),

    driftLabel:
      createDriftLabel(
        result.continuitySignal
          .driftDirection
      ),
  };
}

function createSummary(
  value: string
): string {
  const trimmed =
    value.trim();

  if (trimmed.length <= 42) {
    return trimmed;
  }

  return `${trimmed.slice(0, 42)}...`;
}

function createContinuityLabel(
  strength: number
): string {
  if (strength >= 80) {
    return "강한 연결";
  }

  if (strength >= 60) {
    return "이어지는 흐름";
  }

  return "새로운 생각";
}

function createThemeLabel(
  summary: string
): string {
  const trimmed =
    summary.trim();

  if (trimmed.length === 0) {
    return "reflection";
  }

  if (trimmed.length <= 18) {
    return trimmed;
  }

  return `${trimmed.slice(0, 18)}...`;
}

function createDriftLabel(
  driftDirection:
    | "stable"
    | "branching"
    | "fragmenting"
    | "resetting"
    | undefined
): string | undefined {
  if (driftDirection === "branching") {
    return "방향 분기";
  }

  if (driftDirection === "fragmenting") {
    return "흐름 분산";
  }

  if (driftDirection === "resetting") {
    return "기준 재정리";
  }

  return undefined;
}