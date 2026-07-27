import type {
    RecommendationEvolutionConfidence,
    RecommendationEvolutionResult,
} from "./recommendationEvolutionTypes";

/* ------------------------------------------------------------------ */
/* Intelligence Signal Types                                          */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionIntelligenceSignalType =
  | "insufficient-history"
  | "stable-continuation"
  | "productive-refinement"
  | "persistent-repetition"
  | "unresolved-repetition"
  | "frequent-redirection"
  | "premature-supersession"
  | "completion-momentum"
  | "low-completion-rate"
  | "high-supersession-rate"
  | "increasing-confidence"
  | "decreasing-confidence"
  | "high-drift"
  | "stable-direction"
  | "observation-needed";

/* ------------------------------------------------------------------ */
/* Signal Severity                                                    */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionIntelligenceSignalSeverity =
  | "info"
  | "low"
  | "moderate"
  | "high";

/* ------------------------------------------------------------------ */
/* Signal Confidence                                                  */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionIntelligenceSignalConfidence =
  RecommendationEvolutionConfidence;

/* ------------------------------------------------------------------ */
/* Signal Score                                                       */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionIntelligenceSignalScore =
  number;

/* ------------------------------------------------------------------ */
/* Signal Evidence                                                    */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionIntelligenceSignalEvidence = {
  label:
    string;

  value:
    string | number | boolean;

  relatedComparisonIds:
    string[];
};

