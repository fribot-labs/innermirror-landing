import type {
    RuntimeAdapterError,
} from "./runtimeAdapterErrors";

import type {
    RuntimeBoundaryHealthResult,
} from "./runtimeBoundaryTypes";

import type {
    RuntimeUxModeResult,
} from "./runtimeUxModeTypes";

import type {
    RuntimeFailureRecoveryState,
} from "./runtimeFailureRecoveryTypes";

export function resolveRuntimeFailureRecovery(params: {
  runtimeUxMode: RuntimeUxModeResult;
  runtimeBoundaryHealth: RuntimeBoundaryHealthResult | null;
  runtimeError: RuntimeAdapterError | null;
  timelineError: RuntimeAdapterError | null;
  isStreamingMergeActive: boolean;
  localPendingCount: number;
}): RuntimeFailureRecoveryState {
  if (
    params.runtimeUxMode.mode === "local-only"
  ) {
    return {
      visible:
        true,
      kind:
        "runtime-offline",
      severity:
        "warning",
      title:
        "Runtime 연결이 끊어졌습니다.",
      message:
        "지금은 로컬 기록 모드로 전환되어 있습니다.",
      reassurance:
        "기록은 브라우저에 유지됩니다. Runtime이 복구되면 깊은 분석은 나중에 연결됩니다.",
      action:
        "retry-runtime",
    };
  }

  if (
    params.runtimeUxMode.mode === "partial-runtime"
  ) {
    return {
      visible:
        true,
      kind:
        "runtime-degraded",
      severity:
        "info",
      title:
        "일부 runtime 기능이 지연되고 있습니다.",
      message:
        "기본 기록은 가능하지만 deep merge 또는 memory timeline이 늦어질 수 있습니다.",
      reassurance:
        "기록은 유지되었습니다. 깊은 분석은 나중에 연결됩니다.",
      action:
        "retry-runtime",
    };
  }

  if (
    params.runtimeError !== null
  ) {
    return {
      visible:
        true,
      kind:
        params.runtimeError.code === "RUNTIME_TIMEOUT"
          ? "fast-path-timeout"
          : "runtime-unknown-error",
      severity:
        params.runtimeError.code === "RUNTIME_TIMEOUT"
          ? "warning"
          : "danger",
      title:
        params.runtimeError.code === "RUNTIME_TIMEOUT"
          ? "Runtime 응답이 지연되고 있습니다."
          : "Runtime 처리 중 문제가 발생했습니다.",
      message:
        params.runtimeError.message,
      reassurance:
        "입력한 기록은 유지되었습니다. 깊은 분석은 나중에 다시 연결할 수 있습니다.",
      action:
        "retry-runtime",
    };
  }

  if (
    params.timelineError !== null
  ) {
    return {
      visible:
        true,
      kind:
        "memory-timeline-unavailable",
      severity:
        "info",
      title:
        "Memory timeline을 잠시 불러오지 못했습니다.",
      message:
        params.timelineError.message,
      reassurance:
        "reflection 기록 자체가 사라진 것은 아닙니다. Timeline 표시만 지연되고 있습니다.",
      action:
        "retry-timeline",
    };
  }

  if (
    params.isStreamingMergeActive
  ) {
    return {
      visible:
        true,
      kind:
        "deep-merge-delayed",
      severity:
        "info",
      title:
        "깊은 분석을 연결하고 있습니다.",
      message:
        "빠른 결과는 표시되었고, memory timeline과 continuity 연결을 확인하는 중입니다.",
      reassurance:
        "기록은 유지되었습니다. 깊은 분석은 도착하는 대로 연결됩니다.",
      action:
        "none",
    };
  }

  if (
    params.localPendingCount > 0 &&
    params.runtimeUxMode.mode === "full-runtime"
  ) {
    return {
      visible:
        true,
      kind:
        "deep-merge-delayed",
      severity:
        "info",
      title:
        "동기화 대기 기록이 있습니다.",
      message:
        `${params.localPendingCount}개의 로컬 reflection이 runtime memory 연결을 기다리고 있습니다.`,
      reassurance:
        "기록은 유지되었습니다. Runtime 연결 상태가 안정되면 깊은 분석과 함께 연결됩니다.",
      action:
        "sync-local",
    };
  }

  return {
    visible:
      false,
    kind:
      "none",
    severity:
      "info",
    title:
      "",
    message:
      "",
    reassurance:
      "",
    action:
      "none",
  };
}