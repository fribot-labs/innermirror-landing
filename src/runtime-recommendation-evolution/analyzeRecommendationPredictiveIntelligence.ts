import {
  createEmptyRecommendationPredictionScores,
  createEmptyRecommendationPredictionStatistics,
  getPrimaryRecommendationPredictedOpportunity,
  getPrimaryRecommendationPredictedRisk,
  getPrimaryRecommendationPredictedRuntimeDecision,
  getPrimaryRecommendationPredictedState,
  getPrimaryRecommendationPredictedStrategy,
  isRecommendationPredictionHorizon,
  isRecommendationPredictionSeverity,
  isRecommendationPredictionSignalType,
  isRecommendationPredictiveIntelligenceState,
} from "./recommendationPredictiveIntelligenceTypes";

import {
  createRecommendationPredictionContext,
  validateRecommendationPredictionContext,
} from "./createRecommendationPredictionContext";

import {
  cloneRecommendationPredictedState,
  predictNextRecommendationStates,
  validateRecommendationPredictedStates,
} from "./predictNextRecommendationStates";

import {
  cloneRecommendationPredictedStrategy,
  predictNextRecommendationStrategies,
  validateRecommendationPredictedStrategies,
} from "./predictNextRecommendationStrategies";

import {
  cloneRecommendationPredictedRuntimeDecision,
  predictRecommendationRuntimeDecisions,
  validateRecommendationPredictedRuntimeDecisions,
} from "./predictRuntimeDecisions";

import {
  cloneRecommendationPredictedRisk,
  predictRecommendationRisks,
  validateRecommendationPredictedRisks,
} from "./predictRecommendationRisks";

import {
  cloneRecommendationPredictedOpportunity,
  predictRecommendationOpportunities,
  validateRecommendationPredictedOpportunities,
} from "./predictRecommendationOpportunities";

import {
  cloneRecommendationPredictionConflict,
  detectRecommendationPredictionConflicts,
  normalizeRecommendationOpportunityPredictions,
  normalizeRecommendationRiskPredictions,
  normalizeRecommendationRuntimeDecisionPredictions,
  normalizeRecommendationStatePredictions,
  normalizeRecommendationStrategyPredictions,
  validateRecommendationPredictionConflicts,
} from "./normalizeRecommendationPredictions";

import {
  validateRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
  validateRecommendationEvolutionMemoryAnalysis,
} from "./analyzeRecommendationEvolutionMemory";

import {
  validateRecommendationAdaptiveLearningAnalysis,
} from "./analyzeRecommendationAdaptiveLearning";

