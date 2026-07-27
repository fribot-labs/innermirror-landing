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
    validateRecommendationEvolutionMemory,
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
    RecommendationEvolutionMemoryEntry,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Test Constants                                                     */
/* ------------------------------------------------------------------ */

const MEMORY_ID =
  "recommendation-memory-1";

const HISTORY_ID =
  "history-1";

const FIRST_EVOLUTION_ANALYZED_AT =
  "2026-07-27T03:00:00.000Z";

const FIRST_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T03:03:00.000Z";

const FIRST_RECORDED_AT =
  "2026-07-27T03:05:00.000Z";

const SECOND_EVOLUTION_ANALYZED_AT =
  "2026-07-27T04:00:00.000Z";

const SECOND_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T04:03:00.000Z";

const SECOND_RECORDED_AT =
  "2026-07-27T04:05:00.000Z";

const THIRD_EVOLUTION_ANALYZED_AT =
  "2026-07-27T05:00:00.000Z";

const THIRD_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T05:03:00.000Z";

const THIRD_RECORDED_AT =
  "2026-07-27T05:05:00.000Z";

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
        `signal-${index}-${type}`,

    createDecisionId:
      (
        type:
          RecommendationEvolutionRuntimeDecisionType,
        index:
          number,
      ) =>
        `decision-${index}-${type}`,

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

  return createRecommendationEvolutionMemoryEntry({
    intelligence,

    recordedAt:
      params.recordedAt,

    createEntryId:
      () =>
        params.id,
  });
}

function createFirstEntry():
  RecommendationEvolutionMemoryEntry {
  return createEntry({
    id:
      "entry-1",

    evolutionAnalyzedAt:
      FIRST_EVOLUTION_ANALYZED_AT,

    intelligenceAnalyzedAt:
      FIRST_INTELLIGENCE_ANALYZED_AT,

    recordedAt:
      FIRST_RECORDED_AT,
  });
}

function createSecondEntry(
  overrides:
    Partial<
      CreateEntryParams
    > = {},
): RecommendationEvolutionMemoryEntry {
  return createEntry({
    id:
      "entry-2",

    evolutionAnalyzedAt:
      SECOND_EVOLUTION_ANALYZED_AT,

    intelligenceAnalyzedAt:
      SECOND_INTELLIGENCE_ANALYZED_AT,

    recordedAt:
      SECOND_RECORDED_AT,

    ...overrides,
  });
}

function createThirdEntry():
  RecommendationEvolutionMemoryEntry {
  return createEntry({
    id:
      "entry-3",

    evolutionAnalyzedAt:
      THIRD_EVOLUTION_ANALYZED_AT,

    intelligenceAnalyzedAt:
      THIRD_INTELLIGENCE_ANALYZED_AT,

    recordedAt:
      THIRD_RECORDED_AT,
  });
}

/* ------------------------------------------------------------------ */
/* Memory Fixture                                                     */
/* ------------------------------------------------------------------ */

/**
 * Memory 구조를 테스트에서 수동으로 추측하지 않고,
 * 실제 append 함수를 통해 최초 Memory를 생성합니다.
 */
