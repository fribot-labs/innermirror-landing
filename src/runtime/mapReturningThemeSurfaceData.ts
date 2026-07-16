import type {
  RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

import type {
  ReturningThemeSurfaceData,
} from "../types/runtimeReturningTheme";

export function mapReturningThemeSurfaceData(
  result: RuntimeReflectionResult | null
): ReturningThemeSurfaceData {
  if (result === null) {
    return {
      visible: false,
      title: "",
      message: "",
    };
  }

  const continuity =
    result.continuitySignal;

  const strength =
    continuity.strength ?? 0;

  const message =
    continuity.message ?? "";

  const normalizedMessage =
    message.toLowerCase();

  const isReturningTheme =
    strength >= 70 ||
    normalizedMessage.includes("continuity") ||
    normalizedMessage.includes("pattern") ||
    normalizedMessage.includes("recurring") ||
    normalizedMessage.includes("returning") ||
    message.includes("반복") ||
    message.includes("흐름");

  if (!isReturningTheme) {
    return {
      visible: false,
      title: "",
      message: "",
    };
  }

  return {
    visible: true,
    title:
      "This theme is returning.",
    message:
      "The current Reflection is connected to an interest that has appeared before.",
    themeLabel:
      createThemeLabel(result.summary.text),
    occurrenceLabel:
      "Recurring pattern detected",
    emotionalCue:
      "Pause and consider why this theme has returned.",
    strength:
      strength >= 85
        ? "strong"
        : strength >= 70
          ? "emerging"
          : "weak",
  };
}

function createThemeLabel(
  summaryText: string
): string {
  const normalized =
    summaryText.trim();

  if (normalized.length === 0) {
    return "Returning thought";
  }

  if (normalized.length <= 24) {
    return normalized;
  }

  return `${normalized.slice(0, 24)}...`;
}