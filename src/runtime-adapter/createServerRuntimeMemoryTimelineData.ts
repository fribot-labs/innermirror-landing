import type {
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
      title: "기억 흐름",
      subtitle:
        "아직 runtime memory timeline에 저장된 reflection이 없습니다.",
      items: [],
    };
  }

  return {
    visible: true,
    title: "기억 흐름",
    subtitle:
      "Runtime memory에 저장된 reflection 흐름입니다.",
    items:
      timeline.items.map((item) => ({
        id:
          item.id,
        summary:
          item.summaryText ??
          item.content,
        createdAt:
          item.createdAt,
        timeLabel:
          item.timeLabel,
        continuityLabel:
          item.continuityLabel,
        themeLabel:
          item.continuityStatus,
        driftLabel:
          item.source,
      })),
  };
}