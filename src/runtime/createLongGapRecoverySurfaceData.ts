import type {
    RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

import type {
    LongGapRecoverySurfaceData,
} from "../types/runtimeLongGapRecovery";

export function createLongGapRecoverySurfaceData(
  result: RuntimeReflectionResult | null
): LongGapRecoverySurfaceData {
  if (result === null) {
    return createHiddenLongGapRecoverySurfaceData();
  }

  const continuity =
    result.continuitySignal;

  const gapDays =
    continuity.longGapDays ?? 0;

  const hasLongGap =
    gapDays >= 60 ||
    continuity.bridgeKind === "long-gap";

  if (!hasLongGap) {
    return createHiddenLongGapRecoverySurfaceData();
  }

  return {
    visible: true,

    title:
      createLongGapTitle(gapDays),

    message:
      "지금의 reflection은 잠시 끊어진 듯 보였던 오래전 흐름과 다시 연결되고 있습니다.",

    timeGapLabel:
      createTimeGapLabel(gapDays),

    recoveredTheme:
      continuity.relatedSummary ??
      "오래전에도 비슷한 생각의 흐름이 있었습니다.",

    previousReflectionSummary:
      continuity.relatedSummary ??
      "이전에 남겨둔 reflection 흐름",

    recoveryCue:
      "바로 결론내리지 말고, 왜 이 흐름이 다시 돌아왔는지 천천히 살펴보세요.",

    gapKind:
      createGapKind(gapDays),
  };
}

function createHiddenLongGapRecoverySurfaceData():
  LongGapRecoverySurfaceData {
  return {
    visible: false,
    title: "",
    message: "",
  };
}

function createLongGapTitle(
  gapDays: number
): string {
  if (gapDays >= 90) {
    return "3개월 전 흐름과 다시 연결됩니다.";
  }

  if (gapDays >= 60) {
    return "두 달 전 흐름과 다시 연결됩니다.";
  }

  return "오래전 흐름과 다시 연결됩니다.";
}

function createTimeGapLabel(
  gapDays: number
): string {
  if (gapDays >= 90) {
    return "약 3개월 전";
  }

  if (gapDays >= 60) {
    return "약 2개월 전";
  }

  return "오래전 흐름";
}

function createGapKind(
  gapDays: number
): LongGapRecoverySurfaceData["gapKind"] {
  if (gapDays >= 90) {
    return "quarter";
  }

  if (gapDays >= 60) {
    return "months";
  }

  if (gapDays >= 14) {
    return "weeks";
  }

  return "unknown";
}