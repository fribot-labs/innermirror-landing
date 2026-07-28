import {
    describe,
    expect,
    it,
} from "vitest";

import {
    analyzeRecommendationEvolutionIntelligence,
} from "./analyzeRecommendationEvolutionIntelligence";

import {
    appendRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    createRecommendationEvolutionMemoryEntry,
} from "./createRecommendationEvolutionMemoryEntry";

import {
    analyzeRecommendationEvolutionMemory,
} from "./analyzeRecommendationEvolutionMemory";

import {
    hasRecommendationAdaptiveLearningConflict,
    hasRecommendationAdaptiveLearningRuntimeAdjustment,
    isRecommendationAdaptiveLearningActivelyAdapting,
    isRecommendationAdaptiveLearningStable,
    requiresMoreRecommendationAdaptiveLearningEvidence,
    summarizeRecommendationAdaptiveLearningUpdate,
    updateRecommendationAdaptiveLearning,
    validateRecommendationAdaptiveLearningUpdateResult,
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
    RecommendationAdaptiveLearningSignalType,
    RecommendationLearningPatternType,
    UpdateRecommendationAdaptiveLearningParams,
} from "./recommendationAdaptiveLearningTypes";

/* ------------------------------------------------------------------ */
/* Test Constants                                                     */
/* ------------------------------------------------------------------ */

const HISTORY_ID =
  "history-adaptive-learning-1";

const MEMORY_ID =
  "memory-adaptive-learning-1";

const FIRST_EVOLUTION_ANALYZED_AT =
  "2026-07-27T01:00:00.000Z";

const FIRST_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T01:10:00.000Z";

const FIRST_RECORDED_AT =
  "2026-07-27T01:20:00.000Z";

const SECOND_EVOLUTION_ANALYZED_AT =
  "2026-07-27T02:00:00.000Z";

const SECOND_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T02:10:00.000Z";

const SECOND_RECORDED_AT =
  "2026-07-27T02:20:00.000Z";

const THIRD_EVOLUTION_ANALYZED_AT =
  "2026-07-27T03:00:00.000Z";

const THIRD_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T03:10:00.000Z";

const THIRD_RECORDED_AT =
  "2026-07-27T03:20:00.000Z";

const MEMORY_ANALYZED_AT =
  "2026-07-27T04:00:00.000Z";

const ADAPTIVE_LEARNING_UPDATED_AT =
  "2026-07-27T05:00:00.000Z";

/* ------------------------------------------------------------------ */
/* Evolution Fixture Types                                            */
/* ------------------------------------------------------------------ */

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

  historyId?:
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
      params.historyId ??
      HISTORY_ID,

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
        index,
      ) =>
        `${idPrefix}-warning-${index}`,

    createObservationId:
      (
        index,
      ) =>
        `${idPrefix}-intelligence-observation-${index}`,
  };
}

/* ------------------------------------------------------------------ */
/* Memory Entry Fixture                                               */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Specific Memory Entries                                            */
/* ------------------------------------------------------------------ */

function createFirstMemoryEntry():
  RecommendationEvolutionMemoryEntry {
  return createMemoryEntry({
    id:
      "memory-entry-1",

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
      "first",
  });
}

function createSecondMemoryEntry():
  RecommendationEvolutionMemoryEntry {
  return createMemoryEntry({
    id:
      "memory-entry-2",

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
      "second",
  });
}

function createThirdMemoryEntry():
  RecommendationEvolutionMemoryEntry {
  return createMemoryEntry({
    id:
      "memory-entry-3",

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
      "third",
  });
}

/* ------------------------------------------------------------------ */
/* Memory Fixture                                                     */
/* ------------------------------------------------------------------ */

function createMemory(
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
        MEMORY_ID,

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
        MEMORY_ID,

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
      MEMORY_ID,

    updatedAt:
      thirdEntry.recordedAt,
  });
}

/* ------------------------------------------------------------------ */
/* Memory Analysis Fixture                                            */
/* ------------------------------------------------------------------ */

function createMemoryAnalysis(
  memory:
    RecommendationEvolutionMemory,
): RecommendationEvolutionMemoryAnalysis {
  return analyzeRecommendationEvolutionMemory({
    memory,

    analyzedAt:
      MEMORY_ANALYZED_AT,

    createComparisonId:
      (
        index,
      ) =>
        `memory-comparison-${index}`,

    createSignalId:
      (
        type:
          RecommendationEvolutionMemorySignalType,
        index:
          number,
      ) =>
        `memory-signal-${index}-${type}`,
  });
}

