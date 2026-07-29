import {
    analyzeRecommendationEvolutionIntelligence,
} from "./analyzeRecommendationEvolutionIntelligence";

import {
    analyzeRecommendationEvolutionMemory,
} from "./analyzeRecommendationEvolutionMemory";

import {
    appendRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    createRecommendationEvolutionMemoryEntry,
} from "./createRecommendationEvolutionMemoryEntry";

import {
    updateRecommendationAdaptiveLearning,
} from "./updateRecommendationAdaptiveLearning";

import type {
    RecommendationEvolutionConfidence,
    RecommendationEvolutionDataQuality,
    RecommendationEvolutionResult,
    RecommendationEvolutionSummary,
} from "./recommendationEvolutionTypes";

import type {
    AnalyzeRecommendationEvolutionIntelligenceParams,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionRuntimeDecisionType,
} from "./recommendationEvolutionIntelligenceTypes";

import type {
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryAnalysis,
    RecommendationEvolutionMemoryEntry,
    RecommendationEvolutionMemorySignalType,
} from "./recommendationEvolutionMemoryTypes";

import type {
    RecommendationAdaptationRuleType,
    RecommendationAdaptiveLearningAnalysis,
    RecommendationAdaptiveLearningSignalType,
    RecommendationLearningPatternType,
} from "./recommendationAdaptiveLearningTypes";

/* ------------------------------------------------------------------ */
/* Shared Constants                                                   */
/* ------------------------------------------------------------------ */

export const RECOMMENDATION_PREDICTIVE_TEST_HISTORY_ID =
  "history-predictive-integration-1";

export const RECOMMENDATION_PREDICTIVE_TEST_MEMORY_ID =
  "memory-predictive-integration-1";

export const RECOMMENDATION_PREDICTIVE_TEST_MEMORY_ANALYZED_AT =
  "2026-07-29T04:00:00.000Z";

export const RECOMMENDATION_PREDICTIVE_TEST_ADAPTIVE_ANALYZED_AT =
  "2026-07-29T05:00:00.000Z";

export const RECOMMENDATION_PREDICTIVE_TEST_PREDICTED_AT =
  "2026-07-29T06:00:00.000Z";

const FIRST_EVOLUTION_ANALYZED_AT =
  "2026-07-29T01:00:00.000Z";

const FIRST_INTELLIGENCE_ANALYZED_AT =
  "2026-07-29T01:10:00.000Z";

const FIRST_RECORDED_AT =
  "2026-07-29T01:20:00.000Z";

const SECOND_EVOLUTION_ANALYZED_AT =
  "2026-07-29T02:00:00.000Z";

const SECOND_INTELLIGENCE_ANALYZED_AT =
  "2026-07-29T02:10:00.000Z";

const SECOND_RECORDED_AT =
  "2026-07-29T02:20:00.000Z";

const THIRD_EVOLUTION_ANALYZED_AT =
  "2026-07-29T03:00:00.000Z";

const THIRD_INTELLIGENCE_ANALYZED_AT =
  "2026-07-29T03:10:00.000Z";

const THIRD_RECORDED_AT =
  "2026-07-29T03:20:00.000Z";

/* ------------------------------------------------------------------ */
/* Public Fixture Types                                               */
/* ------------------------------------------------------------------ */

export type RecommendationPredictiveIntegrationFixture = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  adaptiveLearningAnalysis:
    RecommendationAdaptiveLearningAnalysis;

  predictedAt:
    string;
};

type EvolutionStatisticsOverrides =
  Partial<
    RecommendationEvolutionResult[
      "statistics"
    ]
  >;

type EvolutionSummaryOverrides =
  Partial<
    RecommendationEvolutionSummary
  >;

type CreateEvolutionParams = {
  analyzedAt:
    string;

  statistics?:
    EvolutionStatisticsOverrides;

  summary?:
    EvolutionSummaryOverrides;

  dataQuality?:
    RecommendationEvolutionDataQuality;

  confidence?:
    RecommendationEvolutionConfidence;
};

