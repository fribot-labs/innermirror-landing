import type {
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryAnalysis,
    RecommendationEvolutionMemoryComparison,
    RecommendationEvolutionMemoryEntry,
    RecommendationEvolutionMemorySignalType,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Derived REI04 Types                                                */
/* ------------------------------------------------------------------ */

/**
 * REI05는 REI04와 동일한 State·Strategy·Decision 계약을 사용합니다.
 *
 * 타입을 별도로 재정의하지 않고 기존 Memory 계약에서 파생하여
 * 두 계층 사이의 타입 불일치를 방지합니다.
 */
export type RecommendationAdaptiveLearningEntryState =
  RecommendationEvolutionMemoryEntry["state"];

export type RecommendationAdaptiveLearningStrategyType =
  RecommendationEvolutionMemoryEntry["strategyType"];

export type RecommendationAdaptiveLearningStrategyPriority =
  RecommendationEvolutionMemoryEntry["strategyPriority"];

export type RecommendationAdaptiveLearningAssessmentConfidence =
  RecommendationEvolutionMemoryEntry["assessmentConfidence"];

export type RecommendationAdaptiveLearningRuntimeDecisionType =
  RecommendationEvolutionMemoryEntry[
    "enabledRuntimeDecisionTypes"
  ][number];

/**
 * 개별 Memory Entry가 보존하는 REI03 Intelligence Signal입니다.
 *
 * Observation의 previousPrimarySignalType과
 * currentPrimarySignalType은 이 타입을 사용합니다.
 */
export type RecommendationAdaptiveLearningEntrySignalType =
  RecommendationEvolutionMemoryEntry["primarySignalType"];

export type RecommendationAdaptiveLearningMemorySignalType =
  RecommendationEvolutionMemorySignalType;

export type RecommendationAdaptiveLearningMemoryState =
  RecommendationEvolutionMemoryAnalysis["state"];

export type RecommendationAdaptiveLearningScoreChanges =
  RecommendationEvolutionMemoryComparison["scoreChanges"];

/* ------------------------------------------------------------------ */
/* Version                                                            */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningVersion =
  1;

/* ------------------------------------------------------------------ */
/* Outcome                                                            */
/* ------------------------------------------------------------------ */

/**
 * 하나의 Recommendation 판단 이후 관찰된 결과입니다.
 *
 * unknown은 첫 Entry, 불충분한 데이터, 상충되는 결과처럼
 * 성공·실패를 확정할 수 없는 경우 사용합니다.
 */
export type RecommendationLearningOutcomeType =
  | "unknown"
  | "maintained"
  | "improved"
  | "advanced"
  | "completed"
  | "stalled"
  | "fragmented"
  | "regressed"
  | "recovered"
  | "redirected";

/**
 * Outcome을 학습 통계에 사용할 때의 상위 분류입니다.
 */
export type RecommendationLearningOutcomeCategory =
  | "unknown"
  | "positive"
  | "neutral"
  | "negative"
  | "ambiguous";

/* ------------------------------------------------------------------ */
/* Learning Observation                                               */
/* ------------------------------------------------------------------ */

/**
 * Memory Comparison을 REI05가 학습할 수 있는 단위로 정규화한
 * Observation입니다.
 *
 * RecommendationAdaptiveLearning은 사용자의 성향을 고정적으로
 * 분류하지 않고, 특정 State·Strategy·Decision 조합 이후에
 * 어떤 결과가 관찰됐는지를 기록합니다.
 */
export type RecommendationLearningObservation = {
  version:
    RecommendationAdaptiveLearningVersion;

  id:
    string;

  historyId:
    string;

  memoryId:
    string;

  comparisonId:
    string;

  previousEntryId:
    string | null;

  currentEntryId:
    string;

  previousState:
    RecommendationAdaptiveLearningEntryState | null;

  currentState:
    RecommendationAdaptiveLearningEntryState;

  previousStrategyType:
    RecommendationAdaptiveLearningStrategyType | null;

  currentStrategyType:
    RecommendationAdaptiveLearningStrategyType;

  previousAssessmentConfidence:
    RecommendationAdaptiveLearningAssessmentConfidence | null;

  currentAssessmentConfidence:
    RecommendationAdaptiveLearningAssessmentConfidence;

  previousPrimarySignalType:
    RecommendationAdaptiveLearningEntrySignalType;

  currentPrimarySignalType:
    RecommendationAdaptiveLearningEntrySignalType;

  enabledRuntimeDecisionTypes:
    RecommendationAdaptiveLearningRuntimeDecisionType[];

  outcome:
    RecommendationLearningOutcomeType;

  outcomeCategory:
    RecommendationLearningOutcomeCategory;

  scoreChanges:
    RecommendationAdaptiveLearningScoreChanges;

  warningCountChange:
    number;

  observationCountChange:
    number;

  stateChanged:
    boolean;

  strategyChanged:
    boolean;

  confidenceChanged:
    boolean;

  primarySignalChanged:
    boolean;

  observedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Learning Observation Creation                                      */
/* ------------------------------------------------------------------ */

export type CreateRecommendationLearningObservationParams = {
  memory:
    RecommendationEvolutionMemory;

  comparison:
    RecommendationEvolutionMemoryComparison;

  observedAt:
    string;

  createObservationId:
    () => string;
};

export type EvaluateRecommendationLearningOutcomeParams = {
  previous:
    RecommendationEvolutionMemoryEntry | null;

  current:
    RecommendationEvolutionMemoryEntry;

  comparison:
    RecommendationEvolutionMemoryComparison;
};

/* ------------------------------------------------------------------ */
/* Effectiveness                                                      */
/* ------------------------------------------------------------------ */

/**
 * Strategy·Decision·Signal의 관찰 결과를 집계한 공통 성능 구조입니다.
 *
 * effectivenessScore가 높더라도 sampleCount가 작으면
 * confidence는 낮게 계산되어야 합니다.
 */
export type RecommendationLearningEffectiveness = {
  sampleCount:
    number;

  positiveCount:
    number;

  neutralCount:
    number;

  negativeCount:
    number;

  ambiguousCount:
    number;

  unknownCount:
    number;

  effectivenessScore:
    number;

  confidence:
    number;
};

/* ------------------------------------------------------------------ */
/* Average Changes                                                    */
/* ------------------------------------------------------------------ */

export type RecommendationLearningAverageChanges = {
  stability:
    number;

  progress:
    number;

  repetitionRisk:
    number;

  redirectionRisk:
    number;

  completionMomentum:
    number;

  warningCount:
    number;

  observationCount:
    number;
};

/* ------------------------------------------------------------------ */
/* Outcome Counts                                                     */
/* ------------------------------------------------------------------ */

export type RecommendationLearningOutcomeCounts =
  Record<
    RecommendationLearningOutcomeType,
    number
  >;

/* ------------------------------------------------------------------ */
/* Strategy Learning Profile                                          */
/* ------------------------------------------------------------------ */

export type RecommendationStrategyStateProfile = {
  state:
    RecommendationAdaptiveLearningEntryState;

  effectiveness:
    RecommendationLearningEffectiveness;

  averageChanges:
    RecommendationLearningAverageChanges;

  outcomeCounts:
    RecommendationLearningOutcomeCounts;
};

export type RecommendationStrategyLearningProfile = {
  strategyType:
    RecommendationAdaptiveLearningStrategyType;

  overall:
    RecommendationLearningEffectiveness;

  byState:
    Partial<
      Record<
        RecommendationAdaptiveLearningEntryState,
        RecommendationStrategyStateProfile
      >
    >;

  averageChanges:
    RecommendationLearningAverageChanges;

  outcomeCounts:
    RecommendationLearningOutcomeCounts;

  relatedObservationIds:
    string[];
};

export type EvaluateRecommendationStrategyEffectivenessParams = {
  observations:
    RecommendationLearningObservation[];
};

/* ------------------------------------------------------------------ */
/* Runtime Decision Learning Profile                                  */
/* ------------------------------------------------------------------ */

export type RecommendationRuntimeDecisionStateProfile = {
  state:
    RecommendationAdaptiveLearningEntryState;

  effectiveness:
    RecommendationLearningEffectiveness;

  averageChanges:
    RecommendationLearningAverageChanges;

  outcomeCounts:
    RecommendationLearningOutcomeCounts;
};

export type RecommendationRuntimeDecisionLearningProfile = {
  decisionType:
    RecommendationAdaptiveLearningRuntimeDecisionType;

  effectiveness:
    RecommendationLearningEffectiveness;

  byState:
    Partial<
      Record<
        RecommendationAdaptiveLearningEntryState,
        RecommendationRuntimeDecisionStateProfile
      >
    >;

  averageChanges:
    RecommendationLearningAverageChanges;

  outcomeCounts:
    RecommendationLearningOutcomeCounts;

  relatedObservationIds:
    string[];
};

export type EvaluateRuntimeDecisionEffectivenessParams = {
  observations:
    RecommendationLearningObservation[];
};

/* ------------------------------------------------------------------ */
/* Signal Reliability                                                 */
/* ------------------------------------------------------------------ */

/**
 * Signal이 이후 관찰된 결과와 얼마나 일치했는지를 나타냅니다.
 *
 * reliabilityScore는 인과성을 의미하지 않습니다.
 * Signal 이후 Outcome이 예상 방향과 얼마나 자주 일치했는지를
 * 통계적으로 표현합니다.
 */
export type RecommendationSignalReliabilityProfile = {
  signalType:
    RecommendationAdaptiveLearningMemorySignalType;

  sampleCount:
    number;

  confirmedCount:
    number;

  contradictedCount:
    number;

  unresolvedCount:
    number;

  reliabilityScore:
    number;

  confidence:
    number;

  relatedObservationIds:
    string[];
};

export type EvaluateMemorySignalReliabilityParams = {
  observations:
    RecommendationLearningObservation[];

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;
};

/* ------------------------------------------------------------------ */
/* Learning Pattern                                                   */
/* ------------------------------------------------------------------ */

export type RecommendationLearningPatternType =
  | "strategy-success"
  | "strategy-failure"
  | "decision-success"
  | "decision-failure"
  | "state-strategy-mismatch"
  | "repeated-premature-advance"
  | "persistent-over-observation"
  | "effective-stabilization"
  | "effective-recovery"
  | "signal-overestimation"
  | "signal-underestimation"
  | "confidence-degradation"
  | "confidence-recovery"
  | "conflicting-evidence"
  | "insufficient-evidence";

export type RecommendationLearningPatternSeverity =
  | "low"
  | "moderate"
  | "high";

export type RecommendationLearningPattern = {
  id:
    string;

  type:
    RecommendationLearningPatternType;

  severity:
    RecommendationLearningPatternSeverity;

  confidence:
    number;

  description:
    string;

  relatedObservationIds:
    string[];

  relatedEntryIds:
    string[];

  relatedComparisonIds:
    string[];

  relatedStrategyTypes:
    RecommendationAdaptiveLearningStrategyType[];

  relatedDecisionTypes:
    RecommendationAdaptiveLearningRuntimeDecisionType[];

  relatedSignalTypes:
    RecommendationAdaptiveLearningMemorySignalType[];

  detectedAt:
    string;
};

export type DetectRecommendationLearningPatternsParams = {
  observations:
    RecommendationLearningObservation[];

  strategyProfiles:
    RecommendationStrategyLearningProfile[];

  runtimeDecisionProfiles:
    RecommendationRuntimeDecisionLearningProfile[];

  signalReliabilityProfiles:
    RecommendationSignalReliabilityProfile[];

  detectedAt:
    string;

  createPatternId:
    (
      type:
        RecommendationLearningPatternType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Adaptation Rule                                                    */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptationRuleType =
  | "increase-strategy-preference"
  | "decrease-strategy-preference"
  | "increase-decision-preference"
  | "decrease-decision-preference"
  | "require-more-evidence"
  | "reduce-evidence-requirement"
  | "delay-new-recommendation"
  | "allow-earlier-recommendation"
  | "prefer-stabilization"
  | "prefer-recovery"
  | "reduce-redirection"
  | "allow-redirection"
  | "lower-signal-confidence"
  | "raise-signal-confidence";

export type RecommendationAdaptationRuleStatus =
  | "proposed"
  | "active"
  | "suppressed"
  | "conflicted";

export type RecommendationAdaptationRule = {
  id:
    string;

  type:
    RecommendationAdaptationRuleType;

  status:
    RecommendationAdaptationRuleStatus;

  targetStrategyType:
    RecommendationAdaptiveLearningStrategyType | null;

  targetDecisionType:
    RecommendationAdaptiveLearningRuntimeDecisionType | null;

  targetSignalType:
    RecommendationAdaptiveLearningMemorySignalType | null;

  appliesToState:
    RecommendationAdaptiveLearningEntryState | null;

  adjustment:
    number;

  confidence:
    number;

  sampleCount:
    number;

  reasoning:
    string[];

  sourcePatternIds:
    string[];

  evidenceObservationIds:
    string[];

  evidenceEntryIds:
    string[];

  evidenceComparisonIds:
    string[];

  createdAt:
    string;
};

export type CreateRecommendationAdaptationRulesParams = {
  patterns:
    RecommendationLearningPattern[];

  strategyProfiles:
    RecommendationStrategyLearningProfile[];

  runtimeDecisionProfiles:
    RecommendationRuntimeDecisionLearningProfile[];

  signalReliabilityProfiles:
    RecommendationSignalReliabilityProfile[];

  minimumSampleCount:
    number;

  minimumConfidence:
    number;

  createdAt:
    string;

  createRuleId:
    (
      type:
        RecommendationAdaptationRuleType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Runtime Adjustment                                                 */
/* ------------------------------------------------------------------ */

/**
 * Adaptation Rule을 실제 Runtime이 읽을 수 있도록 정규화한 결과입니다.
 *
 * 모든 조정값은 가역적이며 Recommendation을 절대적으로 금지하거나
 * 강제하지 않습니다.
 */
export type RecommendationRuntimeAdjustment = {
  strategyPreferenceAdjustments:
    Partial<
      Record<
        RecommendationAdaptiveLearningStrategyType,
        number
      >
    >;

  decisionPreferenceAdjustments:
    Partial<
      Record<
        RecommendationAdaptiveLearningRuntimeDecisionType,
        number
      >
    >;

  signalConfidenceAdjustments:
    Partial<
      Record<
        RecommendationAdaptiveLearningMemorySignalType,
        number
      >
    >;

  evidenceRequirementAdjustment:
    number;

  newRecommendationThresholdAdjustment:
    number;

  redirectionThresholdAdjustment:
    number;

  stabilizationPreferenceAdjustment:
    number;

  recoveryPreferenceAdjustment:
    number;
};

export type CreateRecommendationRuntimeAdjustmentsParams = {
  rules:
    RecommendationAdaptationRule[];
};

/* ------------------------------------------------------------------ */
/* Learning State                                                     */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningState =
  | "unavailable"
  | "insufficient"
  | "observing"
  | "learning"
  | "adapting"
  | "stable"
  | "conflicted";

/* ------------------------------------------------------------------ */
/* Learning Scores                                                    */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningScores = {
  evidenceStrength:
    number;

  learningConfidence:
    number;

  adaptationReadiness:
    number;

  strategyConsistency:
    number;

  decisionConsistency:
    number;

  signalReliability:
    number;

  conflictRisk:
    number;
};

/* ------------------------------------------------------------------ */
/* Learning Statistics                                                */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningStatistics = {
  memoryEntryCount:
    number;

  comparisonCount:
    number;

  observationCount:
    number;

  positiveOutcomeCount:
    number;

  neutralOutcomeCount:
    number;

  negativeOutcomeCount:
    number;

  ambiguousOutcomeCount:
    number;

  unknownOutcomeCount:
    number;

  strategyProfileCount:
    number;

  runtimeDecisionProfileCount:
    number;

  signalReliabilityProfileCount:
    number;

  patternCount:
    number;

  adaptationRuleCount:
    number;

  activeAdaptationRuleCount:
    number;

  conflictedAdaptationRuleCount:
    number;
};

/* ------------------------------------------------------------------ */
/* Learning Analysis Signal                                           */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningSignalType =
  | "insufficient-learning-data"
  | "learning-evidence-available"
  | "strategy-effectiveness-detected"
  | "strategy-failure-detected"
  | "decision-effectiveness-detected"
  | "decision-failure-detected"
  | "signal-reliability-confirmed"
  | "signal-reliability-declined"
  | "adaptation-ready"
  | "adaptation-conflict"
  | "stable-learning-pattern";

export type RecommendationAdaptiveLearningSignalSeverity =
  | "informational"
  | "low"
  | "moderate"
  | "high";

export type RecommendationAdaptiveLearningSignal = {
  id:
    string;

  type:
    RecommendationAdaptiveLearningSignalType;

  severity:
    RecommendationAdaptiveLearningSignalSeverity;

  confidence:
    number;

  score:
    number;

  description:
    string;

  relatedObservationIds:
    string[];

  relatedPatternIds:
    string[];

  relatedRuleIds:
    string[];

  detectedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Adaptive Learning Analysis                                         */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningAnalysis = {
  version:
    RecommendationAdaptiveLearningVersion;

  memoryId:
    string;

  historyId:
    string;

  sourceMemoryAnalyzedAt:
    string;

  state:
    RecommendationAdaptiveLearningState;

  statistics:
    RecommendationAdaptiveLearningStatistics;

  scores:
    RecommendationAdaptiveLearningScores;

  observations:
    RecommendationLearningObservation[];

  strategyProfiles:
    RecommendationStrategyLearningProfile[];

  runtimeDecisionProfiles:
    RecommendationRuntimeDecisionLearningProfile[];

  signalReliabilityProfiles:
    RecommendationSignalReliabilityProfile[];

  patterns:
    RecommendationLearningPattern[];

  adaptationRules:
    RecommendationAdaptationRule[];

  runtimeAdjustment:
    RecommendationRuntimeAdjustment;

  signals:
    RecommendationAdaptiveLearningSignal[];

  primarySignalType:
    RecommendationAdaptiveLearningSignalType | null;

  reasoning:
    string[];

  confidence:
    number;

  analyzedAt:
    string;
};

export type AnalyzeRecommendationAdaptiveLearningParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  analyzedAt:
    string;

  minimumSampleCount?:
    number;

  minimumConfidence?:
    number;

  createObservationId:
    (
      comparison:
        RecommendationEvolutionMemoryComparison,
      index:
        number,
    ) => string;

  createPatternId:
    (
      type:
        RecommendationLearningPatternType,
      index:
        number,
    ) => string;

  createRuleId:
    (
      type:
        RecommendationAdaptationRuleType,
      index:
        number,
    ) => string;

  createSignalId:
    (
      type:
        RecommendationAdaptiveLearningSignalType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Presentation                                                       */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningPresentationTone =
  | "unavailable"
  | "neutral"
  | "observing"
  | "learning"
  | "adapting"
  | "stable"
  | "attention";

export type RecommendationAdaptiveLearningPresentation = {
  tone:
    RecommendationAdaptiveLearningPresentationTone;

  headline:
    string;

  summary:
    string;

  learnedObservation:
    string | null;

  adjustmentDescription:
    string | null;

  confidenceDisclosure:
    string;

  warnings:
    string[];

  evidence:
    string[];

  createdAt:
    string;
};

export type CreateRecommendationAdaptiveLearningPresentationParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  analysis:
    RecommendationAdaptiveLearningAnalysis;

  createdAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Update Result                                                      */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningUpdateResult = {
  analysis:
    RecommendationAdaptiveLearningAnalysis;

  presentation:
    RecommendationAdaptiveLearningPresentation;

  runtimeAdjustment:
    RecommendationRuntimeAdjustment;

  updatedAt:
    string;
};

export type UpdateRecommendationAdaptiveLearningParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  updatedAt:
    string;

  minimumSampleCount?:
    number;

  minimumConfidence?:
    number;

  createObservationId:
    (
      comparison:
        RecommendationEvolutionMemoryComparison,
      index:
        number,
    ) => string;

  createPatternId:
    (
      type:
        RecommendationLearningPatternType,
      index:
        number,
    ) => string;

  createRuleId:
    (
      type:
        RecommendationAdaptationRuleType,
      index:
        number,
    ) => string;

  createSignalId:
    (
      type:
        RecommendationAdaptiveLearningSignalType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Validation Params                                                  */
/* ------------------------------------------------------------------ */

export type ValidateRecommendationLearningObservationParams = {
  observation:
    RecommendationLearningObservation;
};

export type ValidateRecommendationLearningEffectivenessParams = {
  effectiveness:
    RecommendationLearningEffectiveness;

  fieldName?:
    string;
};

export type ValidateRecommendationStrategyLearningProfileParams = {
  profile:
    RecommendationStrategyLearningProfile;
};

export type ValidateRecommendationRuntimeDecisionLearningProfileParams = {
  profile:
    RecommendationRuntimeDecisionLearningProfile;
};

export type ValidateRecommendationSignalReliabilityProfileParams = {
  profile:
    RecommendationSignalReliabilityProfile;
};

export type ValidateRecommendationLearningPatternParams = {
  pattern:
    RecommendationLearningPattern;
};

export type ValidateRecommendationAdaptationRuleParams = {
  rule:
    RecommendationAdaptationRule;
};

export type ValidateRecommendationRuntimeAdjustmentParams = {
  adjustment:
    RecommendationRuntimeAdjustment;
};

export type ValidateRecommendationAdaptiveLearningAnalysisParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  analysis:
    RecommendationAdaptiveLearningAnalysis;
};

export type ValidateRecommendationAdaptiveLearningPresentationParams = {
  analysis:
    RecommendationAdaptiveLearningAnalysis;

  presentation:
    RecommendationAdaptiveLearningPresentation;
};

export type ValidateRecommendationAdaptiveLearningUpdateResultParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  result:
    RecommendationAdaptiveLearningUpdateResult;
};

/* ------------------------------------------------------------------ */
/* Query Types                                                        */
/* ------------------------------------------------------------------ */

export type FindRecommendationStrategyLearningProfileParams = {
  profiles:
    RecommendationStrategyLearningProfile[];

  strategyType:
    RecommendationAdaptiveLearningStrategyType;
};

export type FindRecommendationRuntimeDecisionLearningProfileParams = {
  profiles:
    RecommendationRuntimeDecisionLearningProfile[];

  decisionType:
    RecommendationAdaptiveLearningRuntimeDecisionType;
};

export type FindRecommendationSignalReliabilityProfileParams = {
  profiles:
    RecommendationSignalReliabilityProfile[];

  signalType:
    RecommendationAdaptiveLearningMemorySignalType;
};

export type FindRecommendationAdaptationRulesParams = {
  rules:
    RecommendationAdaptationRule[];

  type?:
    RecommendationAdaptationRuleType;

  status?:
    RecommendationAdaptationRuleStatus;

  appliesToState?:
    RecommendationAdaptiveLearningEntryState;

  targetStrategyType?:
    RecommendationAdaptiveLearningStrategyType;

  targetDecisionType?:
    RecommendationAdaptiveLearningRuntimeDecisionType;

  targetSignalType?:
    RecommendationAdaptiveLearningMemorySignalType;
};

/* ------------------------------------------------------------------ */
/* Type Guards                                                        */
/* ------------------------------------------------------------------ */

const RECOMMENDATION_LEARNING_OUTCOME_TYPES:
  readonly RecommendationLearningOutcomeType[] = [
    "unknown",
    "maintained",
    "improved",
    "advanced",
    "completed",
    "stalled",
    "fragmented",
    "regressed",
    "recovered",
    "redirected",
  ];

const RECOMMENDATION_LEARNING_OUTCOME_CATEGORIES:
  readonly RecommendationLearningOutcomeCategory[] = [
    "unknown",
    "positive",
    "neutral",
    "negative",
    "ambiguous",
  ];

const RECOMMENDATION_LEARNING_PATTERN_TYPES:
  readonly RecommendationLearningPatternType[] = [
    "strategy-success",
    "strategy-failure",
    "decision-success",
    "decision-failure",
    "state-strategy-mismatch",
    "repeated-premature-advance",
    "persistent-over-observation",
    "effective-stabilization",
    "effective-recovery",
    "signal-overestimation",
    "signal-underestimation",
    "confidence-degradation",
    "confidence-recovery",
    "conflicting-evidence",
    "insufficient-evidence",
  ];

const RECOMMENDATION_LEARNING_PATTERN_SEVERITIES:
  readonly RecommendationLearningPatternSeverity[] = [
    "low",
    "moderate",
    "high",
  ];

const RECOMMENDATION_ADAPTATION_RULE_TYPES:
  readonly RecommendationAdaptationRuleType[] = [
    "increase-strategy-preference",
    "decrease-strategy-preference",
    "increase-decision-preference",
    "decrease-decision-preference",
    "require-more-evidence",
    "reduce-evidence-requirement",
    "delay-new-recommendation",
    "allow-earlier-recommendation",
    "prefer-stabilization",
    "prefer-recovery",
    "reduce-redirection",
    "allow-redirection",
    "lower-signal-confidence",
    "raise-signal-confidence",
  ];

const RECOMMENDATION_ADAPTATION_RULE_STATUSES:
  readonly RecommendationAdaptationRuleStatus[] = [
    "proposed",
    "active",
    "suppressed",
    "conflicted",
  ];

const RECOMMENDATION_ADAPTIVE_LEARNING_STATES:
  readonly RecommendationAdaptiveLearningState[] = [
    "unavailable",
    "insufficient",
    "observing",
    "learning",
    "adapting",
    "stable",
    "conflicted",
  ];

const RECOMMENDATION_ADAPTIVE_LEARNING_SIGNAL_TYPES:
  readonly RecommendationAdaptiveLearningSignalType[] = [
    "insufficient-learning-data",
    "learning-evidence-available",
    "strategy-effectiveness-detected",
    "strategy-failure-detected",
    "decision-effectiveness-detected",
    "decision-failure-detected",
    "signal-reliability-confirmed",
    "signal-reliability-declined",
    "adaptation-ready",
    "adaptation-conflict",
    "stable-learning-pattern",
  ];

const RECOMMENDATION_ADAPTIVE_LEARNING_SIGNAL_SEVERITIES:
  readonly RecommendationAdaptiveLearningSignalSeverity[] = [
    "informational",
    "low",
    "moderate",
    "high",
  ];

const RECOMMENDATION_ADAPTIVE_LEARNING_PRESENTATION_TONES:
  readonly RecommendationAdaptiveLearningPresentationTone[] = [
    "unavailable",
    "neutral",
    "observing",
    "learning",
    "adapting",
    "stable",
    "attention",
  ];

export function isRecommendationAdaptiveLearningVersion(
  value:
    unknown,
): value is RecommendationAdaptiveLearningVersion {
  return value ===
    1;
}

export function isRecommendationLearningOutcomeType(
  value:
    unknown,
): value is RecommendationLearningOutcomeType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_LEARNING_OUTCOME_TYPES.includes(
      value as RecommendationLearningOutcomeType,
    )
  );
}

export function isRecommendationLearningOutcomeCategory(
  value:
    unknown,
): value is RecommendationLearningOutcomeCategory {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_LEARNING_OUTCOME_CATEGORIES.includes(
      value as RecommendationLearningOutcomeCategory,
    )
  );
}

export function isRecommendationLearningPatternType(
  value:
    unknown,
): value is RecommendationLearningPatternType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_LEARNING_PATTERN_TYPES.includes(
      value as RecommendationLearningPatternType,
    )
  );
}

export function isRecommendationLearningPatternSeverity(
  value:
    unknown,
): value is RecommendationLearningPatternSeverity {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_LEARNING_PATTERN_SEVERITIES.includes(
      value as RecommendationLearningPatternSeverity,
    )
  );
}

export function isRecommendationAdaptationRuleType(
  value:
    unknown,
): value is RecommendationAdaptationRuleType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_ADAPTATION_RULE_TYPES.includes(
      value as RecommendationAdaptationRuleType,
    )
  );
}