/* ------------------------------------------------------------------ */
/* Adaptive Learning Params                                           */
/* ------------------------------------------------------------------ */

function createUpdateParams(
  overrides:
    Partial<
      UpdateRecommendationAdaptiveLearningParams
    > = {},
): UpdateRecommendationAdaptiveLearningParams {
  const memory =
    overrides.memory ??
    createMemory();

  const memoryAnalysis =
    overrides.memoryAnalysis ??
    createMemoryAnalysis(
      memory,
    );

  return {
    updatedAt:
      ADAPTIVE_LEARNING_UPDATED_AT,

    minimumSampleCount:
      3,

    minimumConfidence:
      0.6,

    createObservationId:
      (
        comparison,
        index,
      ) =>
        `learning-observation-${index}-${comparison.id}`,

    createPatternId:
      (
        type:
          RecommendationLearningPatternType,
        index:
          number,
      ) =>
        `learning-pattern-${index}-${type}`,

    createRuleId:
      (
        type:
          RecommendationAdaptationRuleType,
        index:
          number,
      ) =>
        `adaptation-rule-${index}-${type}`,

    createSignalId:
      (
        type:
          RecommendationAdaptiveLearningSignalType,
        index:
          number,
      ) =>
        `adaptive-learning-signal-${index}-${type}`,

    ...overrides,

    memory,

    memoryAnalysis,
  };
}

/* ------------------------------------------------------------------ */
/* Deep Clone Helper                                                  */
/* ------------------------------------------------------------------ */

function cloneJsonValue<
  TValue,