/* ------------------------------------------------------------------ */
/* Intelligence Signal                                                */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionIntelligenceSignal = {
  id:
    string;

  type:
    RecommendationEvolutionIntelligenceSignalType;

  severity:
    RecommendationEvolutionIntelligenceSignalSeverity;

  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence;

  score:
    RecommendationEvolutionIntelligenceSignalScore;

  title:
    string;

  description:
    string;

  evidence:
    RecommendationEvolutionIntelligenceSignalEvidence[];

  relatedComparisonIds:
    string[];

  detectedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Signal Collection                                                  */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionIntelligenceSignalCollection = {
  signals:
    RecommendationEvolutionIntelligenceSignal[];

  signalTypes:
    RecommendationEvolutionIntelligenceSignalType[];

  primarySignalId:
    string | null;

  hasActionableSignal:
    boolean;

  needsObservation:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Signal Derivation Parameters                                       */
/* ------------------------------------------------------------------ */

export type DeriveRecommendationEvolutionSignalsParams = {
  evolution:
    RecommendationEvolutionResult;

  detectedAt:
    string;

  createSignalId:
    (
      type:
        RecommendationEvolutionIntelligenceSignalType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Signal Query Types                                                 */
/* ------------------------------------------------------------------ */

export type FindRecommendationEvolutionIntelligenceSignalParams = {
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  type:
    RecommendationEvolutionIntelligenceSignalType;
};

export type CompareRecommendationEvolutionIntelligenceSignalsParams = {
  left:
    RecommendationEvolutionIntelligenceSignal;

  right:
    RecommendationEvolutionIntelligenceSignal;
};

/* ------------------------------------------------------------------ */
/* Signal Type Guards                                                 */
/* ------------------------------------------------------------------ */

export function isRecommendationEvolutionIntelligenceSignalType(
  value:
    unknown,
): value is RecommendationEvolutionIntelligenceSignalType {
  return (
    value === "insufficient-history" ||
    value === "stable-continuation" ||
    value === "productive-refinement" ||
    value === "persistent-repetition" ||
    value === "unresolved-repetition" ||
    value === "frequent-redirection" ||
    value === "premature-supersession" ||
    value === "completion-momentum" ||
    value === "low-completion-rate" ||
    value === "high-supersession-rate" ||
    value === "increasing-confidence" ||
    value === "decreasing-confidence" ||
    value === "high-drift" ||
    value === "stable-direction" ||
    value === "observation-needed"
  );
}

export function isRecommendationEvolutionIntelligenceSignalSeverity(
  value:
    unknown,
): value is RecommendationEvolutionIntelligenceSignalSeverity {
  return (
    value === "info" ||
    value === "low" ||
    value === "moderate" ||
    value === "high"
  );
}

export function isRecommendationEvolutionIntelligenceSignalConfidence(
  value:
    unknown,
): value is RecommendationEvolutionIntelligenceSignalConfidence {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high"
  );
}

/* ------------------------------------------------------------------ */
/* Intelligence State                                                 */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Intelligence의
 * 현재 Runtime 판단 상태입니다.
 */
export type RecommendationEvolutionIntelligenceState =
  | "unavailable"
  | "observing"
  | "stable"
  | "progressing"
  | "stalled"
  | "fragmented"
  | "advancing";

/* ------------------------------------------------------------------ */
/* Assessment Scores                                                  */
/* ------------------------------------------------------------------ */

/**
 * Intelligence에서 사용하는 정규화 점수입니다.
 *
 * 모든 점수는 0~1 범위를 사용합니다.
 */
export type RecommendationEvolutionIntelligenceScore =
  number;

/**
 * Assessment를 구성하는 개별 점수입니다.
 */
export type RecommendationEvolutionIntelligenceScores = {
  /**
   * Recommendation 방향의 안정성입니다.
   */
  stability:
    RecommendationEvolutionIntelligenceScore;

  /**
   * Recommendation이 실행 방향으로 발전하는 정도입니다.
   */
  progress:
    RecommendationEvolutionIntelligenceScore;

  /**
   * 동일 Recommendation 반복 위험입니다.
   */
  repetitionRisk:
    RecommendationEvolutionIntelligenceScore;

  /**
   * Recommendation 방향 변경 위험입니다.
   */
  redirectionRisk:
    RecommendationEvolutionIntelligenceScore;

  /**
   * 완료 이후 다음 단계로 이어지는 흐름입니다.
   */
  completionMomentum:
    RecommendationEvolutionIntelligenceScore;
};

/* ------------------------------------------------------------------ */
/* Assessment                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution을 종합적으로 해석한 결과입니다.
 */
export type RecommendationEvolutionIntelligenceAssessment = {
  /**
   * 현재 Intelligence 상태입니다.
   */
  state:
    RecommendationEvolutionIntelligenceState;

  /**
   * Assessment 자체의 신뢰도입니다.
   */
  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence;

  /**
   * Assessment 계산에 사용된 점수입니다.
   */
  scores:
    RecommendationEvolutionIntelligenceScores;

  /**
   * 현재 가장 중요한 Signal입니다.
   */
  primarySignalType:
    RecommendationEvolutionIntelligenceSignalType | null;

  /**
   * 추가 관찰이 필요한 상태인지 여부입니다.
   */
  needsObservation:
    boolean;

  /**
   * Recommendation을 유지하는 것이 적절한지 여부입니다.
   */
  shouldMaintainCurrentRecommendation:
    boolean;

  /**
   * Recommendation을 구체화하는 것이 적절한지 여부입니다.
   */
  shouldRefineRecommendation:
    boolean;

  /**
   * Recommendation 완료 여부를 먼저 확인해야 하는지 여부입니다.
   */
  shouldConfirmCompletion:
    boolean;

  /**
   * Recommendation 방향 안정화가 필요한지 여부입니다.
   */
  shouldStabilizeDirection:
    boolean;

  /**
   * Assessment 근거입니다.
   */
  reasoning:
    string[];
};

/* ------------------------------------------------------------------ */
/* Assessment Parameters                                              */
/* ------------------------------------------------------------------ */

/**
 * Assessment 생성 입력입니다.
 */
export type AssessRecommendationEvolutionIntelligenceParams = {
  /**
   * 생성된 Intelligence Signal입니다.
   */
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  /**
   * REI02 Evolution 분석 결과입니다.
   */
  evolution:
    RecommendationEvolutionResult;
};

/* ------------------------------------------------------------------ */
/* Assessment Collection                                              */
/* ------------------------------------------------------------------ */

/**
 * Assessment와 그 근거 Signal을 함께 보존하는 구조입니다.
 *
 * Assessment만으로도 현재 상태를 판단할 수 있지만,
 * Runtime 디버깅과 설명 가능성을 위해 사용된 Signal 집합을
 * 함께 유지합니다.
 */
export type RecommendationEvolutionIntelligenceAssessmentCollection = {
  /**
   * 최종 Intelligence Assessment입니다.
   */
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  /**
   * Assessment 계산에 사용된 전체 Signal입니다.
   */
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  /**
   * Primary Signal입니다.
   *
   * 해당 Signal이 없으면 null입니다.
   */
  primarySignal:
    RecommendationEvolutionIntelligenceSignal | null;

  /**
   * Assessment에 실질적으로 영향을 준 Signal ID입니다.
   */
  contributingSignalIds:
    string[];

  /**
   * Assessment 생성 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  assessedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Assessment Summary                                                 */
/* ------------------------------------------------------------------ */

/**
 * Assessment의 핵심 상태를 간결하게 전달하기 위한 요약입니다.
 *
 * 전체 Assessment보다 작은 구조가 필요한
 * Presentation, Logging, Diagnostics 계층에서 사용할 수 있습니다.
 */
export type RecommendationEvolutionIntelligenceAssessmentSummary = {
  /**
   * 현재 Intelligence 상태입니다.
   */
  state:
    RecommendationEvolutionIntelligenceState;

  /**
   * Assessment 신뢰도입니다.
   */
  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence;

  /**
   * 가장 중요한 Signal 종류입니다.
   */
  primarySignalType:
    RecommendationEvolutionIntelligenceSignalType | null;

  /**
   * 추가 관찰 필요 여부입니다.
   */
  needsObservation:
    boolean;

  /**
   * Runtime 개입이 필요한 상태인지 여부입니다.
   *
   * stalled 또는 fragmented와 같이
   * Recommendation 생성 전략을 조정해야 하는 경우 true입니다.
   */
  requiresIntervention:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Assessment Query Types                                             */
/* ------------------------------------------------------------------ */

/**
 * Assessment가 특정 상태인지 확인할 때 사용하는 입력입니다.
 */
export type MatchRecommendationEvolutionIntelligenceStateParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  state:
    RecommendationEvolutionIntelligenceState;
};

/**
 * Assessment 점수를 조회할 때 사용할 수 있는 Score Key입니다.
 */
export type RecommendationEvolutionIntelligenceScoreKey =
  keyof RecommendationEvolutionIntelligenceScores;

/**
 * 특정 Assessment Score를 조회할 때 사용하는 입력입니다.
 */
export type GetRecommendationEvolutionIntelligenceScoreParams = {
  scores:
    RecommendationEvolutionIntelligenceScores;

  key:
    RecommendationEvolutionIntelligenceScoreKey;
};

/**
 * Assessment의 상태 우선순위를 비교할 때 사용하는 입력입니다.
 */
export type CompareRecommendationEvolutionIntelligenceStatesParams = {
  left:
    RecommendationEvolutionIntelligenceState;

  right:
    RecommendationEvolutionIntelligenceState;
};

/* ------------------------------------------------------------------ */
/* Assessment Validation Types                                        */
/* ------------------------------------------------------------------ */

/**
 * Intelligence Score 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionIntelligenceScoreParams = {
  value:
    unknown;

  fieldName:
    string;
};

/**
 * Assessment Scores 전체 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionIntelligenceScoresParams = {
  scores:
    RecommendationEvolutionIntelligenceScores;

  fieldName:
    string;
};

/**
 * Assessment 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionIntelligenceAssessmentParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

/* ------------------------------------------------------------------ */
/* Assessment State Guards                                            */
/* ------------------------------------------------------------------ */

/**
 * unknown 값이 지원되는 Intelligence State인지 확인합니다.
 */
export function isRecommendationEvolutionIntelligenceState(
  value:
    unknown,
): value is RecommendationEvolutionIntelligenceState {
  return (
    value === "unavailable" ||
    value === "observing" ||
    value === "stable" ||
    value === "progressing" ||
    value === "stalled" ||
    value === "fragmented" ||
    value === "advancing"
  );
}

/**
 * Intelligence State가 충분한 데이터 분석을 전제로 하는 상태인지
 * 확인합니다.
 */
export function isResolvedRecommendationEvolutionIntelligenceState(
  state:
    RecommendationEvolutionIntelligenceState,
): boolean {
  return (
    state !== "unavailable" &&
    state !== "observing"
  );
}

/**
 * Intelligence State가 Runtime의 개입을 요구하는지 확인합니다.
 */
export function isRecommendationEvolutionInterventionState(
  state:
    RecommendationEvolutionIntelligenceState,
): boolean {
  return (
    state === "stalled" ||
    state === "fragmented"
  );
}

/**
 * Intelligence State가 긍정적인 진전 흐름인지 확인합니다.
 */
export function isRecommendationEvolutionProgressState(
  state:
    RecommendationEvolutionIntelligenceState,
): boolean {
  return (
    state === "progressing" ||
    state === "advancing"
  );
}

/**
 * Intelligence State가 현재 Recommendation 방향의 보존을
 * 우선해야 하는 상태인지 확인합니다.
 */
export function isRecommendationEvolutionPreservationState(
  state:
    RecommendationEvolutionIntelligenceState,
): boolean {
  return (
    state === "stable" ||
    state === "progressing" ||
    state === "stalled"
  );
}

/* ------------------------------------------------------------------ */
/* Score Guards                                                       */
/* ------------------------------------------------------------------ */

/**
 * unknown 값이 유효한 정규화 점수인지 확인합니다.
 *
 * 유효 범위는 0 이상 1 이하입니다.
 */
export function isRecommendationEvolutionIntelligenceScore(
  value:
    unknown,
): value is RecommendationEvolutionIntelligenceScore {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

/**
 * unknown 값이 지원되는 Assessment Score Key인지 확인합니다.
 */
export function isRecommendationEvolutionIntelligenceScoreKey(
  value:
    unknown,
): value is RecommendationEvolutionIntelligenceScoreKey {
  return (
    value === "stability" ||
    value === "progress" ||
    value === "repetitionRisk" ||
    value === "redirectionRisk" ||
    value === "completionMomentum"
  );
}

/* ------------------------------------------------------------------ */
/* Assessment Helpers                                                 */
/* ------------------------------------------------------------------ */

/**
 * Assessment Scores에서 특정 점수를 반환합니다.
 */
export function getRecommendationEvolutionIntelligenceScore(
  params:
    GetRecommendationEvolutionIntelligenceScoreParams,
): RecommendationEvolutionIntelligenceScore {
  return params.scores[
    params.key
  ];
}

/**
 * Assessment가 특정 Intelligence State인지 확인합니다.
 */
export function matchesRecommendationEvolutionIntelligenceState(
  params:
    MatchRecommendationEvolutionIntelligenceStateParams,
): boolean {
  return (
    params.assessment.state ===
    params.state
  );
}

/**
 * Assessment에서 간결한 Summary를 생성합니다.
 *
 * 이 함수는 문자열 Presentation을 생성하지 않고,
 * 구조화된 핵심 상태만 반환합니다.
 */
export function createRecommendationEvolutionIntelligenceAssessmentSummary(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
): RecommendationEvolutionIntelligenceAssessmentSummary {
  return {
    state:
      assessment.state,

    confidence:
      assessment.confidence,

    primarySignalType:
      assessment.primarySignalType,

    needsObservation:
      assessment.needsObservation,

    requiresIntervention:
      isRecommendationEvolutionInterventionState(
        assessment.state,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Recommendation Strategy Types                                      */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Intelligence가 선택할 수 있는
 * Runtime 대응 전략의 종류입니다.
 *
 * observe
 * 데이터가 부족하므로 새로운 판단보다 추가 관찰을 우선합니다.
 *
 * maintain
 * 현재 Recommendation 방향을 유지합니다.
 *
 * clarify
 * Recommendation의 의미나 목표를 더 명확하게 만듭니다.
 *
 * narrow
 * 현재 Recommendation을 더 작은 실행 단위로 좁힙니다.
 *
 * confirm-completion
 * 새로운 Recommendation을 생성하기 전에
 * 현재 Recommendation의 완료 여부를 먼저 확인합니다.
 *
 * advance
 * 이전 Recommendation의 완료 또는 충분한 진전을 근거로
 * 다음 단계 Recommendation으로 이동합니다.
 *
 * stabilize
 * 잦은 방향 변경을 줄이고 현재 목표를 다시 고정합니다.
 *
 * reconsider
 * 현재 Recommendation의 타당성이나 전제 자체를 다시 검토합니다.
 */
export type RecommendationEvolutionStrategyType =
  | "observe"
  | "maintain"
  | "clarify"
  | "narrow"
  | "confirm-completion"
  | "advance"
  | "stabilize"
  | "reconsider";

/* ------------------------------------------------------------------ */
/* Strategy Priority                                                  */
/* ------------------------------------------------------------------ */

/**
 * Strategy를 Runtime이 얼마나 우선적으로 반영해야 하는지 나타냅니다.
 */
export type RecommendationEvolutionStrategyPriority =
  | "low"
  | "medium"
  | "high";

/* ------------------------------------------------------------------ */
/* Strategy Decision Flags                                            */
/* ------------------------------------------------------------------ */

/**
 * Strategy가 Runtime Recommendation 생성 흐름에 적용할
 * 구체적인 의사결정 플래그입니다.
 *
 * 각 값은 서로 완전히 독립적이지 않으며,
 * Strategy Resolver가 의미적으로 일관된 조합을 생성해야 합니다.
 */
export type RecommendationEvolutionStrategyDecisions = {
  /**
   * 새로운 Recommendation을 생성해도 되는지 여부입니다.
   */
  shouldGenerateNewRecommendation:
    boolean;

  /**
   * 현재 Recommendation을 보존해야 하는지 여부입니다.
   */
  shouldPreserveCurrentRecommendation:
    boolean;

  /**
   * 현재 Recommendation의 진행 근거를 요청해야 하는지 여부입니다.
   */
  shouldRequestProgressEvidence:
    boolean;

  /**
   * 현재 Recommendation의 완료 여부를 확인해야 하는지 여부입니다.
   */
  shouldRequestCompletionConfirmation:
    boolean;

  /**
   * 새로운 방향 추가보다 기존 방향의 안정화를 우선해야 하는지
   * 여부입니다.
   */
  shouldReduceDirectionChanges:
    boolean;

  /**
   * 현재 Recommendation을 더 구체적인 실행 단위로 좁혀야 하는지
   * 여부입니다.
   */
  shouldNarrowCurrentRecommendation:
    boolean;

  /**
   * 현재 Recommendation의 의미나 목표를 다시 명확히 해야 하는지
   * 여부입니다.
   */
  shouldClarifyCurrentRecommendation:
    boolean;

  /**
   * Recommendation의 전제 또는 방향 자체를 다시 검토해야 하는지
   * 여부입니다.
   */
  shouldReconsiderCurrentRecommendation:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Recommendation Strategy                                            */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Intelligence가 최종적으로 선택한
 * Runtime 대응 전략입니다.
 */
export type RecommendationEvolutionStrategy = {
  /**
   * 선택된 전략 종류입니다.
   */
  type:
    RecommendationEvolutionStrategyType;

  /**
   * 전략 적용 우선순위입니다.
   */
  priority:
    RecommendationEvolutionStrategyPriority;

  /**
   * 전략 결정에 사용된 Intelligence 상태입니다.
   */
  sourceState:
    RecommendationEvolutionIntelligenceState;

  /**
   * 전략 결정에 가장 크게 기여한 Signal 종류입니다.
   */
  primarySignalType:
    RecommendationEvolutionIntelligenceSignalType | null;

  /**
   * Runtime이 실제로 사용할 구체적인 의사결정 플래그입니다.
   */
  decisions:
    RecommendationEvolutionStrategyDecisions;

  /**
   * Strategy 선택 근거입니다.
   */
  rationale:
    string[];

  /**
   * Strategy와 직접 관련된 Signal ID입니다.
   */
  relatedSignalIds:
    string[];

  /**
   * Strategy 생성 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  resolvedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Strategy Resolution Parameters                                     */
/* ------------------------------------------------------------------ */

/**
 * Intelligence Assessment를 Runtime Strategy로 변환할 때 사용하는
 * 입력입니다.
 */
export type ResolveRecommendationEvolutionStrategyParams = {
  /**
   * 현재 Recommendation Evolution Intelligence Assessment입니다.
   */
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  /**
   * Assessment에 사용된 Intelligence Signal입니다.
   */
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  /**
   * Strategy 생성 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  resolvedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Runtime Decision Types                                             */
/* ------------------------------------------------------------------ */

/**
 * Strategy를 Runtime의 단일 행동 결정으로 표현한 종류입니다.
 *
 * Strategy는 여러 Decision Flag를 포함할 수 있지만,
 * Runtime Decision은 실제 실행 파이프라인에서 사용할 수 있도록
 * 하나의 명시적인 행동 단위로 분해됩니다.
 */
export type RecommendationEvolutionRuntimeDecisionType =
  | "allow-new-recommendation"
  | "block-new-recommendation"
  | "preserve-current-recommendation"
  | "request-progress-evidence"
  | "request-completion-confirmation"
  | "reduce-direction-changes"
  | "narrow-current-recommendation"
  | "clarify-current-recommendation"
  | "reconsider-current-recommendation";

/* ------------------------------------------------------------------ */
/* Runtime Decision Priority                                          */
/* ------------------------------------------------------------------ */

/**
 * Runtime Decision의 실행 우선순위입니다.
 */
export type RecommendationEvolutionRuntimeDecisionPriority =
  RecommendationEvolutionStrategyPriority;

/* ------------------------------------------------------------------ */
/* Runtime Decision                                                   */
/* ------------------------------------------------------------------ */

/**
 * Runtime이 실제 Recommendation 생성 흐름에 적용할 수 있는
 * 단일 의사결정 단위입니다.
 */
export type RecommendationEvolutionRuntimeDecision = {
  /**
   * Decision 자체의 안정적인 ID입니다.
   */
  id:
    string;

  /**
   * Decision 종류입니다.
   */
  type:
    RecommendationEvolutionRuntimeDecisionType;

  /**
   * Decision 실행 우선순위입니다.
   */
  priority:
    RecommendationEvolutionRuntimeDecisionPriority;

  /**
   * Decision 활성화 여부입니다.
   *
   * false인 Decision은 Diagnostics나 설명 가능성을 위해
   * 보존할 수 있지만 Runtime 실행에는 적용하지 않습니다.
   */
  enabled:
    boolean;

  /**
   * Decision을 만든 Strategy 종류입니다.
   */
  sourceStrategyType:
    RecommendationEvolutionStrategyType;

  /**
   * Decision을 설명하는 짧은 문장입니다.
   */
  description:
    string;

  /**
   * Decision 근거입니다.
   */
  rationale:
    string[];

  /**
   * Decision과 관련된 Signal ID입니다.
   */
  relatedSignalIds:
    string[];

  /**
   * Decision 생성 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  decidedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Runtime Decision Collection                                        */
/* ------------------------------------------------------------------ */

/**
 * 하나의 Strategy에서 파생된 Runtime Decision 집합입니다.
 */
export type RecommendationEvolutionRuntimeDecisionCollection = {
  /**
   * Decision 생성의 원본 Strategy입니다.
   */
  strategy:
    RecommendationEvolutionStrategy;

  /**
   * 생성된 전체 Runtime Decision입니다.
   */
  decisions:
    RecommendationEvolutionRuntimeDecision[];

  /**
   * 활성화된 Decision ID입니다.
   */
  enabledDecisionIds:
    string[];

  /**
   * 가장 우선적인 Decision ID입니다.
   *
   * 활성 Decision이 없으면 null입니다.
   */
  primaryDecisionId:
    string | null;

  /**
   * 새로운 Recommendation 생성이 허용되는지 여부입니다.
   *
   * Runtime에서 자주 조회하는 값을 빠르게 사용할 수 있도록
   * 파생 필드로 제공합니다.
   */
  canGenerateNewRecommendation:
    boolean;

  /**
   * 현재 Recommendation 보존이 필요한지 여부입니다.
   */
  mustPreserveCurrentRecommendation:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Runtime Decision Creation Parameters                               */
/* ------------------------------------------------------------------ */

/**
 * Strategy에서 Runtime Decision을 생성할 때 사용하는 입력입니다.
 */
export type CreateRecommendationEvolutionRuntimeDecisionsParams = {
  /**
   * Decision 생성의 원본 Strategy입니다.
   */
  strategy:
    RecommendationEvolutionStrategy;

  /**
   * Decision 생성 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  decidedAt:
    string;

  /**
   * Decision ID 생성 Factory입니다.
   */
  createDecisionId:
    (
      type:
        RecommendationEvolutionRuntimeDecisionType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Strategy Query Types                                               */
/* ------------------------------------------------------------------ */

/**
 * Strategy가 특정 종류인지 확인할 때 사용하는 입력입니다.
 */
export type MatchRecommendationEvolutionStrategyParams = {
  strategy:
    RecommendationEvolutionStrategy;

  type:
    RecommendationEvolutionStrategyType;
};

/**
 * Strategy의 특정 Decision Flag를 조회할 때 사용하는 Key입니다.
 */
export type RecommendationEvolutionStrategyDecisionKey =
  keyof RecommendationEvolutionStrategyDecisions;

/**
 * Strategy Decision Flag를 조회할 때 사용하는 입력입니다.
 */
export type GetRecommendationEvolutionStrategyDecisionParams = {
  decisions:
    RecommendationEvolutionStrategyDecisions;

  key:
    RecommendationEvolutionStrategyDecisionKey;
};

/**
 * 두 Strategy의 우선순위를 비교할 때 사용하는 입력입니다.
 */
export type CompareRecommendationEvolutionStrategiesParams = {
  left:
    RecommendationEvolutionStrategy;

  right:
    RecommendationEvolutionStrategy;
};

/* ------------------------------------------------------------------ */
/* Runtime Decision Query Types                                       */
/* ------------------------------------------------------------------ */

/**
 * Runtime Decision 집합에서 특정 Decision 종류를 찾을 때 사용하는
 * 입력입니다.
 */
export type FindRecommendationEvolutionRuntimeDecisionParams = {
  decisions:
    readonly RecommendationEvolutionRuntimeDecision[];

  type:
    RecommendationEvolutionRuntimeDecisionType;
};

/**
 * Runtime Decision의 활성 여부를 조회할 때 사용하는 입력입니다.
 */
export type HasEnabledRecommendationEvolutionRuntimeDecisionParams = {
  decisions:
    readonly RecommendationEvolutionRuntimeDecision[];

  type:
    RecommendationEvolutionRuntimeDecisionType;
};

/* ------------------------------------------------------------------ */
/* Guidance Tone                                                      */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Guidance가 사용자와 Runtime에 전달하는
 * 전체적인 표현 톤입니다.
 *
 * unavailable
 * 분석 가능한 Recommendation Evolution 정보가 없습니다.
 *
 * neutral
 * 특별한 위험이나 진전 없이 추가 관찰이 필요합니다.
 *
 * stable
 * 현재 Recommendation 방향이 안정적으로 유지되고 있습니다.
 *
 * progressing
 * Recommendation이 구체화되거나 다음 단계로 발전하고 있습니다.
 *
 * attention
 * 반복 정체, 잦은 방향 전환, 조기 교체 등
 * Runtime의 주의가 필요한 상태입니다.
 */
export type RecommendationEvolutionGuidanceTone =
  | "unavailable"
  | "neutral"
  | "stable"
  | "progressing"
  | "attention";

/* ------------------------------------------------------------------ */
/* Guidance Warning                                                   */
/* ------------------------------------------------------------------ */

/**
 * Guidance에서 사용자 또는 Runtime에 전달하는 단일 Warning입니다.
 */
export type RecommendationEvolutionGuidanceWarning = {
  /**
   * Warning 자체의 안정적인 ID입니다.
   */
  id:
    string;

  /**
   * Warning의 심각도입니다.
   */
  severity:
    RecommendationEvolutionIntelligenceSignalSeverity;

  /**
   * Warning을 설명하는 짧은 제목입니다.
   */
  title:
    string;

  /**
   * Warning의 의미를 설명하는 문장입니다.
   */
  description:
    string;

  /**
   * Warning과 직접 관련된 Signal ID입니다.
   */
  relatedSignalIds:
    string[];
};

/* ------------------------------------------------------------------ */
/* Guidance Observation                                               */
/* ------------------------------------------------------------------ */

/**
 * Runtime이 다음 분석 시점까지 관찰해야 하는 항목입니다.
 */
export type RecommendationEvolutionGuidanceObservation = {
  /**
   * Observation 자체의 안정적인 ID입니다.
   */
  id:
    string;

  /**
   * 관찰해야 하는 대상 또는 조건입니다.
   */
  subject:
    string;

  /**
   * 왜 이 항목을 관찰해야 하는지 설명합니다.
   */
  reason:
    string;

  /**
   * 관찰 우선순위입니다.
   */
  priority:
    RecommendationEvolutionStrategyPriority;

  /**
   * Observation과 관련된 Signal ID입니다.
   */
  relatedSignalIds:
    string[];
};

/* ------------------------------------------------------------------ */
/* Recommendation Evolution Guidance                                  */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Intelligence의 최종 Guidance입니다.
 *
 * Guidance는 Assessment와 Strategy를 사람이 읽을 수 있는 표현과
 * Runtime이 사용할 수 있는 지침으로 변환한 결과입니다.
 */
export type RecommendationEvolutionGuidance = {
  /**
   * Guidance 자체의 안정적인 ID입니다.
   */
  id:
    string;

  /**
   * Guidance 표현 톤입니다.
   */
  tone:
    RecommendationEvolutionGuidanceTone;

  /**
   * Guidance의 핵심 내용을 전달하는 제목입니다.
   */
  headline:
    string;

  /**
   * 현재 Recommendation Evolution 상태를 설명하는 요약입니다.
   */
  summary:
    string;

  /**
   * Runtime이 다음 Recommendation 생성 과정에서 적용해야 하는
   * 구체적인 지침입니다.
   */
  runtimeInstruction:
    string;

  /**
   * 사용자에게 제시할 수 있는 다음 질문입니다.
   *
   * 추가 질문이 필요하지 않으면 null입니다.
   */
  nextQuestion:
    string | null;

  /**
   * 현재 Recommendation을 유지하는 이유 또는
   * 전략을 변경하는 이유를 설명합니다.
   */
  rationale:
    string[];

  /**
   * 사용자 또는 Runtime이 주의해야 하는 Warning입니다.
   */
  warnings:
    RecommendationEvolutionGuidanceWarning[];

  /**
   * 다음 분석 시점까지 관찰해야 하는 항목입니다.
   */
  observations:
    RecommendationEvolutionGuidanceObservation[];

  /**
   * Guidance를 생성한 원본 Intelligence State입니다.
   */
  sourceState:
    RecommendationEvolutionIntelligenceState;

  /**
   * Guidance를 생성한 원본 Strategy Type입니다.
   */
  sourceStrategyType:
    RecommendationEvolutionStrategyType;

  /**
   * Guidance에 가장 큰 영향을 준 Signal Type입니다.
   */
  primarySignalType:
    RecommendationEvolutionIntelligenceSignalType | null;

  /**
   * Guidance와 직접 관련된 Signal ID입니다.
   */
  relatedSignalIds:
    string[];

  /**
   * Guidance 생성 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  createdAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Guidance Collection                                                */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Guidance 전체 집합입니다.
 *
 * 하나의 Intelligence 결과로부터 생성된
 * Guidance와 Runtime Decision을 함께 보존합니다.
 */
export type RecommendationEvolutionGuidanceCollection = {
  /**
   * 최종 Guidance입니다.
   */
  guidance:
    RecommendationEvolutionGuidance;

  /**
   * Guidance 생성의 원본 Strategy입니다.
   */
  strategy:
    RecommendationEvolutionStrategy;

  /**
   * Guidance 생성의 원본 Assessment입니다.
   */
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  /**
   * Guidance 생성에 사용된 Runtime Decision입니다.
   */
  runtimeDecisions:
    readonly RecommendationEvolutionRuntimeDecision[];

  /**
   * Guidance 생성에 사용된 Intelligence Signal입니다.
   */
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  /**
   * Guidance 생성 시각입니다.
   */
  createdAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Guidance Creation Parameters                                       */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Guidance 생성 입력입니다.
 */
export type CreateRecommendationEvolutionGuidanceParams = {
  /**
   * Intelligence Assessment입니다.
   */
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  /**
   * Runtime Strategy입니다.
   */
  strategy:
    RecommendationEvolutionStrategy;

  /**
   * Runtime Decision입니다.
   */
  runtimeDecisions:
    readonly RecommendationEvolutionRuntimeDecision[];

  /**
   * Intelligence Signal입니다.
   */
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  /**
   * Guidance 생성 시각입니다.
   */
  createdAt:
    string;

  /**
   * Guidance ID 생성기입니다.
   */
  createGuidanceId:
    () => string;

  /**
   * Warning ID 생성기입니다.
   */
  createWarningId:
    (
      index:
        number,
    ) => string;

  /**
   * Observation ID 생성기입니다.
   */
  createObservationId:
    (
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Guidance Query Types                                               */
/* ------------------------------------------------------------------ */

/**
 * Guidance가 특정 Tone인지 확인할 때 사용하는 입력입니다.
 */
export type MatchRecommendationEvolutionGuidanceToneParams = {
  guidance:
    RecommendationEvolutionGuidance;

  tone:
    RecommendationEvolutionGuidanceTone;
};

/**
 * Guidance Warning 조회 입력입니다.
 */
export type FindRecommendationEvolutionGuidanceWarningParams = {
  warnings:
    readonly RecommendationEvolutionGuidanceWarning[];

  severity?:
    RecommendationEvolutionIntelligenceSignalSeverity;

  signalType?:
    RecommendationEvolutionIntelligenceSignalType;
};

/**
 * Observation 조회 입력입니다.
 */
export type FindRecommendationEvolutionObservationParams = {
  observations:
    readonly RecommendationEvolutionGuidanceObservation[];

  priority?:
    RecommendationEvolutionStrategyPriority;
};

/**
 * Runtime Instruction 생성 입력입니다.
 */
export type CreateRecommendationEvolutionRuntimeInstructionParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;
};

/**
 * Headline 생성 입력입니다.
 */
export type CreateRecommendationEvolutionHeadlineParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;
};

/**
 * Summary 생성 입력입니다.
 */
export type CreateRecommendationEvolutionSummaryParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

/**
 * Next Question 생성 입력입니다.
 */
export type CreateRecommendationEvolutionNextQuestionParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

/* ------------------------------------------------------------------ */
/* Guidance Validation Parameters                                     */
/* ------------------------------------------------------------------ */

/**
 * Guidance 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionGuidanceParams = {
  guidance:
    RecommendationEvolutionGuidance;

  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;
};

/**
 * Guidance Collection 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionGuidanceCollectionParams = {
  collection:
    RecommendationEvolutionGuidanceCollection;
};

/**
 * Guidance Warning 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionGuidanceWarningParams = {
  warning:
    RecommendationEvolutionGuidanceWarning;
};

/**
 * Observation 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionObservationParams = {
  observation:
    RecommendationEvolutionGuidanceObservation;
};

/* ------------------------------------------------------------------ */
/* Strategy Type Guards                                               */
/* ------------------------------------------------------------------ */

/**
 * unknown 값이 지원되는 Strategy Type인지 확인합니다.
 */
export function isRecommendationEvolutionStrategyType(
  value:
    unknown,
): value is RecommendationEvolutionStrategyType {
  return (
    value === "observe" ||
    value === "maintain" ||
    value === "clarify" ||
    value === "narrow" ||
    value === "confirm-completion" ||
    value === "advance" ||
    value === "stabilize" ||
    value === "reconsider"
  );
}

/**
 * unknown 값이 지원되는 Strategy Priority인지 확인합니다.
 */
export function isRecommendationEvolutionStrategyPriority(
  value:
    unknown,
): value is RecommendationEvolutionStrategyPriority {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high"
  );
}

/**
 * Strategy가 특정 종류인지 확인합니다.
 */
export function matchesRecommendationEvolutionStrategy(
  params:
    MatchRecommendationEvolutionStrategyParams,
): boolean {
  return (
    params.strategy.type ===
    params.type
  );
}

/**
 * Strategy가 새로운 Recommendation 생성을 허용하는지 확인합니다.
 */
export function canRecommendationEvolutionStrategyGenerateNewRecommendation(
  strategy:
    RecommendationEvolutionStrategy,
): boolean {
  return (
    strategy.decisions
      .shouldGenerateNewRecommendation
  );
}

/**
 * Strategy가 현재 Recommendation 보존을 요구하는지 확인합니다.
 */
export function shouldRecommendationEvolutionStrategyPreserveCurrentRecommendation(
  strategy:
    RecommendationEvolutionStrategy,
): boolean {
  return (
    strategy.decisions
      .shouldPreserveCurrentRecommendation
  );
}

/**
 * Strategy가 사용자 또는 Runtime의 확인 행동을 요구하는지
 * 확인합니다.
 */
export function doesRecommendationEvolutionStrategyRequireConfirmation(
  strategy:
    RecommendationEvolutionStrategy,
): boolean {
  return (
    strategy.decisions
      .shouldRequestProgressEvidence ||
    strategy.decisions
      .shouldRequestCompletionConfirmation
  );
}

/* ------------------------------------------------------------------ */
/* Strategy Decision Guards                                           */
/* ------------------------------------------------------------------ */

/**
 * unknown 값이 지원되는 Strategy Decision Key인지 확인합니다.
 */
export function isRecommendationEvolutionStrategyDecisionKey(
  value:
    unknown,
): value is RecommendationEvolutionStrategyDecisionKey {
  return (
    value === "shouldGenerateNewRecommendation" ||
    value === "shouldPreserveCurrentRecommendation" ||
    value === "shouldRequestProgressEvidence" ||
    value === "shouldRequestCompletionConfirmation" ||
    value === "shouldReduceDirectionChanges" ||
    value === "shouldNarrowCurrentRecommendation" ||
    value === "shouldClarifyCurrentRecommendation" ||
    value === "shouldReconsiderCurrentRecommendation"
  );
}

/**
 * Strategy Decision Flag를 반환합니다.
 */
export function getRecommendationEvolutionStrategyDecision(
  params:
    GetRecommendationEvolutionStrategyDecisionParams,
): boolean {
  return params.decisions[
    params.key
  ];
}

/**
 * Strategy Decision 구조에 하나 이상의 활성 Flag가 존재하는지
 * 확인합니다.
 */
export function hasEnabledRecommendationEvolutionStrategyDecision(
  decisions:
    RecommendationEvolutionStrategyDecisions,
): boolean {
  return (
    decisions
      .shouldGenerateNewRecommendation ||
    decisions
      .shouldPreserveCurrentRecommendation ||
    decisions
      .shouldRequestProgressEvidence ||
    decisions
      .shouldRequestCompletionConfirmation ||
    decisions
      .shouldReduceDirectionChanges ||
    decisions
      .shouldNarrowCurrentRecommendation ||
    decisions
      .shouldClarifyCurrentRecommendation ||
    decisions
      .shouldReconsiderCurrentRecommendation
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Type Guards                                       */
/* ------------------------------------------------------------------ */

/**
 * unknown 값이 지원되는 Runtime Decision Type인지 확인합니다.
 */
export function isRecommendationEvolutionRuntimeDecisionType(
  value:
    unknown,
): value is RecommendationEvolutionRuntimeDecisionType {
  return (
    value === "allow-new-recommendation" ||
    value === "block-new-recommendation" ||
    value === "preserve-current-recommendation" ||
    value === "request-progress-evidence" ||
    value === "request-completion-confirmation" ||
    value === "reduce-direction-changes" ||
    value === "narrow-current-recommendation" ||
    value === "clarify-current-recommendation" ||
    value === "reconsider-current-recommendation"
  );
}

/**
 * Runtime Decision 집합에서 특정 Type의 Decision을 찾습니다.
 */
export function findRecommendationEvolutionRuntimeDecision(
  params:
    FindRecommendationEvolutionRuntimeDecisionParams,
): RecommendationEvolutionRuntimeDecision | null {
  return (
    params.decisions.find(
      (
        decision,
      ) =>
        decision.type ===
        params.type,
    ) ??
    null
  );
}

/**
 * 특정 Type의 활성 Runtime Decision이 존재하는지 확인합니다.
 */
export function hasEnabledRecommendationEvolutionRuntimeDecision(
  params:
    HasEnabledRecommendationEvolutionRuntimeDecisionParams,
): boolean {
  return params.decisions.some(
    (
      decision,
    ) =>
      decision.type ===
        params.type &&
      decision.enabled,
  );
}

/**
 * Runtime Decision 집합에서 활성화된 Decision만 반환합니다.
 */
export function getEnabledRecommendationEvolutionRuntimeDecisions(
  decisions:
    readonly RecommendationEvolutionRuntimeDecision[],
): RecommendationEvolutionRuntimeDecision[] {
  return decisions.filter(
    (
      decision,
    ) =>
      decision.enabled,
  );
}

/* ------------------------------------------------------------------ */
/* Guidance Type Guards                                               */
/* ------------------------------------------------------------------ */

/**
 * unknown 값이 지원되는 Guidance Tone인지 확인합니다.
 */
export function isRecommendationEvolutionGuidanceTone(
  value:
    unknown,
): value is RecommendationEvolutionGuidanceTone {
  return (
    value === "unavailable" ||
    value === "neutral" ||
    value === "stable" ||
    value === "progressing" ||
    value === "attention"
  );
}

/**
 * Guidance가 특정 Tone인지 확인합니다.
 */
export function matchesRecommendationEvolutionGuidanceTone(
  params:
    MatchRecommendationEvolutionGuidanceToneParams,
): boolean {
  return (
    params.guidance.tone ===
    params.tone
  );
}

/**
 * Guidance가 Warning을 포함하는지 확인합니다.
 */
export function hasRecommendationEvolutionGuidanceWarnings(
  guidance:
    RecommendationEvolutionGuidance,
): boolean {
  return (
    guidance.warnings.length >
    0
  );
}

/**
 * Guidance가 Observation을 포함하는지 확인합니다.
 */
export function hasRecommendationEvolutionGuidanceObservations(
  guidance:
    RecommendationEvolutionGuidance,
): boolean {
  return (
    guidance.observations.length >
    0
  );
}

/**
 * Guidance가 다음 질문을 포함하는지 확인합니다.
 */
export function hasRecommendationEvolutionGuidanceNextQuestion(
  guidance:
    RecommendationEvolutionGuidance,
): guidance is RecommendationEvolutionGuidance & {
  nextQuestion:
    string;
} {
  return (
    typeof guidance.nextQuestion ===
      "string" &&
    guidance.nextQuestion
      .trim()
      .length >
      0
  );
}

/* ------------------------------------------------------------------ */
/* Guidance Query Helpers                                             */
/* ------------------------------------------------------------------ */

/**
 * 조건에 일치하는 첫 번째 Guidance Warning을 반환합니다.
 */
export function findRecommendationEvolutionGuidanceWarning(
  params:
    FindRecommendationEvolutionGuidanceWarningParams,
): RecommendationEvolutionGuidanceWarning | null {
  return (
    params.warnings.find(
      (
        warning,
      ) => {
        if (
          params.severity !==
            undefined &&
          warning.severity !==
            params.severity
        ) {
          return false;
        }

        if (
          params.signalType !==
          undefined
        ) {
          return warning
            .relatedSignalIds
            .length >
            0;
        }

        return true;
      },
    ) ??
    null
  );
}

/**
 * 조건에 일치하는 첫 번째 Observation을 반환합니다.
 */
export function findRecommendationEvolutionObservation(
  params:
    FindRecommendationEvolutionObservationParams,
): RecommendationEvolutionGuidanceObservation | null {
  return (
    params.observations.find(
      (
        observation,
      ) => {
        if (
          params.priority !==
            undefined &&
          observation.priority !==
            params.priority
        ) {
          return false;
        }

        return true;
      },
    ) ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Guidance Summary Types                                             */
/* ------------------------------------------------------------------ */

/**
 * Guidance의 핵심 정보만 제공하는 경량 요약 구조입니다.
 */
export type RecommendationEvolutionGuidanceSummary = {
  tone:
    RecommendationEvolutionGuidanceTone;

  headline:
    string;

  runtimeInstruction:
    string;

  nextQuestion:
    string | null;

  warningCount:
    number;

  observationCount:
    number;

  sourceState:
    RecommendationEvolutionIntelligenceState;

  sourceStrategyType:
    RecommendationEvolutionStrategyType;
};

/**
 * Guidance에서 경량 Summary를 생성합니다.
 */
export function createRecommendationEvolutionGuidanceSummary(
  guidance:
    RecommendationEvolutionGuidance,
): RecommendationEvolutionGuidanceSummary {
  return {
    tone:
      guidance.tone,

    headline:
      guidance.headline,

    runtimeInstruction:
      guidance.runtimeInstruction,

    nextQuestion:
      guidance.nextQuestion,

    warningCount:
      guidance.warnings.length,

    observationCount:
      guidance.observations.length,

    sourceState:
      guidance.sourceState,

    sourceStrategyType:
      guidance.sourceStrategyType,
  };
}

/* ------------------------------------------------------------------ */
/* Validation Helper Types                                            */
/* ------------------------------------------------------------------ */

/**
 * Strategy 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionStrategyParams = {
  strategy:
    RecommendationEvolutionStrategy;

  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

/**
 * Strategy Decision 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionStrategyDecisionsParams = {
  decisions:
    RecommendationEvolutionStrategyDecisions;

  strategyType:
    RecommendationEvolutionStrategyType;
};

/**
 * Runtime Decision 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionRuntimeDecisionParams = {
  decision:
    RecommendationEvolutionRuntimeDecision;

  strategy:
    RecommendationEvolutionStrategy;
};

/**
 * Runtime Decision Collection 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionRuntimeDecisionCollectionParams = {
  collection:
    RecommendationEvolutionRuntimeDecisionCollection;
};

/**
 * Guidance Summary 검증 입력입니다.
 */
export type ValidateRecommendationEvolutionGuidanceSummaryParams = {
  summary:
    RecommendationEvolutionGuidanceSummary;
};

/* ------------------------------------------------------------------ */
/* Priority Helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Strategy Priority를 정렬 가능한 숫자로 변환합니다.
 */
export function getRecommendationEvolutionStrategyPriorityWeight(
  priority:
    RecommendationEvolutionStrategyPriority,
): number {
  switch (priority) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;
  }
}

/**
 * 두 Strategy의 우선순위를 비교합니다.
 *
 * 반환값이 양수이면 left가 더 높은 우선순위입니다.
 */
export function compareRecommendationEvolutionStrategies(
  params:
    CompareRecommendationEvolutionStrategiesParams,
): number {
  return (
    getRecommendationEvolutionStrategyPriorityWeight(
      params.left.priority,
    ) -
    getRecommendationEvolutionStrategyPriorityWeight(
      params.right.priority,
    )
  );
}

/* ------------------------------------------------------------------ */
/* Guidance Consistency Helpers                                       */
/* ------------------------------------------------------------------ */

/**
 * Guidance Tone이 Intelligence State와 기본적으로 일치하는지
 * 확인합니다.
 *
 * 이 함수는 완전한 Validation을 대체하지 않고,
 * 빠른 일관성 점검을 위한 Helper입니다.
 */
export function isRecommendationEvolutionGuidanceToneConsistent(
  guidance:
    RecommendationEvolutionGuidance,
): boolean {
  switch (guidance.sourceState) {
    case "unavailable":
      return (
        guidance.tone ===
        "unavailable"
      );

    case "observing":
      return (
        guidance.tone ===
        "neutral"
      );

    case "stable":
      return (
        guidance.tone ===
        "stable"
      );

    case "progressing":
    case "advancing":
      return (
        guidance.tone ===
        "progressing"
      );

    case "stalled":
    case "fragmented":
      return (
        guidance.tone ===
        "attention"
      );
  }
}

/**
 * Strategy와 Guidance의 Source Type이 일치하는지 확인합니다.
 */
export function isRecommendationEvolutionGuidanceStrategyConsistent(
  guidance:
    RecommendationEvolutionGuidance,
  strategy:
    RecommendationEvolutionStrategy,
): boolean {
  return (
    guidance.sourceStrategyType ===
      strategy.type &&
    guidance.sourceState ===
      strategy.sourceState
  );
}

/* ------------------------------------------------------------------ */
/* Public Intelligence API                                            */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Intelligence 공개 결과 버전입니다.
 *
 * 구조적 변경이 발생하면 새로운 숫자 리터럴 버전을 추가합니다.
 */
export type RecommendationEvolutionIntelligenceVersion =
  1;

/**
 * Recommendation Evolution Intelligence 전체 파이프라인 입력입니다.
 *
 * REI02에서 생성한 Evolution Result를 받아 Signal, Assessment,
 * Strategy, Runtime Decision, Guidance를 순서대로 생성합니다.
 */
export type AnalyzeRecommendationEvolutionIntelligenceParams = {
  /**
   * REI02 Recommendation Evolution 분석 결과입니다.
   */
  evolution:
    RecommendationEvolutionResult;

  /**
   * Intelligence 전체 분석 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  analyzedAt:
    string;

  /**
   * Signal ID 생성 Factory입니다.
   */
  createSignalId:
    (
      type:
        RecommendationEvolutionIntelligenceSignalType,
      index:
        number,
    ) => string;

  /**
   * Runtime Decision ID 생성 Factory입니다.
   */
  createDecisionId:
    (
      type:
        RecommendationEvolutionRuntimeDecisionType,
      index:
        number,
    ) => string;

  /**
   * Guidance ID 생성 Factory입니다.
   */
  createGuidanceId:
    () => string;

  /**
   * Guidance Warning ID 생성 Factory입니다.
   */
  createWarningId:
    (
      index:
        number,
    ) => string;

  /**
   * Guidance Observation ID 생성 Factory입니다.
   */
  createObservationId:
    (
      index:
        number,
    ) => string;
};

/**
 * Recommendation Evolution Intelligence 전체 분석 결과입니다.
 *
 * 동일한 객체를 중복 생성하지 않도록 signals와 runtimeDecisions는
 * 각각 Collection 내부 배열을 그대로 참조합니다.
 */
export type RecommendationEvolutionIntelligenceResult = {
  /**
   * Public Contract 버전입니다.
   */
  version:
    RecommendationEvolutionIntelligenceVersion;

  /**
   * 분석 대상이 된 REI02 Evolution Result입니다.
   */
  evolution:
    RecommendationEvolutionResult;

  /**
   * Signal과 Signal Collection 메타데이터입니다.
   */
  signalCollection:
    RecommendationEvolutionIntelligenceSignalCollection;

  /**
   * 빠른 소비를 위한 Signal 배열 별칭입니다.
   *
   * signalCollection.signals와 동일한 배열 참조를 사용합니다.
   */
  signals:
    RecommendationEvolutionIntelligenceSignal[];

  /**
   * 현재 Recommendation 흐름에 대한 종합 Assessment입니다.
   */
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  /**
   * Assessment에서 파생된 Runtime 대응 Strategy입니다.
   */
  strategy:
    RecommendationEvolutionStrategy;

  /**
   * Strategy에서 파생된 Runtime Decision Collection입니다.
   */
  runtimeDecisionCollection:
    RecommendationEvolutionRuntimeDecisionCollection;

  /**
   * 빠른 소비를 위한 Runtime Decision 배열 별칭입니다.
   *
   * runtimeDecisionCollection.decisions와 동일한 배열 참조를 사용합니다.
   */
  runtimeDecisions:
    RecommendationEvolutionRuntimeDecision[];

  /**
   * 사용자와 Runtime에 전달할 최종 Guidance입니다.
   */
  guidance:
    RecommendationEvolutionGuidance;

  /**
   * Intelligence 전체 분석 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  analyzedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Public Result Query Types                                          */
/* ------------------------------------------------------------------ */

/**
 * Intelligence Result에서 특정 Signal Type 존재 여부를 조회할 때
 * 사용하는 입력입니다.
 */
export type HasRecommendationEvolutionIntelligenceSignalParams = {
  result:
    RecommendationEvolutionIntelligenceResult;

  type:
    RecommendationEvolutionIntelligenceSignalType;
};

/**
 * Intelligence Result에서 특정 Runtime Decision Type 존재 여부를
 * 조회할 때 사용하는 입력입니다.
 */
export type HasRecommendationEvolutionRuntimeDecisionInResultParams = {
  result:
    RecommendationEvolutionIntelligenceResult;

  type:
    RecommendationEvolutionRuntimeDecisionType;

  enabledOnly?:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Public Result Helpers                                              */
/* ------------------------------------------------------------------ */

/**
 * Intelligence Result에 특정 Signal Type이 존재하는지 확인합니다.
 */
export function hasRecommendationEvolutionIntelligenceSignal(
  params:
    HasRecommendationEvolutionIntelligenceSignalParams,
): boolean {
  return params.result.signals.some(
    (
      signal,
    ) =>
      signal.type ===
      params.type,
  );
}

/**
 * Intelligence Result에 특정 Runtime Decision Type이 존재하는지
 * 확인합니다.
 */
export function hasRecommendationEvolutionRuntimeDecisionInResult(
  params:
    HasRecommendationEvolutionRuntimeDecisionInResultParams,
): boolean {
  return params.result.runtimeDecisions.some(
    (
      decision,
    ) =>
      decision.type ===
        params.type &&
      (
        params.enabledOnly !==
          true ||
        decision.enabled
      ),
  );
}