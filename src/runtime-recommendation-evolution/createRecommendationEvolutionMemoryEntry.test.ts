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
    createRecommendationEvolutionMemoryEntry,
    validateRecommendationEvolutionMemoryEntry,
} from "./createRecommendationEvolutionMemoryEntry";

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
    RecommendationEvolutionMemoryEntry,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Test Constants                                                     */
/* ------------------------------------------------------------------ */

const EVOLUTION_ANALYZED_AT =
  "2026-07-27T00:00:00.000Z";

const INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T03:00:00.000Z";

const RECORDED_AT =
  "2026-07-27T03:05:00.000Z";

const ENTRY_ID =
  "memory-entry-1";

/* ------------------------------------------------------------------ */
/* Evolution Fixtures                                                 */
/* ------------------------------------------------------------------ */

type StatisticsOverrides =
  Partial<
    RecommendationEvolutionResult["statistics"]
  >;

type SummaryOverrides =
  Partial<
    RecommendationEvolutionSummary
  >;

type CreateEvolutionOverrides = {
  statistics?:
    StatisticsOverrides;

  summary?:
    SummaryOverrides;

  dataQuality?:
    RecommendationEvolutionDataQuality;

  confidence?:
    RecommendationEvolutionConfidence;
};

function createEvolution(
  overrides:
    CreateEvolutionOverrides = {},
): RecommendationEvolutionResult {
  return {
    version:
      1,

    historyId:
      "history-1",

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

      ...overrides.statistics,
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

      ...overrides.summary,
    },

    dataQuality:
      overrides.dataQuality ??
      "sufficient",

    confidence:
      overrides.confidence ??
      "high",

    analyzedAt:
      EVOLUTION_ANALYZED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Intelligence Fixtures                                              */
/* ------------------------------------------------------------------ */

function createIntelligenceParams(
  evolution:
    RecommendationEvolutionResult,
): AnalyzeRecommendationEvolutionIntelligenceParams {
  return {
    evolution,

    analyzedAt:
      INTELLIGENCE_ANALYZED_AT,

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

function createIntelligence(
  evolution:
    RecommendationEvolutionResult =
      createEvolution(),
): RecommendationEvolutionIntelligenceResult {
  return analyzeRecommendationEvolutionIntelligence(
    createIntelligenceParams(
      evolution,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Memory Entry Fixture                                               */
/* ------------------------------------------------------------------ */

function createEntry(
  intelligence:
    RecommendationEvolutionIntelligenceResult =
      createIntelligence(),
): RecommendationEvolutionMemoryEntry {
  return createRecommendationEvolutionMemoryEntry({
    intelligence,

    recordedAt:
      RECORDED_AT,

    createEntryId:
      () =>
        ENTRY_ID,
  });
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "createRecommendationEvolutionMemoryEntry",
  () => {
    it(
      "creates a valid Memory Entry from an Intelligence Result",
      () => {
        const intelligence =
          createIntelligence();

        const entry =
          createEntry(
            intelligence,
          );

        expect(
          entry,
        ).toEqual({
          id:
            ENTRY_ID,

          intelligenceVersion:
            intelligence.version,

          historyId:
            intelligence.evolution.historyId,

          sourceEvolutionAnalyzedAt:
            intelligence.evolution.analyzedAt,

          intelligenceAnalyzedAt:
            intelligence.analyzedAt,

          state:
            intelligence.assessment.state,

          assessmentConfidence:
            intelligence.assessment.confidence,

          scores:
            intelligence.assessment.scores,

          primarySignalType:
            intelligence.assessment.primarySignalType,

          signalTypes:
            intelligence.signals.map(
              (
                signal,
              ) =>
                signal.type,
            ),

          strategyType:
            intelligence.strategy.type,

          strategyPriority:
            intelligence.strategy.priority,

          decisions:
            intelligence.strategy.decisions,

          enabledRuntimeDecisionTypes:
            intelligence.runtimeDecisions
              .filter(
                (
                  decision,
                ) =>
                  decision.enabled,
              )
              .map(
                (
                  decision,
                ) =>
                  decision.type,
              ),

          guidanceTone:
            intelligence.guidance.tone,

          warningCount:
            intelligence.guidance.warnings.length,

          observationCount:
            intelligence.guidance.observations.length,

          recordedAt:
            RECORDED_AT,
        });
      },
    );

    it(
      "uses the ID returned by createEntryId",
      () => {
        const createEntryId =
          vi.fn(
            () =>
              "generated-entry-id",
          );

        const entry =
          createRecommendationEvolutionMemoryEntry({
            intelligence:
              createIntelligence(),

            recordedAt:
              RECORDED_AT,

            createEntryId,
          });

        expect(
          createEntryId,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          entry.id,
        ).toBe(
          "generated-entry-id",
        );
      },
    );

    it(
      "preserves source and Intelligence timestamps separately",
      () => {
        const entry =
          createEntry();

        expect(
          entry.sourceEvolutionAnalyzedAt,
        ).toBe(
          EVOLUTION_ANALYZED_AT,
        );

        expect(
          entry.intelligenceAnalyzedAt,
        ).toBe(
          INTELLIGENCE_ANALYZED_AT,
        );

        expect(
          entry.recordedAt,
        ).toBe(
          RECORDED_AT,
        );
      },
    );

    it(
      "extracts all Intelligence Signal types in their original order",
      () => {
        const intelligence =
          createIntelligence(
            createEvolution({
              summary: {
                stability:
                  "highly-stable",

                drift:
                  "none",

                repeatPattern:
                  "none",

                dominantDirection:
                  "stable",

                latestDirection:
                  "stable",

                hasSufficientHistory:
                  true,
              },
            }),
          );

        const entry =
          createEntry(
            intelligence,
          );

        expect(
          entry.signalTypes,
        ).toEqual(
          intelligence.signals.map(
            (
              signal,
            ) =>
              signal.type,
          ),
        );

        expect(
          entry.primarySignalType,
        ).toBe(
          intelligence.assessment
            .primarySignalType,
        );
      },
    );

    it(
      "stores only enabled Runtime Decision types",
      () => {
        const intelligence =
          createIntelligence(
            createEvolution({
              statistics: {
                redirectedTransitionCount:
                  2,
              },

              summary: {
                stability:
                  "unstable",

                drift:
                  "high",

                repeatPattern:
                  "none",

                dominantType:
                  "redirected",

                dominantDirection:
                  "redirecting",

                latestType:
                  "redirected",

                latestDirection:
                  "redirecting",

                recommendationChanged:
                  true,

                hasMeaningfulEvolution:
                  true,
              },
            }),
          );

        const entry =
          createEntry(
            intelligence,
          );

        const expectedEnabledTypes =
          intelligence.runtimeDecisions
            .filter(
              (
                decision,
              ) =>
                decision.enabled,
            )
            .map(
              (
                decision,
              ) =>
                decision.type,
            );

        expect(
          entry.enabledRuntimeDecisionTypes,
        ).toEqual(
          expectedEnabledTypes,
        );

        expect(
          entry.enabledRuntimeDecisionTypes,
        ).toContain(
          "reduce-direction-changes",
        );
      },
    );

    it(
      "stores Guidance warning and observation counts",
      () => {
        const intelligence =
          createIntelligence(
            createEvolution({
              statistics: {
                repeatedTransitionCount:
                  2,

                repetitionRate:
                  1,

                completionRate:
                  0,
              },

              summary: {
                stability:
                  "stable",

                drift:
                  "none",

                repeatPattern:
                  "persistent",

                dominantType:
                  "repeated",

                dominantDirection:
                  "stable",

                latestType:
                  "repeated",

                latestDirection:
                  "stable",

                hasSufficientHistory:
                  true,
              },
            }),
          );

        const entry =
          createEntry(
            intelligence,
          );

        expect(
          intelligence.guidance.warnings
            .length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          entry.warningCount,
        ).toBe(
          intelligence.guidance.warnings
            .length,
        );

        expect(
          entry.observationCount,
        ).toBe(
          intelligence.guidance.observations
            .length,
        );
      },
    );

    it(
      "creates an advancing Memory Entry from completion momentum",
      () => {
        const intelligence =
          createIntelligence(
            createEvolution({
              statistics: {
                completedCount:
                  2,

                completionRate:
                  1,

                completionAdvanceCount:
                  2,
              },

              summary: {
                stability:
                  "developing",

                drift:
                  "none",

                repeatPattern:
                  "none",

                dominantType:
                  "completed-and-advanced",

                dominantDirection:
                  "advancing",

                latestType:
                  "completed-and-advanced",

                latestDirection:
                  "advancing",

                recommendationChanged:
                  true,

                hasMeaningfulEvolution:
                  true,
              },
            }),
          );

        const entry =
          createEntry(
            intelligence,
          );

        expect(
          entry.state,
        ).toBe(
          "advancing",
        );

        expect(
          entry.strategyType,
        ).toBe(
          "advance",
        );

        expect(
          entry.guidanceTone,
        ).toBe(
          "progressing",
        );

        expect(
          entry.enabledRuntimeDecisionTypes,
        ).toContain(
          "allow-new-recommendation",
        );
      },
    );

    it(
      "does not mutate the Intelligence Result",
      () => {
        const intelligence =
          createIntelligence(
            createEvolution({
              summary: {
                stability:
                  "highly-stable",

                drift:
                  "none",

                dominantDirection:
                  "stable",

                latestDirection:
                  "stable",
              },
            }),
          );

        const originalSignalTypes =
          intelligence.signals.map(
            (
              signal,
            ) =>
              signal.type,
          );

        const originalDecisionTypes =
          intelligence.runtimeDecisions.map(
            (
              decision,
            ) =>
              decision.type,
          );

        const originalScores = {
          ...intelligence.assessment.scores,
        };

        createEntry(
          intelligence,
        );

        expect(
          intelligence.signals.map(
            (
              signal,
            ) =>
              signal.type,
          ),
        ).toEqual(
          originalSignalTypes,
        );

        expect(
          intelligence.runtimeDecisions.map(
            (
              decision,
            ) =>
              decision.type,
          ),
        ).toEqual(
          originalDecisionTypes,
        );

        expect(
          intelligence.assessment.scores,
        ).toEqual(
          originalScores,
        );
      },
    );

    it(
      "returns independent arrays and nested objects for persistent Memory storage",
      () => {
        const intelligence =
          createIntelligence(
            createEvolution({
              summary: {
                stability:
                  "highly-stable",

                drift:
                  "none",

                dominantDirection:
                  "stable",

                latestDirection:
                  "stable",
              },
            }),
          );

        const entry =
          createEntry(
            intelligence,
          );

        expect(
          entry.signalTypes,
        ).not.toBe(
          intelligence.signalCollection
            .signalTypes,
        );

        expect(
          entry.enabledRuntimeDecisionTypes,
        ).not.toBe(
          intelligence.runtimeDecisionCollection
            .enabledDecisionIds,
        );

        expect(
          entry.scores,
        ).not.toBe(
          intelligence.assessment.scores,
        );

        expect(
          entry.decisions,
        ).not.toBe(
          intelligence.strategy.decisions,
        );
      },
    );

    it(
      "passes the public Memory Entry validator",
      () => {
        const entry =
          createEntry();

        expect(
          () =>
            validateRecommendationEvolutionMemoryEntry({
              entry,
            }),
        ).not.toThrow();
      },
    );

    it(
      "throws when createEntryId returns an empty string",
      () => {
        expect(
          () =>
            createRecommendationEvolutionMemoryEntry({
              intelligence:
                createIntelligence(),

              recordedAt:
                RECORDED_AT,

              createEntryId:
                () =>
                  " ",
            }),
        ).toThrow();
      },
    );

    it(
      "throws when recordedAt is invalid",
      () => {
        expect(
          () =>
            createRecommendationEvolutionMemoryEntry({
              intelligence:
                createIntelligence(),

              recordedAt:
                "invalid-date",

              createEntryId:
                () =>
                  ENTRY_ID,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects a Memory Entry whose recordedAt precedes the Intelligence analysis",
      () => {
        expect(
          () =>
            createRecommendationEvolutionMemoryEntry({
              intelligence:
                createIntelligence(),

              recordedAt:
                "2026-07-27T02:00:00.000Z",

              createEntryId:
                () =>
                  ENTRY_ID,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects duplicate Signal types through the public validator",
      () => {
        const entry =
          createEntry();

        const duplicateSignalType =
          "duplicate-test-signal" as
            RecommendationEvolutionIntelligenceSignalType;

        const invalidEntry:
          RecommendationEvolutionMemoryEntry = {
            ...entry,

            primarySignalType:
              duplicateSignalType,

            signalTypes: [
              duplicateSignalType,
              duplicateSignalType,
            ],
          };

        expect(
          () =>
            validateRecommendationEvolutionMemoryEntry({
              entry:
                invalidEntry,
            }),
        ).toThrow(
          "signalTypes must not contain duplicate values",
        );
      },
    );

    it(
      "rejects enabled Runtime Decision types that contain duplicates",
      () => {
        const entry =
          createEntry();

        const firstDecisionType =
          entry.enabledRuntimeDecisionTypes[
            0
          ];

        if (
          firstDecisionType ===
          undefined
        ) {
          throw new Error(
            "Test fixture must create at least one enabled Runtime Decision.",
          );
        }

        const invalidEntry:
          RecommendationEvolutionMemoryEntry = {
            ...entry,

            enabledRuntimeDecisionTypes: [
              firstDecisionType,
              firstDecisionType,
            ],
        };

        expect(
          () =>
            validateRecommendationEvolutionMemoryEntry({
              entry:
                invalidEntry,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an invalid normalized score",
      () => {
        const entry =
          createEntry();

        const invalidEntry:
          RecommendationEvolutionMemoryEntry = {
            ...entry,

            scores: {
              ...entry.scores,

              stability:
                1.5,
            },
        };

        expect(
          () =>
            validateRecommendationEvolutionMemoryEntry({
              entry:
                invalidEntry,
            }),
        ).toThrow();
      },
    );
  },
);