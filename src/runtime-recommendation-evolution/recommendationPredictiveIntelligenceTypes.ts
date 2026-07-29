import type {
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryAnalysis,
    RecommendationEvolutionMemoryComparison,
    RecommendationEvolutionMemoryEntry,
    RecommendationEvolutionMemorySignalType,
} from "./recommendationEvolutionMemoryTypes";

import type {
    RecommendationAdaptationRule,
    RecommendationAdaptiveLearningAnalysis,
    RecommendationAdaptiveLearningEntryState,
    RecommendationAdaptiveLearningMemorySignalType,
    RecommendationAdaptiveLearningRuntimeDecisionType,
    RecommendationAdaptiveLearningStrategyType,
    RecommendationLearningPatternType,
    RecommendationRuntimeAdjustment,
} from "./recommendationAdaptiveLearningTypes";

/* ------------------------------------------------------------------ */
/* Derived Source Types                                               */
/* ------------------------------------------------------------------ */

/**
 * REI06는 기존 REI04·REI05 계약을 재정의하지 않습니다.
 *
 * Predictive Intelligence가 사용하는 State·Strategy·Decision은
 * 현재 Memory와 Adaptive Learning에서 사용하는 타입으로부터
 * 파생합니다.
 */
export type RecommendationPredictiveEntryState =
  RecommendationAdaptiveLearningEntryState;

export type RecommendationPredictiveStrategyType =
  RecommendationAdaptiveLearningStrategyType;

export type RecommendationPredictiveRuntimeDecisionType =
  RecommendationAdaptiveLearningRuntimeDecisionType;

export type RecommendationPredictiveMemorySignalType =
  RecommendationAdaptiveLearningMemorySignalType;

export type RecommendationPredictiveLearningPatternType =
  RecommendationLearningPatternType;

export type RecommendationPredictiveEntryConfidence =
  RecommendationEvolutionMemoryEntry[
    "assessmentConfidence"
  ];

export type RecommendationPredictiveEntrySignalType =
  RecommendationEvolutionMemoryEntry[
    "primarySignalType"
  ];

export type RecommendationPredictiveScoreChanges =
  RecommendationEvolutionMemoryComparison[
    "scoreChanges"
  ];

/* ------------------------------------------------------------------ */
/* Version                                                            */
/* ------------------------------------------------------------------ */

export type RecommendationPredictiveIntelligenceVersion =
  1;

/* ------------------------------------------------------------------ */
/* Prediction Horizon                                                 */
/* ------------------------------------------------------------------ */

/**
 * 예측이 다루는 시간적 범위입니다.
 *
 * next-evaluation:
 * 다음 Runtime 평가 한 번
 *
 * next-recommendation:
 * 다음 Recommendation 생성 또는 변경 시점
 *
 * near-term-sequence:
 * 앞으로 이어질 짧은 Recommendation 흐름
 */
export type RecommendationPredictionHorizon =
  | "next-evaluation"
  | "next-recommendation"
  | "near-term-sequence";

/* ------------------------------------------------------------------ */
/* Predictive Intelligence State                                      */
/* ------------------------------------------------------------------ */

export type RecommendationPredictiveIntelligenceState =
  | "unavailable"
  | "insufficient"
  | "observing"
  | "predicting"
  | "stable"
  | "conflicted";

/* ------------------------------------------------------------------ */
/* Prediction Severity                                                */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionSeverity =
  | "informational"
  | "low"
  | "moderate"
  | "high";

/* ------------------------------------------------------------------ */
/* Prediction Trend                                                   */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionTrendDirection =
  | "increasing"
  | "decreasing"
  | "stable"
  | "mixed"
  | "unknown";

export type RecommendationPredictionScoreTrend = {
  stability:
    RecommendationPredictionTrendDirection;

  progress:
    RecommendationPredictionTrendDirection;

  repetitionRisk:
    RecommendationPredictionTrendDirection;

  redirectionRisk:
    RecommendationPredictionTrendDirection;

  completionMomentum:
    RecommendationPredictionTrendDirection;

  stabilityChange:
    number;

  progressChange:
    number;

  repetitionRiskChange:
    number;

  redirectionRiskChange:
    number;

  completionMomentumChange:
    number;

  sampleCount:
    number;
};

/* ------------------------------------------------------------------ */
/* Prediction Context                                                 */
/* ------------------------------------------------------------------ */

