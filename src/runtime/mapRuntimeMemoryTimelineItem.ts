import type {
  RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

import type {
  RuntimeMemoryFlowState,
  RuntimeMemoryTimelineItem,
} from "../types/runtimeMemoryTimeline";

export function mapRuntimeMemoryTimelineItem(
  result: RuntimeReflectionResult
): RuntimeMemoryTimelineItem {
  return {
    id:
      result.reflectionId,

    summary:
      createSummary(
        result.summary.text
      ),

    createdAt:
      new Date().toISOString(),

    timeLabel:
      "Just now",

    flowState:
      createFlowState(
        result.continuitySignal.strength,
        result.continuitySignal
          .driftDirection
      ),

    topicLabel:
      createTopicLabel(
        result.summary.text
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

function createFlowState(
  strength: number,
  driftDirection:
    | "stable"
    | "branching"
    | "fragmenting"
    | "resetting"
    | undefined
): RuntimeMemoryFlowState {
  if (driftDirection === "branching") {
    return "branching";
  }

  if (strength >= 85) {
    return "deepening";
  }

  if (strength >= 70) {
    return "returning";
  }

  if (strength >= 50) {
    return "forming";
  }

  return "stable";
}

function createTopicLabel(
  summary: string
): string {
  const trimmed =
    summary.trim();

  if (trimmed.length === 0) {
    return "Reflection";
  }

  if (trimmed.length <= 18) {
    return trimmed;
  }

  return `${trimmed.slice(0, 18)}...`;
}