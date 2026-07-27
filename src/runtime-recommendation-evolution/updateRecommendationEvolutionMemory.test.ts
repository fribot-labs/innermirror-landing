import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    analyzeRecommendationEvolutionIntelligence,
} from "./analyzeRecommendationEvolutionIntelligence";

import {
    updateRecommendationEvolutionMemory,
    validateRecommendationEvolutionMemoryUpdateResult,
} from "./updateRecommendationEvolutionMemory";

import type {
    RecommendationEvolutionConfidence,
    RecommendationEvolutionDataQuality,
    RecommendationEvolutionResult,
    RecommendationEvolutionSummary,
} from "./recommendationEvolutionTypes";

import type {
    AnalyzeRecommendationEvolutionIntelligenceParams,
    RecommendationEvolutionIntelligenceResult,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionRuntimeDecisionType,
} from "./recommendationEvolutionIntelligenceTypes";

import type {
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryUpdateResult,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Test Constants                                                     */
/* ------------------------------------------------------------------ */

const MEMORY_ID =
  "recommendation-memory-1";

const HISTORY_ID =
  "history-1";

const FIRST_EVOLUTION_ANALYZED_AT =
  "2026-07-27T01:00:00.000Z";

const FIRST_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T01:03:00.000Z";

const FIRST_UPDATED_AT =
  "2026-07-27T01:05:00.000Z";

const SECOND_EVOLUTION_ANALYZED_AT =
  "2026-07-27T02:00:00.000Z";

const SECOND_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T02:03:00.000Z";

const SECOND_UPDATED_AT =
  "2026-07-27T02:05:00.000Z";

const THIRD_EVOLUTION_ANALYZED_AT =
  "2026-07-27T03:00:00.000Z";

const THIRD_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T03:03:00.000Z";

const THIRD_UPDATED_AT =
  "2026-07-27T03:05:00.000Z";

/* ------------------------------------------------------------------ */
/* Evolution Fixture                                                  */
/* ------------------------------------------------------------------ */

type CreateEvolutionParams = {
  analyzedAt:
    string;

  historyId?:
    string;

  summary?:
    Partial<
      RecommendationEvolutionSummary
    >;

  statistics?:
    Partial<
      RecommendationEvolutionResult["statistics"]
    >;

  dataQuality?:
    RecommendationEvolutionDataQuality;

  confidence?:
    RecommendationEvolutionConfidence;
};

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
        `intelligence-signal-${index}-${type}`,

    createDecisionId:
      (
        type:
          RecommendationEvolutionRuntimeDecisionType,
        index:
          number,
      ) =>
        `runtime-decision-${index}-${type}`,

    createGuidanceId:
      () =>
        "guidance-1",

    createWarningId:
      (
        index,
      ) =>
        `warning-${index}`,

    createObservationId:
      (
        index,
      ) =>
        `observation-${index}`,
  };
}

type CreateIntelligenceParams = {
  evolutionAnalyzedAt:
    string;

  intelligenceAnalyzedAt:
    string;

  historyId?:
    string;

  summary?:
    Partial<
      RecommendationEvolutionSummary
    >;

  statistics?:
    Partial<
      RecommendationEvolutionResult["statistics"]
    >;

  dataQuality?:
    RecommendationEvolutionDataQuality;

  confidence?:
    RecommendationEvolutionConfidence;
};

function createIntelligence(
  params:
    CreateIntelligenceParams,
): RecommendationEvolutionIntelligenceResult {
  const evolution =
    createEvolution({
      analyzedAt:
        params.evolutionAnalyzedAt,

      historyId:
        params.historyId,

      summary:
        params.summary,

      statistics:
        params.statistics,

      dataQuality:
        params.dataQuality,

      confidence:
        params.confidence,
    });

  return analyzeRecommendationEvolutionIntelligence(
    createIntelligenceParams(
      evolution,
      params.intelligenceAnalyzedAt,
    ),
  );
}

function createFirstIntelligence():
  RecommendationEvolutionIntelligenceResult {
  return createIntelligence({
    evolutionAnalyzedAt:
      FIRST_EVOLUTION_ANALYZED_AT,

    intelligenceAnalyzedAt:
      FIRST_INTELLIGENCE_ANALYZED_AT,
  });
}