>(
  value:
    TValue,
): TValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as TValue;
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "updateRecommendationAdaptiveLearning",
  () => {
    it(
      "creates a complete Adaptive Learning Update Result",
      () => {
        const params =
          createUpdateParams();

        const result =
          updateRecommendationAdaptiveLearning(
            params,
          );

        expect(
          result.analysis,
        ).toBeDefined();

        expect(
          result.presentation,
        ).toBeDefined();

        expect(
          result.runtimeAdjustment,
        ).toBeDefined();

        expect(
          result.updatedAt,
        ).toBe(
          ADAPTIVE_LEARNING_UPDATED_AT,
        );

        expect(
          result.analysis.version,
        ).toBe(
          1,
        );

        expect(
          result.analysis.memoryId,
        ).toBe(
          MEMORY_ID,
        );

        expect(
          result.analysis.historyId,
        ).toBe(
          HISTORY_ID,
        );

        expect(
          result.analysis.sourceMemoryAnalyzedAt,
        ).toBe(
          MEMORY_ANALYZED_AT,
        );

        expect(
          result.analysis.observations.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          result.presentation.headline.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          result.presentation.summary.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          result.presentation
            .confidenceDisclosure.length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "preserves identity and timestamp consistency across the result",
      () => {
        const params =
          createUpdateParams();

        const result =
          updateRecommendationAdaptiveLearning(
            params,
          );

        expect(
          result.analysis.memoryId,
        ).toBe(
          params.memory.id,
        );

        expect(
          result.analysis.historyId,
        ).toBe(
          params.memory.historyId,
        );

        expect(
          result.analysis.historyId,
        ).toBe(
          params.memoryAnalysis.historyId,
        );

        expect(
          result.analysis.sourceMemoryAnalyzedAt,
        ).toBe(
          params.memoryAnalysis.analyzedAt,
        );

        expect(
          result.analysis.analyzedAt,
        ).toBe(
          params.updatedAt,
        );

        expect(
          result.presentation.createdAt,
        ).toBe(
          params.updatedAt,
        );

        expect(
          result.updatedAt,
        ).toBe(
          params.updatedAt,
        );
      },
    );

    it(
      "returns an independent top-level Runtime Adjustment clone",
      () => {
        const result =
          updateRecommendationAdaptiveLearning(
            createUpdateParams(),
          );

        expect(
          result.runtimeAdjustment,
        ).toEqual(
          result.analysis.runtimeAdjustment,
        );

        expect(
          result.runtimeAdjustment,
        ).not.toBe(
          result.analysis.runtimeAdjustment,
        );

        expect(
          result.runtimeAdjustment
            .strategyPreferenceAdjustments,
        ).not.toBe(
          result.analysis.runtimeAdjustment
            .strategyPreferenceAdjustments,
        );

        expect(
          result.runtimeAdjustment
            .decisionPreferenceAdjustments,
        ).not.toBe(
          result.analysis.runtimeAdjustment
            .decisionPreferenceAdjustments,
        );

        expect(
          result.runtimeAdjustment
            .signalConfidenceAdjustments,
        ).not.toBe(
          result.analysis.runtimeAdjustment
            .signalConfidenceAdjustments,
        );
      },
    );

    it(
      "returns insufficient learning state when the sample is below the minimum",
      () => {
        const memory =
          createMemory(
            1,
          );

        const memoryAnalysis =
          createMemoryAnalysis(
            memory,
          );

        const result =
          updateRecommendationAdaptiveLearning(
            createUpdateParams({
              memory,

              memoryAnalysis,

              minimumSampleCount:
                3,
            }),
          );

        expect(
          result.analysis.state,
        ).toBe(
          "insufficient",
        );

        expect(
          result.presentation.tone,
        ).toBe(
          "observing",
        );

        expect(
          result.analysis.statistics
            .observationCount,
        ).toBeLessThan(
          3,
        );

        expect(
          result.analysis.statistics
            .activeAdaptationRuleCount,
        ).toBe(
          0,
        );

        expect(
          hasRecommendationAdaptiveLearningRuntimeAdjustment(
            result,
          ),
        ).toBe(
          false,
        );

        expect(
          requiresMoreRecommendationAdaptiveLearningEvidence(
            result,
          ),
        ).toBe(
          true,
        );

        expect(
          result.presentation.warnings.length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "does not mutate Memory or Memory Analysis inputs",
      () => {
        const params =
          createUpdateParams();

        const originalMemory =
          cloneJsonValue(
            params.memory,
          );

        const originalMemoryAnalysis =
          cloneJsonValue(
            params.memoryAnalysis,
          );

        updateRecommendationAdaptiveLearning(
          params,
        );

        expect(
          params.memory,
        ).toEqual(
          originalMemory,
        );

        expect(
          params.memoryAnalysis,
        ).toEqual(
          originalMemoryAnalysis,
        );
      },
    );

    it(
      "passes explicit Update Result validation",
      () => {
        const params =
          createUpdateParams();

        const result =
          updateRecommendationAdaptiveLearning(
            params,
          );

        expect(
          () =>
            validateRecommendationAdaptiveLearningUpdateResult({
              params,
              result,
            }),
        ).not.toThrow();
      },
    );

    it(
      "rejects inconsistent Memory and Memory Analysis history identities",
      () => {
        const memory =
          createMemory();

        const memoryAnalysis =
          createMemoryAnalysis(
            memory,
          );

        const inconsistentMemoryAnalysis:
          RecommendationEvolutionMemoryAnalysis = {
          ...memoryAnalysis,

          historyId:
            "different-history-id",
        };

        expect(
          () =>
            updateRecommendationAdaptiveLearning(
              createUpdateParams({
                memory,

                memoryAnalysis:
                  inconsistentMemoryAnalysis,
              }),
            ),
        ).toThrow();
      },
    );

    it(
      "rejects a Memory Analysis whose memoryId does not match the Memory",
      () => {
        const memory =
          createMemory();

        const memoryAnalysis =
          createMemoryAnalysis(
            memory,
          );

        const inconsistentMemoryAnalysis:
          RecommendationEvolutionMemoryAnalysis = {
          ...memoryAnalysis,

          memoryId:
            "different-memory-id",
        };

        expect(
          () =>
            updateRecommendationAdaptiveLearning(
              createUpdateParams({
                memory,

                memoryAnalysis:
                  inconsistentMemoryAnalysis,
              }),
            ),
        ).toThrow();
      },
    );

    it(
      "rejects updatedAt earlier than Memory Analysis analyzedAt",
      () => {
        expect(
          () =>
            updateRecommendationAdaptiveLearning(
              createUpdateParams({
                updatedAt:
                  "2026-07-27T03:59:59.000Z",
              }),
            ),
        ).toThrow();
      },
    );

    it.each([
      0,
      -1,
      1.5,
    ])(
      "rejects invalid minimumSampleCount value %s",
      (
        minimumSampleCount,
      ) => {
        expect(
          () =>
            updateRecommendationAdaptiveLearning(
              createUpdateParams({
                minimumSampleCount,
              }),
            ),
        ).toThrow();
      },
    );

    it.each([
      -0.1,
      1.1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ])(
      "rejects invalid minimumConfidence value %s",
      (
        minimumConfidence,
      ) => {
        expect(
          () =>
            updateRecommendationAdaptiveLearning(
              createUpdateParams({
                minimumConfidence,
              }),
            ),
        ).toThrow();
      },
    );

    it(
      "rejects an invalid Observation ID generated by the factory",
      () => {
        expect(
          () =>
            updateRecommendationAdaptiveLearning(
              createUpdateParams({
                createObservationId:
                  () =>
                    "",
              }),
            ),
        ).toThrow();
      },
    );

    it(
      "produces a summary consistent with the Update Result",
      () => {
        const result =
          updateRecommendationAdaptiveLearning(
            createUpdateParams(),
          );

        const summary =
          summarizeRecommendationAdaptiveLearningUpdate(
            result,
          );

        expect(
          summary.state,
        ).toBe(
          result.analysis.state,
        );

        expect(
          summary.confidence,
        ).toBe(
          result.analysis.confidence,
        );

        expect(
          summary.observationCount,
        ).toBe(
          result.analysis.statistics
            .observationCount,
        );

        expect(
          summary.patternCount,
        ).toBe(
          result.analysis.statistics
            .patternCount,
        );

        expect(
          summary.adaptationRuleCount,
        ).toBe(
          result.analysis.statistics
            .adaptationRuleCount,
        );

        expect(
          summary.activeAdaptationRuleCount,
        ).toBe(
          result.analysis.statistics
            .activeAdaptationRuleCount,
        );

        expect(
          summary.conflictedAdaptationRuleCount,
        ).toBe(
          result.analysis.statistics
            .conflictedAdaptationRuleCount,
        );

        expect(
          summary.signalCount,
        ).toBe(
          result.analysis.signals.length,
        );

        expect(
          summary.headline,
        ).toBe(
          result.presentation.headline,
        );

        expect(
          summary.hasRuntimeAdjustment,
        ).toBe(
          hasRecommendationAdaptiveLearningRuntimeAdjustment(
            result,
          ),
        );

        expect(
          summary.hasConflict,
        ).toBe(
          hasRecommendationAdaptiveLearningConflict(
            result,
          ),
        );

        expect(
          summary.isStable,
        ).toBe(
          isRecommendationAdaptiveLearningStable(
            result,
          ),
        );
      },
    );

    it(
      "reports actively adapting only when state, active rules, and adjustments agree",
      () => {
        const result =
          updateRecommendationAdaptiveLearning(
            createUpdateParams(),
          );

        const expected =
          (
            result.analysis.state ===
              "adapting" &&
            result.analysis.statistics
              .activeAdaptationRuleCount >
              0 &&
            hasRecommendationAdaptiveLearningRuntimeAdjustment(
              result,
            )
          );

        expect(
          isRecommendationAdaptiveLearningActivelyAdapting(
            result,
          ),
        ).toBe(
          expected,
        );
      },
    );

    it(
      "returns query helper values consistent with Analysis state",
      () => {
        const result =
          updateRecommendationAdaptiveLearning(
            createUpdateParams(),
          );

        expect(
          isRecommendationAdaptiveLearningStable(
            result,
          ),
        ).toBe(
          result.analysis.state ===
          "stable",
        );

        expect(
          requiresMoreRecommendationAdaptiveLearningEvidence(
            result,
          ),
        ).toBe(
          (
            result.analysis.state ===
              "unavailable" ||
            result.analysis.state ===
              "insufficient" ||
            result.analysis.state ===
              "observing" ||
            result.analysis.state ===
              "conflicted"
          ),
        );

        expect(
          hasRecommendationAdaptiveLearningConflict(
            result,
          ),
        ).toBe(
          (
            result.analysis.state ===
              "conflicted" ||
            result.analysis.scores
              .conflictRisk >=
              0.4 ||
            result.analysis.statistics
              .conflictedAdaptationRuleCount >
              0 ||
            result.analysis.patterns.some(
              (
                pattern,
              ) =>
                pattern.type ===
                "conflicting-evidence",
            )
          ),
        );
      },
    );
  },
);