import {
    describe,
    expect,
    it,
} from "vitest";

import {
    analyzeRecommendationEvolutionIntelligence,
} from "./analyzeRecommendationEvolutionIntelligence";

import {
    analyzeRecommendationEvolutionMemory,
    validateRecommendationEvolutionMemoryAnalysis,
} from "./analyzeRecommendationEvolutionMemory";

import {
    appendRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    createRecommendationEvolutionMemoryEntry,
} from "./createRecommendationEvolutionMemoryEntry";

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
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Test Constants                                                     */
/* ------------------------------------------------------------------ */

const MEMORY_ID =
  "recommendation-memory-1";

const HISTORY_ID =
  "history-1";

const ANALYZED_AT =
  "2026-07-27T06:00:00.000Z";

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

/* ------------------------------------------------------------------ */
/* Entry Fixture                                                      */
/* ------------------------------------------------------------------ */

type CreateEntryParams = {
  id:
    string;

  evolutionAnalyzedAt:
    string;

  intelligenceAnalyzedAt:
    string;

  recordedAt:
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

  overrides?:
    Partial<
      RecommendationEvolutionMemoryEntry
    >;
};

function createEntry(
  params:
    CreateEntryParams,
): RecommendationEvolutionMemoryEntry {
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

  const intelligence =
    analyzeRecommendationEvolutionIntelligence(
      createIntelligenceParams(
        evolution,
        params.intelligenceAnalyzedAt,
      ),
    );

  const generatedEntry =
    createRecommendationEvolutionMemoryEntry({
      intelligence,

      recordedAt:
        params.recordedAt,

      createEntryId:
        () =>
          params.id,
    });

  const overrides =
    params.overrides ??
    {};

  return {
    ...generatedEntry,
    ...overrides,

    scores: {
      ...generatedEntry.scores,
      ...overrides.scores,
    },

    decisions: {
      ...generatedEntry.decisions,
      ...overrides.decisions,
    },

    signalTypes:
      overrides.signalTypes ===
      undefined
        ? [
            ...generatedEntry.signalTypes,
          ]
        : [
            ...overrides.signalTypes,
          ],

    enabledRuntimeDecisionTypes:
      overrides.enabledRuntimeDecisionTypes ===
      undefined
        ? [
            ...generatedEntry
              .enabledRuntimeDecisionTypes,
          ]
        : [
            ...overrides
              .enabledRuntimeDecisionTypes,
          ],
  };
}

function createFirstEntry(
  overrides:
    Partial<
      RecommendationEvolutionMemoryEntry
    > = {},
): RecommendationEvolutionMemoryEntry {
  return createEntry({
    id:
      "entry-1",

    evolutionAnalyzedAt:
      "2026-07-27T01:00:00.000Z",

    intelligenceAnalyzedAt:
      "2026-07-27T01:03:00.000Z",

    recordedAt:
      "2026-07-27T01:05:00.000Z",

    overrides,
  });
}

function createSecondEntry(
  overrides:
    Partial<
      RecommendationEvolutionMemoryEntry
    > = {},
): RecommendationEvolutionMemoryEntry {
  return createEntry({
    id:
      "entry-2",

    evolutionAnalyzedAt:
      "2026-07-27T02:00:00.000Z",

    intelligenceAnalyzedAt:
      "2026-07-27T02:03:00.000Z",

    recordedAt:
      "2026-07-27T02:05:00.000Z",

    overrides,
  });
}

function createThirdEntry(
  overrides:
    Partial<
      RecommendationEvolutionMemoryEntry
    > = {},
): RecommendationEvolutionMemoryEntry {
  return createEntry({
    id:
      "entry-3",

    evolutionAnalyzedAt:
      "2026-07-27T03:00:00.000Z",

    intelligenceAnalyzedAt:
      "2026-07-27T03:03:00.000Z",

    recordedAt:
      "2026-07-27T03:05:00.000Z",

    overrides,
  });
}

function createFourthEntry(
  overrides:
    Partial<
      RecommendationEvolutionMemoryEntry
    > = {},
): RecommendationEvolutionMemoryEntry {
  return createEntry({
    id:
      "entry-4",

    evolutionAnalyzedAt:
      "2026-07-27T04:00:00.000Z",

    intelligenceAnalyzedAt:
      "2026-07-27T04:03:00.000Z",

    recordedAt:
      "2026-07-27T04:05:00.000Z",

    overrides,
  });
}

/* ------------------------------------------------------------------ */
/* Memory Fixture                                                     */
/* ------------------------------------------------------------------ */