/**
 * Memory·Adaptive Learning 전체 구조를 예측 알고리즘이 직접
 * 탐색하지 않도록 필요한 정보만 정규화한 Context입니다.
 */
export type RecommendationPredictionContext = {
  version:
    RecommendationPredictiveIntelligenceVersion;

  memoryId:
    string;

  historyId:
    string;

  sourceMemoryAnalyzedAt:
    string;

  sourceAdaptiveLearningAnalyzedAt:
    string;

  horizon:
    RecommendationPredictionHorizon;

  currentEntryId:
    string | null;

  currentState:
    RecommendationPredictiveEntryState | null;

  currentStrategyType:
    RecommendationPredictiveStrategyType | null;

  currentAssessmentConfidence:
    RecommendationPredictiveEntryConfidence | null;

  currentPrimarySignalType:
    RecommendationPredictiveEntrySignalType;

  currentMemorySignalTypes:
    RecommendationPredictiveMemorySignalType[];

  currentRuntimeDecisionTypes:
    RecommendationPredictiveRuntimeDecisionType[];

  recentEntryIds:
    string[];

  recentComparisonIds:
    string[];

  recentStates:
    RecommendationPredictiveEntryState[];

  recentStrategyTypes:
    RecommendationPredictiveStrategyType[];

  recentRuntimeDecisionTypes:
    RecommendationPredictiveRuntimeDecisionType[];

  recentLearningPatternTypes:
    RecommendationPredictiveLearningPatternType[];

  scoreTrend:
    RecommendationPredictionScoreTrend;

  activeAdaptationRuleIds:
    string[];

  conflictedAdaptationRuleIds:
    string[];

  runtimeAdjustment:
    RecommendationRuntimeAdjustment;

  evidenceStrength:
    number;

  learningConfidence:
    number;

  adaptationReadiness:
    number;

  conflictRisk:
    number;

  createdAt:
    string;
};

export type CreateRecommendationPredictionContextParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  horizon:
    RecommendationPredictionHorizon;

  createdAt:
    string;

  recentEntryLimit?:
    number;

  recentComparisonLimit?:
    number;
};

/* ------------------------------------------------------------------ */
/* Shared Prediction Evidence                                         */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionEvidence = {
  relatedEntryIds:
    string[];

  relatedComparisonIds:
    string[];

  relatedObservationIds:
    string[];

  relatedPatternIds:
    string[];

  relatedRuleIds:
    string[];

  relatedMemorySignalTypes:
    RecommendationPredictiveMemorySignalType[];
};

/* ------------------------------------------------------------------ */
/* Shared Prediction Score                                            */
/* ------------------------------------------------------------------ */

/**
 * rawScore:
 * 정규화 이전 내부 점수
 *
 * probability:
 * 같은 후보 집합 안에서 정규화된 상대적 가능성
 *
 * confidence:
 * 해당 가능성을 지지하는 Evidence의 양과 일관성
 */
export type RecommendationPredictionCandidateScores = {
  rawScore:
    number;

  probability:
    number;

  confidence:
    number;
};

/* ------------------------------------------------------------------ */
/* Predicted State                                                    */
/* ------------------------------------------------------------------ */

export type RecommendationPredictedState = {
  id:
    string;

  state:
    RecommendationPredictiveEntryState;

  rank:
    number;

  scores:
    RecommendationPredictionCandidateScores;

  reasoning:
    string[];

  evidence:
    RecommendationPredictionEvidence;

  predictedAt:
    string;
};

