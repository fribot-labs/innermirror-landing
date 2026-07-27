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
} from "./analyzeRecommendationEvolutionMemory";

import {
    appendRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    createRecommendationEvolutionMemoryEntry,
} from "./createRecommendationEvolutionMemoryEntry";

import {
    createRecommendationEvolutionMemoryPresentation,
    validateRecommendationEvolutionMemoryPresentation,
} from "./createRecommendationEvolutionMemoryPresentation";

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
    RecommendationEvolutionMemoryPresentation,
    RecommendationEvolutionMemorySignal,
    RecommendationEvolutionMemorySignalType,
    RecommendationEvolutionMemoryState,
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

const PRESENTATION_CREATED_AT =
  "2026-07-27T06:05:00.000Z";

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

/* ------------------------------------------------------------------ */
/* Analysis Override Fixture                                          */
/* ------------------------------------------------------------------ */

type CreateAnalysisOverrides = {
  state?:
    RecommendationEvolutionMemoryState;

  signals?:
    RecommendationEvolutionMemorySignal[];

  primarySignalType?:
    RecommendationEvolutionMemorySignalType | null;

  longTermStability?:
    number;

  longTermProgress?:
    number;

  longTermRisk?:
    number;

  recovery?:
    number;
};

function createAnalysisWithOverrides(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
  overrides:
    CreateAnalysisOverrides,
): RecommendationEvolutionMemoryAnalysis {
  return {
    ...analysis,

    state:
      overrides.state ??
      analysis.state,

    scores: {
      ...analysis.scores,

      longTermStability:
        overrides.longTermStability ??
        analysis.scores.longTermStability,

      longTermProgress:
        overrides.longTermProgress ??
        analysis.scores.longTermProgress,

      longTermRisk:
        overrides.longTermRisk ??
        analysis.scores.longTermRisk,

      recovery:
        overrides.recovery ??
        analysis.scores.recovery,
    },

    signals:
      overrides.signals ===
      undefined
        ? analysis.signals.map(
            (
              signal,
            ) => ({
              ...signal,

              relatedEntryIds: [
                ...signal.relatedEntryIds,
              ],

              relatedComparisonIds: [
                ...signal.relatedComparisonIds,
              ],
            }),
          )
        : overrides.signals.map(
            (
              signal,
            ) => ({
              ...signal,

              relatedEntryIds: [
                ...signal.relatedEntryIds,
              ],

              relatedComparisonIds: [
                ...signal.relatedComparisonIds,
              ],
            }),
          ),

    primarySignalType:
      overrides.primarySignalType ===
      undefined
        ? analysis.primarySignalType
        : overrides.primarySignalType,
  };
}

/* ------------------------------------------------------------------ */
/* Signal Fixture                                                     */
/* ------------------------------------------------------------------ */

