import type {
    RuntimeRecommendationQualityPolicy,
} from "./runtimeRecommendationQualityTypes";

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Quality Analysis의 기본 정책입니다.
 *
 * PR-046A에서는 Recommendation History를 해석하는 기준으로만 사용됩니다.
 *
 * Candidate 점수 변경은 아직 수행하지 않습니다.
 */
export const DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY: RuntimeRecommendationQualityPolicy =
{
  /**
   * History가 3회 이상 누적되면
   * developing confidence로 간주합니다.
   */
  minimumOccurrencesForDevelopingConfidence:
    3,

  /**
   * 충분히 안정적인 History가 누적되었다고 판단하는 기준입니다.
   */
  minimumOccurrencesForEstablishedConfidence:
    6,

  /**
   * effective outcome으로 판단하는 최소 완료율
   */
  effectiveCompletionRateThreshold:
    0.60,

  /**
   * Recommendation이 자주 교체되었다고 판단하는 기준
   */
  unstableSupersededRateThreshold:
    0.50,

  /**
   * unresolved 패턴으로 판단하는 최소 비율
   */
  unresolvedRateThreshold:
    0.50,

  /**
   * Recommendation 반복을 의미 있는 신호로 인정하는 최소 횟수
   */
  repeatedOccurrenceThreshold:
    2,

  /**
   * Recommendation 위치까지 이동했지만 완료되지 않은
   * 패턴을 인정하는 최소 occurrence 수
   */
  visitedWithoutCompletionThreshold:
    2,
};

/* ------------------------------------------------------------------ */
/* Conservative Policy */
/* ------------------------------------------------------------------ */

/**
 * Recommendation을 쉽게 평가하지 않는 보수적인 정책입니다.
 *
 * History가 충분히 누적될 때까지
 * 대부분의 Recommendation을
 * mixed 또는 insufficient-history로 유지합니다.
 *
 * 초기 MVP 테스트에 적합합니다.
 */
export const CONSERVATIVE_RUNTIME_RECOMMENDATION_QUALITY_POLICY: RuntimeRecommendationQualityPolicy =
{
  minimumOccurrencesForDevelopingConfidence:
    5,

  minimumOccurrencesForEstablishedConfidence:
    10,

  effectiveCompletionRateThreshold:
    0.70,

  unstableSupersededRateThreshold:
    0.60,

  unresolvedRateThreshold:
    0.60,

  repeatedOccurrenceThreshold:
    3,

  visitedWithoutCompletionThreshold:
    3,
};

/* ------------------------------------------------------------------ */
/* Exploratory Policy */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution 실험용 정책입니다.
 *
 * History가 적어도
 * Recommendation 품질을 적극적으로 분석합니다.
 *
 * PR-046A Diagnostics 비교 테스트에서 사용할 수 있습니다.
 */
export const EXPLORATORY_RUNTIME_RECOMMENDATION_QUALITY_POLICY: RuntimeRecommendationQualityPolicy =
{
  minimumOccurrencesForDevelopingConfidence:
    2,

  minimumOccurrencesForEstablishedConfidence:
    4,

  effectiveCompletionRateThreshold:
    0.50,

  unstableSupersededRateThreshold:
    0.40,

  unresolvedRateThreshold:
    0.40,

  repeatedOccurrenceThreshold:
    2,

  visitedWithoutCompletionThreshold:
    1,
};

/* ------------------------------------------------------------------ */
/* Policy Collection */
/* ------------------------------------------------------------------ */

/**
 * Runtime에서 사용할 수 있는 Policy 집합입니다.
 *
 * 현재는 내부 테스트 용도로만 사용됩니다.
 */
export const RUNTIME_RECOMMENDATION_QUALITY_POLICIES = {
  default:
    DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY,

  conservative:
    CONSERVATIVE_RUNTIME_RECOMMENDATION_QUALITY_POLICY,

  exploratory:
    EXPLORATORY_RUNTIME_RECOMMENDATION_QUALITY_POLICY,
} as const;

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Quality Policy를 복사하여 반환합니다.
 *
 * Builder가 Policy 객체를 직접 수정하지 않도록 합니다.
 */
export function cloneRuntimeRecommendationQualityPolicy(
  policy: RuntimeRecommendationQualityPolicy
): RuntimeRecommendationQualityPolicy {
  return {
    ...policy,
  };
}

/**
 * Runtime 기본 Policy를 반환합니다.
 */
export function createDefaultRuntimeRecommendationQualityPolicy():
  RuntimeRecommendationQualityPolicy {
  return cloneRuntimeRecommendationQualityPolicy(
    DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
  );
}