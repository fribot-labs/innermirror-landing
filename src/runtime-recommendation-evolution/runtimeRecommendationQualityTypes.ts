import type {
    RuntimeActionHistoryStatus,
    RuntimeActionResolutionState,
} from "../runtime-action-history/runtimeActionHistoryTypes";

import type {
    RuntimeNextActionKind,
    RuntimeNextActionSource,
    RuntimeNextActionTarget,
} from "../runtime-next-action/runtimeNextActionTypes";

/* ------------------------------------------------------------------ */
/* Recommendation Identity */
/* ------------------------------------------------------------------ */

/**
 * History 품질 분석에서 하나의 Recommendation 계열을 식별하기 위한
 * 최소한의 안정적 정보입니다.
 *
 * fingerprint는 Runtime Action History에서 생성한 값을 그대로 사용합니다.
 */
export type RuntimeRecommendationQualityIdentity = {
  fingerprint:
    string;

  projectId:
    string;

  kind:
    RuntimeNextActionKind;

  target:
    RuntimeNextActionTarget;

  source:
    RuntimeNextActionSource;

  title:
    string;
};

/* ------------------------------------------------------------------ */
/* Quality Confidence */
/* ------------------------------------------------------------------ */

/**
 * Recommendation 품질 판단에 사용할 수 있는 History 데이터의
 * 충분성을 나타냅니다.
 *
 * Recommendation의 좋고 나쁨이 아니라,
 * 현재 품질 판단을 얼마나 신뢰할 수 있는지를 표현합니다.
 */
export type RuntimeRecommendationQualityConfidence =
  | "unknown"
  | "low"
  | "developing"
  | "established";

/* ------------------------------------------------------------------ */
/* Quality Outcome */
/* ------------------------------------------------------------------ */

/**
 * 과거 Recommendation 결과를 종합한 품질 해석입니다.
 *
 * 이 값은 사용자를 평가하지 않습니다.
 * Runtime Recommendation이 현재까지 어떤 결과 패턴을 보였는지를
 * 설명하기 위한 내부 분석 값입니다.
 */
export type RuntimeRecommendationQualityOutcome =
  | "insufficient-history"
  | "effective"
  | "mixed"
  | "unstable"
  | "unresolved";

/* ------------------------------------------------------------------ */
/* Latest Recommendation State */
/* ------------------------------------------------------------------ */

/**
 * 가장 최근에 관찰된 Recommendation occurrence의 상태입니다.
 */
export type RuntimeRecommendationLatestState = {
  status:
    RuntimeActionHistoryStatus | null;

  resolutionState:
    RuntimeActionResolutionState | null;

  firstObservedAt:
    string | null;

  lastObservedAt:
    string | null;

  completedAt:
    string | null;

  supersededAt:
    string | null;
};

/* ------------------------------------------------------------------ */
/* History Feature Counts */
/* ------------------------------------------------------------------ */

/**
 * 동일 fingerprint Recommendation의 누적 occurrence 수입니다.
 */
export type RuntimeRecommendationHistoryCounts = {
  /**
   * 동일 fingerprint가 History에 등장한 전체 횟수입니다.
   */
  totalOccurrences:
    number;

  /**
   * 실제 project-state 변화로 완료된 occurrence 수입니다.
   */
  completedCount:
    number;

  /**
   * 완료 전에 다른 Recommendation으로 교체된 occurrence 수입니다.
   */
  supersededCount:
    number;

  /**
   * 현재 active 또는 navigated 상태로 남아 있는 occurrence 수입니다.
   *
   * 정상적인 프로젝트별 History에서는 일반적으로 0 또는 1입니다.
   */
  activeCount:
    number;

  /**
   * navigation event가 한 번 이상 존재하는 occurrence 수입니다.
   */
  visitedOccurrenceCount:
    number;

  /**
   * 모든 occurrence의 navigation event 총합입니다.
   */
  totalNavigationCount:
    number;

  /**
   * resolutionState가 repeated인 occurrence 수입니다.
   */
  repeatedCount:
    number;

  /**
   * resolutionState가 unresolved인 occurrence 수입니다.
   */
  unresolvedCount:
    number;

  /**
   * completion evidence 전체 개수입니다.
   */
  completionEvidenceCount:
    number;

  /**
   * 동일 Recommendation을 관찰한 전체 횟수의 합입니다.
   */
  totalObservationCount:
    number;
};

/* ------------------------------------------------------------------ */
/* History Feature Rates */
/* ------------------------------------------------------------------ */

/**
 * History count를 0~1 범위로 정규화한 비율입니다.
 *
 * 데이터가 없는 경우 모든 비율은 0입니다.
 */