function createMemorySignal(
  type:
    RecommendationEvolutionMemorySignalType,
  description:
    string,
): RecommendationEvolutionMemorySignal {
  return {
    id:
      `signal-${type}`,

    type,

    severity:
      "moderate",

    confidence:
      "high",

    score:
      0.8,

    description,

    relatedEntryIds: [
      "entry-1",
      "entry-2",
    ],

    relatedComparisonIds: [
      "memory-comparison-1",
    ],

    detectedAt:
      ANALYZED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Presentation Fixture                                               */
/* ------------------------------------------------------------------ */

function createPresentation(
  memory:
    RecommendationEvolutionMemory,
  analysis:
    RecommendationEvolutionMemoryAnalysis,
  createdAt:
    string =
      PRESENTATION_CREATED_AT,
): RecommendationEvolutionMemoryPresentation {
  return createRecommendationEvolutionMemoryPresentation({
    memory,
    analysis,
    createdAt,
  });
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "createRecommendationEvolutionMemoryPresentation",
  () => {
    it(
      "creates an unavailable Presentation for empty Memory",
      () => {
        const memory =
          createMemory(
            [],
          );

        const analysis =
          analyzeMemory(
            memory,
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          analysis.state,
        ).toBe(
          "unavailable",
        );

        expect(
          presentation.tone,
        ).toBe(
          "unavailable",
        );

        expect(
          presentation.latestChange,
        ).toBeNull();

        expect(
          presentation.longTermObservation,
        ).toBeNull();

        expect(
          presentation.createdAt,
        ).toBe(
          PRESENTATION_CREATED_AT,
        );
      },
    );

    it(
      "creates a neutral Presentation for insufficient Memory",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          analysis.state,
        ).toBe(
          "insufficient",
        );

        expect(
          presentation.tone,
        ).toBe(
          "neutral",
        );

        expect(
          presentation.latestChange,
        ).toBeNull();

        expect(
          presentation.longTermObservation,
        ).not.toBeNull();
      },
    );

    it(
      "creates non-empty main Presentation text",
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

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.headline.trim().length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          presentation.summary.trim().length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          presentation.trendDescription.trim().length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "creates latestChange when a non-initial Comparison exists",
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

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          analysis.comparisons,
        ).toHaveLength(
          2,
        );

        expect(
          analysis.comparisons[1]?.previous,
        ).not.toBeNull();

        expect(
          presentation.latestChange,
        ).not.toBeNull();

        expect(
          presentation.latestChange?.trim().length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "creates stable tone for stable Memory Analysis",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              state:
                "stable",
            }),

            createSecondEntry({
              state:
                "stable",
            }),

            createThirdEntry({
              state:
                "stable",
            }),
          ]);

        const baseAnalysis =
          analyzeMemory(
            memory,
          );

        const analysis =
          createAnalysisWithOverrides(
            baseAnalysis,
            {
              state:
                "stable",

              longTermStability:
                0.9,

              longTermRisk:
                0.1,
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.tone,
        ).toBe(
          "stable",
        );

        expect(
          presentation.longTermObservation,
        ).not.toBeNull();
      },
    );

    it(
      "creates progressing tone for improving Memory Analysis",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const baseAnalysis =
          analyzeMemory(
            memory,
          );

        const analysis =
          createAnalysisWithOverrides(
            baseAnalysis,
            {
              state:
                "improving",

              longTermProgress:
                0.8,

              longTermRisk:
                0.2,
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.tone,
        ).toBe(
          "progressing",
        );

        expect(
          presentation.longTermObservation,
        ).not.toBeNull();
      },
    );

    it(
      "creates progressing tone for advancing Memory Analysis",
      () => {
        const memory =
          createMemory([
            createFirstEntry({
              state:
                "advancing",
            }),

            createSecondEntry({
              state:
                "advancing",
            }),
          ]);

        const baseAnalysis =
          analyzeMemory(
            memory,
          );

        const analysis =
          createAnalysisWithOverrides(
            baseAnalysis,
            {
              state:
                "advancing",

              longTermProgress:
                0.9,
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.tone,
        ).toBe(
          "progressing",
        );

        expect(
          presentation.longTermObservation,
        ).not.toBeNull();
      },
    );

    it(
      "creates attention tone and warning for regressing Memory Analysis",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const baseAnalysis =
          analyzeMemory(
            memory,
          );

        const analysis =
          createAnalysisWithOverrides(
            baseAnalysis,
            {
              state:
                "regressing",

              longTermProgress:
                0.2,

              longTermRisk:
                0.9,
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.tone,
        ).toBe(
          "attention",
        );

        expect(
          presentation.warnings.length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "creates recovering tone for recovering Memory Analysis",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const baseAnalysis =
          analyzeMemory(
            memory,
          );

        const analysis =
          createAnalysisWithOverrides(
            baseAnalysis,
            {
              state:
                "recovering",

              recovery:
                0.8,

              longTermRisk:
                0.3,
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.tone,
        ).toBe(
          "recovering",
        );

        expect(
          presentation.longTermObservation,
        ).not.toBeNull();
      },
    );

    it(
      "creates warning text from warning Memory Signals",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
            createThirdEntry(),
          ]);

        const baseAnalysis =
          analyzeMemory(
            memory,
          );

        const warningSignal =
          createMemorySignal(
            "persistent-stall",
            "The stalled condition has persisted across recent analyses.",
          );

        const analysis =
          createAnalysisWithOverrides(
            baseAnalysis,
            {
              state:
                "stagnant",

              signals: [
                warningSignal,
              ],

              primarySignalType:
                "persistent-stall",

              longTermRisk:
                0.8,
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.tone,
        ).toBe(
          "attention",
        );

        expect(
          presentation.warnings.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          presentation.warnings.some(
            (
              warning,
            ) =>
              warning
                .toLowerCase()
                .includes(
                  "stalled",
                ),
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "includes Memory entry count and resolved state in evidence",
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

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.evidence,
        ).toContain(
          "2 memory entries were included in the presentation.",
        );

        expect(
          presentation.evidence,
        ).toContain(
          `The resolved long-term memory state is ${analysis.state}.`,
        );
      },
    );

    it(
      "includes Memory Signal descriptions in evidence",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const baseAnalysis =
          analyzeMemory(
            memory,
          );

        const description =
          "Long-term progress has continued across recent analyses.";

        const signal =
          createMemorySignal(
            "long-term-progression",
            description,
          );

        const analysis =
          createAnalysisWithOverrides(
            baseAnalysis,
            {
              state:
                "improving",

              signals: [
                signal,
              ],

              primarySignalType:
                "long-term-progression",
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.evidence,
        ).toContain(
          description,
        );
      },
    );

    it(
      "creates unique warning and evidence strings",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
            createThirdEntry(),
          ]);

        const baseAnalysis =
          analyzeMemory(
            memory,
          );

        const signal =
          createMemorySignal(
            "risk-accumulation",
            "Long-term risk is accumulating.",
          );

        const analysis =
          createAnalysisWithOverrides(
            baseAnalysis,
            {
              state:
                "regressing",

              signals: [
                signal,
              ],

              primarySignalType:
                "risk-accumulation",

              longTermRisk:
                0.9,
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          new Set(
            presentation.warnings,
          ).size,
        ).toBe(
          presentation.warnings.length,
        );

        expect(
          new Set(
            presentation.evidence,
          ).size,
        ).toBe(
          presentation.evidence.length,
        );
      },
    );

    it(
      "does not mutate Memory or Analysis",
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

        const memorySnapshot =
          structuredClone(
            memory,
          );

        const analysisSnapshot =
          structuredClone(
            analysis,
          );

        createPresentation(
          memory,
          analysis,
        );

        expect(
          memory,
        ).toEqual(
          memorySnapshot,
        );

        expect(
          analysis,
        ).toEqual(
          analysisSnapshot,
        );
      },
    );

    it(
      "returns independent warning and evidence arrays",
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

        const firstPresentation =
          createPresentation(
            memory,
            analysis,
          );

        const secondPresentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          firstPresentation.warnings,
        ).not.toBe(
          secondPresentation.warnings,
        );

        expect(
          firstPresentation.evidence,
        ).not.toBe(
          secondPresentation.evidence,
        );
      },
    );

    it(
      "passes the public Presentation validator",
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

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          () =>
            validateRecommendationEvolutionMemoryPresentation({
              memory,
              analysis,
              presentation,
            }),
        ).not.toThrow();
      },
    );

    it(
      "rejects an invalid createdAt timestamp",
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
          () =>
            createPresentation(
              memory,
              analysis,
              "invalid-date",
            ),
        ).toThrow();
      },
    );

    it(
      "rejects createdAt earlier than Analysis analyzedAt",
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
          () =>
            createPresentation(
              memory,
              analysis,
              "2026-07-27T05:00:00.000Z",
            ),
        ).toThrow();
      },
    );

    it(
      "rejects a Presentation with a tone inconsistent with Analysis state",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
            createSecondEntry(),
          ]);

        const analysis =
          createAnalysisWithOverrides(
            analyzeMemory(
              memory,
            ),
            {
              state:
                "stable",
            },
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        const invalidPresentation:
          RecommendationEvolutionMemoryPresentation = {
            ...presentation,

            tone:
              "attention",
          };

        expect(
          () =>
            validateRecommendationEvolutionMemoryPresentation({
              memory,
              analysis,
              presentation:
                invalidPresentation,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects a Presentation without required entry-count evidence",
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

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        const entryCountEvidence =
          `${memory.entries.length} memory entries were included in the presentation.`;

        const invalidPresentation:
          RecommendationEvolutionMemoryPresentation = {
            ...presentation,

            evidence:
              presentation.evidence.filter(
                (
                  evidence,
                ) =>
                  evidence !==
                  entryCountEvidence,
              ),
        };

        expect(
          () =>
            validateRecommendationEvolutionMemoryPresentation({
              memory,
              analysis,
              presentation:
                invalidPresentation,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects duplicate evidence strings",
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

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        const firstEvidence =
          presentation.evidence[0];

        if (
          firstEvidence ===
          undefined
        ) {
          throw new Error(
            "Presentation fixture must contain evidence.",
          );
        }

        const invalidPresentation:
          RecommendationEvolutionMemoryPresentation = {
            ...presentation,

            evidence: [
              firstEvidence,
              firstEvidence,
            ],
        };

        expect(
          () =>
            validateRecommendationEvolutionMemoryPresentation({
              memory,
              analysis,
              presentation:
                invalidPresentation,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects latestChange when no non-initial Comparison exists",
      () => {
        const memory =
          createMemory([
            createFirstEntry(),
          ]);

        const analysis =
          analyzeMemory(
            memory,
          );

        const presentation =
          createPresentation(
            memory,
            analysis,
          );

        expect(
          presentation.latestChange,
        ).toBeNull();

        const invalidPresentation:
          RecommendationEvolutionMemoryPresentation = {
            ...presentation,

            latestChange:
              "A change was detected.",
        };

        expect(
          () =>
            validateRecommendationEvolutionMemoryPresentation({
              memory,
              analysis,
              presentation:
                invalidPresentation,
            }),
        ).toThrow();
      },
    );
  },
);