import type {
  AnalyzeRecommendationPredictiveIntelligenceParams,
  RecommendationPredictedOpportunity,
  RecommendationPredictedRisk,
  RecommendationPredictedRuntimeDecision,
  RecommendationPredictedState,
  RecommendationPredictedStrategy,
  RecommendationPredictionConflict,
  RecommendationPredictionScores,
  RecommendationPredictionSeverity,
  RecommendationPredictionSignal,
  RecommendationPredictionSignalType,
  RecommendationPredictionStatistics,
  RecommendationPredictiveIntelligence,
  RecommendationPredictiveIntelligenceState,
  ValidateRecommendationPredictiveIntelligenceParams,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_RECENT_ENTRY_LIMIT =
  5;

const DEFAULT_RECENT_COMPARISON_LIMIT =
  5;

const DEFAULT_MAXIMUM_STATE_CANDIDATE_COUNT =
  3;

const DEFAULT_MAXIMUM_STRATEGY_CANDIDATE_COUNT =
  3;

const DEFAULT_MAXIMUM_DECISION_CANDIDATE_COUNT =
  4;

const DEFAULT_MINIMUM_CANDIDATE_PROBABILITY =
  0.05;

const MAXIMUM_RECENT_ITEM_LIMIT =
  100;

const MAXIMUM_STATE_CANDIDATE_COUNT =
  7;

const MAXIMUM_STRATEGY_CANDIDATE_COUNT =
  8;

const MAXIMUM_DECISION_CANDIDATE_COUNT =
  9;

const SCORE_PRECISION =
  10000;

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Predictive Intelligence 전체 분석 Pipeline을
 * 실행합니다.
 *
 * Pipeline:
 *
 * Memory + Memory Analysis + Adaptive Learning
 *        ↓
 * Prediction Context
 *        ↓
 * State Prediction
 *        ↓
 * Strategy Prediction
 *        ↓
 * Runtime Decision Prediction
 *        ↓
 * Risk / Opportunity Prediction
 *        ↓
 * Final Normalization
 *        ↓
 * Conflict Detection
 *        ↓
 * Statistics / Scores / Signals / State
 */
export function analyzeRecommendationPredictiveIntelligence(
  params:
    AnalyzeRecommendationPredictiveIntelligenceParams,
): RecommendationPredictiveIntelligence {
  validateAnalyzeRecommendationPredictiveIntelligenceParams(
    params,
  );

  const recentEntryLimit =
    params.recentEntryLimit ??
    DEFAULT_RECENT_ENTRY_LIMIT;

  const recentComparisonLimit =
    params.recentComparisonLimit ??
    DEFAULT_RECENT_COMPARISON_LIMIT;

  const maximumStateCandidateCount =
    params.maximumStateCandidateCount ??
    DEFAULT_MAXIMUM_STATE_CANDIDATE_COUNT;

  const maximumStrategyCandidateCount =
    params.maximumStrategyCandidateCount ??
    DEFAULT_MAXIMUM_STRATEGY_CANDIDATE_COUNT;

  const maximumDecisionCandidateCount =
    params.maximumDecisionCandidateCount ??
    DEFAULT_MAXIMUM_DECISION_CANDIDATE_COUNT;

  const minimumCandidateProbability =
    params.minimumCandidateProbability ??
    DEFAULT_MINIMUM_CANDIDATE_PROBABILITY;

  const context =
    createRecommendationPredictionContext({
      memory:
        params.memory,

      memoryAnalysis:
        params.memoryAnalysis,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      horizon:
        params.horizon,

      createdAt:
        params.predictedAt,

      recentEntryLimit,

      recentComparisonLimit,
    });

  const initialPredictedStates =
    predictNextRecommendationStates({
      context,

      memory:
        params.memory,

      memoryAnalysis:
        params.memoryAnalysis,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      predictedAt:
        params.predictedAt,

      maximumCandidateCount:
        maximumStateCandidateCount,

      minimumProbability:
        minimumCandidateProbability,

      createPredictionId:
        params.createStatePredictionId,
    });

  const predictedStates =
    normalizeRecommendationStatePredictions({
      predictions:
        initialPredictedStates,

      maximumCandidateCount:
        maximumStateCandidateCount,

      minimumProbability:
        minimumCandidateProbability,
    });

  const initialPredictedStrategies =
    predictNextRecommendationStrategies({
      context,

      predictedStates,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      predictedAt:
        params.predictedAt,

      maximumCandidateCount:
        maximumStrategyCandidateCount,

      minimumProbability:
        minimumCandidateProbability,

      createPredictionId:
        params.createStrategyPredictionId,
    });

  const predictedStrategies =
    normalizeRecommendationStrategyPredictions({
      predictions:
        initialPredictedStrategies,

      maximumCandidateCount:
        maximumStrategyCandidateCount,

      minimumProbability:
        minimumCandidateProbability,
    });

  const initialPredictedRuntimeDecisions =
    predictRecommendationRuntimeDecisions({
      context,

      predictedStates,

      predictedStrategies,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      predictedAt:
        params.predictedAt,

      maximumCandidateCount:
        maximumDecisionCandidateCount,

      minimumProbability:
        minimumCandidateProbability,

      createPredictionId:
        params.createDecisionPredictionId,
    });

  const predictedRuntimeDecisions =
    normalizeRecommendationRuntimeDecisionPredictions({
      predictions:
        initialPredictedRuntimeDecisions,

      maximumCandidateCount:
        maximumDecisionCandidateCount,

      minimumProbability:
        minimumCandidateProbability,
    });

  const initialPredictedRisks =
    predictRecommendationRisks({
      context,

      predictedStates,

      predictedStrategies,

      predictedRuntimeDecisions,

      memoryAnalysis:
        params.memoryAnalysis,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      predictedAt:
        params.predictedAt,

      minimumProbability:
        minimumCandidateProbability,

      createPredictionId:
        params.createRiskPredictionId,
    });

  const predictedRisks =
    normalizeRecommendationRiskPredictions(
      initialPredictedRisks,
    );

  const initialPredictedOpportunities =
    predictRecommendationOpportunities({
      context,

      predictedStates,

      predictedStrategies,

      predictedRuntimeDecisions,

      memoryAnalysis:
        params.memoryAnalysis,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      predictedAt:
        params.predictedAt,

      minimumProbability:
        minimumCandidateProbability,

      createPredictionId:
        params.createOpportunityPredictionId,
    });

  const predictedOpportunities =
    normalizeRecommendationOpportunityPredictions(
      initialPredictedOpportunities,
    );

  const conflicts =
    detectRecommendationPredictionConflicts({
      predictedStates,

      predictedStrategies,

      predictedRuntimeDecisions,

      predictedRisks,

      predictedOpportunities,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      createConflictId:
        params.createConflictId,
    });

  const initialStatistics =
    createRecommendationPredictionStatistics({
      memoryEntryCount:
        params.memory.entries.length,

      comparisonCount:
        params.memoryAnalysis.comparisons.length,

      activeAdaptationRuleCount:
        context.activeAdaptationRuleIds.length,

      conflictedAdaptationRuleCount:
        context.conflictedAdaptationRuleIds.length,

      predictedStates,

      predictedStrategies,

      predictedRuntimeDecisions,

      predictedRisks,

      predictedOpportunities,

      conflicts,
    });

  const scores =
    createRecommendationPredictionScores({
      context,

      predictedStates,

      predictedStrategies,

      predictedRuntimeDecisions,

      predictedRisks,

      predictedOpportunities,

      conflicts,
    });

  const state =
    resolveRecommendationPredictiveIntelligenceState({
      memoryEntryCount:
        initialStatistics.memoryEntryCount,

      comparisonCount:
        initialStatistics.comparisonCount,

      scores,

      predictedStates,

      predictedStrategies,

      predictedRuntimeDecisions,

      conflicts,
    });

  const signals =
    createRecommendationPredictionSignals({
      state,

      scores,

      predictedStates,

      predictedStrategies,

      predictedRuntimeDecisions,

      predictedRisks,

      predictedOpportunities,

      conflicts,

      predictedAt:
        params.predictedAt,

      createSignalId:
        params.createSignalId,
    });

  const statistics:
    RecommendationPredictionStatistics = {
    ...initialStatistics,

    signalCount:
      signals.length,
  };

  const primarySignalType =
    resolvePrimaryRecommendationPredictionSignalType(
      signals,
    );

  const primaryStatePrediction =
    getPrimaryRecommendationPredictedState(
      predictedStates,
    );

  const primaryStrategyPrediction =
    getPrimaryRecommendationPredictedStrategy(
      predictedStrategies,
    );

  const primaryRuntimeDecisionPrediction =
    getPrimaryRecommendationPredictedRuntimeDecision(
      predictedRuntimeDecisions,
    );

  const primaryRiskPrediction =
    getPrimaryRecommendationPredictedRisk(
      predictedRisks,
    );

  const primaryOpportunityPrediction =
    getPrimaryRecommendationPredictedOpportunity(
      predictedOpportunities,
    );

  const reasoning =
    createRecommendationPredictiveReasoning({
      state,

      scores,

      primaryStatePrediction,

      primaryStrategyPrediction,

      primaryRuntimeDecisionPrediction,

      primaryRiskPrediction,

      primaryOpportunityPrediction,

      conflicts,
    });

  const analysis:
    RecommendationPredictiveIntelligence = {
      version:
        1,

      memoryId:
        params.memory.id,

      historyId:
        params.memory.historyId,

      sourceMemoryAnalyzedAt:
        params.memoryAnalysis.analyzedAt,

      sourceAdaptiveLearningAnalyzedAt:
        params.adaptiveLearningAnalysis.analyzedAt,

      state,

      horizon:
        params.horizon,

      context,

      statistics,

      scores,

      predictedStates:
        predictedStates.map(
          cloneRecommendationPredictedState,
        ),

      predictedStrategies:
        predictedStrategies.map(
          cloneRecommendationPredictedStrategy,
        ),

      predictedRuntimeDecisions:
        predictedRuntimeDecisions.map(
          cloneRecommendationPredictedRuntimeDecision,
        ),

      predictedRisks:
        predictedRisks.map(
          cloneRecommendationPredictedRisk,
        ),

      predictedOpportunities:
        predictedOpportunities.map(
          cloneRecommendationPredictedOpportunity,
        ),

      conflicts:
        conflicts.map(
          cloneRecommendationPredictionConflict,
        ),

      signals:
        signals.map(
          cloneRecommendationPredictionSignal,
        ),

      primarySignalType,

      primaryState:
        primaryStatePrediction?.state ??
        null,

      primaryStrategyType:
        primaryStrategyPrediction?.strategyType ??
        null,

      primaryRuntimeDecisionType:
        primaryRuntimeDecisionPrediction?.decisionType ??
        null,

      primaryRiskType:
        primaryRiskPrediction?.type ??
        null,

      primaryOpportunityType:
        primaryOpportunityPrediction?.type ??
        null,

      reasoning,

      confidence:
        scores.predictionConfidence,

      predictedAt:
        params.predictedAt,
    };

  validateRecommendationPredictiveIntelligence({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    adaptiveLearningAnalysis:
      params.adaptiveLearningAnalysis,

    analysis,
  });

  return cloneRecommendationPredictiveIntelligence(
    analysis,
  );
}

/* ------------------------------------------------------------------ */
/* Statistics                                                         */
/* ------------------------------------------------------------------ */

function createRecommendationPredictionStatistics(
  params: {
    memoryEntryCount:
      number;

    comparisonCount:
      number;

    activeAdaptationRuleCount:
      number;

    conflictedAdaptationRuleCount:
      number;

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];

    predictedRisks:
      readonly RecommendationPredictedRisk[];

    predictedOpportunities:
      readonly RecommendationPredictedOpportunity[];

    conflicts:
      readonly RecommendationPredictionConflict[];
  },
): RecommendationPredictionStatistics {
  const statistics =
    createEmptyRecommendationPredictionStatistics();

  const learningObservationIds =
    collectUniqueEvidenceIds({
      predictedStates:
        params.predictedStates,

      predictedStrategies:
        params.predictedStrategies,

      predictedRuntimeDecisions:
        params.predictedRuntimeDecisions,

      predictedRisks:
        params.predictedRisks,

      predictedOpportunities:
        params.predictedOpportunities,

      field:
        "relatedObservationIds",
    });

  return {
    ...statistics,

    memoryEntryCount:
      params.memoryEntryCount,

    comparisonCount:
      params.comparisonCount,

    learningObservationCount:
      learningObservationIds.length,

    activeAdaptationRuleCount:
      params.activeAdaptationRuleCount,

    conflictedAdaptationRuleCount:
      params.conflictedAdaptationRuleCount,

    predictedStateCount:
      params.predictedStates.length,

    predictedStrategyCount:
      params.predictedStrategies.length,

    predictedRuntimeDecisionCount:
      params.predictedRuntimeDecisions.length,

    predictedRiskCount:
      params.predictedRisks.length,

    predictedOpportunityCount:
      params.predictedOpportunities.length,

    conflictCount:
      params.conflicts.length,

    signalCount:
      0,
  };
}

