import type {
  RuntimeMemoryTimelineRecord,
  RuntimeStreamingMergeEvent,
  RuntimeStreamingMergeStage,
} from "../types/runtimeStreamingMerge";

import {
  RUNTIME_TERMINOLOGY,
} from "../constants/runtimeTerminology";

export function createRuntimeStreamingMergeEvent(
  stage: RuntimeStreamingMergeStage,
  item?: RuntimeMemoryTimelineRecord
): RuntimeStreamingMergeEvent {
  if (stage === "recorded") {
    return createEvent(
      stage,
      "Reflection recorded.",
      "InnerMirror accepted the current Reflection."
    );
  }

  if (stage === "fast-result") {
    return createEvent(
      stage,
      "Fast analysis received.",
      "The summary and next question arrived first."
    );
  }

  if (stage === "memory-query") {
    return createEvent(
      stage,
      "Reviewing Reflection Memory.",
      "Runtime is comparing recent Reflection memory with the current thought."
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
      "Analysis completed.",
      "The current Reflection has been stored in Reflection Memory."
    );
  }

  if (stage === "failed") {
    return createEvent(
      stage,
      "Deep continuity analysis is delayed.",
      "The Reflection remains saved, and the basic result is still available."
    );
  }

  return createEvent(
    "idle",
    "",
    ""
  );
}

function createContinuityMergedEvent(
  item: RuntimeMemoryTimelineRecord
): RuntimeStreamingMergeEvent {
  const continuityLabel =
    normalizeContinuityLabel(
      item.continuityLabel,
      item.continuityStatus
    );
  if (item.continuityStatus === "returning") {
    return createEvent(
      "continuity-merged",
      "A recurring theme was detected.",
      `"${continuityLabel}" connects this Reflection with an earlier flow.`
    );
  }

  if (item.continuityStatus === "deepening") {
    return createEvent(
      "continuity-merged",
      "The thought is becoming deeper.",
      `"${continuityLabel}" is building on the earlier flow.`
    );
  }

  if (item.continuityStatus === "branching") {
    return createEvent(
      "continuity-merged",
      "A new direction is emerging.",
      `"${continuityLabel}" is branching from the earlier thought flow.`
    );
  }

  if (item.continuityStatus === "recovering") {
    return createEvent(
      "continuity-merged",
      "An earlier flow has been restored.",
      `"${continuityLabel}" has reconnected with a past Reflection flow.`
    );
  }

  if (item.continuityStatus === "drifting") {
    return createEvent(
      "continuity-merged",
      "The thought direction is shifting.",
      `"${continuityLabel}" indicates movement away from the earlier flow.`
    );
  }

  return createEvent(
    "continuity-merged",
    `${RUNTIME_TERMINOLOGY.reflectionMemory} updated.`,
    `The current Reflection is now available in the ${RUNTIME_TERMINOLOGY.memoryTimeline}.`
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

function normalizeContinuityLabel(
  value: string | undefined,
  status: string | undefined
): string {
  if (!value) {
    return formatContinuityStatus(status);
  }

  const normalizedValue =
    value.trim().toLowerCase();

  if (
    value === "깊어지는 흐름" ||
    normalizedValue === "deepening flow"
  ) {
    return "Deepening";
  }

  if (
    value === "반복되는 흐름" ||
    value === "되돌아온 흐름" ||
    normalizedValue === "returning flow"
  ) {
    return "Returning";
  }

  if (
    value === "새로운 분기" ||
    value === "갈라지는 흐름" ||
    normalizedValue === "branching flow"
  ) {
    return "Branching";
  }

  if (
    value === "형성되는 흐름" ||
    normalizedValue === "forming flow"
  ) {
    return "Forming";
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

function formatContinuityStatus(
  value: string | undefined
): string {
  if (!value) {
    return "Current continuity";
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