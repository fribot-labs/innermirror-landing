import type {
    RuntimeNextActionConfidence,
    RuntimeNextActionKind,
    RuntimeNextActionSource,
    RuntimeNextActionTarget,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
    RuntimeRecommendationLifecycleResolution,
} from "../runtime-recommendation-lifecycle/runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Evolution Classification */
/* ------------------------------------------------------------------ */

/**
 * 두 Recommendation 사이에서 관찰된 변화의 기본 유형입니다.
 *
 * initial
 * 비교할 이전 Recommendation이 없는 최초 상태
 *
 * repeated
 * 핵심 Recommendation이 이전과 동일하게 반복됨
 *
 * refined
 * 방향은 유지되지만 표현이나 행동 범위가 더 구체화됨
 *
 * expanded
 * 기존 방향을 유지하면서 새로운 범위가 추가됨
 *
 * redirected
 * Recommendation의 행동 대상이나 방향이 변경됨
 *
 * completed-and-advanced
 * 이전 Recommendation을 완료하고 다음 단계로 이동함
 *
 * superseded
 * 이전 Recommendation이 완료되기 전에 새 Recommendation으로 교체됨
 */
export type RecommendationEvolutionType =
  | "initial"
  | "repeated"
  | "refined"
  | "expanded"
  | "redirected"
  | "completed-and-advanced"
  | "superseded";

/**
 * Recommendation 변화의 규모입니다.
 */
export type RecommendationEvolutionMagnitude =
  | "none"
  | "minor"
  | "moderate"
  | "major";

/**
 * Recommendation 변화가 향하는 의미적 방향입니다.
 *
 * stable
 * 현재 방향이 유지됨
 *
 * narrowing
 * 범위가 더 구체적이고 집중된 형태로 좁아짐
 *
 * broadening
 * 다루는 범위가 넓어짐
 *
 * advancing
 * 이전 Recommendation을 완료하고 다음 단계로 이동함
 *
 * redirecting
 * 기존과 다른 행동 또는 분석 방향으로 이동함
 *
 * unresolved
 * 데이터가 부족해 변화 방향을 판단할 수 없음
 */
export type RecommendationEvolutionDirection =
  | "stable"
  | "narrowing"
  | "broadening"
  | "advancing"
  | "redirecting"
  | "unresolved";

/* ------------------------------------------------------------------ */
/* Comparison Confidence */
/* ------------------------------------------------------------------ */

/**
 * Evolution 분석 결과에 대한 Runtime의 신뢰 수준입니다.
 *
 * Recommendation 자체의 confidence와 구분됩니다.
 */
export type RecommendationEvolutionConfidence =
  | "low"
  | "medium"
  | "high";

/**
 * Evolution 분석에 사용 가능한 데이터 상태입니다.
 */
export type RecommendationEvolutionDataQuality =
  | "insufficient"
  | "partial"
  | "sufficient";

/* ------------------------------------------------------------------ */
/* Recommendation Identity Snapshot */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution 비교에 필요한 최소 정보입니다.
 *
 * RuntimeNextAction 전체 객체를 저장하지 않고,
 * 변화 분석에 필요한 핵심 속성만 보존합니다.
 */
export type RecommendationEvolutionSnapshot = {
  /**
   * Lifecycle Record ID입니다.
   */
  lifecycleId:
    string;

  /**
   * Recommendation ID입니다.
   */
  recommendationId:
    string;

  /**
   * Recommendation의 결정론적 동일성 키입니다.
   */
  fingerprint:
    string;

  kind:
    RuntimeNextActionKind;

  title:
    string;

  description:
    string;

  target:
    RuntimeNextActionTarget;

  confidence:
    RuntimeNextActionConfidence;

  source:
    RuntimeNextActionSource;

  sourceLabel:
    string;

  whySummary:
    string | null;

  evidenceSummary:
    string | null;

  signalCount:
    number;

  createdAt:
    string;

  activatedAt:
    string | null;

  resolvedAt:
    string | null;

  resolution:
    RuntimeRecommendationLifecycleResolution | null;
};

/* ------------------------------------------------------------------ */
/* Field-Level Change */
/* ------------------------------------------------------------------ */

/**
 * Recommendation 비교 대상 필드입니다.
 */
export type RecommendationEvolutionField =
  | "fingerprint"
  | "kind"
  | "title"
  | "description"
  | "target"
  | "confidence"
  | "source"
  | "why"
  | "evidence"
  | "signal-count";

/**
 * 특정 필드 하나의 변화입니다.
 *
 * 값은 서로 다른 Runtime 계약을 포괄할 수 있도록
 * 문자열·숫자·null의 정규화된 형태로 보존합니다.
 */
export type RecommendationEvolutionFieldChange = {
  field:
    RecommendationEvolutionField;

  changed:
    boolean;

  previousValue:
    string | number | null;

  currentValue:
    string | number | null;
};

/* ------------------------------------------------------------------ */
/* Comparison Signals */
/* ------------------------------------------------------------------ */

/**
 * Evolution 분류를 뒷받침하는 비교 신호입니다.
 */