/* ------------------------------------------------------------------ */
/* Scores                                                             */
/* ------------------------------------------------------------------ */

function createRecommendationPredictionScores(
  params: {
    context:
      RecommendationPredictiveIntelligence[
        "context"
      ];

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];

    predictedRisks:
      readonly RecommendationPredictedRisk[];

    predictedOpportunities:
      readonly RecommendationPredictedOpportunity[];

    conflicts:
      readonly RecommendationPredictionConflict[];
  },
): RecommendationPredictionScores {
  const scores =
    createEmptyRecommendationPredictionScores();

  const statePredictionClarity =
    calculatePredictionDistributionClarity(
      params.predictedStates,
    );

  const strategyPredictionClarity =
    calculatePredictionDistributionClarity(
      params.predictedStrategies,
    );

  const decisionPredictionClarity =
    calculatePredictionDistributionClarity(
      params.predictedRuntimeDecisions,
    );

  const riskPressure =
    calculateMaximumPredictionStrength(
      params.predictedRisks,
    );

  const opportunityStrength =
    calculateMaximumPredictionStrength(
      params.predictedOpportunities,
    );

  const detectedConflictRisk =
    calculateMaximumConflictStrength(
      params.conflicts,
    );

  const conflictRisk =
    clampUnitInterval(
      Math.max(
        params.context.conflictRisk,
        detectedConflictRisk,
      ),
    );

  const temporalConsistency =
    calculateTemporalConsistency(
      params.context,
    );

  const adaptiveAlignment =
    clampUnitInterval(
      averageNumbers([
        params.context.learningConfidence,
        params.context.adaptationReadiness,
        1 -
          params.context.conflictRisk,
      ]),
    );

  const predictionConfidence =
    clampUnitInterval(
      params.context.evidenceStrength *
        0.2 +
      temporalConsistency *
        0.14 +
      statePredictionClarity *
        0.16 +
      strategyPredictionClarity *
        0.14 +
      decisionPredictionClarity *
        0.12 +
      adaptiveAlignment *
        0.16 +
      averagePredictionConfidence([
        ...params.predictedStates,
        ...params.predictedStrategies,
        ...params.predictedRuntimeDecisions,
      ]) *
        0.08,
    ) *
    (
      1 -
      conflictRisk *
        0.35
    );

  return {
    ...scores,

    evidenceStrength:
      roundScore(
        params.context.evidenceStrength,
      ),

    temporalConsistency:
      roundScore(
        temporalConsistency,
      ),

    statePredictionClarity:
      roundScore(
        statePredictionClarity,
      ),

    strategyPredictionClarity:
      roundScore(
        strategyPredictionClarity,
      ),

    decisionPredictionClarity:
      roundScore(
        decisionPredictionClarity,
      ),

    riskPressure:
      roundScore(
        riskPressure,
      ),

    opportunityStrength:
      roundScore(
        opportunityStrength,
      ),

    adaptiveAlignment:
      roundScore(
        adaptiveAlignment,
      ),

    conflictRisk:
      roundScore(
        conflictRisk,
      ),

    predictionConfidence:
      roundScore(
        clampUnitInterval(
          predictionConfidence,
        ),
      ),
  };
}

/* ------------------------------------------------------------------ */
/* State Resolution                                                   */
/* ------------------------------------------------------------------ */

export function resolveRecommendationPredictiveIntelligenceState(
  params: {
    memoryEntryCount:
      number;

    comparisonCount:
      number;

    scores:
      RecommendationPredictionScores;

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];

    conflicts:
      readonly RecommendationPredictionConflict[];
  },
): RecommendationPredictiveIntelligenceState {
  if (
    params.memoryEntryCount ===
    0
  ) {
    return "unavailable";
  }

  if (
    params.memoryEntryCount <
      2 ||
    params.comparisonCount ===
      0 ||
    params.predictedStates.length ===
      0
  ) {
    return "insufficient";
  }

  if (
    params.conflicts.length >
      0 &&
    params.scores.conflictRisk >=
      0.35
  ) {
    return "conflicted";
  }

  if (
    params.scores.predictionConfidence <
      0.35
  ) {
    return "observing";
  }

  if (
    params.scores.predictionConfidence >=
      0.7 &&
    params.scores.statePredictionClarity >=
      0.5 &&
    params.scores.strategyPredictionClarity >=
      0.45 &&
    params.scores.decisionPredictionClarity >=
      0.4
  ) {
    return "stable";
  }

  return "predicting";
}

/* ------------------------------------------------------------------ */
/* Signals                                                            */
/* ------------------------------------------------------------------ */