export type PredictNextRecommendationStatesParams = {
  context:
    RecommendationPredictionContext;

  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  predictedAt:
    string;

  maximumCandidateCount?:
    number;

  minimumProbability?:
    number;

  createPredictionId:
    (
      state:
        RecommendationPredictiveEntryState,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Predicted Strategy                                                 */
/* ------------------------------------------------------------------ */

export type RecommendationPredictedStrategy = {
  id:
    string;

  strategyType:
    RecommendationPredictiveStrategyType;

  rank:
    number;

  scores:
    RecommendationPredictionCandidateScores;

  compatibleStateTypes:
    RecommendationPredictiveEntryState[];

  reasoning:
    string[];

  evidence:
    RecommendationPredictionEvidence;

  predictedAt:
    string;
};

export type PredictNextRecommendationStrategiesParams = {
  context:
    RecommendationPredictionContext;

  predictedStates:
    RecommendationPredictedState[];

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  predictedAt:
    string;

  maximumCandidateCount?:
    number;

  minimumProbability?:
    number;

  createPredictionId:
    (
      strategyType:
        RecommendationPredictiveStrategyType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Predicted Runtime Decision                                         */
/* ------------------------------------------------------------------ */

export type RecommendationPredictedRuntimeDecision = {
  id:
    string;

  decisionType:
    RecommendationPredictiveRuntimeDecisionType;

  rank:
    number;

  scores:
    RecommendationPredictionCandidateScores;

  relatedStateTypes:
    RecommendationPredictiveEntryState[];

  relatedStrategyTypes:
    RecommendationPredictiveStrategyType[];

  reasoning:
    string[];

  evidence:
    RecommendationPredictionEvidence;

  predictedAt:
    string;
};

export type PredictRecommendationRuntimeDecisionsParams = {
  context:
    RecommendationPredictionContext;

  predictedStates:
    RecommendationPredictedState[];

  predictedStrategies:
    RecommendationPredictedStrategy[];

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  predictedAt:
    string;

  maximumCandidateCount?:
    number;

  minimumProbability?:
    number;

  createPredictionId:
    (
      decisionType:
        RecommendationPredictiveRuntimeDecisionType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Risk Prediction                                                    */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionRiskType =
  | "premature-advance-risk"
  | "persistent-observation-risk"
  | "stagnation-risk"
  | "fragmentation-risk"
  | "strategy-oscillation-risk"
  | "state-oscillation-risk"
  | "redirection-risk"
  | "confidence-degradation-risk"
  | "completion-failure-risk"
  | "adaptation-conflict-risk";

export type RecommendationPredictedRisk = {
  id:
    string;

  type:
    RecommendationPredictionRiskType;

  severity:
    RecommendationPredictionSeverity;

  rank:
    number;

  scores:
    RecommendationPredictionCandidateScores;

  description:
    string;

  relatedStateTypes:
    RecommendationPredictiveEntryState[];

  relatedStrategyTypes:
    RecommendationPredictiveStrategyType[];

  relatedDecisionTypes:
    RecommendationPredictiveRuntimeDecisionType[];

  reasoning:
    string[];

  evidence:
    RecommendationPredictionEvidence;

  predictedAt:
    string;
};

export type PredictRecommendationRisksParams = {
  context:
    RecommendationPredictionContext;

  predictedStates:
    RecommendationPredictedState[];

  predictedStrategies:
    RecommendationPredictedStrategy[];

  predictedRuntimeDecisions:
    RecommendationPredictedRuntimeDecision[];

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  predictedAt:
    string;

  minimumProbability?:
    number;

  createPredictionId:
    (
      type:
        RecommendationPredictionRiskType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Opportunity Prediction                                             */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionOpportunityType =
  | "stabilization-likelihood"
  | "recovery-likelihood"
  | "progress-likelihood"
  | "completion-likelihood"
  | "successful-advance-likelihood"
  | "productive-clarification-likelihood"
  | "signal-confirmation-likelihood";

export type RecommendationPredictedOpportunity = {
  id:
    string;

  type:
    RecommendationPredictionOpportunityType;

  severity:
    RecommendationPredictionSeverity;

  rank:
    number;

  scores:
    RecommendationPredictionCandidateScores;

  description:
    string;

  relatedStateTypes:
    RecommendationPredictiveEntryState[];

  relatedStrategyTypes:
    RecommendationPredictiveStrategyType[];

  relatedDecisionTypes:
    RecommendationPredictiveRuntimeDecisionType[];

  reasoning:
    string[];

  evidence:
    RecommendationPredictionEvidence;

  predictedAt:
    string;
};

export type PredictRecommendationOpportunitiesParams = {
  context:
    RecommendationPredictionContext;

  predictedStates:
    RecommendationPredictedState[];

  predictedStrategies:
    RecommendationPredictedStrategy[];

  predictedRuntimeDecisions:
    RecommendationPredictedRuntimeDecision[];

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  predictedAt:
    string;

  minimumProbability?:
    number;

  createPredictionId:
    (
      type:
        RecommendationPredictionOpportunityType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Prediction Conflict                                                */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionConflictType =
  | "state-distribution-conflict"
  | "strategy-distribution-conflict"
  | "decision-distribution-conflict"
  | "risk-opportunity-conflict"
  | "adaptive-evidence-conflict";

export type RecommendationPredictionConflict = {
  id:
    string;

  type:
    RecommendationPredictionConflictType;

  severity:
    RecommendationPredictionSeverity;

  score:
    number;

  confidence:
    number;

  description:
    string;

  relatedPredictionIds:
    string[];

  reasoning:
    string[];
};

/* ------------------------------------------------------------------ */
/* Prediction Signal                                                  */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionSignalType =
  | "insufficient-prediction-data"
  | "state-transition-likely"
  | "strategy-transition-likely"
  | "runtime-decision-likely"
  | "risk-elevated"
  | "opportunity-detected"
  | "prediction-stable"
  | "prediction-conflicted";

export type RecommendationPredictionSignal = {
  id:
    string;

  type:
    RecommendationPredictionSignalType;

  severity:
    RecommendationPredictionSeverity;

  score:
    number;

  confidence:
    number;

  description:
    string;

  relatedStatePredictionIds:
    string[];

  relatedStrategyPredictionIds:
    string[];

  relatedDecisionPredictionIds:
    string[];

  relatedRiskPredictionIds:
    string[];

  relatedOpportunityPredictionIds:
    string[];

  detectedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Prediction Statistics                                              */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionStatistics = {
  memoryEntryCount:
    number;

  comparisonCount:
    number;

  learningObservationCount:
    number;

  activeAdaptationRuleCount:
    number;

  conflictedAdaptationRuleCount:
    number;

  predictedStateCount:
    number;

  predictedStrategyCount:
    number;

  predictedRuntimeDecisionCount:
    number;

  predictedRiskCount:
    number;

  predictedOpportunityCount:
    number;

  conflictCount:
    number;

  signalCount:
    number;
};

/* ------------------------------------------------------------------ */
/* Prediction Scores                                                  */
/* ------------------------------------------------------------------ */

export type RecommendationPredictionScores = {
  evidenceStrength:
    number;

  temporalConsistency:
    number;

  statePredictionClarity:
    number;

  strategyPredictionClarity:
    number;

  decisionPredictionClarity:
    number;

  riskPressure:
    number;

  opportunityStrength:
    number;

  adaptiveAlignment:
    number;

  conflictRisk:
    number;

  predictionConfidence:
    number;
};

/* ------------------------------------------------------------------ */
/* Predictive Intelligence Analysis                                   */
/* ------------------------------------------------------------------ */

export type RecommendationPredictiveIntelligence = {
  version:
    RecommendationPredictiveIntelligenceVersion;

  memoryId:
    string;

  historyId:
    string;

  sourceMemoryAnalyzedAt:
    string;

  sourceAdaptiveLearningAnalyzedAt:
    string;

  state:
    RecommendationPredictiveIntelligenceState;

  horizon:
    RecommendationPredictionHorizon;

  context:
    RecommendationPredictionContext;

  statistics:
    RecommendationPredictionStatistics;

  scores:
    RecommendationPredictionScores;

  predictedStates:
    RecommendationPredictedState[];

  predictedStrategies:
    RecommendationPredictedStrategy[];

  predictedRuntimeDecisions:
    RecommendationPredictedRuntimeDecision[];

  predictedRisks:
    RecommendationPredictedRisk[];

  predictedOpportunities:
    RecommendationPredictedOpportunity[];

  conflicts:
    RecommendationPredictionConflict[];

  signals:
    RecommendationPredictionSignal[];

  primarySignalType:
    RecommendationPredictionSignalType | null;

  primaryState:
    RecommendationPredictiveEntryState | null;

  primaryStrategyType:
    RecommendationPredictiveStrategyType | null;

  primaryRuntimeDecisionType:
    RecommendationPredictiveRuntimeDecisionType | null;

  primaryRiskType:
    RecommendationPredictionRiskType | null;

  primaryOpportunityType:
    RecommendationPredictionOpportunityType | null;

  reasoning:
    string[];

  confidence:
    number;

  predictedAt:
    string;
};

export type AnalyzeRecommendationPredictiveIntelligenceParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  horizon:
    RecommendationPredictionHorizon;

  predictedAt:
    string;

  recentEntryLimit?:
    number;

  recentComparisonLimit?:
    number;

  maximumStateCandidateCount?:
    number;

  maximumStrategyCandidateCount?:
    number;

  maximumDecisionCandidateCount?:
    number;

  minimumCandidateProbability?:
    number;

  createStatePredictionId:
    (
      state:
        RecommendationPredictiveEntryState,
      index:
        number,
    ) => string;

  createStrategyPredictionId:
    (
      strategyType:
        RecommendationPredictiveStrategyType,
      index:
        number,
    ) => string;

  createDecisionPredictionId:
    (
      decisionType:
        RecommendationPredictiveRuntimeDecisionType,
      index:
        number,
    ) => string;

  createRiskPredictionId:
    (
      type:
        RecommendationPredictionRiskType,
      index:
        number,
    ) => string;

  createOpportunityPredictionId:
    (
      type:
        RecommendationPredictionOpportunityType,
      index:
        number,
    ) => string;

  createConflictId:
    (
      type:
        RecommendationPredictionConflictType,
      index:
        number,
    ) => string;

  createSignalId:
    (
      type:
        RecommendationPredictionSignalType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Prediction Presentation                                            */
/* ------------------------------------------------------------------ */

export type RecommendationPredictivePresentationTone =
  | "unavailable"
  | "neutral"
  | "observing"
  | "predicting"
  | "stable"
  | "attention";

export type RecommendationPredictivePresentation = {
  tone:
    RecommendationPredictivePresentationTone;

  headline:
    string;

  summary:
    string;

  primaryPrediction:
    string | null;

  statePrediction:
    string | null;

  strategyPrediction:
    string | null;

  decisionPrediction:
    string | null;

  riskDescription:
    string | null;

  opportunityDescription:
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

export type CreateRecommendationPredictivePresentationParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  analysis:
    RecommendationPredictiveIntelligence;

  createdAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Prediction Update Result                                           */
/* ------------------------------------------------------------------ */

export type RecommendationPredictiveIntelligenceUpdateResult = {
  analysis:
    RecommendationPredictiveIntelligence;

  presentation:
    RecommendationPredictivePresentation;

  predictedAt:
    string;
};

export type UpdateRecommendationPredictiveIntelligenceParams =
  AnalyzeRecommendationPredictiveIntelligenceParams;

/* ------------------------------------------------------------------ */
/* Normalization Params                                               */
/* ------------------------------------------------------------------ */

export type NormalizeRecommendationStatePredictionsParams = {
  predictions:
    RecommendationPredictedState[];

  maximumCandidateCount:
    number;

  minimumProbability:
    number;
};

export type NormalizeRecommendationStrategyPredictionsParams = {
  predictions:
    RecommendationPredictedStrategy[];

  maximumCandidateCount:
    number;

  minimumProbability:
    number;
};

export type NormalizeRecommendationRuntimeDecisionPredictionsParams = {
  predictions:
    RecommendationPredictedRuntimeDecision[];

  maximumCandidateCount:
    number;

  minimumProbability:
    number;
};

export type DetectRecommendationPredictionConflictsParams = {
  predictedStates:
    RecommendationPredictedState[];

  predictedStrategies:
    RecommendationPredictedStrategy[];

  predictedRuntimeDecisions:
    RecommendationPredictedRuntimeDecision[];

  predictedRisks:
    RecommendationPredictedRisk[];

  predictedOpportunities:
    RecommendationPredictedOpportunity[];

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  createConflictId:
    (
      type:
        RecommendationPredictionConflictType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Validation Parameter Types                                         */
/* ------------------------------------------------------------------ */

export type ValidateRecommendationPredictionContextParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  context:
    RecommendationPredictionContext;
};

export type ValidateRecommendationPredictedStateParams = {
  prediction:
    RecommendationPredictedState;
};

export type ValidateRecommendationPredictedStrategyParams = {
  prediction:
    RecommendationPredictedStrategy;
};

export type ValidateRecommendationPredictedRuntimeDecisionParams = {
  prediction:
    RecommendationPredictedRuntimeDecision;
};

export type ValidateRecommendationPredictedRiskParams = {
  prediction:
    RecommendationPredictedRisk;
};

export type ValidateRecommendationPredictedOpportunityParams = {
  prediction:
    RecommendationPredictedOpportunity;
};

export type ValidateRecommendationPredictionSignalParams = {
  signal:
    RecommendationPredictionSignal;
};

export type ValidateRecommendationPredictiveIntelligenceParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  analysis:
    RecommendationPredictiveIntelligence;
};

export type ValidateRecommendationPredictivePresentationParams = {
  analysis:
    RecommendationPredictiveIntelligence;

  presentation:
    RecommendationPredictivePresentation;
};

export type ValidateRecommendationPredictiveUpdateResultParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  result:
    RecommendationPredictiveIntelligenceUpdateResult;
};

/* ------------------------------------------------------------------ */
/* Query Parameter Types                                              */
/* ------------------------------------------------------------------ */

export type FindRecommendationPredictedStateParams = {
  predictions:
    readonly RecommendationPredictedState[];

  state:
    RecommendationPredictiveEntryState;
};

export type FindRecommendationPredictedStrategyParams = {
  predictions:
    readonly RecommendationPredictedStrategy[];

  strategyType:
    RecommendationPredictiveStrategyType;
};

export type FindRecommendationPredictedRuntimeDecisionParams = {
  predictions:
    readonly RecommendationPredictedRuntimeDecision[];

  decisionType:
    RecommendationPredictiveRuntimeDecisionType;
};

export type FindRecommendationPredictedRiskParams = {
  predictions:
    readonly RecommendationPredictedRisk[];

  type:
    RecommendationPredictionRiskType;
};

export type FindRecommendationPredictedOpportunityParams = {
  predictions:
    readonly RecommendationPredictedOpportunity[];

  type:
    RecommendationPredictionOpportunityType;
};

/* ------------------------------------------------------------------ */
/* Type Guard Constants                                               */
/* ------------------------------------------------------------------ */

const RECOMMENDATION_PREDICTION_HORIZONS:
  readonly RecommendationPredictionHorizon[] = [
    "next-evaluation",
    "next-recommendation",
    "near-term-sequence",
  ];

const RECOMMENDATION_PREDICTIVE_INTELLIGENCE_STATES:
  readonly RecommendationPredictiveIntelligenceState[] = [
    "unavailable",
    "insufficient",
    "observing",
    "predicting",
    "stable",
    "conflicted",
  ];

const RECOMMENDATION_PREDICTION_SEVERITIES:
  readonly RecommendationPredictionSeverity[] = [
    "informational",
    "low",
    "moderate",
    "high",
  ];

const RECOMMENDATION_PREDICTION_TREND_DIRECTIONS:
  readonly RecommendationPredictionTrendDirection[] = [
    "increasing",
    "decreasing",
    "stable",
    "mixed",
    "unknown",
  ];

const RECOMMENDATION_PREDICTION_RISK_TYPES:
  readonly RecommendationPredictionRiskType[] = [
    "premature-advance-risk",
    "persistent-observation-risk",
    "stagnation-risk",
    "fragmentation-risk",
    "strategy-oscillation-risk",
    "state-oscillation-risk",
    "redirection-risk",
    "confidence-degradation-risk",
    "completion-failure-risk",
    "adaptation-conflict-risk",
  ];

const RECOMMENDATION_PREDICTION_OPPORTUNITY_TYPES:
  readonly RecommendationPredictionOpportunityType[] = [
    "stabilization-likelihood",
    "recovery-likelihood",
    "progress-likelihood",
    "completion-likelihood",
    "successful-advance-likelihood",
    "productive-clarification-likelihood",
    "signal-confirmation-likelihood",
  ];

const RECOMMENDATION_PREDICTION_CONFLICT_TYPES:
  readonly RecommendationPredictionConflictType[] = [
    "state-distribution-conflict",
    "strategy-distribution-conflict",
    "decision-distribution-conflict",
    "risk-opportunity-conflict",
    "adaptive-evidence-conflict",
  ];

const RECOMMENDATION_PREDICTION_SIGNAL_TYPES:
  readonly RecommendationPredictionSignalType[] = [
    "insufficient-prediction-data",
    "state-transition-likely",
    "strategy-transition-likely",
    "runtime-decision-likely",
    "risk-elevated",
    "opportunity-detected",
    "prediction-stable",
    "prediction-conflicted",
  ];

const RECOMMENDATION_PREDICTIVE_PRESENTATION_TONES:
  readonly RecommendationPredictivePresentationTone[] = [
    "unavailable",
    "neutral",
    "observing",
    "predicting",
    "stable",
    "attention",
  ];

/* ------------------------------------------------------------------ */
/* Type Guards                                                        */
/* ------------------------------------------------------------------ */

export function isRecommendationPredictiveIntelligenceVersion(
  value:
    unknown,
): value is RecommendationPredictiveIntelligenceVersion {
  return value ===
    1;
}

export function isRecommendationPredictionHorizon(
  value:
    unknown,
): value is RecommendationPredictionHorizon {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTION_HORIZONS.includes(
      value as RecommendationPredictionHorizon,
    )
  );
}

export function isRecommendationPredictiveIntelligenceState(
  value:
    unknown,
): value is RecommendationPredictiveIntelligenceState {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTIVE_INTELLIGENCE_STATES.includes(
      value as RecommendationPredictiveIntelligenceState,
    )
  );
}

export function isRecommendationPredictionSeverity(
  value:
    unknown,
): value is RecommendationPredictionSeverity {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTION_SEVERITIES.includes(
      value as RecommendationPredictionSeverity,
    )
  );
}

export function isRecommendationPredictionTrendDirection(
  value:
    unknown,
): value is RecommendationPredictionTrendDirection {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTION_TREND_DIRECTIONS.includes(
      value as RecommendationPredictionTrendDirection,
    )
  );
}

export function isRecommendationPredictionRiskType(
  value:
    unknown,
): value is RecommendationPredictionRiskType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTION_RISK_TYPES.includes(
      value as RecommendationPredictionRiskType,
    )
  );
}

export function isRecommendationPredictionOpportunityType(
  value:
    unknown,
): value is RecommendationPredictionOpportunityType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTION_OPPORTUNITY_TYPES.includes(
      value as RecommendationPredictionOpportunityType,
    )
  );
}

export function isRecommendationPredictionConflictType(
  value:
    unknown,
): value is RecommendationPredictionConflictType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTION_CONFLICT_TYPES.includes(
      value as RecommendationPredictionConflictType,
    )
  );
}

export function isRecommendationPredictionSignalType(
  value:
    unknown,
): value is RecommendationPredictionSignalType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTION_SIGNAL_TYPES.includes(
      value as RecommendationPredictionSignalType,
    )
  );
}