export function isRecommendationAdaptationRuleStatus(
  value:
    unknown,
): value is RecommendationAdaptationRuleStatus {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_ADAPTATION_RULE_STATUSES.includes(
      value as RecommendationAdaptationRuleStatus,
    )
  );
}

export function isRecommendationAdaptiveLearningState(
  value:
    unknown,
): value is RecommendationAdaptiveLearningState {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_ADAPTIVE_LEARNING_STATES.includes(
      value as RecommendationAdaptiveLearningState,
    )
  );
}

export function isRecommendationAdaptiveLearningSignalType(
  value:
    unknown,
): value is RecommendationAdaptiveLearningSignalType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_ADAPTIVE_LEARNING_SIGNAL_TYPES.includes(
      value as RecommendationAdaptiveLearningSignalType,
    )
  );
}

export function isRecommendationAdaptiveLearningSignalSeverity(
  value:
    unknown,
): value is RecommendationAdaptiveLearningSignalSeverity {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_ADAPTIVE_LEARNING_SIGNAL_SEVERITIES.includes(
      value as RecommendationAdaptiveLearningSignalSeverity,
    )
  );
}

export function isRecommendationAdaptiveLearningPresentationTone(
  value:
    unknown,
): value is RecommendationAdaptiveLearningPresentationTone {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_ADAPTIVE_LEARNING_PRESENTATION_TONES.includes(
      value as RecommendationAdaptiveLearningPresentationTone,
    )
  );
}