export type RecommendationEvolutionSignalType =
  | "same-fingerprint"
  | "kind-changed"
  | "target-changed"
  | "title-changed"
  | "description-changed"
  | "confidence-increased"
  | "confidence-decreased"
  | "source-changed"
  | "why-changed"
  | "evidence-changed"
  | "signal-count-increased"
  | "signal-count-decreased"
  | "previous-completed"
  | "previous-superseded"
  | "lifecycle-linked"
  | "missing-comparison-data";

/**
 * 단일 Evolution 신호입니다.
 */
export type RecommendationEvolutionSignal = {
  type:
    RecommendationEvolutionSignalType;

  description:
    string;

  weight:
    number;
};

/* ------------------------------------------------------------------ */
/* Lifecycle Pair Comparison */
/* ------------------------------------------------------------------ */

/**
 * 연속된 두 Recommendation Lifecycle의 비교 결과입니다.
 */
export type RecommendationLifecycleComparison = {
  id:
    string;

  previous:
    RecommendationEvolutionSnapshot | null;

  current:
    RecommendationEvolutionSnapshot;

  type:
    RecommendationEvolutionType;

  magnitude:
    RecommendationEvolutionMagnitude;

  direction:
    RecommendationEvolutionDirection;

  confidence:
    RecommendationEvolutionConfidence;

  dataQuality:
    RecommendationEvolutionDataQuality;

  /**
   * 동일 Recommendation으로 판단되는지 나타냅니다.
   */
  isRepeated:
    boolean;

  /**
   * 이전 Recommendation 완료 후 다음 단계로 이동했는지 나타냅니다.
   */
  isCompletionAdvance:
    boolean;

  /**
   * 완료되지 않은 Recommendation이 교체되었는지 나타냅니다.
   */
  isSupersession:
    boolean;

  /**
   * 핵심 행동 대상이 변경되었는지 나타냅니다.
   */
  targetChanged:
    boolean;

  /**
   * Recommendation 종류가 변경되었는지 나타냅니다.
   */
  kindChanged:
    boolean;

  /**
   * Recommendation confidence가 변경되었는지 나타냅니다.
   */
  confidenceChanged:
    boolean;

  fieldChanges:
    RecommendationEvolutionFieldChange[];

  signals:
    RecommendationEvolutionSignal[];

  /**
   * 비교가 수행된 시각입니다.
   */
  comparedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Evolution Stability */
/* ------------------------------------------------------------------ */

/**
 * Recommendation 흐름의 안정성 분류입니다.
 */
export type RecommendationEvolutionStability =
  | "unknown"
  | "unstable"
  | "developing"
  | "stable"
  | "highly-stable";

/**
 * Recommendation 흐름에서 관찰되는 Drift 수준입니다.
 */
export type RecommendationEvolutionDrift =
  | "unknown"
  | "none"
  | "low"
  | "moderate"
  | "high";

/**
 * 최근 Recommendation 흐름의 반복 상태입니다.
 */
export type RecommendationEvolutionRepeatPattern =
  | "unknown"
  | "none"
  | "occasional"
  | "persistent";

/* ------------------------------------------------------------------ */
/* Evolution Statistics */
/* ------------------------------------------------------------------ */

/**
 * Lifecycle History 전체에서 계산한 정량 통계입니다.
 */
export type RecommendationEvolutionStatistics = {
  totalRecommendationCount:
    number;

  comparableRecommendationCount:
    number;

  transitionCount:
    number;

  activeCount:
    number;

  completedCount:
    number;

  supersededCount:
    number;

  archivedCount:
    number;

  repeatedTransitionCount:
    number;

  changedTransitionCount:
    number;

  refinedTransitionCount:
    number;

  redirectedTransitionCount:
    number;

  completionAdvanceCount:
    number;

  /**
   * 0에서 1 사이의 비율입니다.
   */
  completionRate:
    number;

  /**
   * 0에서 1 사이의 비율입니다.
   */
  supersessionRate:
    number;

  /**
   * 0에서 1 사이의 비율입니다.
   */
  repetitionRate:
    number;

  /**
   * resolvedAt과 activatedAt을 모두 가진 Record만 사용합니다.
   *
   * 계산할 수 없으면 null입니다.
   */
  averageActiveDurationMs:
    number | null;
};

/* ------------------------------------------------------------------ */
/* Evolution Summary */
/* ------------------------------------------------------------------ */

/**
 * History 전체에서 도출된 Recommendation Evolution 요약입니다.
 */
export type RecommendationEvolutionSummary = {
  stability:
    RecommendationEvolutionStability;

  drift:
    RecommendationEvolutionDrift;

  repeatPattern:
    RecommendationEvolutionRepeatPattern;

  dominantType:
    RecommendationEvolutionType | null;

  dominantDirection:
    RecommendationEvolutionDirection | null;

  latestType:
    RecommendationEvolutionType | null;

  latestDirection:
    RecommendationEvolutionDirection | null;

  latestMagnitude:
    RecommendationEvolutionMagnitude | null;

  recommendationChanged:
    boolean;

  hasMeaningfulEvolution:
    boolean;

  hasSufficientHistory:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Evolution Result */
/* ------------------------------------------------------------------ */

/**
 * Lifecycle History 전체에 대한 Recommendation Evolution 분석 결과입니다.
 */
export type RecommendationEvolutionResult = {
  version:
    1;

  /**
   * 분석 대상 Lifecycle History ID입니다.
   */
  historyId:
    string;

  /**
   * Lifecycle 생성 순서에 따른 비교 결과입니다.
   *
   * 최초 Recommendation도 previous=null인 initial 비교로 포함할 수 있습니다.
   */
  comparisons:
    RecommendationLifecycleComparison[];

  statistics:
    RecommendationEvolutionStatistics;

  summary:
    RecommendationEvolutionSummary;

  dataQuality:
    RecommendationEvolutionDataQuality;

  confidence:
    RecommendationEvolutionConfidence;

  analyzedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Comparison Input */
/* ------------------------------------------------------------------ */

/**
 * 두 Lifecycle Record를 직접 비교할 때 사용하는 입력입니다.
 */
export type CompareRecommendationLifecycleParams = {
  previous:
    RuntimeRecommendationLifecycleRecord | null;

  current:
    RuntimeRecommendationLifecycleRecord;

  previousFingerprint:
    string | null;

  currentFingerprint:
    string;

  createSnapshot:
    (
      lifecycle:
        RuntimeRecommendationLifecycleRecord,
      fingerprint:
        string,
    ) => RecommendationEvolutionSnapshot;

  comparisonId:
    string;

  comparedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* History Analysis Input */
/* ------------------------------------------------------------------ */

/**
 * Lifecycle History 전체를 분석할 때 사용하는 입력입니다.
 */
export type AnalyzeRecommendationEvolutionParams = {
  history:
    RuntimeRecommendationLifecycleHistory;

  analyzedAt:
    string;

  createFingerprint:
    (
      lifecycle:
        RuntimeRecommendationLifecycleRecord,
    ) => string;

  createSnapshot:
    (
      lifecycle:
        RuntimeRecommendationLifecycleRecord,
      fingerprint:
        string,
    ) => RecommendationEvolutionSnapshot;

  createComparisonId:
    (
      previous:
        RuntimeRecommendationLifecycleRecord | null,
      current:
        RuntimeRecommendationLifecycleRecord,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Statistics Input */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution 통계를 계산할 때 사용하는 입력입니다.
 */
export type CreateRecommendationEvolutionStatisticsParams = {
  history:
    RuntimeRecommendationLifecycleHistory;

  comparisons:
    RecommendationLifecycleComparison[];
};

/* ------------------------------------------------------------------ */
/* Presentation */
/* ------------------------------------------------------------------ */

/**
 * Evolution 분석 결과를 UI에 전달하기 위한 Tone입니다.
 */
export type RecommendationEvolutionPresentationTone =
  | "neutral"
  | "stable"
  | "progressing"
  | "attention"
  | "unavailable";

/**
 * Evolution 결과를 사용자가 이해할 수 있는 문구로 변환한 결과입니다.
 */
export type RecommendationEvolutionPresentation = {
  headline:
    string;

  overview:
    string;

  stabilityLabel:
    string;

  driftLabel:
    string;

  repeatPatternLabel:
    string;

  latestChangeLabel:
    string;

  confidenceLabel:
    string;

  dataQualityLabel:
    string;

  totalRecommendationLabel:
    string;

  completionRateLabel:
    string;

  repetitionRateLabel:
    string;

  primarySignalTitle:
    string;

  primarySignalDescription:
    string;

  nextObservationFocus:
    string | null;

  warnings:
    string[];

  tone:
    RecommendationEvolutionPresentationTone;
};

/* ------------------------------------------------------------------ */
/* Presentation Input */
/* ------------------------------------------------------------------ */

export type CreateRecommendationEvolutionPresentationParams = {
  result:
    RecommendationEvolutionResult;
};

/* ------------------------------------------------------------------ */
/* Type Guards */
/* ------------------------------------------------------------------ */

/**
 * 이전 Recommendation과 의미 있는 비교가 가능한 결과인지 확인합니다.
 */
export function isComparableRecommendationEvolution(
  comparison:
    RecommendationLifecycleComparison,
): boolean {
  return (
    comparison.previous !== null &&
    comparison.dataQuality !== "insufficient"
  );
}

/**
 * Recommendation의 핵심 방향이 변경된 비교인지 확인합니다.
 */
export function isRedirectedRecommendationEvolution(
  comparison:
    RecommendationLifecycleComparison,
): boolean {
  return (
    comparison.type === "redirected" ||
    comparison.direction === "redirecting"
  );
}

/**
 * Recommendation 흐름이 동일하게 반복된 비교인지 확인합니다.
 */
export function isRepeatedRecommendationEvolution(
  comparison:
    RecommendationLifecycleComparison,
): boolean {
  return (
    comparison.type === "repeated" ||
    comparison.isRepeated
  );
}