export function isRecommendationPredictivePresentationTone(
  value:
    unknown,
): value is RecommendationPredictivePresentationTone {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTIVE_PRESENTATION_TONES.includes(
      value as RecommendationPredictivePresentationTone,
    )
  );
}

/* ------------------------------------------------------------------ */
/* Empty Factories                                                    */
/* ------------------------------------------------------------------ */

export function createEmptyRecommendationPredictionScoreTrend():
  RecommendationPredictionScoreTrend {
  return {
    stability:
      "unknown",

    progress:
      "unknown",

    repetitionRisk:
      "unknown",

    redirectionRisk:
      "unknown",

    completionMomentum:
      "unknown",

    stabilityChange:
      0,

    progressChange:
      0,

    repetitionRiskChange:
      0,

    redirectionRiskChange:
      0,

    completionMomentumChange:
      0,

    sampleCount:
      0,
  };
}

export function createEmptyRecommendationPredictionEvidence():
  RecommendationPredictionEvidence {
  return {
    relatedEntryIds:
      [],

    relatedComparisonIds:
      [],

    relatedObservationIds:
      [],

    relatedPatternIds:
      [],

    relatedRuleIds:
      [],

    relatedMemorySignalTypes:
      [],
  };
}

export function createEmptyRecommendationPredictionStatistics():
  RecommendationPredictionStatistics {
  return {
    memoryEntryCount:
      0,

    comparisonCount:
      0,

    learningObservationCount:
      0,

    activeAdaptationRuleCount:
      0,

    conflictedAdaptationRuleCount:
      0,

    predictedStateCount:
      0,

    predictedStrategyCount:
      0,

    predictedRuntimeDecisionCount:
      0,

    predictedRiskCount:
      0,

    predictedOpportunityCount:
      0,

    conflictCount:
      0,

    signalCount:
      0,
  };
}