function createMemory(
  entries:
    RecommendationEvolutionMemoryEntry[],
): RecommendationEvolutionMemory {
  if (
    entries.length ===
    0
  ) {
    return {
      version:
        1,

      id:
        MEMORY_ID,

      historyId:
        HISTORY_ID,

      entries:
        [],

      createdAt:
        "2026-07-27T00:00:00.000Z",

      updatedAt:
        "2026-07-27T00:00:00.000Z",
    };
  }

  let memory:
    RecommendationEvolutionMemory | null =
      null;

  entries.forEach(
    (
      entry,
    ) => {
      memory =
        appendRecommendationEvolutionMemory({
          memory,

          entry,

          memoryId:
            MEMORY_ID,

          updatedAt:
            entry.recordedAt,
        });
    },
  );

  if (
    memory ===
    null
  ) {
    throw new Error(
      "Memory fixture creation failed.",
    );
  }

  return memory;
}

/* ------------------------------------------------------------------ */
/* Analysis Fixture                                                   */
/* ------------------------------------------------------------------ */

function analyzeMemory(
  memory:
    RecommendationEvolutionMemory,
): RecommendationEvolutionMemoryAnalysis {
  let comparisonIndex =
    0;

  let signalIndex =
    0;

  return analyzeRecommendationEvolutionMemory({
    memory,

    analyzedAt:
      ANALYZED_AT,

    createComparisonId:
      () => {
        const id =
          `memory-comparison-${comparisonIndex}`;

        comparisonIndex +=
          1;

        return id;
      },

    createSignalId:
      () => {
        const id =
          `memory-signal-${signalIndex}`;

        signalIndex +=
          1;

        return id;
      },
  });
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "analyzeRecommendationEvolutionMemory",
  () => {
    it(
      "creates an unavailable Analysis for an empty Memory",
      () => {
        const memory =
          createMemory(
            [],
          );

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.memoryId,
        ).toBe(
          MEMORY_ID,
        );

        expect(
          analysis.historyId,
        ).toBe(
          HISTORY_ID,
        );

        expect(
          analysis.state,
        ).toBe(
          "unavailable",
        );

        expect(
          analysis.statistics.entryCount,
        ).toBe(
          0,
        );

        expect(
          analysis.comparisons,
        ).toEqual(
          [],
        );

        expect(
          analysis.analyzedAt,
        ).toBe(
          ANALYZED_AT,
        );
      },
    );

    it(
      "creates an insufficient Analysis for one Memory Entry",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.state,
        ).toBe(
          "insufficient",
        );

        expect(
          analysis.statistics.entryCount,
        ).toBe(
          1,
        );

        expect(
          analysis.comparisons,
        ).toHaveLength(
          1,
        );

        expect(
          analysis.comparisons[0]?.type,
        ).toBe(
          "initial",
        );
      },
    );

    it(
      "creates one Comparison for every Memory Entry",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
            createThirdEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.comparisons,
        ).toHaveLength(
          3,
        );

        expect(
          analysis.comparisons[0]?.previous,
        ).toBeNull();

        expect(
          analysis.comparisons[1]?.previous?.id,
        ).toBe(
          "entry-1",
        );

        expect(
          analysis.comparisons[1]?.current.id,
        ).toBe(
          "entry-2",
        );

        expect(
          analysis.comparisons[2]?.previous?.id,
        ).toBe(
          "entry-2",
        );

        expect(
          analysis.comparisons[2]?.current.id,
        ).toBe(
          "entry-3",
        );
      },
    );

    it(
      "calculates State counts from all Memory Entries",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              state:
                "stable",
            }),

            createSecondEntry({
              state:
                "advancing",
            }),

            createThirdEntry({
              state:
                "stable",
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.statistics.stateCounts.stable,
        ).toBe(
          2,
        );

        expect(
          analysis.statistics.stateCounts.advancing,
        ).toBe(
          1,
        );
      },
    );

    it(
      "calculates Strategy counts from all Memory Entries",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              strategyType:
                "maintain",
            }),

            createSecondEntry({
              strategyType:
                "advance",
            }),

            createThirdEntry({
              strategyType:
                "maintain",
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.statistics.strategyCounts.maintain,
        ).toBe(
          2,
        );

        expect(
          analysis.statistics.strategyCounts.advance,
        ).toBe(
          1,
        );
      },
    );

    it(
      "calculates average Memory scores",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              scores: {
                stability:
                  0.2,

                progress:
                  0.3,

                repetitionRisk:
                  0.8,

                redirectionRisk:
                  0.6,

                completionMomentum:
                  0.1,
              },
            }),

            createSecondEntry({
              scores: {
                stability:
                  0.6,

                progress:
                  0.5,

                repetitionRisk:
                  0.4,

                redirectionRisk:
                  0.2,

                completionMomentum:
                  0.5,
              },
            }),

            createThirdEntry({
              scores: {
                stability:
                  1,

                progress:
                  0.7,

                repetitionRisk:
                  0,

                redirectionRisk:
                  0.1,

                completionMomentum:
                  0.9,
              },
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.statistics.averageScores.stability,
        ).toBeCloseTo(
          0.6,
        );

        expect(
          analysis.statistics.averageScores.progress,
        ).toBeCloseTo(
          0.5,
        );

        expect(
          analysis.statistics.averageScores.repetitionRisk,
        ).toBeCloseTo(
          0.4,
        );

        expect(
          analysis.statistics.averageScores.redirectionRisk,
        ).toBeCloseTo(
          0.3,
        );

        expect(
          analysis.statistics.averageScores.completionMomentum,
        ).toBeCloseTo(
          0.5,
        );
      },
    );

    it(
      "stores the latest score changes from the latest Comparison",
      () => {
        const firstEntry =
          createFirstEntry({
            scores: {
              stability:
                0.4,

              progress:
                0.3,

              repetitionRisk:
                0.5,

              redirectionRisk:
                0.6,

              completionMomentum:
                0.2,
            },
          });

        const secondEntry =
          createSecondEntry({
            scores: {
              stability:
                0.6,

              progress:
                0.7,

              repetitionRisk:
                0.2,

              redirectionRisk:
                0.3,

              completionMomentum:
                0.8,
            },
          });

        const memory =
          createMemory([
            firstEntry,
            secondEntry,
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.statistics.latestScoreChanges,
        ).not.toBeNull();

        expect(
          analysis.statistics.latestScoreChanges?.stability,
        ).toBeCloseTo(
          0.2,
        );

        expect(
          analysis.statistics.latestScoreChanges?.progress,
        ).toBeCloseTo(
          0.4,
        );

        expect(
          analysis.statistics.latestScoreChanges?.repetitionRisk,
        ).toBeCloseTo(
          -0.3,
        );

        expect(
          analysis.statistics.latestScoreChanges?.redirectionRisk,
        ).toBeCloseTo(
          -0.3,
        );

        expect(
          analysis.statistics.latestScoreChanges
            ?.completionMomentum,
        ).toBeCloseTo(
          0.6,
        );
      },
    );

    it(
      "calculates the current advancing State streak",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              state:
                "stable",
            }),

            createSecondEntry({
              state:
                "advancing",
            }),

            createThirdEntry({
              state:
                "advancing",
            }),

            createFourthEntry({
              state:
                "advancing",
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.statistics.advancingStreak,
        ).toBe(
          3,
        );
      },
    );

    it(
      "calculates the current maintain Strategy streak",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              strategyType:
                "observe",
            }),

            createSecondEntry({
              strategyType:
                "maintain",
            }),

            createThirdEntry({
              strategyType:
                "maintain",
            }),

            createFourthEntry({
              strategyType:
                "maintain",
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.statistics.maintainStreak,
        ).toBe(
          3,
        );
      },
    );

    it(
      "calculates named State and Strategy streak statistics",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              state:
                "stalled",

              strategyType:
                "observe",
            }),

            createSecondEntry({
              state:
                "stalled",

              strategyType:
                "observe",
            }),

            createThirdEntry({
              state:
                "stalled",

              strategyType:
                "observe",
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.statistics.stalledStreak,
        ).toBe(
          3,
        );

        expect(
          analysis.statistics.observeStreak,
        ).toBe(
          3,
        );

        expect(
          analysis.statistics.advancingStreak,
        ).toBe(
          0,
        );

        expect(
          analysis.statistics.maintainStreak,
        ).toBe(
          0,
        );
      },
    );

    it(
      "counts State and Strategy changes",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              state:
                "stable",

              strategyType:
                "maintain",
            }),

            createSecondEntry({
              state:
                "advancing",

              strategyType:
                "advance",
            }),

            createThirdEntry({
              state:
                "stable",

              strategyType:
                "maintain",
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.statistics.stateChangeCount,
        ).toBe(
          2,
        );

        expect(
          analysis.statistics.strategyChangeCount,
        ).toBe(
          2,
        );
      },
    );

    it(
      "creates unique Comparison and Memory Signal IDs",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              state:
                "stable",
            }),

            createSecondEntry({
              state:
                "stalled",
            }),

            createThirdEntry({
              state:
                "stalled",
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        const comparisonIds =
          analysis.comparisons.map(
            (
              comparison,
            ) =>
              comparison.id,
          );

        expect(
          new Set(
            comparisonIds,
          ).size,
        ).toBe(
          comparisonIds.length,
        );

        const signalIds =
          analysis.signals.map(
            (
              signal,
            ) =>
              signal.id,
          );

        expect(
          new Set(
            signalIds,
          ).size,
        ).toBe(
          signalIds.length,
        );
      },
    );

    it(
      "creates normalized long-term scores",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
            createThirdEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        Object.values(
          analysis.scores,
        ).forEach(
          (
            score,
          ) => {
            expect(
              score,
            ).toBeGreaterThanOrEqual(
              0,
            );

            expect(
              score,
            ).toBeLessThanOrEqual(
              1,
            );
          },
        );
      },
    );

    it(
      "creates non-empty reasoning",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          analysis.reasoning.length,
        ).toBeGreaterThan(
          0,
        );

        analysis.reasoning.forEach(
          (
            reasoning,
          ) => {
            expect(
              reasoning.trim().length,
            ).toBeGreaterThan(
              0,
            );
          },
        );
      },
    );

    it(
      "does not mutate the source Memory",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
            createThirdEntry(),
          ]);

        const memorySnapshot =
          structuredClone(
            memory,
          );

        analyzeMemory(
          memory,
        );

        expect(
          memory,
        ).toEqual(
          memorySnapshot,
        );
      },
    );

    it(
      "passes the public Memory Analysis validator",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
            createThirdEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        expect(
          () =>
            validateRecommendationEvolutionMemoryAnalysis({
              memory,
              analysis,
            }),
        ).not.toThrow();
      },
    );

    it(
      "rejects an invalid analyzedAt timestamp",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
          ]);

        expect(
          () =>
            analyzeRecommendationEvolutionMemory({
              memory,

              analyzedAt:
                "invalid-date",

              createComparisonId:
                () =>
                  "comparison-1",

              createSignalId:
                () =>
                  "signal-1",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects analyzedAt earlier than Memory updatedAt",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        expect(
          () =>
            analyzeRecommendationEvolutionMemory({
              memory,

              analyzedAt:
                "2026-07-27T01:00:00.000Z",

              createComparisonId:
                () =>
                  "comparison-1",

              createSignalId:
                () =>
                  "signal-1",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects a Memory Analysis with a mismatched memoryId",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        const invalidAnalysis:
          RecommendationEvolutionMemoryAnalysis = {
            ...analysis,

            memoryId:
              "different-memory-id",
          };

        expect(
          () =>
            validateRecommendationEvolutionMemoryAnalysis({
              memory,
              analysis:
                invalidAnalysis,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects duplicate Comparison IDs through the public validator",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        const firstComparison =
          analysis.comparisons[0];

        const secondComparison =
          analysis.comparisons[1];

        if (
          firstComparison ===
            undefined ||
          secondComparison ===
            undefined
        ) {
          throw new Error(
            "Analysis fixture must contain two Comparisons.",
          );
        }

        const invalidAnalysis:
          RecommendationEvolutionMemoryAnalysis = {
            ...analysis,

            comparisons: [
              firstComparison,
              {
                ...secondComparison,

                id:
                  firstComparison.id,
              },
            ],
          };

        expect(
          () =>
            validateRecommendationEvolutionMemoryAnalysis({
              memory,
              analysis:
                invalidAnalysis,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an invalid normalized long-term score",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        const invalidAnalysis:
          RecommendationEvolutionMemoryAnalysis = {
            ...analysis,

            scores: {
              ...analysis.scores,

              longTermStability:
                1.5,
            },
          };

        expect(
          () =>
            validateRecommendationEvolutionMemoryAnalysis({
              memory,
              analysis:
                invalidAnalysis,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an Analysis whose primary Signal is absent from signals",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              state:
                "stalled",
            }),

            createSecondEntry({
              state:
                "stalled",
            }),

            createThirdEntry({
              state:
                "stalled",
            }),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        if (
          analysis.primarySignalType ===
          null
        ) {
          return;
        }

        const invalidAnalysis:
          RecommendationEvolutionMemoryAnalysis = {
            ...analysis,

            signals:
              analysis.signals.filter(
                (
                  signal,
                ) =>
                  signal.type !==
                  analysis.primarySignalType,
              ),
        };

        expect(
          () =>
            validateRecommendationEvolutionMemoryAnalysis({
              memory,
              analysis:
                invalidAnalysis,
            }),
        ).toThrow();
      },
    );
  },
);