type CreateMemoryEntryParams = {
  id:
    string;

  evolution:
    RecommendationEvolutionResult;

  intelligenceAnalyzedAt:
    string;

  recordedAt:
    string;

  idPrefix:
    string;
};

/* ------------------------------------------------------------------ */
/* Evolution Fixture                                                  */
/* ------------------------------------------------------------------ */

function createEvolution(
  params:
    CreateEvolutionParams,
): RecommendationEvolutionResult {
  return {
    version:
      1,

    historyId:
      RECOMMENDATION_PREDICTIVE_TEST_HISTORY_ID,

    comparisons:
      [],

    statistics: {
      totalRecommendationCount:
        3,

      comparableRecommendationCount:
        2,

      transitionCount:
        2,

      activeCount:
        1,

      completedCount:
        0,

      supersededCount:
        0,

      archivedCount:
        2,

      repeatedTransitionCount:
        0,

      changedTransitionCount:
        2,

      refinedTransitionCount:
        0,

      redirectedTransitionCount:
        0,

      completionAdvanceCount:
        0,

      completionRate:
        0,

      supersessionRate:
        0,

      repetitionRate:
        0,

      averageActiveDurationMs:
        null,

      ...params.statistics,
    },

    summary: {
      stability:
        "developing",

      drift:
        "low",

      repeatPattern:
        "none",

      dominantType:
        null,

      dominantDirection:
        null,

      latestType:
        null,

      latestDirection:
        null,

      latestMagnitude:
        null,

      recommendationChanged:
        false,

      hasMeaningfulEvolution:
        false,

      hasSufficientHistory:
        true,

      ...params.summary,
    },

    dataQuality:
      params.dataQuality ??
      "sufficient",

    confidence:
      params.confidence ??
      "high",

    analyzedAt:
      params.analyzedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Intelligence Fixture                                               */
/* ------------------------------------------------------------------ */

function createIntelligenceParams(
  evolution:
    RecommendationEvolutionResult,
  analyzedAt:
    string,
  idPrefix:
    string,
): AnalyzeRecommendationEvolutionIntelligenceParams {
  return {
    evolution,

    analyzedAt,

    createSignalId:
      (
        type:
          RecommendationEvolutionIntelligenceSignalType,
        index:
          number,
      ) =>
        `${idPrefix}-intelligence-signal-${index}-${type}`,

    createDecisionId:
      (
        type:
          RecommendationEvolutionRuntimeDecisionType,
        index:
          number,
      ) =>
        `${idPrefix}-runtime-decision-${index}-${type}`,

    createGuidanceId:
      () =>
        `${idPrefix}-guidance`,

    createWarningId:
      (
        index:
          number,
      ) =>
        `${idPrefix}-warning-${index}`,

    createObservationId:
      (
        index:
          number,
      ) =>
        `${idPrefix}-intelligence-observation-${index}`,
  };
}

/* ------------------------------------------------------------------ */
/* Memory Entry Fixtures                                              */
/* ------------------------------------------------------------------ */

function createMemoryEntry(
  params:
    CreateMemoryEntryParams,
): RecommendationEvolutionMemoryEntry {
  const intelligence =
    analyzeRecommendationEvolutionIntelligence(
      createIntelligenceParams(
        params.evolution,
        params.intelligenceAnalyzedAt,
        params.idPrefix,
      ),
    );

  return createRecommendationEvolutionMemoryEntry({
    intelligence,

    recordedAt:
      params.recordedAt,

    createEntryId:
      () =>
        params.id,
  });
}

function createFirstMemoryEntry():
  RecommendationEvolutionMemoryEntry {
  return createMemoryEntry({
    id:
      "predictive-memory-entry-1",

    evolution:
      createEvolution({
        analyzedAt:
          FIRST_EVOLUTION_ANALYZED_AT,

        summary: {
          stability:
            "developing",

          drift:
            "low",

          latestType:
            "refined",

          latestDirection:
            "narrowing",

          latestMagnitude:
            "minor",

          recommendationChanged:
            true,

          hasMeaningfulEvolution:
            true,
        },

        statistics: {
          refinedTransitionCount:
            1,
        },
      }),

    intelligenceAnalyzedAt:
      FIRST_INTELLIGENCE_ANALYZED_AT,

    recordedAt:
      FIRST_RECORDED_AT,

    idPrefix:
      "predictive-first",
  });
}

function createSecondMemoryEntry():
  RecommendationEvolutionMemoryEntry {
  return createMemoryEntry({
    id:
      "predictive-memory-entry-2",

    evolution:
      createEvolution({
        analyzedAt:
          SECOND_EVOLUTION_ANALYZED_AT,

        summary: {
          stability:
            "stable",

          drift:
            "none",

          latestType:
            "repeated",

          latestDirection:
            "stable",

          latestMagnitude:
            "none",

          recommendationChanged:
            false,

          hasMeaningfulEvolution:
            true,
        },

        statistics: {
          repeatedTransitionCount:
            1,

          repetitionRate:
            0.5,
        },
      }),

    intelligenceAnalyzedAt:
      SECOND_INTELLIGENCE_ANALYZED_AT,

    recordedAt:
      SECOND_RECORDED_AT,

    idPrefix:
      "predictive-second",
  });
}

function createThirdMemoryEntry():
  RecommendationEvolutionMemoryEntry {
  return createMemoryEntry({
    id:
      "predictive-memory-entry-3",

    evolution:
      createEvolution({
        analyzedAt:
          THIRD_EVOLUTION_ANALYZED_AT,

        summary: {
          stability:
            "stable",

          drift:
            "none",

          latestType:
            "completed-and-advanced",

          latestDirection:
            "advancing",

          latestMagnitude:
            "moderate",

          recommendationChanged:
            true,

          hasMeaningfulEvolution:
            true,
        },

        statistics: {
          completedCount:
            1,

          completionAdvanceCount:
            1,

          completionRate:
            0.5,
        },
      }),

    intelligenceAnalyzedAt:
      THIRD_INTELLIGENCE_ANALYZED_AT,

    recordedAt:
      THIRD_RECORDED_AT,

    idPrefix:
      "predictive-third",
  });
}

/* ------------------------------------------------------------------ */
/* Memory Fixture                                                     */
/* ------------------------------------------------------------------ */

export function createRecommendationPredictiveMemoryFixture(
  entryCount:
    1 | 2 | 3 =
      3,
): RecommendationEvolutionMemory {
  const firstEntry =
    createFirstMemoryEntry();

  let memory =
    appendRecommendationEvolutionMemory({
      memory:
        null,

      entry:
        firstEntry,

      memoryId:
        RECOMMENDATION_PREDICTIVE_TEST_MEMORY_ID,

      updatedAt:
        firstEntry.recordedAt,
    });

  if (
    entryCount ===
    1
  ) {
    return memory;
  }

  const secondEntry =
    createSecondMemoryEntry();

  memory =
    appendRecommendationEvolutionMemory({
      memory,

      entry:
        secondEntry,

      memoryId:
        RECOMMENDATION_PREDICTIVE_TEST_MEMORY_ID,

      updatedAt:
        secondEntry.recordedAt,
    });

  if (
    entryCount ===
    2
  ) {
    return memory;
  }

  const thirdEntry =
    createThirdMemoryEntry();

  return appendRecommendationEvolutionMemory({
    memory,

    entry:
      thirdEntry,

    memoryId:
      RECOMMENDATION_PREDICTIVE_TEST_MEMORY_ID,

    updatedAt:
      thirdEntry.recordedAt,
  });
}

/* ------------------------------------------------------------------ */
/* Memory Analysis Fixture                                            */
/* ------------------------------------------------------------------ */

export function createRecommendationPredictiveMemoryAnalysisFixture(
  memory:
    RecommendationEvolutionMemory =
      createRecommendationPredictiveMemoryFixture(),
): RecommendationEvolutionMemoryAnalysis {
  return analyzeRecommendationEvolutionMemory({
    memory,

    analyzedAt:
      RECOMMENDATION_PREDICTIVE_TEST_MEMORY_ANALYZED_AT,

    createComparisonId:
      (
        index:
          number,
      ) =>
        `predictive-memory-comparison-${index}`,

    createSignalId:
      (
        type:
          RecommendationEvolutionMemorySignalType,
        index:
          number,
      ) =>
        `predictive-memory-signal-${index}-${type}`,
  });
}

/* ------------------------------------------------------------------ */
/* Adaptive Learning Fixture                                          */
/* ------------------------------------------------------------------ */

export function createRecommendationPredictiveAdaptiveLearningFixture(
  memory:
    RecommendationEvolutionMemory =
      createRecommendationPredictiveMemoryFixture(),

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis =
      createRecommendationPredictiveMemoryAnalysisFixture(
        memory,
      ),
): RecommendationAdaptiveLearningAnalysis {
  const result =
    updateRecommendationAdaptiveLearning({
      memory,

      memoryAnalysis,

      updatedAt:
        RECOMMENDATION_PREDICTIVE_TEST_ADAPTIVE_ANALYZED_AT,

      minimumSampleCount:
        3,

      minimumConfidence:
        0.6,

      createObservationId:
        (
          comparison,
          index:
            number,
        ) =>
          (
            `predictive-learning-observation-` +
            `${index}-${comparison.id}`
          ),

      createPatternId:
        (
          type:
            RecommendationLearningPatternType,
          index:
            number,
        ) =>
          `predictive-learning-pattern-${index}-${type}`,

      createRuleId:
        (
          type:
            RecommendationAdaptationRuleType,
          index:
            number,
        ) =>
          `predictive-adaptation-rule-${index}-${type}`,

      createSignalId:
        (
          type:
            RecommendationAdaptiveLearningSignalType,
          index:
            number,
        ) =>
          `predictive-learning-signal-${index}-${type}`,
    });

  return result.analysis;
}

/* ------------------------------------------------------------------ */
/* Complete Integration Fixture                                       */
/* ------------------------------------------------------------------ */

export function createRecommendationPredictiveIntegrationFixture():
  RecommendationPredictiveIntegrationFixture {
  const memory =
    createRecommendationPredictiveMemoryFixture();

  const memoryAnalysis =
    createRecommendationPredictiveMemoryAnalysisFixture(
      memory,
    );

  const adaptiveLearningAnalysis =
    createRecommendationPredictiveAdaptiveLearningFixture(
      memory,
      memoryAnalysis,
    );

  return {
    memory,

    memoryAnalysis,

    adaptiveLearningAnalysis,

    predictedAt:
      RECOMMENDATION_PREDICTIVE_TEST_PREDICTED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Insufficient Evidence Fixture                                      */
/* ------------------------------------------------------------------ */

export function createRecommendationPredictiveInsufficientFixture():
  RecommendationPredictiveIntegrationFixture {
  const memory =
    createRecommendationPredictiveMemoryFixture(
      1,
    );

  const memoryAnalysis =
    createRecommendationPredictiveMemoryAnalysisFixture(
      memory,
    );

  const adaptiveLearningResult =
    updateRecommendationAdaptiveLearning({
      memory,

      memoryAnalysis,

      updatedAt:
        RECOMMENDATION_PREDICTIVE_TEST_ADAPTIVE_ANALYZED_AT,

      minimumSampleCount:
        3,

      minimumConfidence:
        0.6,

      createObservationId:
        (
          comparison,
          index:
            number,
        ) =>
          (
            `insufficient-learning-observation-` +
            `${index}-${comparison.id}`
          ),

      createPatternId:
        (
          type:
            RecommendationLearningPatternType,
          index:
            number,
        ) =>
          `insufficient-learning-pattern-${index}-${type}`,

      createRuleId:
        (
          type:
            RecommendationAdaptationRuleType,
          index:
            number,
        ) =>
          `insufficient-adaptation-rule-${index}-${type}`,

      createSignalId:
        (
          type:
            RecommendationAdaptiveLearningSignalType,
          index:
            number,
        ) =>
          `insufficient-learning-signal-${index}-${type}`,
    });

  return {
    memory,

    memoryAnalysis,

    adaptiveLearningAnalysis:
      adaptiveLearningResult.analysis,

    predictedAt:
      RECOMMENDATION_PREDICTIVE_TEST_PREDICTED_AT,
  };
}