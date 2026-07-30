/* ------------------------------------------------------------------ */
/* Runtime Predictive Presentation Status                             */
/* ------------------------------------------------------------------ */

/**
 * Runtime UI가 인식하는 Predictive Presentation의 가용 상태입니다.
 *
 * 이 상태는 Runtime 계층이 Prediction을 다시 평가한 결과가
 * 아닙니다.
 *
 * Recommendation Predictive Intelligence의 도메인 상태를
 * Runtime UI가 사용할 수 있는 작은 상태 집합으로 투영한 값입니다.
 *
 * - available:
 *   사용자에게 표시할 수 있는 Prediction이 존재합니다.
 *
 * - insufficient:
 *   Prediction은 실행되었지만 충분한 근거가 아직 없습니다.
 *
 * - unavailable:
 *   Prediction 결과를 Runtime Presentation으로 사용할 수 없습니다.
 *
 * Predictive Intelligence Result 자체가 null인 경우에는
 * RuntimePredictivePresentation을 생성하지 않고 null을 반환합니다.
 */
export type RuntimePredictivePresentationStatus =
  | "available"
  | "insufficient"
  | "unavailable";

/* ------------------------------------------------------------------ */
/* Runtime Predictive Emphasis                                        */
/* ------------------------------------------------------------------ */

/**
 * Runtime Predictive Insight의 상대적 강조 수준입니다.
 *
 * 이 값은 Risk 또는 Opportunity의 중요도를 UI 계층에 전달하기
 * 위한 의미적 정보입니다.
 *
 * 특정 색상이나 CSS 구현을 직접 지정하지 않습니다.
 */
export type RuntimePredictiveEmphasis =
  | "low"
  | "moderate"
  | "high";

/* ------------------------------------------------------------------ */
/* Runtime Predictive Primary Item                                    */
/* ------------------------------------------------------------------ */

/**
 * Runtime UI에 표시되는 하나의 주요 Prediction 항목입니다.
 *
 * 예:
 *
 * - Likely state
 * - Likely strategy
 * - Likely Runtime decision
 *
 * confidence는 0 이상 1 이하의 정규화된 값이며,
 * 사용할 수 없는 경우 null입니다.
 */
export type RuntimePredictivePrimaryItem = {
  /**
   * Prediction 항목의 사용자 표시용 이름입니다.
   */
  label:
    string;

  /**
   * 가장 가능성이 높은 Prediction 값의 사용자 표시용 문자열입니다.
   */
  value:
    string;

  /**
   * Prediction 항목의 정규화된 confidence입니다.
   *
   * 유효 범위:
   *
   * 0 <= confidence <= 1
   */
  confidence:
    number | null;
};

/* ------------------------------------------------------------------ */
/* Runtime Predictive Insight                                         */
/* ------------------------------------------------------------------ */

/**
 * Runtime UI에 표시되는 Risk 또는 Opportunity 정보입니다.
 */
export type RuntimePredictiveInsight = {
  /**
   * Insight의 사용자 표시용 제목입니다.
   */
  title:
    string;

  /**
   * Insight가 의미하는 내용을 설명하는 문장입니다.
   */
  description:
    string;

  /**
   * Runtime UI에서 사용할 의미적 강조 수준입니다.
   */
  emphasis:
    RuntimePredictiveEmphasis;
};

/* ------------------------------------------------------------------ */
/* Runtime Predictive Confidence                                      */
/* ------------------------------------------------------------------ */

/**
 * Runtime Predictive Presentation의 전체 confidence 정보입니다.
 *
 * score는 계산 및 검증에 사용할 수 있는 0~1 값입니다.
 *
 * percentage는 사용자 표시를 위한 0~100 정수 값입니다.
 *
 * disclosure는 Prediction이 확정적인 미래가 아니라
 * 현재 근거에 기반한 조건부 전망임을 사용자에게 설명합니다.
 */
export type RuntimePredictiveConfidence = {
  /**
   * 0 이상 1 이하로 정규화된 confidence score입니다.
   */
  score:
    number | null;

  /**
   * 사용자 표시용 confidence percentage입니다.
   *
   * 유효 범위:
   *
   * 0 <= percentage <= 100
   */
  percentage:
    number | null;

  /**
   * Prediction confidence의 한계와 조건을 설명하는 문장입니다.
   */
  disclosure:
    string;
};

/* ------------------------------------------------------------------ */
/* Runtime Predictive Presentation                                    */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Predictive Intelligence 결과를 Runtime UI가
 * 안전하게 사용할 수 있도록 축소하고 정규화한 Presentation
 * 계약입니다.
 *
 * 이 타입은 Prediction을 새로 생성하거나 재평가하지 않습니다.
 *
 * 다음 정보를 사용자 경험에 필요한 범위로만 투영합니다.
 *
 * - Prediction 상태
 * - 핵심 설명
 * - 예상 State
 * - 예상 Strategy
 * - 예상 Runtime Decision
 * - 주요 Risk
 * - 주요 Opportunity
 * - Confidence
 * - Evidence
 * - Warnings
 *
 * 도메인의 모든 Candidate, raw score, 내부 ID, 관련 Memory ID 및
 * 분석 세부 정보는 이 Presentation에 포함하지 않습니다.
 */
