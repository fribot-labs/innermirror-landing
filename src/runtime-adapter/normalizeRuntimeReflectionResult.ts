import {
    cloneRuntimeRecommendationIntegrationResult,
} from "../runtime-recommendation-integration/createRuntimeRecommendationIntegrationResult";

import type {
    RuntimeReflectionResult,
    RuntimeReflectionTransportResult,
} from "./runtimeAdapterTypes";

/* ------------------------------------------------------------------ */
/* Runtime Reflection Result Normalization */
/* ------------------------------------------------------------------ */

/**
 * Private Runtime에서 수신한 Transport Result를 Landing 내부에서
 * 사용하는 정규화된 RuntimeReflectionResult로 변환합니다.
 *
 * Transport 계층에서는 이전 Runtime 서버와의 호환성을 위해
 * recommendationIntegration이 생략될 수 있습니다.
 *
 * Landing 내부 결과에서는 해당 필드가 항상 존재합니다.
 *
 * 상태 의미:
 *
 * - undefined:
 *   이전 Runtime 계약 또는 아직 Recommendation Integration 필드를
 *   제공하지 않는 Runtime 서버 응답
 *
 * - null:
 *   Recommendation Integration Pipeline이 실행되지 않음
 *
 * - non-null:
 *   Recommendation Integration Pipeline이 실행되어 결과를 반환함
 *
 * non-null Integration Result의 diagnostics.status가
 * "insufficient-data"인 경우에는 Pipeline은 실행되었지만 분석 증거가
 * 부족했다는 의미입니다.
 */
export function normalizeRuntimeReflectionResult(
  result: RuntimeReflectionTransportResult
): RuntimeReflectionResult {
  return {
    contractVersion:
      result.contractVersion,

    reflectionId:
      result.reflectionId,

    summary: {
      ...result.summary,
    },

    pacing: {
      ...result.pacing,
    },

    nextQuestion: {
      ...result.nextQuestion,
    },

    continuitySignal:
      normalizeRuntimeContinuitySignal(
        result.continuitySignal
      ),

    recommendationIntegration:
      result.recommendationIntegration == null
        ? null
        : cloneRuntimeRecommendationIntegrationResult(
            result.recommendationIntegration
          ),
  };
}

/* ------------------------------------------------------------------ */
/* Continuity Signal Normalization */
/* ------------------------------------------------------------------ */

/**
 * 기존 Runtime Adapter가 제공하던 Continuity Signal 기본값을
 * 유지합니다.
 *
 * Recommendation Integration 확장이 기존 Landing 표시 동작을
 * 변경하지 않도록 기존 정규화 규칙을 이 모듈로 그대로 이동합니다.
 */
function normalizeRuntimeContinuitySignal(
  continuitySignal:
    RuntimeReflectionTransportResult[
      "continuitySignal"
    ]
): RuntimeReflectionResult[
  "continuitySignal"
] {
  return {
    ...continuitySignal,

    relatedSummary:
      continuitySignal.relatedSummary ??
      "A similar Reflection flow appeared earlier.",

    relatedTimeLabel:
      continuitySignal.relatedTimeLabel ??
      "Recent flow",

    bridgeKind:
      continuitySignal.bridgeKind ??
      "weak-signal",

    longGapDays:
      continuitySignal.longGapDays ??
      0,

    driftStrength:
      continuitySignal.driftStrength ??
      "none",

    driftDirection:
      continuitySignal.driftDirection ??
      "stable",

    driftFromLabel:
      normalizeDriftDisplayLabel(
        continuitySignal.driftFromLabel,
        "Previous thought flow"
      ),

    driftToLabel:
      normalizeDriftDisplayLabel(
        continuitySignal.driftToLabel,
        "Current thought flow"
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Drift Display Label Normalization */
/* ------------------------------------------------------------------ */

/**
 * 과거 Runtime 응답에서 한국어 기본 라벨이 전달될 수 있으므로
 * Landing 표시용 영문 라벨로 정규화합니다.
 */
function normalizeDriftDisplayLabel(
  value: string | undefined,
  fallback: string
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return fallback;
  }

  const normalizedValue =
    value.trim();

  if (
    normalizedValue ===
    "기존 생각 흐름"
  ) {
    return "Previous thought flow";
  }

  if (
    normalizedValue ===
    "현재 생각 흐름"
  ) {
    return "Current thought flow";
  }

  return normalizedValue;
}