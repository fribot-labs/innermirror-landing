import type {
    RuntimeMemoryTimelineItem,
    RuntimeStreamingMergeEvent,
    RuntimeStreamingMergeStage,
} from "../types/runtimeStreamingMerge";

export function createRuntimeStreamingMergeEvent(
  stage: RuntimeStreamingMergeStage,
  item?: RuntimeMemoryTimelineItem
): RuntimeStreamingMergeEvent {
  if (stage === "recorded") {
    return createEvent(
      stage,
      "생각을 기록했습니다.",
      "InnerMirror가 입력한 reflection을 즉시 받아들였습니다."
    );
  }

  if (stage === "fast-result") {
    return createEvent(
      stage,
      "빠른 분석 결과를 받았습니다.",
      "summary와 next question이 먼저 도착했습니다."
    );
  }

  if (stage === "memory-query") {
    return createEvent(
      stage,
      "기억 흐름을 확인하고 있습니다.",
      "최근 reflection memory와 현재 생각을 비교하고 있습니다."
    );
  }

  if (
    stage === "continuity-merged" &&
    item
  ) {
    return createContinuityMergedEvent(
      item
    );
  }

  if (stage === "completed") {
    return createEvent(
      stage,
      "분석 흐름이 정리되었습니다.",
      "현재 reflection과 memory timeline이 함께 갱신되었습니다."
    );
  }

  if (stage === "failed") {
    return createEvent(
      stage,
      "깊은 연결 확인은 지연되고 있습니다.",
      "기록은 유지되었고, 기본 reflection 결과는 사용할 수 있습니다."
    );
  }

  return createEvent(
    "idle",
    "",
    ""
  );
}

function createContinuityMergedEvent(
  item: RuntimeMemoryTimelineItem
): RuntimeStreamingMergeEvent {
  if (item.continuityStatus === "returning") {
    return createEvent(
      "continuity-merged",
      "반복 주제가 감지되었습니다.",
      `"${item.continuityLabel}" 흐름으로 이전 reflection과 이어집니다.`
    );
  }

  if (item.continuityStatus === "deepening") {
    return createEvent(
      "continuity-merged",
      "생각이 더 깊어지고 있습니다.",
      `"${item.continuityLabel}" 상태로 이전 흐름 위에 쌓이고 있습니다.`
    );
  }

  if (item.continuityStatus === "branching") {
    return createEvent(
      "continuity-merged",
      "새 방향이 열리고 있습니다.",
      `"${item.continuityLabel}" 흐름으로 기존 생각에서 갈라지고 있습니다.`
    );
  }

  if (item.continuityStatus === "recovering") {
    return createEvent(
      "continuity-merged",
      "오래전 흐름과 다시 연결되었습니다.",
      `"${item.continuityLabel}" 흐름이 복구되었습니다.`
    );
  }

  if (item.continuityStatus === "drifting") {
    return createEvent(
      "continuity-merged",
      "생각 방향이 이동하고 있습니다.",
      `"${item.continuityLabel}" 흐름으로 이전과 다른 방향이 나타났습니다.`
    );
  }

  return createEvent(
    "continuity-merged",
    "기억 흐름이 갱신되었습니다.",
    "현재 reflection이 memory timeline에 반영되었습니다."
  );
}

function createEvent(
  stage: RuntimeStreamingMergeStage,
  title: string,
  message: string
): RuntimeStreamingMergeEvent {
  return {
    stage,
    title,
    message,
    createdAt:
      new Date().toISOString(),
  };
}