export function createEmptyRecommendationPredictionScores():
  RecommendationPredictionScores {
  return {
    evidenceStrength:
      0,

    temporalConsistency:
      0,

    statePredictionClarity:
      0,

    strategyPredictionClarity:
      0,

    decisionPredictionClarity:
      0,

    riskPressure:
      0,

    opportunityStrength:
      0,

    adaptiveAlignment:
      0,

    conflictRisk:
      0,

    predictionConfidence:
      0,
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function findRecommendationPredictedState(
  params:
    FindRecommendationPredictedStateParams,
): RecommendationPredictedState | null {
  return (
    params.predictions.find(
      (
        prediction,
      ) =>
        prediction.state ===
        params.state,
    ) ??
    null
  );
}

export function findRecommendationPredictedStrategy(
  params:
    FindRecommendationPredictedStrategyParams,
): RecommendationPredictedStrategy | null {
  return (
    params.predictions.find(
      (
        prediction,
      ) =>
        prediction.strategyType ===
        params.strategyType,
    ) ??
    null
  );
}

export function findRecommendationPredictedRuntimeDecision(
  params:
    FindRecommendationPredictedRuntimeDecisionParams,
): RecommendationPredictedRuntimeDecision | null {
  return (
    params.predictions.find(
      (
        prediction,
      ) =>
        prediction.decisionType ===
        params.decisionType,
    ) ??
    null
  );
}

export function findRecommendationPredictedRisk(
  params:
    FindRecommendationPredictedRiskParams,
): RecommendationPredictedRisk | null {
  return (
    params.predictions.find(
      (
        prediction,
      ) =>
        prediction.type ===
        params.type,
    ) ??
    null
  );
}

export function findRecommendationPredictedOpportunity(
  params:
    FindRecommendationPredictedOpportunityParams,
): RecommendationPredictedOpportunity | null {
  return (
    params.predictions.find(
      (
        prediction,
      ) =>
        prediction.type ===
        params.type,
    ) ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Primary Prediction Helpers                                         */
/* ------------------------------------------------------------------ */

export function getPrimaryRecommendationPredictedState(
  predictions:
    readonly RecommendationPredictedState[],
): RecommendationPredictedState | null {
  return getRankedPrimaryPrediction(
    predictions,
  );
}

export function getPrimaryRecommendationPredictedStrategy(
  predictions:
    readonly RecommendationPredictedStrategy[],
): RecommendationPredictedStrategy | null {
  return getRankedPrimaryPrediction(
    predictions,
  );
}

export function getPrimaryRecommendationPredictedRuntimeDecision(
  predictions:
    readonly RecommendationPredictedRuntimeDecision[],
): RecommendationPredictedRuntimeDecision | null {
  return getRankedPrimaryPrediction(
    predictions,
  );
}

export function getPrimaryRecommendationPredictedRisk(
  predictions:
    readonly RecommendationPredictedRisk[],
): RecommendationPredictedRisk | null {
  return getRankedPrimaryPrediction(
    predictions,
  );
}

export function getPrimaryRecommendationPredictedOpportunity(
  predictions:
    readonly RecommendationPredictedOpportunity[],
): RecommendationPredictedOpportunity | null {
  return getRankedPrimaryPrediction(
    predictions,
  );
}

function getRankedPrimaryPrediction<
  TPrediction extends {
    rank:
      number;

    scores:
      RecommendationPredictionCandidateScores;
  },
>(
  predictions:
    readonly TPrediction[],
): TPrediction | null {
  if (
    predictions.length ===
    0
  ) {
    return null;
  }

  const ranked =
    [...predictions].sort(
      (
        left,
        right,
      ) => {
        if (
          left.rank !==
          right.rank
        ) {
          return left.rank -
            right.rank;
        }

        if (
          left.scores.probability !==
          right.scores.probability
        ) {
          return right.scores.probability -
            left.scores.probability;
        }

        return right.scores.confidence -
          left.scores.confidence;
      },
    );

  return ranked[
    0
  ] ??
    null;
}

/* ------------------------------------------------------------------ */
/* Adaptation Rule Helpers                                            */
/* ------------------------------------------------------------------ */

export function getActiveRecommendationPredictionAdaptationRules(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): RecommendationAdaptationRule[] {
  return analysis.adaptationRules.filter(
    (
      rule,
    ) =>
      rule.status ===
      "active",
  );
}

export function getConflictedRecommendationPredictionAdaptationRules(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): RecommendationAdaptationRule[] {
  return analysis.adaptationRules.filter(
    (
      rule,
    ) =>
      rule.status ===
      "conflicted",
  );
}

/* ------------------------------------------------------------------ */
/* Memory Signal Helpers                                              */
/* ------------------------------------------------------------------ */

export function hasRecommendationPredictionMemorySignal(
  params: {
    memoryAnalysis:
      RecommendationEvolutionMemoryAnalysis;

    type:
      RecommendationEvolutionMemorySignalType;
  },
): boolean {
  return params.memoryAnalysis.signals.some(
    (
      signal,
    ) =>
      signal.type ===
      params.type,
  );
}