/* ------------------------------------------------------------------ */
/* Outcome Helpers                                                    */
/* ------------------------------------------------------------------ */

export function resolveRecommendationLearningOutcomeCategory(
  outcome:
    RecommendationLearningOutcomeType,
): RecommendationLearningOutcomeCategory {
  switch (
    outcome
  ) {
    case "improved":
    case "advanced":
    case "completed":
    case "recovered":
      return "positive";

    case "maintained":
      return "neutral";

    case "stalled":
    case "fragmented":
    case "regressed":
      return "negative";

    case "redirected":
      return "ambiguous";

    case "unknown":
      return "unknown";
  }
}

export function isPositiveRecommendationLearningOutcome(
  outcome:
    RecommendationLearningOutcomeType,
): boolean {
  return (
    resolveRecommendationLearningOutcomeCategory(
      outcome,
    ) ===
    "positive"
  );
}

export function isNegativeRecommendationLearningOutcome(
  outcome:
    RecommendationLearningOutcomeType,
): boolean {
  return (
    resolveRecommendationLearningOutcomeCategory(
      outcome,
    ) ===
    "negative"
  );
}

/* ------------------------------------------------------------------ */
/* Factory Helpers                                                    */
/* ------------------------------------------------------------------ */

export function createEmptyRecommendationLearningOutcomeCounts():
  RecommendationLearningOutcomeCounts {
  return {
    unknown:
      0,

    maintained:
      0,

    improved:
      0,

    advanced:
      0,

    completed:
      0,

    stalled:
      0,

    fragmented:
      0,

    regressed:
      0,

    recovered:
      0,

    redirected:
      0,
  };
}