export type RuntimePredictivePresentation = {
  /**
   * Runtime UI 기준의 Predictive Presentation 상태입니다.
   */
  status:
    RuntimePredictivePresentationStatus;

  /**
   * Prediction 영역의 가장 중요한 한 줄 제목입니다.
   */
  headline:
    string;

  /**
   * Prediction의 전체 의미를 설명하는 짧은 요약입니다.
   */
  summary:
    string;

  /**
   * 현재 Prediction 전체를 대표하는 핵심 문장입니다.
   *
   * 사용할 수 없는 경우 null입니다.
   */
  primaryPrediction:
    string | null;

  /**
   * 가장 가능성이 높은 다음 State입니다.
   */
  statePrediction:
    RuntimePredictivePrimaryItem | null;

  /**
   * 가장 가능성이 높은 다음 Strategy입니다.
   */
  strategyPrediction:
    RuntimePredictivePrimaryItem | null;

  /**
   * 가장 가능성이 높은 다음 Runtime Decision입니다.
   */
  decisionPrediction:
    RuntimePredictivePrimaryItem | null;

  /**
   * 현재 Prediction에서 가장 중요한 Risk입니다.
   */
  risk:
    RuntimePredictiveInsight | null;

  /**
   * 현재 Prediction에서 가장 중요한 Opportunity입니다.
   */
  opportunity:
    RuntimePredictiveInsight | null;

  /**
   * 현재 Prediction 전체의 confidence 정보입니다.
   */
  confidence:
    RuntimePredictiveConfidence;

  /**
   * 사용자에게 표시할 수 있는 Prediction 근거 목록입니다.
   *
   * 빈 문자열과 중복 문자열은 derivation 과정에서 제거합니다.
   */
  evidence:
    string[];

  /**
   * Prediction을 해석할 때 함께 표시해야 하는 경고 목록입니다.
   *
   * 빈 문자열과 중복 문자열은 derivation 과정에서 제거합니다.
   */
  warnings:
    string[];

  /**
   * Prediction이 생성된 ISO 시각입니다.
   */
  predictedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Runtime Predictive Presentation Input                              */
/* ------------------------------------------------------------------ */

/**
 * Runtime Predictive Presentation을 사용하는 컴포넌트가 받을 수
 * 있는 기본 입력 형태입니다.
 *
 * Prediction이 실행되지 않았거나 Runtime에 연결되지 않은 경우
 * null을 사용합니다.
 */
export type RuntimePredictivePresentationInput =
  RuntimePredictivePresentation | null;

/* ------------------------------------------------------------------ */
/* Runtime Predictive Presentation Type Guards                        */
/* ------------------------------------------------------------------ */

/**
 * 주어진 값이 null이 아닌 Runtime Predictive Presentation인지
 * 확인합니다.
 *
 * 이 함수는 구조 전체를 검증하지 않습니다.
 * 전체 계약 검증은 validateRuntimePredictivePresentation이
 * 담당합니다.
 */
export function hasRuntimePredictivePresentation(
  value:
    RuntimePredictivePresentationInput,
): value is RuntimePredictivePresentation {
  return value !== null;
}

/**
 * Runtime Predictive Presentation이 사용자에게 표시 가능한
 * Prediction 상태인지 확인합니다.
 */
export function isRuntimePredictivePresentationAvailable(
  value:
    RuntimePredictivePresentationInput,
): value is RuntimePredictivePresentation {
  return (
    value !== null &&
    value.status ===
      "available"
  );
}

/**
 * Runtime Predictive Presentation에 주요 Prediction 항목이 하나
 * 이상 존재하는지 확인합니다.
 */
export function hasRuntimePredictivePrimaryItems(
  value:
    RuntimePredictivePresentationInput,
): boolean {
  if (
    value ===
    null
  ) {
    return false;
  }

  return (
    value.statePrediction !==
      null ||
    value.strategyPrediction !==
      null ||
    value.decisionPrediction !==
      null
  );
}

/**
 * Runtime Predictive Presentation에 Risk가 존재하는지 확인합니다.
 */
export function hasRuntimePredictiveRisk(
  value:
    RuntimePredictivePresentationInput,
): boolean {
  return (
    value !== null &&
    value.risk !== null
  );
}

/**
 * Runtime Predictive Presentation에 Opportunity가 존재하는지
 * 확인합니다.
 */
export function hasRuntimePredictiveOpportunity(
  value:
    RuntimePredictivePresentationInput,
): boolean {
  return (
    value !== null &&
    value.opportunity !==
      null
  );
}

/**
 * Runtime Predictive Presentation에 표시 가능한 Evidence가
 * 존재하는지 확인합니다.
 */
export function hasRuntimePredictiveEvidence(
  value:
    RuntimePredictivePresentationInput,
): boolean {
  return (
    value !== null &&
    value.evidence.length >
      0
  );
}

/**
 * Runtime Predictive Presentation에 표시해야 하는 Warning이
 * 존재하는지 확인합니다.
 */
export function hasRuntimePredictiveWarnings(
  value:
    RuntimePredictivePresentationInput,
): boolean {
  return (
    value !== null &&
    value.warnings.length >
      0
  );
}