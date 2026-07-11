import type {
  RuntimeMemoryFlowState,
  RuntimeMemoryTimelineData,
} from "../types/runtimeMemoryTimeline";

import type {
  RuntimeMemoryTimelineResponse,
} from "../types/runtimeStreamingMerge";

type ServerRuntimeMemoryTimelineResult =
  NonNullable<RuntimeMemoryTimelineResponse["result"]>;

export function createServerRuntimeMemoryTimelineData(
  timeline: ServerRuntimeMemoryTimelineResult | null
): RuntimeMemoryTimelineData {
  if (
    timeline === null ||
    timeline.items.length === 0
  ) {
    return {
      visible: false,
      title: "Memory Flow",
      subtitle:
        "No reflections have been stored in Runtime memory yet.",
      items: [],
    };
  }

  return {
    visible: true,
    title: "Memory Flow",
    subtitle:
      "Reflection history stored in Runtime memory.",
    items: timeline.items.map((item) => ({
      id: item.id,

      summary:
        item.summaryText ??
        item.content,

      createdAt:
        item.createdAt,

      timeLabel:
        item.timeLabel,

      flowState:
        normalizeFlowState(
          item.continuityStatus
        ),

      topicLabel:
        formatTopicLabel(item.source),
    })),
  };
}

function normalizeFlowState(
  value: string | undefined
): RuntimeMemoryFlowState | undefined {
  if (value === "forming") {
    return "forming";
  }

  if (value === "deepening") {
    return "deepening";
  }

  if (value === "branching") {
    return "branching";
  }

  if (value === "returning") {
    return "returning";
  }

  if (value === "stable") {
    return "stable";
  }

  return undefined;
}

function formatTopicLabel(
  value: string | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}