export function createEmptyRecommendationLearningAverageChanges():
  RecommendationLearningAverageChanges {
  return {
    stability:
      0,

    progress:
      0,

    repetitionRisk:
      0,

    redirectionRisk:
      0,

    completionMomentum:
      0,

    warningCount:
      0,

    observationCount:
      0,
  };
}

export function createEmptyRecommendationLearningEffectiveness():
  RecommendationLearningEffectiveness {
  return {
    sampleCount:
      0,

    positiveCount:
      0,

    neutralCount:
      0,

    negativeCount:
      0,

    ambiguousCount:
      0,

    unknownCount:
      0,

    effectivenessScore:
      0,

    confidence:
      0,
  };
}

export function createEmptyRecommendationRuntimeAdjustment():
  RecommendationRuntimeAdjustment {
  return {
    strategyPreferenceAdjustments:
      {},

    decisionPreferenceAdjustments:
      {},

    signalConfidenceAdjustments:
      {},

    evidenceRequirementAdjustment:
      0,

    newRecommendationThresholdAdjustment:
      0,

    redirectionThresholdAdjustment:
      0,

    stabilizationPreferenceAdjustment:
      0,

    recoveryPreferenceAdjustment:
      0,
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function findRecommendationStrategyLearningProfile(
  params:
    FindRecommendationStrategyLearningProfileParams,
): RecommendationStrategyLearningProfile | null {
  return (
    params.profiles.find(
      (
        profile,
      ) =>
        profile.strategyType ===
        params.strategyType,
    ) ??
    null
  );
}

export function findRecommendationRuntimeDecisionLearningProfile(
  params:
    FindRecommendationRuntimeDecisionLearningProfileParams,
): RecommendationRuntimeDecisionLearningProfile | null {
  return (
    params.profiles.find(
      (
        profile,
      ) =>
        profile.decisionType ===
        params.decisionType,
    ) ??
    null
  );
}

export function findRecommendationSignalReliabilityProfile(
  params:
    FindRecommendationSignalReliabilityProfileParams,
): RecommendationSignalReliabilityProfile | null {
  return (
    params.profiles.find(
      (
        profile,
      ) =>
        profile.signalType ===
        params.signalType,
    ) ??
    null
  );
}

export function findRecommendationAdaptationRules(
  params:
    FindRecommendationAdaptationRulesParams,
): RecommendationAdaptationRule[] {
  return params.rules.filter(
    (
      rule,
    ) => {
      if (
        params.type !==
          undefined &&
        rule.type !==
          params.type
      ) {
        return false;
      }

      if (
        params.status !==
          undefined &&
        rule.status !==
          params.status
      ) {
        return false;
      }

      if (
        params.appliesToState !==
          undefined &&
        rule.appliesToState !==
          params.appliesToState
      ) {
        return false;
      }

      if (
        params.targetStrategyType !==
          undefined &&
        rule.targetStrategyType !==
          params.targetStrategyType
      ) {
        return false;
      }

      if (
        params.targetDecisionType !==
          undefined &&
        rule.targetDecisionType !==
          params.targetDecisionType
      ) {
        return false;
      }

      if (
        params.targetSignalType !==
          undefined &&
        rule.targetSignalType !==
          params.targetSignalType
      ) {
        return false;
      }

      return true;
    },
  );
}