function createRecommendationPredictionSignals(
  params: {
    state:
      RecommendationPredictiveIntelligenceState;

    scores:
      RecommendationPredictionScores;

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];

    predictedRisks:
      readonly RecommendationPredictedRisk[];

    predictedOpportunities:
      readonly RecommendationPredictedOpportunity[];

    conflicts:
      readonly RecommendationPredictionConflict[];

    predictedAt:
      string;

    createSignalId:
      AnalyzeRecommendationPredictiveIntelligenceParams[
        "createSignalId"
      ];
  },
): RecommendationPredictionSignal[] {
  const drafts:
    Omit<
      RecommendationPredictionSignal,
      "id"
    >[] = [];

  if (
    params.state ===
      "unavailable" ||
    params.state ===
      "insufficient"
  ) {
    drafts.push({
      type:
        "insufficient-prediction-data",

      severity:
        "informational",

      score:
        roundScore(
          1 -
          params.scores.evidenceStrength,
        ),

      confidence:
        roundScore(
          1 -
          params.scores.predictionConfidence,
        ),

      description:
        "More Recommendation history is required before a reliable prediction can be produced.",

      relatedStatePredictionIds:
        [],

      relatedStrategyPredictionIds:
        [],

      relatedDecisionPredictionIds:
        [],

      relatedRiskPredictionIds:
        [],

      relatedOpportunityPredictionIds:
        [],

      detectedAt:
        params.predictedAt,
    });
  }

  const primaryState =
    getPrimaryRecommendationPredictedState(
      params.predictedStates,
    );

  if (
    primaryState !==
      null
  ) {
    drafts.push({
      type:
        "state-transition-likely",

      severity:
        resolveSignalSeverity(
          primaryState.scores.probability,
        ),

      score:
        primaryState.scores.probability,

      confidence:
        primaryState.scores.confidence,

      description:
        `${primaryState.state} is the strongest next-state prediction.`,

      relatedStatePredictionIds: [
        primaryState.id,
      ],

      relatedStrategyPredictionIds:
        [],

      relatedDecisionPredictionIds:
        [],

      relatedRiskPredictionIds:
        [],

      relatedOpportunityPredictionIds:
        [],

      detectedAt:
        params.predictedAt,
    });
  }

  const primaryStrategy =
    getPrimaryRecommendationPredictedStrategy(
      params.predictedStrategies,
    );

  if (
    primaryStrategy !==
      null
  ) {
    drafts.push({
      type:
        "strategy-transition-likely",

      severity:
        resolveSignalSeverity(
          primaryStrategy.scores.probability,
        ),

      score:
        primaryStrategy.scores.probability,

      confidence:
        primaryStrategy.scores.confidence,

      description:
        `${primaryStrategy.strategyType} is the strongest next-strategy prediction.`,

      relatedStatePredictionIds:
        [],

      relatedStrategyPredictionIds: [
        primaryStrategy.id,
      ],

      relatedDecisionPredictionIds:
        [],

      relatedRiskPredictionIds:
        [],

      relatedOpportunityPredictionIds:
        [],

      detectedAt:
        params.predictedAt,
    });
  }

  const primaryDecision =
    getPrimaryRecommendationPredictedRuntimeDecision(
      params.predictedRuntimeDecisions,
    );

  if (
    primaryDecision !==
      null
  ) {
    drafts.push({
      type:
        "runtime-decision-likely",

      severity:
        resolveSignalSeverity(
          primaryDecision.scores.probability,
        ),

      score:
        primaryDecision.scores.probability,

      confidence:
        primaryDecision.scores.confidence,

      description:
        `${primaryDecision.decisionType} is the strongest predicted Runtime Decision.`,

      relatedStatePredictionIds:
        [],

      relatedStrategyPredictionIds:
        [],

      relatedDecisionPredictionIds: [
        primaryDecision.id,
      ],

      relatedRiskPredictionIds:
        [],

      relatedOpportunityPredictionIds:
        [],

      detectedAt:
        params.predictedAt,
    });
  }

  const primaryRisk =
    getPrimaryRecommendationPredictedRisk(
      params.predictedRisks,
    );

  if (
    primaryRisk !==
      null &&
    primaryRisk.scores.probability >=
      0.15
  ) {
    drafts.push({
      type:
        "risk-elevated",

      severity:
        primaryRisk.severity,

      score:
        primaryRisk.scores.probability,

      confidence:
        primaryRisk.scores.confidence,

      description:
        `${primaryRisk.type} is the strongest predicted risk.`,

      relatedStatePredictionIds:
        [],

      relatedStrategyPredictionIds:
        [],

      relatedDecisionPredictionIds:
        [],

      relatedRiskPredictionIds: [
        primaryRisk.id,
      ],

      relatedOpportunityPredictionIds:
        [],

      detectedAt:
        params.predictedAt,
    });
  }

  const primaryOpportunity =
    getPrimaryRecommendationPredictedOpportunity(
      params.predictedOpportunities,
    );

  if (
    primaryOpportunity !==
      null &&
    primaryOpportunity.scores.probability >=
      0.15
  ) {
    drafts.push({
      type:
        "opportunity-detected",

      severity:
        primaryOpportunity.severity,

      score:
        primaryOpportunity.scores.probability,

      confidence:
        primaryOpportunity.scores.confidence,

      description:
        `${primaryOpportunity.type} is the strongest predicted opportunity.`,

      relatedStatePredictionIds:
        [],

      relatedStrategyPredictionIds:
        [],

      relatedDecisionPredictionIds:
        [],

      relatedRiskPredictionIds:
        [],

      relatedOpportunityPredictionIds: [
        primaryOpportunity.id,
      ],

      detectedAt:
        params.predictedAt,
    });
  }

  if (
    params.state ===
      "stable"
  ) {
    drafts.push({
      type:
        "prediction-stable",

      severity:
        "moderate",

      score:
        params.scores.predictionConfidence,

      confidence:
        params.scores.predictionConfidence,

      description:
        "The current predictive distribution is sufficiently stable.",

      relatedStatePredictionIds:
        params.predictedStates.map(
          (
            prediction,
          ) =>
            prediction.id,
        ),

      relatedStrategyPredictionIds:
        params.predictedStrategies.map(
          (
            prediction,
          ) =>
            prediction.id,
        ),

      relatedDecisionPredictionIds:
        params.predictedRuntimeDecisions.map(
          (
            prediction,
          ) =>
            prediction.id,
        ),

      relatedRiskPredictionIds:
        [],

      relatedOpportunityPredictionIds:
        [],

      detectedAt:
        params.predictedAt,
    });
  }

  if (
    params.state ===
      "conflicted"
  ) {
    drafts.push({
      type:
        "prediction-conflicted",

      severity:
        resolveSignalSeverity(
          params.scores.conflictRisk,
        ),

      score:
        params.scores.conflictRisk,

      confidence:
        params.scores.predictionConfidence,

      description:
        "The current evidence supports multiple competing prediction directions.",

      relatedStatePredictionIds:
        params.predictedStates.map(
          (
            prediction,
          ) =>
            prediction.id,
        ),

      relatedStrategyPredictionIds:
        params.predictedStrategies.map(
          (
            prediction,
          ) =>
            prediction.id,
        ),

      relatedDecisionPredictionIds:
        params.predictedRuntimeDecisions.map(
          (
            prediction,
          ) =>
            prediction.id,
        ),

      relatedRiskPredictionIds:
        params.predictedRisks.map(
          (
            prediction,
          ) =>
            prediction.id,
        ),

      relatedOpportunityPredictionIds:
        params.predictedOpportunities.map(
          (
            prediction,
          ) =>
            prediction.id,
        ),

      detectedAt:
        params.predictedAt,
    });
  }

  const signals =
    drafts.map(
      (
        draft,
        index,
      ): RecommendationPredictionSignal => ({
        id:
          params.createSignalId(
            draft.type,
            index,
          ),

        ...draft,
      }),
    );

  validateRecommendationPredictionSignals(
    signals,
  );

  return signals.map(
    cloneRecommendationPredictionSignal,
  );
}

/* ------------------------------------------------------------------ */
/* Primary Signal                                                     */
/* ------------------------------------------------------------------ */

function resolvePrimaryRecommendationPredictionSignalType(
  signals:
    readonly RecommendationPredictionSignal[],
): RecommendationPredictionSignalType | null {
  if (
    signals.length ===
    0
  ) {
    return null;
  }

  const priority:
    readonly RecommendationPredictionSignalType[] = [
      "prediction-conflicted",
      "risk-elevated",
      "opportunity-detected",
      "state-transition-likely",
      "strategy-transition-likely",
      "runtime-decision-likely",
      "prediction-stable",
      "insufficient-prediction-data",
    ];

  const sorted =
    [...signals].sort(
      (
        left,
        right,
      ) => {
        const priorityDifference =
          priority.indexOf(
            left.type,
          ) -
          priority.indexOf(
            right.type,
          );

        if (
          priorityDifference !==
          0
        ) {
          return priorityDifference;
        }

        if (
          left.score !==
          right.score
        ) {
          return right.score -
            left.score;
        }

        return right.confidence -
          left.confidence;
      },
    );

  return sorted[
    0
  ]?.type ??
    null;
}

/* ------------------------------------------------------------------ */
/* Reasoning                                                          */
/* ------------------------------------------------------------------ */

