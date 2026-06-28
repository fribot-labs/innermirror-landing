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

  const isReturningTheme =
    strength >= 70 ||
    message.toLowerCase().includes("continuity") ||
    message.toLowerCase().includes("pattern") ||
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
    title: "이 주제는 다시 돌아온 흐름입니다.",
    message:
      "지금의 reflection은 단절된 생각이 아니라, 이전에도 반복해서 나타난 관심사와 이어져 있습니다.",
    themeLabel:
      createThemeLabel(result.summary.text),
    occurrenceLabel:
      "반복 감지됨",
    emotionalCue:
      "서두르지 말고, 이 주제가 왜 다시 나타났는지 살펴보세요.",
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
    return "되돌아온 생각";
  }

  if (normalized.length <= 24) {
    return normalized;
  }

  return `${normalized.slice(0, 24)}...`;
}