export type RuntimeRecommendationHistoryRates = {
  completionRate:
    number;

  supersededRate:
    number;

  activeRate:
    number;

  navigationRate:
    number;

  repetitionRate:
    number;

  unresolvedRate:
    number;

  completionEvidenceRate:
    number;
};

/* ------------------------------------------------------------------ */
/* History Feature Averages */
/* ------------------------------------------------------------------ */

/**
 * Recommendation occurrence 단위의 평균값입니다.
 */
export type RuntimeRecommendationHistoryAverages = {
  /**
   * 하나의 Recommendation occurrence가 평균적으로 몇 번 관찰됐는지
   * 나타냅니다.
   */
  averageObservationCount:
    number;

  /**
   * 하나의 occurrence당 평균 navigation event 수입니다.
   */
  averageNavigationCount:
    number;

  /**
   * 완료된 occurrence 하나당 평균 Completion Evidence 개수입니다.
   *
   * 완료 occurrence가 없다면 0입니다.
   */
  averageCompletionEvidenceCount:
    number;
};

/* ------------------------------------------------------------------ */
/* History Temporal Features */
/* ------------------------------------------------------------------ */

/**
 * Recommendation의 시간 관련 관찰 결과입니다.
 *
 * PR-046A에서는 시간을 기록하고 전달하는 역할만 수행합니다.
 * 실제 dwell-time 기반 안정화는 PR-046B 범위입니다.
 */
export type RuntimeRecommendationHistoryTemporalFeatures = {
  firstObservedAt:
    string | null;

  lastObservedAt:
    string | null;

  lastCompletedAt:
    string | null;

  lastSupersededAt:
    string | null;

  /**
   * 완료된 occurrence가 처음 관찰된 시점부터 완료될 때까지 걸린
   * 평균 시간입니다.
   *
   * 계산할 수 없는 경우 null입니다.
   */
  averageCompletionDurationMilliseconds:
    number | null;

  /**
   * 가장 최근 occurrence가 처음 등장한 뒤 경과한 시간입니다.
   *
   * 분석 시각을 기준으로 계산하며, 유효한 timestamp가 없으면 null입니다.
   */
  latestOccurrenceAgeMilliseconds:
    number | null;
};

/* ------------------------------------------------------------------ */
/* Recommendation History Features */
/* ------------------------------------------------------------------ */

/**
 * 동일 Recommendation fingerprint의 History Entry들을 분석하여 만든
 * 중간 Feature 집합입니다.
 *
 * 이 타입은 아직 Recommendation 점수를 변경하지 않습니다.
 *
 * History Entry
 * ↓
 * RuntimeRecommendationHistoryFeatures
 * ↓
 * RuntimeRecommendationQualityProfile
 */
export type RuntimeRecommendationHistoryFeatures = {
  identity:
    RuntimeRecommendationQualityIdentity;

  counts:
    RuntimeRecommendationHistoryCounts;

  rates:
    RuntimeRecommendationHistoryRates;

  averages:
    RuntimeRecommendationHistoryAverages;

  temporal:
    RuntimeRecommendationHistoryTemporalFeatures;

  latest:
    RuntimeRecommendationLatestState;
};

/* ------------------------------------------------------------------ */
/* Quality Signals */
/* ------------------------------------------------------------------ */

/**
 * Quality Profile 판단에 사용된 내부 근거 유형입니다.
 */
export type RuntimeRecommendationQualitySignalType =
  | "insufficient-occurrences"
  | "completion-observed"
  | "high-completion-rate"
  | "low-completion-rate"
  | "navigation-observed"
  | "visited-without-completion"
  | "frequently-superseded"
  | "repeated-recommendation"
  | "unresolved-recommendation"
  | "stable-outcome"
  | "mixed-outcome";

/**
 * 하나의 품질 판단 근거입니다.
 *
 * PR-046A에서는 Diagnostics와 테스트를 위해 사용하며,
 * 사용자 UI에 직접 노출하지 않습니다.
 */
export type RuntimeRecommendationQualitySignal = {
  type:
    RuntimeRecommendationQualitySignalType;

  /**
   * 이 신호가 품질 판단에서 어느 정도 중요한지 나타냅니다.
   *
   * 0~1 범위를 사용합니다.
   */
  strength:
    number;

  /**
   * 개발자 Diagnostics용 설명입니다.
   */
  description:
    string;
};

/* ------------------------------------------------------------------ */
/* Quality Profile */
/* ------------------------------------------------------------------ */

/**
 * Recommendation History Features를 해석한 결과입니다.
 *
 * 이 Profile은 아직 Candidate 점수에 직접 반영되지 않습니다.
 * 실제 Adaptive Scoring 연결은 PR-046C에서 수행합니다.
 */