function createSecondIntelligence():
  RecommendationEvolutionIntelligenceResult {
  return createIntelligence({
    evolutionAnalyzedAt:
      SECOND_EVOLUTION_ANALYZED_AT,

    intelligenceAnalyzedAt:
      SECOND_INTELLIGENCE_ANALYZED_AT,

    summary: {
      stability:
        "stable",

      drift:
        "none",

      dominantDirection:
        "advancing",

      latestDirection:
        "advancing",

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
  });
}

function createThirdIntelligence():
  RecommendationEvolutionIntelligenceResult {
  return createIntelligence({
    evolutionAnalyzedAt:
      THIRD_EVOLUTION_ANALYZED_AT,

    intelligenceAnalyzedAt:
      THIRD_INTELLIGENCE_ANALYZED_AT,

    summary: {
      stability:
        "stable",

      drift:
        "none",

      dominantDirection:
        "advancing",

      latestDirection:
        "advancing",

      recommendationChanged:
        true,

      hasMeaningfulEvolution:
        true,
    },

    statistics: {
      completedCount:
        2,

      completionAdvanceCount:
        2,

      completionRate:
        1,
    },
  });
}

/* ------------------------------------------------------------------ */
/* Update Fixture                                                     */
/* ------------------------------------------------------------------ */

type RunUpdateParams = {
  memory:
    RecommendationEvolutionMemory | null;

  intelligence:
    RecommendationEvolutionIntelligenceResult;

  updatedAt:
    string;

  entryId:
    string;
};

function runUpdate(
  params:
    RunUpdateParams,
): RecommendationEvolutionMemoryUpdateResult {
  let comparisonIndex =
    0;

  let signalIndex =
    0;

  return updateRecommendationEvolutionMemory({
    memory:
      params.memory,

    intelligence:
      params.intelligence,

    updatedAt:
      params.updatedAt,

    memoryId:
      MEMORY_ID,

    createEntryId:
      () =>
        params.entryId,

    createComparisonId:
      () => {
        const id =
          `comparison-${comparisonIndex}`;

        comparisonIndex +=
          1;

        return id;
      },

    createSignalId:
      (
        type,
      ) => {
        const id =
          `memory-signal-${signalIndex}-${type}`;

        signalIndex +=
          1;

        return id;
      },
  });
}

function createFirstUpdate():
  RecommendationEvolutionMemoryUpdateResult {
  return runUpdate({
    memory:
      null,

    intelligence:
      createFirstIntelligence(),

    updatedAt:
      FIRST_UPDATED_AT,

    entryId:
      "entry-1",
  });
}

function createSecondUpdate():
  RecommendationEvolutionMemoryUpdateResult {
  const firstUpdate =
    createFirstUpdate();

  return runUpdate({
    memory:
      firstUpdate.memory,

    intelligence:
      createSecondIntelligence(),

    updatedAt:
      SECOND_UPDATED_AT,

    entryId:
      "entry-2",
  });
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "updateRecommendationEvolutionMemory",
  () => {
    it(
      "creates a complete Update Result when Memory is null",
      () => {
        const result =
          createFirstUpdate();

        expect(
          result.memory.id,
        ).toBe(
          MEMORY_ID,
        );

        expect(
          result.memory.historyId,
        ).toBe(
          HISTORY_ID,
        );

        expect(
          result.memory.entries,
        ).toHaveLength(
          1,
        );

        expect(
          result.entry.id,
        ).toBe(
          "entry-1",
        );

        expect(
          result.latestComparison.type,
        ).toBe(
          "initial",
        );

        expect(
          result.analysis.state,
        ).toBe(
          "insufficient",
        );

        expect(
          result.presentation.tone,
        ).toBe(
          "neutral",
        );

        expect(
          result.updatedAt,
        ).toBe(
          FIRST_UPDATED_AT,
        );
      },
    );

    it(
      "appends a second Entry to an existing Memory",
      () => {
        const firstUpdate =
          createFirstUpdate();

        const secondUpdate =
          runUpdate({
            memory:
              firstUpdate.memory,

            intelligence:
              createSecondIntelligence(),

            updatedAt:
              SECOND_UPDATED_AT,

            entryId:
              "entry-2",
          });

        expect(
          secondUpdate.memory.entries,
        ).toHaveLength(
          2,
        );

        expect(
          secondUpdate.memory.entries.map(
            (
              entry,
            ) =>
              entry.id,
          ),
        ).toEqual([
          "entry-1",
          "entry-2",
        ]);

        expect(
          secondUpdate.entry.id,
        ).toBe(
          "entry-2",
        );
      },
    );

    it(
      "preserves Memory createdAt and updates updatedAt",
      () => {
        const firstUpdate =
          createFirstUpdate();

        const secondUpdate =
          runUpdate({
            memory:
              firstUpdate.memory,

            intelligence:
              createSecondIntelligence(),

            updatedAt:
              SECOND_UPDATED_AT,

            entryId:
              "entry-2",
          });

        expect(
          secondUpdate.memory.createdAt,
        ).toBe(
          FIRST_UPDATED_AT,
        );

        expect(
          secondUpdate.memory.updatedAt,
        ).toBe(
          SECOND_UPDATED_AT,
        );
      },
    );

    it(
      "returns the created Entry as the latest Memory Entry",
      () => {
        const result =
          createSecondUpdate();

        const latestEntry =
          result.memory.entries[
            result.memory.entries.length -
            1
          ];

        expect(
          latestEntry,
        ).toEqual(
          result.entry,
        );

        expect(
          latestEntry?.id,
        ).toBe(
          "entry-2",
        );
      },
    );

    it(
      "returns the latest Analysis Comparison",
      () => {
        const result =
          createSecondUpdate();

        const latestAnalysisComparison =
          result.analysis.comparisons[
            result.analysis.comparisons.length -
            1
          ];

        expect(
          result.analysis.comparisons,
        ).toHaveLength(
          2,
        );

        expect(
          result.latestComparison,
        ).toEqual(
          latestAnalysisComparison,
        );

        expect(
          result.latestComparison.previous?.id,
        ).toBe(
          "entry-1",
        );

        expect(
          result.latestComparison.current.id,
        ).toBe(
          "entry-2",
        );
      },
    );

    it(
      "creates one Comparison for every Memory Entry",
      () => {
        const firstUpdate =
          createFirstUpdate();

        const secondUpdate =
          runUpdate({
            memory:
              firstUpdate.memory,

            intelligence:
              createSecondIntelligence(),

            updatedAt:
              SECOND_UPDATED_AT,

            entryId:
              "entry-2",
          });

        const thirdUpdate =
          runUpdate({
            memory:
              secondUpdate.memory,

            intelligence:
              createThirdIntelligence(),

            updatedAt:
              THIRD_UPDATED_AT,

            entryId:
              "entry-3",
          });

        expect(
          thirdUpdate.memory.entries,
        ).toHaveLength(
          3,
        );

        expect(
          thirdUpdate.analysis.comparisons,
        ).toHaveLength(
          3,
        );

        expect(
          thirdUpdate.latestComparison.current.id,
        ).toBe(
          "entry-3",
        );
      },
    );

    it(
      "uses the Entry ID returned by createEntryId",
      () => {
        const createEntryId =
          vi.fn(
            () =>
              "generated-entry-id",
          );

        const result =
          updateRecommendationEvolutionMemory({
            memory:
              null,

            intelligence:
              createFirstIntelligence(),

            updatedAt:
              FIRST_UPDATED_AT,

            memoryId:
              MEMORY_ID,

            createEntryId,

            createComparisonId:
              () =>
                "comparison-1",

            createSignalId:
              () =>
                "memory-signal-1",
          });

        expect(
          createEntryId,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          result.entry.id,
        ).toBe(
          "generated-entry-id",
        );
      },
    );

    it(
      "uses generated Comparison IDs",
      () => {
        let comparisonIndex =
          0;

        const createComparisonId =
          vi.fn(
            () => {
              const id =
                `generated-comparison-${comparisonIndex}`;

              comparisonIndex +=
                1;

              return id;
            },
          );

        const result =
          updateRecommendationEvolutionMemory({
            memory:
              null,

            intelligence:
              createFirstIntelligence(),

            updatedAt:
              FIRST_UPDATED_AT,

            memoryId:
              MEMORY_ID,

            createEntryId:
              () =>
                "entry-1",

            createComparisonId,

            createSignalId:
              () =>
                "memory-signal-1",
          });

        expect(
          createComparisonId,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          result.latestComparison.id,
        ).toBe(
          "generated-comparison-0",
        );
      },
    );

    it(
      "uses one timestamp across all artifacts created by the update",
      () => {
        const result =
          createSecondUpdate();

        expect(
          result.updatedAt,
        ).toBe(
          SECOND_UPDATED_AT,
        );

        expect(
          result.memory.updatedAt,
        ).toBe(
          SECOND_UPDATED_AT,
        );

        expect(
          result.entry.recordedAt,
        ).toBe(
          SECOND_UPDATED_AT,
        );

        expect(
          result.analysis.analyzedAt,
        ).toBe(
          SECOND_UPDATED_AT,
        );

        expect(
          result.latestComparison.comparedAt,
        ).toBe(
          SECOND_UPDATED_AT,
        );

        expect(
          result.presentation.createdAt,
        ).toBe(
          SECOND_UPDATED_AT,
        );
      },
    );

    it(
      "creates Presentation evidence for the updated Memory",
      () => {
        const result =
          createSecondUpdate();

        expect(
          result.presentation.evidence,
        ).toContain(
          "2 memory entries were included in the presentation.",
        );

        expect(
          result.presentation.evidence,
        ).toContain(
          `The resolved long-term memory state is ${result.analysis.state}.`,
        );
      },
    );

    it(
      "creates latestChange after the second update",
      () => {
        const result =
          createSecondUpdate();

        expect(
          result.presentation.latestChange,
        ).not.toBeNull();

        expect(
          result.presentation.latestChange?.trim().length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "does not mutate the existing Memory",
      () => {
        const firstUpdate =
          createFirstUpdate();

        const originalMemory =
          firstUpdate.memory;

        const memorySnapshot =
          structuredClone(
            originalMemory,
          );

        runUpdate({
          memory:
            originalMemory,

          intelligence:
            createSecondIntelligence(),

          updatedAt:
            SECOND_UPDATED_AT,

          entryId:
            "entry-2",
        });

        expect(
          originalMemory,
        ).toEqual(
          memorySnapshot,
        );
      },
    );

    it(
      "returns independent Memory and Entry objects",
      () => {
        const result =
          createSecondUpdate();

        const latestStoredEntry =
          result.memory.entries[
            result.memory.entries.length -
            1
          ];

        expect(
          result.memory.entries,
        ).not.toBe(
          result.analysis.comparisons,
        );

        expect(
          result.entry,
        ).not.toBe(
          latestStoredEntry,
        );

        expect(
          result.entry.scores,
        ).not.toBe(
          latestStoredEntry?.scores,
        );

        expect(
          result.entry.decisions,
        ).not.toBe(
          latestStoredEntry?.decisions,
        );

        expect(
          result.entry.signalTypes,
        ).not.toBe(
          latestStoredEntry?.signalTypes,
        );

        expect(
          result.entry
            .enabledRuntimeDecisionTypes,
        ).not.toBe(
          latestStoredEntry
            ?.enabledRuntimeDecisionTypes,
        );
      },
    );

    it(
      "returns independent Analysis and Comparison objects",
      () => {
        const result =
          createSecondUpdate();

        const latestAnalysisComparison =
          result.analysis.comparisons[
            result.analysis.comparisons.length -
            1
          ];

        expect(
          result.latestComparison,
        ).not.toBe(
          latestAnalysisComparison,
        );

        expect(
          result.latestComparison.current,
        ).not.toBe(
          result.entry,
        );

        expect(
          result.latestComparison.current.scores,
        ).not.toBe(
          result.entry.scores,
        );
      },
    );

    it(
      "passes the public Update Result validator",
      () => {
        const result =
          createSecondUpdate();

        expect(
          () =>
            validateRecommendationEvolutionMemoryUpdateResult(
              result,
            ),
        ).not.toThrow();
      },
    );

    it(
      "rejects an empty memoryId",
      () => {
        expect(
          () =>
            updateRecommendationEvolutionMemory({
              memory:
                null,

              intelligence:
                createFirstIntelligence(),

              updatedAt:
                FIRST_UPDATED_AT,

              memoryId:
                " ",

              createEntryId:
                () =>
                  "entry-1",

              createComparisonId:
                () =>
                  "comparison-1",

              createSignalId:
                () =>
                  "memory-signal-1",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an invalid updatedAt timestamp",
      () => {
        expect(
          () =>
            updateRecommendationEvolutionMemory({
              memory:
                null,

              intelligence:
                createFirstIntelligence(),

              updatedAt:
                "invalid-date",

              memoryId:
                MEMORY_ID,

              createEntryId:
                () =>
                  "entry-1",

              createComparisonId:
                () =>
                  "comparison-1",

              createSignalId:
                () =>
                  "memory-signal-1",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects updatedAt earlier than Intelligence analyzedAt",
      () => {
        expect(
          () =>
            updateRecommendationEvolutionMemory({
              memory:
                null,

              intelligence:
                createFirstIntelligence(),

              updatedAt:
                "2026-07-27T01:02:00.000Z",

              memoryId:
                MEMORY_ID,

              createEntryId:
                () =>
                  "entry-1",

              createComparisonId:
                () =>
                  "comparison-1",

              createSignalId:
                () =>
                  "memory-signal-1",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects a memoryId that differs from the existing Memory",
      () => {
        const firstUpdate =
          createFirstUpdate();

        expect(
          () =>
            updateRecommendationEvolutionMemory({
              memory:
                firstUpdate.memory,

              intelligence:
                createSecondIntelligence(),

              updatedAt:
                SECOND_UPDATED_AT,

              memoryId:
                "different-memory-id",

              createEntryId:
                () =>
                  "entry-2",

              createComparisonId:
                () =>
                  "comparison-1",

              createSignalId:
                () =>
                  "memory-signal-1",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects Intelligence from a different Recommendation History",
      () => {
        const firstUpdate =
          createFirstUpdate();

        const differentHistoryIntelligence =
          createIntelligence({
            evolutionAnalyzedAt:
              SECOND_EVOLUTION_ANALYZED_AT,

            intelligenceAnalyzedAt:
              SECOND_INTELLIGENCE_ANALYZED_AT,

            historyId:
              "history-2",
          });

        expect(
          () =>
            runUpdate({
              memory:
                firstUpdate.memory,

              intelligence:
                differentHistoryIntelligence,

              updatedAt:
                SECOND_UPDATED_AT,

              entryId:
                "entry-2",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects a duplicate Entry ID",
      () => {
        const firstUpdate =
          createFirstUpdate();

        expect(
          () =>
            runUpdate({
              memory:
                firstUpdate.memory,

              intelligence:
                createSecondIntelligence(),

              updatedAt:
                SECOND_UPDATED_AT,

              entryId:
                "entry-1",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects Intelligence with a duplicate analyzedAt timestamp",
      () => {
        const firstUpdate =
          createFirstUpdate();

        const duplicateTimestampIntelligence =
          createIntelligence({
            evolutionAnalyzedAt:
              FIRST_EVOLUTION_ANALYZED_AT,

            intelligenceAnalyzedAt:
              FIRST_INTELLIGENCE_ANALYZED_AT,
          });

        expect(
          () =>
            runUpdate({
              memory:
                firstUpdate.memory,

              intelligence:
                duplicateTimestampIntelligence,

              updatedAt:
                SECOND_UPDATED_AT,

              entryId:
                "entry-2",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an Update Result with a mismatched latest Entry",
      () => {
        const result =
          createSecondUpdate();

        const invalidResult:
          RecommendationEvolutionMemoryUpdateResult = {
            ...result,

            entry: {
              ...result.entry,

              id:
                "different-entry-id",
            },
          };

        expect(
          () =>
            validateRecommendationEvolutionMemoryUpdateResult(
              invalidResult,
            ),
        ).toThrow();
      },
    );

    it(
      "rejects an Update Result with a mismatched latest Comparison",
      () => {
        const result =
          createSecondUpdate();

        const invalidResult:
          RecommendationEvolutionMemoryUpdateResult = {
            ...result,

            latestComparison: {
              ...result.latestComparison,

              id:
                "different-comparison-id",
            },
          };

        expect(
          () =>
            validateRecommendationEvolutionMemoryUpdateResult(
              invalidResult,
            ),
        ).toThrow();
      },
    );

    it(
      "rejects an Update Result with inconsistent timestamps",
      () => {
        const result =
          createSecondUpdate();

        const invalidResult:
          RecommendationEvolutionMemoryUpdateResult = {
            ...result,

            updatedAt:
              "2026-07-27T09:00:00.000Z",
          };

        expect(
          () =>
            validateRecommendationEvolutionMemoryUpdateResult(
              invalidResult,
            ),
        ).toThrow();
      },
    );
  },
);