function createRecommendationPredictiveReasoning(
  params: {
    state:
      RecommendationPredictiveIntelligenceState;

    scores:
      RecommendationPredictionScores;

    primaryStatePrediction:
      RecommendationPredictedState | null;

    primaryStrategyPrediction:
      RecommendationPredictedStrategy | null;

    primaryRuntimeDecisionPrediction:
      RecommendationPredictedRuntimeDecision | null;

    primaryRiskPrediction:
      RecommendationPredictedRisk | null;

    primaryOpportunityPrediction:
      RecommendationPredictedOpportunity | null;

    conflicts:
      readonly RecommendationPredictionConflict[];
  },
): string[] {
  const reasoning:
    string[] = [
      `Predictive Intelligence state resolved to ${params.state}.`,
      `Overall prediction confidence is ${roundScore(
        params.scores.predictionConfidence *
        100,
      )}%.`,
  ];

  if (
    params.primaryStatePrediction !==
    null
  ) {
    reasoning.push(
      `${params.primaryStatePrediction.state} is the strongest State candidate at ${roundScore(
        params.primaryStatePrediction.scores.probability *
        100,
      )}%.`,
    );
  }

  if (
    params.primaryStrategyPrediction !==
    null
  ) {
    reasoning.push(
      `${params.primaryStrategyPrediction.strategyType} is the strongest Strategy candidate.`,
    );
  }

  if (
    params.primaryRuntimeDecisionPrediction !==
    null
  ) {
    reasoning.push(
      `${params.primaryRuntimeDecisionPrediction.decisionType} is the strongest Runtime Decision candidate.`,
    );
  }

  if (
    params.primaryRiskPrediction !==
    null
  ) {
    reasoning.push(
      `${params.primaryRiskPrediction.type} is the primary predicted risk.`,
    );
  }

  if (
    params.primaryOpportunityPrediction !==
    null
  ) {
    reasoning.push(
      `${params.primaryOpportunityPrediction.type} is the primary predicted opportunity.`,
    );
  }

  if (
    params.conflicts.length >
    0
  ) {
    reasoning.push(
      `${params.conflicts.length} meaningful prediction conflict(s) were detected.`,
    );
  }

  return uniqueStrings(
    reasoning,
  );
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictiveIntelligence(
  params:
    ValidateRecommendationPredictiveIntelligenceParams,
): void {
  const {
    memory,
    memoryAnalysis,
    adaptiveLearningAnalysis,
    analysis,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateRecommendationEvolutionMemoryAnalysis({
    memory,

    analysis:
      memoryAnalysis,
  });

  validateRecommendationAdaptiveLearningAnalysis({
    memory,

    memoryAnalysis,

    analysis:
      adaptiveLearningAnalysis,
  });

  if (
    typeof analysis !==
      "object" ||
    analysis ===
      null ||
    Array.isArray(
      analysis,
    )
  ) {
    throw new Error(
      "Recommendation Predictive Intelligence must be an object.",
    );
  }

  if (
    analysis.version !==
    1
  ) {
    throw new Error(
      "Recommendation Predictive Intelligence version must be 1.",
    );
  }

  validateRequiredIdentifier(
    analysis.memoryId,
    "analysis.memoryId",
  );

  validateRequiredIdentifier(
    analysis.historyId,
    "analysis.historyId",
  );

  if (
    analysis.memoryId !==
    memory.id
  ) {
    throw new Error(
      "Predictive Intelligence memoryId must match Memory id.",
    );
  }

  if (
    analysis.historyId !==
      memory.historyId ||
    analysis.historyId !==
      memoryAnalysis.historyId ||
    analysis.historyId !==
      adaptiveLearningAnalysis.historyId
  ) {
    throw new Error(
      "Predictive Intelligence historyId values are inconsistent.",
    );
  }

  if (
    analysis.sourceMemoryAnalyzedAt !==
    memoryAnalysis.analyzedAt
  ) {
    throw new Error(
      "Predictive Intelligence sourceMemoryAnalyzedAt is inconsistent.",
    );
  }

  if (
    analysis.sourceAdaptiveLearningAnalyzedAt !==
    adaptiveLearningAnalysis.analyzedAt
  ) {
    throw new Error(
      "Predictive Intelligence sourceAdaptiveLearningAnalyzedAt is inconsistent.",
    );
  }

  if (
    !isRecommendationPredictiveIntelligenceState(
      analysis.state,
    )
  ) {
    throw new Error(
      "Predictive Intelligence state is invalid.",
    );
  }

  if (
    !isRecommendationPredictionHorizon(
      analysis.horizon,
    )
  ) {
    throw new Error(
      "Predictive Intelligence horizon is invalid.",
    );
  }

  validateRecommendationPredictionContext({
    memory,

    memoryAnalysis,

    adaptiveLearningAnalysis,

    context:
      analysis.context,
  });

  validateRecommendationPredictionStatistics(
    analysis.statistics,
  );

  validateRecommendationPredictionScores(
    analysis.scores,
  );

  validateRecommendationPredictedStates(
    analysis.predictedStates,
  );

  validateRecommendationPredictedStrategies(
    analysis.predictedStrategies,
  );

  validateRecommendationPredictedRuntimeDecisions(
    analysis.predictedRuntimeDecisions,
  );

  validateRecommendationPredictedRisks(
    analysis.predictedRisks,
  );

  validateRecommendationPredictedOpportunities(
    analysis.predictedOpportunities,
  );

  validateRecommendationPredictionConflicts(
    analysis.conflicts,
  );

  validateRecommendationPredictionSignals(
    analysis.signals,
  );

  validateNullableString(
    analysis.primarySignalType,
    "analysis.primarySignalType",
  );

  validateNullableString(
    analysis.primaryState,
    "analysis.primaryState",
  );

  validateNullableString(
    analysis.primaryStrategyType,
    "analysis.primaryStrategyType",
  );

  validateNullableString(
    analysis.primaryRuntimeDecisionType,
    "analysis.primaryRuntimeDecisionType",
  );

  validateNullableString(
    analysis.primaryRiskType,
    "analysis.primaryRiskType",
  );

  validateNullableString(
    analysis.primaryOpportunityType,
    "analysis.primaryOpportunityType",
  );

  validateStringArray(
    analysis.reasoning,
    "analysis.reasoning",
  );

  validateUnitInterval(
    analysis.confidence,
    "analysis.confidence",
  );

  if (
    analysis.confidence !==
    analysis.scores.predictionConfidence
  ) {
    throw new Error(
      "Predictive Intelligence confidence must match scores.predictionConfidence.",
    );
  }

  validateTimestamp(
    analysis.predictedAt,
    "analysis.predictedAt",
  );

  validateTimestampOrder(
    memoryAnalysis.analyzedAt,
    analysis.predictedAt,
    "memoryAnalysis.analyzedAt",
    "analysis.predictedAt",
  );

  validateTimestampOrder(
    adaptiveLearningAnalysis.analyzedAt,
    analysis.predictedAt,
    "adaptiveLearningAnalysis.analyzedAt",
    "analysis.predictedAt",
  );

  validatePredictionTimestampConsistency(
    analysis,
  );

  validatePredictionPrimaryValueConsistency(
    analysis,
  );

  validatePredictionStatisticsConsistency(
    analysis,
  );
}

/* ------------------------------------------------------------------ */
/* Statistics Validation                                              */
/* ------------------------------------------------------------------ */

function validateRecommendationPredictionStatistics(
  statistics:
    RecommendationPredictionStatistics,
): void {
  if (
    typeof statistics !==
      "object" ||
    statistics ===
      null ||
    Array.isArray(
      statistics,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Statistics must be an object.",
    );
  }

  Object.entries(
    statistics,
  ).forEach(
    (
      [
        fieldName,
        value,
      ],
    ) => {
      validateNonNegativeInteger(
        value,
        `statistics.${fieldName}`,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Scores Validation                                                  */
/* ------------------------------------------------------------------ */

function validateRecommendationPredictionScores(
  scores:
    RecommendationPredictionScores,
): void {
  if (
    typeof scores !==
      "object" ||
    scores ===
      null ||
    Array.isArray(
      scores,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Scores must be an object.",
    );
  }

  Object.entries(
    scores,
  ).forEach(
    (
      [
        fieldName,
        value,
      ],
    ) => {
      validateUnitInterval(
        value,
        `scores.${fieldName}`,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Signal Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictionSignal(
  signal:
    RecommendationPredictionSignal,
): void {
  if (
    typeof signal !==
      "object" ||
    signal ===
      null ||
    Array.isArray(
      signal,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Signal must be an object.",
    );
  }

  validateRequiredIdentifier(
    signal.id,
    "signal.id",
  );

  if (
    !isRecommendationPredictionSignalType(
      signal.type,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Signal type is invalid.",
    );
  }

  if (
    !isRecommendationPredictionSeverity(
      signal.severity,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Signal severity is invalid.",
    );
  }

  validateUnitInterval(
    signal.score,
    "signal.score",
  );

  validateUnitInterval(
    signal.confidence,
    "signal.confidence",
  );

  validateRequiredString(
    signal.description,
    "signal.description",
  );

  validateUniqueStringArray(
    signal.relatedStatePredictionIds,
    "signal.relatedStatePredictionIds",
  );

  validateUniqueStringArray(
    signal.relatedStrategyPredictionIds,
    "signal.relatedStrategyPredictionIds",
  );

  validateUniqueStringArray(
    signal.relatedDecisionPredictionIds,
    "signal.relatedDecisionPredictionIds",
  );

  validateUniqueStringArray(
    signal.relatedRiskPredictionIds,
    "signal.relatedRiskPredictionIds",
  );

  validateUniqueStringArray(
    signal.relatedOpportunityPredictionIds,
    "signal.relatedOpportunityPredictionIds",
  );

  validateTimestamp(
    signal.detectedAt,
    "signal.detectedAt",
  );
}

export function validateRecommendationPredictionSignals(
  signals:
    readonly RecommendationPredictionSignal[],
): void {
  if (
    !Array.isArray(
      signals,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Signals must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  const observedTypes =
    new Set<
      RecommendationPredictionSignalType
    >();

  signals.forEach(
    (
      signal,
    ) => {
      validateRecommendationPredictionSignal(
        signal,
      );

      if (
        observedIds.has(
          signal.id,
        )
      ) {
        throw new Error(
          `Recommendation Prediction Signal id must be unique: ${signal.id}.`,
        );
      }

      if (
        observedTypes.has(
          signal.type,
        )
      ) {
        throw new Error(
          `Recommendation Prediction Signal type must be unique: ${signal.type}.`,
        );
      }

      observedIds.add(
        signal.id,
      );

      observedTypes.add(
        signal.type,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Consistency Validation                                             */
/* ------------------------------------------------------------------ */

function validatePredictionTimestampConsistency(
  analysis:
    RecommendationPredictiveIntelligence,
): void {
  const predictionTimestamps = [
    ...analysis.predictedStates.map(
      (
        prediction,
      ) =>
        prediction.predictedAt,
    ),

    ...analysis.predictedStrategies.map(
      (
        prediction,
      ) =>
        prediction.predictedAt,
    ),

    ...analysis.predictedRuntimeDecisions.map(
      (
        prediction,
      ) =>
        prediction.predictedAt,
    ),

    ...analysis.predictedRisks.map(
      (
        prediction,
      ) =>
        prediction.predictedAt,
    ),

    ...analysis.predictedOpportunities.map(
      (
        prediction,
      ) =>
        prediction.predictedAt,
    ),

    ...analysis.signals.map(
      (
        signal,
      ) =>
        signal.detectedAt,
    ),
  ];

  predictionTimestamps.forEach(
    (
      timestamp,
    ) => {
      if (
        timestamp !==
        analysis.predictedAt
      ) {
        throw new Error(
          "All Predictive Intelligence timestamps must match predictedAt.",
        );
      }
    },
  );
}

function validatePredictionPrimaryValueConsistency(
  analysis:
    RecommendationPredictiveIntelligence,
): void {
  const primaryState =
    getPrimaryRecommendationPredictedState(
      analysis.predictedStates,
    );

  const primaryStrategy =
    getPrimaryRecommendationPredictedStrategy(
      analysis.predictedStrategies,
    );

  const primaryDecision =
    getPrimaryRecommendationPredictedRuntimeDecision(
      analysis.predictedRuntimeDecisions,
    );

  const primaryRisk =
    getPrimaryRecommendationPredictedRisk(
      analysis.predictedRisks,
    );

  const primaryOpportunity =
    getPrimaryRecommendationPredictedOpportunity(
      analysis.predictedOpportunities,
    );

  if (
    analysis.primaryState !==
    (
      primaryState?.state ??
      null
    )
  ) {
    throw new Error(
      "Predictive Intelligence primaryState is inconsistent.",
    );
  }

  if (
    analysis.primaryStrategyType !==
    (
      primaryStrategy?.strategyType ??
      null
    )
  ) {
    throw new Error(
      "Predictive Intelligence primaryStrategyType is inconsistent.",
    );
  }

  if (
    analysis.primaryRuntimeDecisionType !==
    (
      primaryDecision?.decisionType ??
      null
    )
  ) {
    throw new Error(
      "Predictive Intelligence primaryRuntimeDecisionType is inconsistent.",
    );
  }

  if (
    analysis.primaryRiskType !==
    (
      primaryRisk?.type ??
      null
    )
  ) {
    throw new Error(
      "Predictive Intelligence primaryRiskType is inconsistent.",
    );
  }

  if (
    analysis.primaryOpportunityType !==
    (
      primaryOpportunity?.type ??
      null
    )
  ) {
    throw new Error(
      "Predictive Intelligence primaryOpportunityType is inconsistent.",
    );
  }

  if (
    analysis.primarySignalType !==
    resolvePrimaryRecommendationPredictionSignalType(
      analysis.signals,
    )
  ) {
    throw new Error(
      "Predictive Intelligence primarySignalType is inconsistent.",
    );
  }
}

function validatePredictionStatisticsConsistency(
  analysis:
    RecommendationPredictiveIntelligence,
): void {
  if (
    analysis.statistics.predictedStateCount !==
    analysis.predictedStates.length
  ) {
    throw new Error(
      "Prediction Statistics predictedStateCount is inconsistent.",
    );
  }

  if (
    analysis.statistics.predictedStrategyCount !==
    analysis.predictedStrategies.length
  ) {
    throw new Error(
      "Prediction Statistics predictedStrategyCount is inconsistent.",
    );
  }

  if (
    analysis.statistics.predictedRuntimeDecisionCount !==
    analysis.predictedRuntimeDecisions.length
  ) {
    throw new Error(
      "Prediction Statistics predictedRuntimeDecisionCount is inconsistent.",
    );
  }

  if (
    analysis.statistics.predictedRiskCount !==
    analysis.predictedRisks.length
  ) {
    throw new Error(
      "Prediction Statistics predictedRiskCount is inconsistent.",
    );
  }

  if (
    analysis.statistics.predictedOpportunityCount !==
    analysis.predictedOpportunities.length
  ) {
    throw new Error(
      "Prediction Statistics predictedOpportunityCount is inconsistent.",
    );
  }

  if (
    analysis.statistics.conflictCount !==
    analysis.conflicts.length
  ) {
    throw new Error(
      "Prediction Statistics conflictCount is inconsistent.",
    );
  }

  if (
    analysis.statistics.signalCount !==
    analysis.signals.length
  ) {
    throw new Error(
      "Prediction Statistics signalCount is inconsistent.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateAnalyzeRecommendationPredictiveIntelligenceParams(
  params:
    AnalyzeRecommendationPredictiveIntelligenceParams,
): void {
  if (
    typeof params !==
      "object" ||
    params ===
      null ||
    Array.isArray(
      params,
    )
  ) {
    throw new Error(
      "Analyze Recommendation Predictive Intelligence params must be an object.",
    );
  }

  validateRecommendationEvolutionMemory({
    memory:
      params.memory,
  });

  validateRecommendationEvolutionMemoryAnalysis({
    memory:
      params.memory,

    analysis:
      params.memoryAnalysis,
  });

  validateRecommendationAdaptiveLearningAnalysis({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    analysis:
      params.adaptiveLearningAnalysis,
  });

  if (
    !isRecommendationPredictionHorizon(
      params.horizon,
    )
  ) {
    throw new Error(
      "Prediction horizon is invalid.",
    );
  }

  validateTimestamp(
    params.predictedAt,
    "predictedAt",
  );

  validateTimestampOrder(
    params.memoryAnalysis.analyzedAt,
    params.predictedAt,
    "memoryAnalysis.analyzedAt",
    "predictedAt",
  );

  validateTimestampOrder(
    params.adaptiveLearningAnalysis.analyzedAt,
    params.predictedAt,
    "adaptiveLearningAnalysis.analyzedAt",
    "predictedAt",
  );

  validateOptionalPositiveBoundedInteger(
    params.recentEntryLimit,
    "recentEntryLimit",
    MAXIMUM_RECENT_ITEM_LIMIT,
  );

  validateOptionalPositiveBoundedInteger(
    params.recentComparisonLimit,
    "recentComparisonLimit",
    MAXIMUM_RECENT_ITEM_LIMIT,
  );

  validateOptionalPositiveBoundedInteger(
    params.maximumStateCandidateCount,
    "maximumStateCandidateCount",
    MAXIMUM_STATE_CANDIDATE_COUNT,
  );

  validateOptionalPositiveBoundedInteger(
    params.maximumStrategyCandidateCount,
    "maximumStrategyCandidateCount",
    MAXIMUM_STRATEGY_CANDIDATE_COUNT,
  );

  validateOptionalPositiveBoundedInteger(
    params.maximumDecisionCandidateCount,
    "maximumDecisionCandidateCount",
    MAXIMUM_DECISION_CANDIDATE_COUNT,
  );

  if (
    params.minimumCandidateProbability !==
    undefined
  ) {
    validateUnitInterval(
      params.minimumCandidateProbability,
      "minimumCandidateProbability",
    );
  }

  validateFunction(
    params.createStatePredictionId,
    "createStatePredictionId",
  );

  validateFunction(
    params.createStrategyPredictionId,
    "createStrategyPredictionId",
  );

  validateFunction(
    params.createDecisionPredictionId,
    "createDecisionPredictionId",
  );

  validateFunction(
    params.createRiskPredictionId,
    "createRiskPredictionId",
  );

  validateFunction(
    params.createOpportunityPredictionId,
    "createOpportunityPredictionId",
  );

  validateFunction(
    params.createConflictId,
    "createConflictId",
  );

  validateFunction(
    params.createSignalId,
    "createSignalId",
  );
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationPredictiveIntelligence(
  analysis:
    RecommendationPredictiveIntelligence,
): RecommendationPredictiveIntelligence {
  return {
    ...analysis,

    context: {
      ...analysis.context,

      currentMemorySignalTypes: [
        ...analysis.context.currentMemorySignalTypes,
      ],

      currentRuntimeDecisionTypes: [
        ...analysis.context.currentRuntimeDecisionTypes,
      ],

      recentEntryIds: [
        ...analysis.context.recentEntryIds,
      ],

      recentComparisonIds: [
        ...analysis.context.recentComparisonIds,
      ],

      recentStates: [
        ...analysis.context.recentStates,
      ],

      recentStrategyTypes: [
        ...analysis.context.recentStrategyTypes,
      ],

      recentRuntimeDecisionTypes: [
        ...analysis.context.recentRuntimeDecisionTypes,
      ],

      recentLearningPatternTypes: [
        ...analysis.context.recentLearningPatternTypes,
      ],

      scoreTrend: {
        ...analysis.context.scoreTrend,
      },

      activeAdaptationRuleIds: [
        ...analysis.context.activeAdaptationRuleIds,
      ],

      conflictedAdaptationRuleIds: [
        ...analysis.context.conflictedAdaptationRuleIds,
      ],

      runtimeAdjustment: {
        strategyPreferenceAdjustments: {
          ...analysis.context.runtimeAdjustment
            .strategyPreferenceAdjustments,
        },

        decisionPreferenceAdjustments: {
          ...analysis.context.runtimeAdjustment
            .decisionPreferenceAdjustments,
        },

        signalConfidenceAdjustments: {
          ...analysis.context.runtimeAdjustment
            .signalConfidenceAdjustments,
        },

        evidenceRequirementAdjustment:
          analysis.context.runtimeAdjustment
            .evidenceRequirementAdjustment,

        newRecommendationThresholdAdjustment:
          analysis.context.runtimeAdjustment
            .newRecommendationThresholdAdjustment,

        redirectionThresholdAdjustment:
          analysis.context.runtimeAdjustment
            .redirectionThresholdAdjustment,

        stabilizationPreferenceAdjustment:
          analysis.context.runtimeAdjustment
            .stabilizationPreferenceAdjustment,

        recoveryPreferenceAdjustment:
          analysis.context.runtimeAdjustment
            .recoveryPreferenceAdjustment,
      },
    },

    statistics: {
      ...analysis.statistics,
    },

    scores: {
      ...analysis.scores,
    },

    predictedStates:
      analysis.predictedStates.map(
        cloneRecommendationPredictedState,
      ),

    predictedStrategies:
      analysis.predictedStrategies.map(
        cloneRecommendationPredictedStrategy,
      ),

    predictedRuntimeDecisions:
      analysis.predictedRuntimeDecisions.map(
        cloneRecommendationPredictedRuntimeDecision,
      ),

    predictedRisks:
      analysis.predictedRisks.map(
        cloneRecommendationPredictedRisk,
      ),

    predictedOpportunities:
      analysis.predictedOpportunities.map(
        cloneRecommendationPredictedOpportunity,
      ),

    conflicts:
      analysis.conflicts.map(
        cloneRecommendationPredictionConflict,
      ),

    signals:
      analysis.signals.map(
        cloneRecommendationPredictionSignal,
      ),

    reasoning: [
      ...analysis.reasoning,
    ],
  };
}

export function cloneRecommendationPredictionSignal(
  signal:
    RecommendationPredictionSignal,
): RecommendationPredictionSignal {
  return {
    ...signal,

    relatedStatePredictionIds: [
      ...signal.relatedStatePredictionIds,
    ],

    relatedStrategyPredictionIds: [
      ...signal.relatedStrategyPredictionIds,
    ],

    relatedDecisionPredictionIds: [
      ...signal.relatedDecisionPredictionIds,
    ],

    relatedRiskPredictionIds: [
      ...signal.relatedRiskPredictionIds,
    ],

    relatedOpportunityPredictionIds: [
      ...signal.relatedOpportunityPredictionIds,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Score Helpers                                                      */
/* ------------------------------------------------------------------ */

function calculatePredictionDistributionClarity(
  predictions:
    readonly {
      scores: {
        probability:
          number;
      };
    }[],
): number {
  if (
    predictions.length ===
    0
  ) {
    return 0;
  }

  if (
    predictions.length ===
    1
  ) {
    return clampUnitInterval(
      predictions[
        0
      ]?.scores.probability ??
      0,
    );
  }

  const sortedProbabilities =
    predictions
      .map(
        (
          prediction,
        ) =>
          prediction.scores.probability,
      )
      .sort(
        (
          left,
          right,
        ) =>
          right -
          left,
      );

  const first =
    sortedProbabilities[
      0
    ] ??
    0;

  const second =
    sortedProbabilities[
      1
    ] ??
    0;

  return clampUnitInterval(
    first *
      0.65 +
    (
      first -
      second
    ) *
      0.35,
  );
}

function calculateMaximumPredictionStrength(
  predictions:
    readonly {
      scores: {
        probability:
          number;

        confidence:
          number;
      };
    }[],
): number {
  return predictions.reduce(
    (
      maximum,
      prediction,
    ) =>
      Math.max(
        maximum,
        prediction.scores.probability *
        prediction.scores.confidence,
      ),
    0,
  );
}

function calculateMaximumConflictStrength(
  conflicts:
    readonly RecommendationPredictionConflict[],
): number {
  return conflicts.reduce(
    (
      maximum,
      conflict,
    ) =>
      Math.max(
        maximum,
        conflict.score *
        conflict.confidence,
      ),
    0,
  );
}

function calculateTemporalConsistency(
  context:
    RecommendationPredictiveIntelligence[
      "context"
    ],
): number {
  if (
    context.scoreTrend.sampleCount ===
    0
  ) {
    return 0;
  }

  const directions = [
    context.scoreTrend.stability,
    context.scoreTrend.progress,
    context.scoreTrend.repetitionRisk,
    context.scoreTrend.redirectionRisk,
    context.scoreTrend.completionMomentum,
  ];

  const knownDirections =
    directions.filter(
      (
        direction,
      ) =>
        direction !==
        "unknown" &&
        direction !==
        "mixed",
    );

  const directionCoverage =
    knownDirections.length /
    directions.length;

  const sampleStrength =
    clampUnitInterval(
      context.scoreTrend.sampleCount /
      5,
    );

  return clampUnitInterval(
    directionCoverage *
      0.55 +
    sampleStrength *
      0.45,
  );
}

function averagePredictionConfidence(
  predictions:
    readonly {
      scores: {
        probability:
          number;

        confidence:
          number;
      };
    }[],
): number {
  if (
    predictions.length ===
    0
  ) {
    return 0;
  }

  const totalProbability =
    predictions.reduce(
      (
        total,
        prediction,
      ) =>
        total +
        prediction.scores.probability,
      0,
    );

  if (
    totalProbability <=
    0
  ) {
    return averageNumbers(
      predictions.map(
        (
          prediction,
        ) =>
          prediction.scores.confidence,
      ),
    );
  }

  return predictions.reduce(
    (
      total,
      prediction,
    ) =>
      total +
      prediction.scores.confidence *
      prediction.scores.probability,
    0,
  ) /
    totalProbability;
}

/* ------------------------------------------------------------------ */
/* Evidence Helpers                                                   */
/* ------------------------------------------------------------------ */

type PredictionWithEvidence = {
  evidence: {
    relatedObservationIds:
      string[];
  };
};

function collectUniqueEvidenceIds(
  params: {
    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];

    predictedRisks:
      readonly RecommendationPredictedRisk[];

    predictedOpportunities:
      readonly RecommendationPredictedOpportunity[];

    field:
      "relatedObservationIds";
  },
): string[] {
  const predictions:
    PredictionWithEvidence[] = [
      ...params.predictedStates,
      ...params.predictedStrategies,
      ...params.predictedRuntimeDecisions,
      ...params.predictedRisks,
      ...params.predictedOpportunities,
    ];

  return uniqueStrings(
    predictions.flatMap(
      (
        prediction,
      ) =>
        prediction.evidence[
          params.field
        ],
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Severity                                                           */
/* ------------------------------------------------------------------ */

function resolveSignalSeverity(
  score:
    number,
): RecommendationPredictionSeverity {
  if (
    score >=
    0.75
  ) {
    return "high";
  }

  if (
    score >=
    0.5
  ) {
    return "moderate";
  }

  if (
    score >=
    0.25
  ) {
    return "low";
  }

  return "informational";
}

/* ------------------------------------------------------------------ */
/* Generic Helpers                                                    */
/* ------------------------------------------------------------------ */

function averageNumbers(
  values:
    readonly number[],
): number {
  if (
    values.length ===
    0
  ) {
    return 0;
  }

  return values.reduce(
    (
      total,
      value,
    ) =>
      total +
      value,
    0,
  ) /
    values.length;
}

function clampUnitInterval(
  value:
    number,
): number {
  return Math.min(
    1,
    Math.max(
      0,
      value,
    ),
  );
}

function roundScore(
  value:
    number,
): number {
  return Math.round(
    value *
    SCORE_PRECISION,
  ) /
    SCORE_PRECISION;
}

function uniqueStrings<
  TValue extends string,
>(
  values:
    readonly TValue[],
): TValue[] {
  return Array.from(
    new Set(
      values,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Generic Validation Helpers                                         */
/* ------------------------------------------------------------------ */

function validateRequiredString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !==
      "string" ||
    value.trim().length ===
      0
  ) {
    throw new Error(
      `${fieldName} must be a non-empty string.`,
    );
  }
}

function validateRequiredIdentifier(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  validateRequiredString(
    value,
    fieldName,
  );

  if (
    value.length >
    256
  ) {
    throw new Error(
      `${fieldName} must not exceed 256 characters.`,
    );
  }
}

function validateNullableString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string | null {
  if (
    value ===
    null
  ) {
    return;
  }

  validateRequiredString(
    value,
    fieldName,
  );
}

function validateStringArray(
  values:
    readonly string[],
  fieldName:
    string,
): void {
  if (
    !Array.isArray(
      values,
    )
  ) {
    throw new Error(
      `${fieldName} must be an array.`,
    );
  }

  values.forEach(
    (
      value,
      index,
    ) => {
      validateRequiredString(
        value,
        `${fieldName}[${index}]`,
      );
    },
  );
}

function validateUniqueStringArray(
  values:
    readonly string[],
  fieldName:
    string,
): void {
  validateStringArray(
    values,
    fieldName,
  );

  const observed =
    new Set<string>();

  values.forEach(
    (
      value,
    ) => {
      if (
        observed.has(
          value,
        )
      ) {
        throw new Error(
          `${fieldName} must not contain duplicate value: ${value}.`,
        );
      }

      observed.add(
        value,
      );
    },
  );
}

function validateFiniteNumber(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    throw new Error(
      `${fieldName} must be a finite number.`,
    );
  }
}

function validateUnitInterval(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  validateFiniteNumber(
    value,
    fieldName,
  );

  if (
    value <
      0 ||
    value >
      1
  ) {
    throw new Error(
      `${fieldName} must be between 0 and 1.`,
    );
  }
}

function validateNonNegativeInteger(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  if (
    typeof value !==
      "number" ||
    !Number.isInteger(
      value,
    ) ||
    value <
      0
  ) {
    throw new Error(
      `${fieldName} must be a non-negative integer.`,
    );
  }
}

function validateOptionalPositiveBoundedInteger(
  value:
    unknown,
  fieldName:
    string,
  maximum:
    number,
): void {
  if (
    value ===
    undefined
  ) {
    return;
  }

  if (
    typeof value !==
      "number" ||
    !Number.isInteger(
      value,
    ) ||
    value <
      1 ||
    value >
      maximum
  ) {
    throw new Error(
      `${fieldName} must be an integer between 1 and ${maximum}.`,
    );
  }
}

function validateTimestamp(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  validateRequiredString(
    value,
    fieldName,
  );

  if (
    Number.isNaN(
      Date.parse(
        value,
      ),
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid timestamp.`,
    );
  }
}

function validateTimestampOrder(
  earlier:
    string,
  later:
    string,
  earlierFieldName:
    string,
  laterFieldName:
    string,
): void {
  if (
    Date.parse(
      earlier,
    ) >
    Date.parse(
      later,
    )
  ) {
    throw new Error(
      `${earlierFieldName} must not be later than ${laterFieldName}.`,
    );
  }
}

function validateFunction(
  value:
    unknown,
  fieldName:
    string,
): asserts value is (...args: never[]) => unknown {
  if (
    typeof value !==
    "function"
  ) {
    throw new Error(
      `${fieldName} must be a function.`,
    );
  }
}