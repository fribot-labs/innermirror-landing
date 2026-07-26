import type {
    RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

import {
    createRuntimeRecommendationPresentation,
} from "./runtimeRecommendationPresentation";

import type {
    RuntimeRecommendationPresentation,
} from "./runtimeRecommendationPresentation";

/**
 * 정규화된 Runtime Reflection Result에서
 * Recommendation Presentation을 파생합니다.
 *
 * Runtime 결과가 없거나 Recommendation Integration Pipeline이
 * 실행되지 않은 경우 null을 반환합니다.
 *
 * 이 함수는 Runtime 결과를 변경하지 않으며,
 * Presentation을 별도 상태로 저장하지 않습니다.
 */
export function deriveRuntimeRecommendationPresentation(
  result:
    RuntimeReflectionResult | null
): RuntimeRecommendationPresentation | null {
  const recommendationIntegration =
    result?.recommendationIntegration;

  if (
    recommendationIntegration ===
      undefined ||
    recommendationIntegration === null
  ) {
    return null;
  }

  return createRuntimeRecommendationPresentation(
    recommendationIntegration
  );
}