export type RuntimeRecommendationQualityProfile = {
  identity:
    RuntimeRecommendationQualityIdentity;

  features:
    RuntimeRecommendationHistoryFeatures;

  confidence:
    RuntimeRecommendationQualityConfidence;

  outcome:
    RuntimeRecommendationQualityOutcome;

  /**
   * Profile 판단 근거입니다.
   */
  signals:
    RuntimeRecommendationQualitySignal[];

  /**
   * 품질 Profile을 생성한 시각입니다.
   */
  evaluatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Quality Policy */
/* ------------------------------------------------------------------ */

/**
 * Quality confidence와 outcome을 결정할 때 사용하는 정책입니다.
 *
 * 하드코딩된 숫자를 여러 Builder에 흩어놓지 않도록
 * 하나의 정책 객체로 전달합니다.
 */
export type RuntimeRecommendationQualityPolicy = {
  /**
   * low confidence를 벗어나기 위한 최소 occurrence 수입니다.
   */
  minimumOccurrencesForDevelopingConfidence:
    number;

  /**
   * established confidence로 판단하기 위한 최소 occurrence 수입니다.
   */
  minimumOccurrencesForEstablishedConfidence:
    number;

  /**
   * effective outcome으로 판단할 수 있는 최소 완료율입니다.
   */
  effectiveCompletionRateThreshold:
    number;

  /**
   * unstable outcome으로 판단할 superseded 비율입니다.
   */
  unstableSupersededRateThreshold:
    number;

  /**
   * unresolved outcome으로 판단할 unresolved 비율입니다.
   */
  unresolvedRateThreshold:
    number;

  /**
   * 반복 Recommendation을 의미 있는 품질 신호로 인정할 최소 횟수입니다.
   */
  repeatedOccurrenceThreshold:
    number;

  /**
   * 사용자 이동은 있었지만 완료되지 않은 패턴을 품질 신호로
   * 인정할 최소 occurrence 수입니다.
   */
  visitedWithoutCompletionThreshold:
    number;
};

/* ------------------------------------------------------------------ */
/* Feature Builder Input */
/* ------------------------------------------------------------------ */

/**
 * 단일 Recommendation fingerprint의 History Feature를 생성할 때
 * 사용하는 입력입니다.
 *
 * entries 자체의 구체적인 타입은 Builder 파일에서 import하여 사용하고,
 * 이 Foundation 타입 파일에서는 순환 의존성을 줄이기 위해
 * 입력 Context만 정의합니다.
 */
export type RuntimeRecommendationHistoryFeatureContext = {
  projectId:
    string;

  fingerprint:
    string;

  evaluatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Profile Builder Input */
/* ------------------------------------------------------------------ */

export type CreateRuntimeRecommendationQualityProfileInput = {
  features:
    RuntimeRecommendationHistoryFeatures;

  policy:
    RuntimeRecommendationQualityPolicy;

  evaluatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Project Quality Summary */
/* ------------------------------------------------------------------ */

/**
 * 한 프로젝트에 존재하는 Recommendation Quality Profile 전체를
 * 요약한 결과입니다.
 *
 * 이후 PR-046C Diagnostics와 PR-046E Controller에서 사용할 수 있습니다.
 */
export type RuntimeRecommendationProjectQualitySummary = {
  projectId:
    string;

  profiles:
    RuntimeRecommendationQualityProfile[];

  totalProfileCount:
    number;

  effectiveProfileCount:
    number;

  mixedProfileCount:
    number;

  unstableProfileCount:
    number;

  unresolvedProfileCount:
    number;

  insufficientHistoryProfileCount:
    number;

  evaluatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Quality Profile Lookup */
/* ------------------------------------------------------------------ */

/**
 * Candidate fingerprint로 Quality Profile을 빠르게 조회하기 위한 Map입니다.
 */
export type RuntimeRecommendationQualityProfileMap =
  Record<
    string,
    RuntimeRecommendationQualityProfile
  >;

/* ------------------------------------------------------------------ */
/* Quality Diagnostics */
/* ------------------------------------------------------------------ */

/**
 * PR-046A 검증을 위한 내부 Diagnostics입니다.
 *
 * 아직 사용자 화면에는 노출하지 않습니다.
 */
export type RuntimeRecommendationQualityDiagnostics = {
  projectId:
    string;

  analyzedEntryCount:
    number;

  analyzedFingerprintCount:
    number;

  ignoredEntryCount:
    number;

  invalidTimestampCount:
    number;

  profiles:
    RuntimeRecommendationQualityProfile[];

  evaluatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Quality Analysis Result */
/* ------------------------------------------------------------------ */

/**
 * PR-046A Quality Analysis의 최종 반환 구조입니다.
 */
export type RuntimeRecommendationQualityAnalysisResult = {
  summary:
    RuntimeRecommendationProjectQualitySummary;

  profileMap:
    RuntimeRecommendationQualityProfileMap;

  diagnostics:
    RuntimeRecommendationQualityDiagnostics;
};