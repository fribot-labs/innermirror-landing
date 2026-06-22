import type {
    RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

import type {
    IdentityDriftSurfaceData,
} from "../types/runtimeIdentityDrift";

export function createIdentityDriftSurfaceData(
  result: RuntimeReflectionResult | null
): IdentityDriftSurfaceData {
  if (result === null) {
    return createHiddenIdentityDriftSurfaceData();
  }

  const continuity =
    result.continuitySignal;

  const driftStrength =
    continuity.driftStrength ?? "none";

  const driftDirection =
    continuity.driftDirection ?? "stable";

  const shouldShow =
    driftStrength === "minor" ||
    driftStrength === "moderate" ||
    driftStrength === "strong" ||
    driftDirection === "branching" ||
    driftDirection === "fragmenting" ||
    driftDirection === "resetting";

  if (!shouldShow) {
    return createHiddenIdentityDriftSurfaceData();
  }

  return {
    visible: true,

    title:
      createIdentityDriftTitle(
        driftStrength,
        driftDirection
      ),

    message:
      createIdentityDriftMessage(
        driftStrength,
        driftDirection
      ),

    driftLabel:
      createDriftLabel(
        driftStrength,
        driftDirection
      ),

    fromLabel:
      continuity.driftFromLabel ??
      "기존 생각 흐름",

    toLabel:
      continuity.driftToLabel ??
      createDefaultToLabel(
        driftDirection
      ),

    driftCue:
      createDriftCue(
        driftDirection
      ),

    driftStrength:
      normalizeDriftStrength(
        driftStrength
      ),

    driftDirection:
      normalizeDriftDirection(
        driftDirection
      ),
  };
}

function createHiddenIdentityDriftSurfaceData():
  IdentityDriftSurfaceData {
  return {
    visible: false,
    title: "",
    message: "",
  };
}

function createIdentityDriftTitle(
  driftStrength: string,
  driftDirection: string
): string {
  if (driftDirection === "branching") {
    return "생각이 새로운 방향으로 갈라지고 있습니다.";
  }

  if (driftDirection === "fragmenting") {
    return "생각 흐름이 여러 방향으로 흩어지고 있습니다.";
  }

  if (driftDirection === "resetting") {
    return "기존 흐름을 다시 정리하려는 움직임이 보입니다.";
  }

  if (
    driftStrength === "moderate" ||
    driftStrength === "strong"
  ) {
    return "생각 방향이 바뀌고 있습니다.";
  }

  return "생각 방향에 작은 변화가 보입니다.";
}

function createIdentityDriftMessage(
  driftStrength: string,
  driftDirection: string
): string {
  if (driftDirection === "branching") {
    return "이 reflection은 이전 흐름을 유지하면서도, 새로운 판단 방향을 함께 열고 있습니다.";
  }

  if (driftDirection === "fragmenting") {
    return "지금은 하나의 결론보다 여러 가능성이 동시에 나타나는 상태로 보입니다.";
  }

  if (driftDirection === "resetting") {
    return "이전 방향을 그대로 이어가기보다, 다시 정리하고 새 기준을 찾으려는 흐름이 보입니다.";
  }

  if (
    driftStrength === "moderate" ||
    driftStrength === "strong"
  ) {
    return "이전 reflection 흐름과 이어져 있지만, 현재의 판단 방향은 조금 달라지고 있습니다.";
  }

  return "이전 흐름과 연결되어 있지만, 지금의 관점에는 작은 변화가 담겨 있습니다.";
}

function createDriftLabel(
  driftStrength: string,
  driftDirection: string
): string {
  if (driftDirection === "branching") {
    return "새 방향 분기";
  }

  if (driftDirection === "fragmenting") {
    return "흐름 분산";
  }

  if (driftDirection === "resetting") {
    return "기준 재정리";
  }

  if (driftStrength === "strong") {
    return "강한 방향 변화";
  }

  if (driftStrength === "moderate") {
    return "중간 정도 변화";
  }

  return "작은 변화";
}

function createDefaultToLabel(
  driftDirection: string
): string {
  if (driftDirection === "branching") {
    return "새로운 가능성";
  }

  if (driftDirection === "fragmenting") {
    return "여러 갈래 흐름";
  }

  if (driftDirection === "resetting") {
    return "재정리된 기준";
  }

  return "달라진 관점";
}

function createDriftCue(
  driftDirection: string
): string {
  if (driftDirection === "fragmenting") {
    return "지금은 하나로 결론내리기보다, 흩어진 방향을 먼저 바라보는 것이 좋습니다.";
  }

  if (driftDirection === "resetting") {
    return "기존 판단을 버리는 것이 아니라, 새 기준을 세우는 과정일 수 있습니다.";
  }

  if (driftDirection === "branching") {
    return "새 방향이 나타났다면, 기존 흐름과 무엇이 달라졌는지 천천히 비교해보세요.";
  }

  return "방향 변화가 보일 때는 서두르지 말고, 이전의 나와 현재의 나를 함께 바라보세요.";
}

function normalizeDriftStrength(
  value: string
): IdentityDriftSurfaceData["driftStrength"] {
  if (
    value === "moderate" ||
    value === "strong"
  ) {
    return value;
  }

  return "minor";
}

function normalizeDriftDirection(
  value: string
): IdentityDriftSurfaceData["driftDirection"] {
  if (
    value === "branching" ||
    value === "fragmenting" ||
    value === "resetting"
  ) {
    return value;
  }

  return "stable";
}