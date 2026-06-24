import type {
    RuntimeBoundaryHealthResult,
} from "./runtimeBoundaryTypes";

import type {
    RuntimeUxModeResult,
} from "./runtimeUxModeTypes";

export function resolveRuntimeUxMode(params: {
  health: RuntimeBoundaryHealthResult | null;
  isChecking: boolean;
}): RuntimeUxModeResult {
  if (params.isChecking && params.health === null) {
    return {
      mode: "partial-runtime",
      reason: "runtime-checking",
      canUseFastReflection: true,
      canUseStreamingMerge: false,
      canUseMemoryTimeline: false,
      canUseContinuitySurfaces: false,
      message:
        "Runtime 상태를 확인하고 있습니다. 기본 reflection 입력은 사용할 수 있습니다.",
    };
  }

  if (params.health?.status === "healthy") {
    return {
      mode: "full-runtime",
      reason: "runtime-healthy",
      canUseFastReflection: true,
      canUseStreamingMerge: true,
      canUseMemoryTimeline: true,
      canUseContinuitySurfaces: true,
      message:
        "Runtime 기능을 모두 사용할 수 있습니다.",
    };
  }

  if (params.health?.status === "degraded") {
    return {
      mode: "partial-runtime",
      reason: "runtime-degraded",
      canUseFastReflection: true,
      canUseStreamingMerge: false,
      canUseMemoryTimeline: true,
      canUseContinuitySurfaces: true,
      message:
        "기본 reflection은 가능하지만 deep merge는 지연될 수 있습니다.",
    };
  }

  return {
    mode: "local-only",
    reason: "runtime-unavailable",
    canUseFastReflection: false,
    canUseStreamingMerge: false,
    canUseMemoryTimeline: false,
    canUseContinuitySurfaces: false,
    message:
      "지금은 로컬 기록 중심으로 사용할 수 있습니다. Runtime이 복구되면 깊은 분석을 다시 연결할 수 있습니다.",
  };
}