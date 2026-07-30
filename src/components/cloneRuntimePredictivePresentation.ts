import type {
    RuntimePredictiveConfidence,
    RuntimePredictiveInsight,
    RuntimePredictivePresentation,
    RuntimePredictivePrimaryItem,
} from "./runtimePredictivePresentationTypes";

/* ------------------------------------------------------------------ */
/* Runtime Predictive Presentation Clone                              */
/* ------------------------------------------------------------------ */

/**
 * RuntimePredictivePresentation의 독립적인 복사본을 생성합니다.
 *
 * Presentation 객체는 React UI, Context Provider, 테스트 Fixture 등
 * 여러 소비 계층으로 전달될 수 있습니다.
 *
 * 따라서 원본 객체와 다음 중첩 값의 참조를 공유하지 않도록
 * 명시적으로 복제합니다.
 *
 * - statePrediction
 * - strategyPrediction
 * - decisionPrediction
 * - risk
 * - opportunity
 * - confidence
 * - evidence
 * - warnings
 *
 * 문자열과 숫자는 불변 원시값이므로 그대로 재사용합니다.
 */
export function cloneRuntimePredictivePresentation(
  source:
    RuntimePredictivePresentation,
): RuntimePredictivePresentation {
  return {
    status:
      source.status,

    headline:
      source.headline,

    summary:
      source.summary,

    primaryPrediction:
      source.primaryPrediction,

    statePrediction:
      cloneRuntimePredictivePrimaryItem(
        source.statePrediction,
      ),

    strategyPrediction:
      cloneRuntimePredictivePrimaryItem(
        source.strategyPrediction,
      ),

    decisionPrediction:
      cloneRuntimePredictivePrimaryItem(
        source.decisionPrediction,
      ),

    risk:
      cloneRuntimePredictiveInsight(
        source.risk,
      ),

    opportunity:
      cloneRuntimePredictiveInsight(
        source.opportunity,
      ),

    confidence:
      cloneRuntimePredictiveConfidence(
        source.confidence,
      ),

    evidence: [
      ...source.evidence,
    ],

    warnings: [
      ...source.warnings,
    ],

    predictedAt:
      source.predictedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Predictive Primary Item Clone                              */
/* ------------------------------------------------------------------ */

/**
 * nullable RuntimePredictivePrimaryItem을 복제합니다.
 *
 * 입력값이 null이면 null을 그대로 반환합니다.
 */
export function cloneRuntimePredictivePrimaryItem(
  source:
    RuntimePredictivePrimaryItem | null,
): RuntimePredictivePrimaryItem | null {
  if (
    source ===
    null
  ) {
    return null;
  }

  return {
    label:
      source.label,

    value:
      source.value,

    confidence:
      source.confidence,
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Predictive Insight Clone                                   */
/* ------------------------------------------------------------------ */

/**
 * nullable RuntimePredictiveInsight를 복제합니다.
 *
 * Risk와 Opportunity가 동일한 Presentation 구조를 사용하므로
 * 하나의 공통 clone 함수를 사용합니다.
 */
export function cloneRuntimePredictiveInsight(
  source:
    RuntimePredictiveInsight | null,
): RuntimePredictiveInsight | null {
  if (
    source ===
    null
  ) {
    return null;
  }

  return {
    title:
      source.title,

    description:
      source.description,

    emphasis:
      source.emphasis,
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Predictive Confidence Clone                                */
/* ------------------------------------------------------------------ */

/**
 * RuntimePredictiveConfidence의 독립적인 복사본을 생성합니다.
 */
export function cloneRuntimePredictiveConfidence(
  source:
    RuntimePredictiveConfidence,
): RuntimePredictiveConfidence {
  return {
    score:
      source.score,

    percentage:
      source.percentage,

    disclosure:
      source.disclosure,
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Predictive Presentation Collection Clone                   */
/* ------------------------------------------------------------------ */

/**
 * RuntimePredictivePresentation 배열의 독립적인 복사본을 생성합니다.
 *
 * 현재 Runtime UI는 보통 하나의 Predictive Presentation만
 * 사용하지만, 향후 Timeline 또는 History 계층에서 여러 결과를
 * 다룰 수 있도록 collection clone helper를 제공합니다.
 */
export function cloneRuntimePredictivePresentations(
  sources:
    RuntimePredictivePresentation[],
): RuntimePredictivePresentation[] {
  return sources.map(
    source =>
      cloneRuntimePredictivePresentation(
        source,
      ),
  );
}