function createMemory(
  entry:
    RecommendationEvolutionMemoryEntry =
      createFirstEntry(),
): RecommendationEvolutionMemory {
  return appendRecommendationEvolutionMemory({
    memory:
      null,

    entry,

    memoryId:
      MEMORY_ID,

    updatedAt:
      entry.recordedAt,
  });
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "appendRecommendationEvolutionMemory",
  () => {
    it(
      "creates a new Memory when the existing Memory is null",
      () => {
        const entry =
          createFirstEntry();

        const memory =
          appendRecommendationEvolutionMemory({
            memory:
              null,

            entry,

            memoryId:
              MEMORY_ID,

            updatedAt:
              FIRST_RECORDED_AT,
          });

        expect(
          memory.id,
        ).toBe(
          MEMORY_ID,
        );

        expect(
          memory.historyId,
        ).toBe(
          HISTORY_ID,
        );

        expect(
          memory.entries,
        ).toHaveLength(
          1,
        );

        expect(
          memory.entries[0],
        ).toEqual(
          entry,
        );

        expect(
          memory.createdAt,
        ).toBe(
          FIRST_RECORDED_AT,
        );

        expect(
          memory.updatedAt,
        ).toBe(
          FIRST_RECORDED_AT,
        );
      },
    );

    it(
      "appends a new Entry to an existing Memory",
      () => {
        const firstEntry =
          createFirstEntry();

        const memory =
          createMemory(
            firstEntry,
          );

        const secondEntry =
          createSecondEntry({
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

        const updatedMemory =
          appendRecommendationEvolutionMemory({
            memory,

            entry:
              secondEntry,

            memoryId:
              MEMORY_ID,

            updatedAt:
              SECOND_RECORDED_AT,
          });

        expect(
          updatedMemory.entries,
        ).toHaveLength(
          2,
        );

        expect(
          updatedMemory.entries[0],
        ).toEqual(
          firstEntry,
        );

        expect(
          updatedMemory.entries[1],
        ).toEqual(
          secondEntry,
        );
      },
    );

    it(
      "preserves createdAt while updating updatedAt",
      () => {
        const memory =
          createMemory();

        const updatedMemory =
          appendRecommendationEvolutionMemory({
            memory,

            entry:
              createSecondEntry(),

            memoryId:
              MEMORY_ID,

            updatedAt:
              SECOND_RECORDED_AT,
          });

        expect(
          updatedMemory.createdAt,
        ).toBe(
          FIRST_RECORDED_AT,
        );

        expect(
          updatedMemory.updatedAt,
        ).toBe(
          SECOND_RECORDED_AT,
        );
      },
    );

    it(
      "preserves the Memory id and historyId",
      () => {
        const memory =
          createMemory();

        const updatedMemory =
          appendRecommendationEvolutionMemory({
            memory,

            entry:
              createSecondEntry(),

            memoryId:
              MEMORY_ID,

            updatedAt:
              SECOND_RECORDED_AT,
          });

        expect(
          updatedMemory.id,
        ).toBe(
          memory.id,
        );

        expect(
          updatedMemory.historyId,
        ).toBe(
          memory.historyId,
        );
      },
    );

    it(
      "does not mutate the existing Memory",
      () => {
        const memory =
          createMemory();

        const originalEntries = [
          ...memory.entries,
        ];

        const originalUpdatedAt =
          memory.updatedAt;

        const updatedMemory =
          appendRecommendationEvolutionMemory({
            memory,

            entry:
              createSecondEntry(),

            memoryId:
              MEMORY_ID,

            updatedAt:
              SECOND_RECORDED_AT,
          });

        expect(
          memory.entries,
        ).toEqual(
          originalEntries,
        );

        expect(
          memory.entries,
        ).toHaveLength(
          1,
        );

        expect(
          memory.updatedAt,
        ).toBe(
          originalUpdatedAt,
        );

        expect(
          updatedMemory,
        ).not.toBe(
          memory,
        );

        expect(
          updatedMemory.entries,
        ).not.toBe(
          memory.entries,
        );
      },
    );

    it(
      "stores an independent copy of the appended Entry",
      () => {
        const entry =
          createFirstEntry();

        const memory =
          appendRecommendationEvolutionMemory({
            memory:
              null,

            entry,

            memoryId:
              MEMORY_ID,

            updatedAt:
              FIRST_RECORDED_AT,
          });

        const storedEntry =
          memory.entries[0];

        expect(
          storedEntry,
        ).toEqual(
          entry,
        );

        expect(
          storedEntry,
        ).not.toBe(
          entry,
        );

        expect(
          storedEntry?.scores,
        ).not.toBe(
          entry.scores,
        );

        expect(
          storedEntry?.decisions,
        ).not.toBe(
          entry.decisions,
        );

        expect(
          storedEntry?.signalTypes,
        ).not.toBe(
          entry.signalTypes,
        );

        expect(
          storedEntry
            ?.enabledRuntimeDecisionTypes,
        ).not.toBe(
          entry.enabledRuntimeDecisionTypes,
        );
      },
    );

    it(
      "keeps Entries in chronological append order",
      () => {
        const firstMemory =
          createMemory(
            createFirstEntry(),
          );

        const secondMemory =
          appendRecommendationEvolutionMemory({
            memory:
              firstMemory,

            entry:
              createSecondEntry(),

            memoryId:
              MEMORY_ID,

            updatedAt:
              SECOND_RECORDED_AT,
          });

        const thirdMemory =
          appendRecommendationEvolutionMemory({
            memory:
              secondMemory,

            entry:
              createThirdEntry(),

            memoryId:
              MEMORY_ID,

            updatedAt:
              THIRD_RECORDED_AT,
          });

        expect(
          thirdMemory.entries.map(
            (
              entry,
            ) =>
              entry.id,
          ),
        ).toEqual([
          "entry-1",
          "entry-2",
          "entry-3",
        ]);
      },
    );

    it(
      "passes the public Memory validator",
      () => {
        const memory =
          createMemory();

        expect(
          () =>
            validateRecommendationEvolutionMemory({
              memory,
            }),
        ).not.toThrow();
      },
    );

    it(
      "rejects a duplicate Entry id",
      () => {
        const memory =
          createMemory();

        const duplicateEntry =
          createSecondEntry({
            id:
              "entry-1",
          });

        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory,

              entry:
                duplicateEntry,

              memoryId:
                MEMORY_ID,

              updatedAt:
                SECOND_RECORDED_AT,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects a duplicate intelligenceAnalyzedAt timestamp",
      () => {
        const memory =
          createMemory();

        const duplicateAnalysisEntry =
          createSecondEntry({
            evolutionAnalyzedAt:
              FIRST_EVOLUTION_ANALYZED_AT,

            intelligenceAnalyzedAt:
              FIRST_INTELLIGENCE_ANALYZED_AT,
          });

        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory,

              entry:
                duplicateAnalysisEntry,

              memoryId:
                MEMORY_ID,

              updatedAt:
                SECOND_RECORDED_AT,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an Entry from a different history",
      () => {
        const memory =
          createMemory();

        const differentHistoryEntry =
          createSecondEntry({
            historyId:
              "history-2",
          });

        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory,

              entry:
                differentHistoryEntry,

              memoryId:
                MEMORY_ID,

              updatedAt:
                SECOND_RECORDED_AT,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects a memoryId that differs from the existing Memory id",
      () => {
        const memory =
          createMemory();

        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory,

              entry:
                createSecondEntry(),

              memoryId:
                "different-memory-id",

              updatedAt:
                SECOND_RECORDED_AT,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an Entry recorded before the latest Memory Entry",
      () => {
        const memory =
          createMemory();

        const earlierEntry =
          createEntry({
            id:
              "entry-2",

            evolutionAnalyzedAt:
              "2026-07-27T02:00:00.000Z",

            intelligenceAnalyzedAt:
              "2026-07-27T02:03:00.000Z",

            recordedAt:
              "2026-07-27T02:05:00.000Z",
          });

        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory,

              entry:
                earlierEntry,

              memoryId:
                MEMORY_ID,

              updatedAt:
                SECOND_RECORDED_AT,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects updatedAt earlier than the existing Memory updatedAt",
      () => {
        const memory =
          createMemory();

        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory,

              entry:
                createSecondEntry(),

              memoryId:
                MEMORY_ID,

              updatedAt:
                "2026-07-27T02:00:00.000Z",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects updatedAt earlier than the appended Entry recordedAt",
      () => {
        const memory =
          createMemory();

        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory,

              entry:
                createSecondEntry(),

              memoryId:
                MEMORY_ID,

              updatedAt:
                "2026-07-27T04:04:00.000Z",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an invalid updatedAt timestamp",
      () => {
        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory:
                null,

              entry:
                createFirstEntry(),

              memoryId:
                MEMORY_ID,

              updatedAt:
                "invalid-date",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an empty memoryId",
      () => {
        expect(
          () =>
            appendRecommendationEvolutionMemory({
              memory:
                null,

              entry:
                createFirstEntry(),

              memoryId:
                " ",

              updatedAt:
                FIRST_RECORDED_AT,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an invalid existing Memory through the public validator",
      () => {
        const memory =
          createMemory();

        const firstEntry =
          memory.entries[0];

        if (
          firstEntry ===
          undefined
        ) {
          throw new Error(
            "Memory fixture must contain one Entry.",
          );
        }

        const invalidMemory:
          RecommendationEvolutionMemory = {
            ...memory,

            entries: [
              firstEntry,
              firstEntry,
            ],
          };

        expect(
          () =>
            validateRecommendationEvolutionMemory({
              memory:
                invalidMemory,
            }),
        ).toThrow();
      },
    );
  },
);