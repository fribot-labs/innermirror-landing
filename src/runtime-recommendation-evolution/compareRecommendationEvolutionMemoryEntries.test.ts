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
    compareRecommendationEvolutionMemoryEntries,
    validateRecommendationEvolutionMemoryComparison,
} from "./compareRecommendationEvolutionMemoryEntries";

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
    RecommendationEvolutionMemoryComparison,
    RecommendationEvolutionMemoryEntry,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Test Constants                                                     */
/* ------------------------------------------------------------------ */

const HISTORY_ID =
  "history-1";

const PREVIOUS_EVOLUTION_ANALYZED_AT =
  "2026-07-27T03:00:00.000Z";

const PREVIOUS_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T03:03:00.000Z";

const PREVIOUS_RECORDED_AT =
  "2026-07-27T03:05:00.000Z";

const CURRENT_EVOLUTION_ANALYZED_AT =
  "2026-07-27T04:00:00.000Z";

const CURRENT_INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T04:03:00.000Z";

const CURRENT_RECORDED_AT =
  "2026-07-27T04:05:00.000Z";

const COMPARED_AT =
  "2026-07-27T04:10:00.000Z";

const COMPARISON_ID =
  "memory-comparison-1";

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

function createGeneratedEntry(
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

function createPreviousEntry():
  RecommendationEvolutionMemoryEntry {
  return createGeneratedEntry({
    id:
      "entry-1",

    evolutionAnalyzedAt:
      PREVIOUS_EVOLUTION_ANALYZED_AT,

    intelligenceAnalyzedAt:
      PREVIOUS_INTELLIGENCE_ANALYZED_AT,

    recordedAt:
      PREVIOUS_RECORDED_AT,
  });
}

/**
 * 유효한 실제 Entry를 먼저 생성한 뒤 필요한 비교 필드만
 * 변경합니다.
 *
 * decisions의 실제 타입 구조를 테스트가 재정의하지 않으므로
 * Strategy 계약 변경에도 비교적 안전합니다.
 */
function createCurrentEntry(
  overrides:
    Partial<
      RecommendationEvolutionMemoryEntry
    > = {},
): RecommendationEvolutionMemoryEntry {
  const generatedEntry =
    createGeneratedEntry({
      id:
        "entry-2",

      evolutionAnalyzedAt:
        CURRENT_EVOLUTION_ANALYZED_AT,

      intelligenceAnalyzedAt:
        CURRENT_INTELLIGENCE_ANALYZED_AT,

      recordedAt:
        CURRENT_RECORDED_AT,
    });

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

function createEquivalentCurrentEntry(
  previous:
    RecommendationEvolutionMemoryEntry,
): RecommendationEvolutionMemoryEntry {
  return {
    ...previous,

    id:
      "entry-2",

    sourceEvolutionAnalyzedAt:
      CURRENT_EVOLUTION_ANALYZED_AT,

    intelligenceAnalyzedAt:
      CURRENT_INTELLIGENCE_ANALYZED_AT,

    scores: {
      ...previous.scores,
    },

    decisions: {
      ...previous.decisions,
    },

    signalTypes: [
      ...previous.signalTypes,
    ],

    enabledRuntimeDecisionTypes: [
      ...previous.enabledRuntimeDecisionTypes,
    ],

    recordedAt:
      CURRENT_RECORDED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Comparison Fixture                                                 */
/* ------------------------------------------------------------------ */

function compareEntries(
  previous:
    RecommendationEvolutionMemoryEntry | null,
  current:
    RecommendationEvolutionMemoryEntry,
): RecommendationEvolutionMemoryComparison {
  return compareRecommendationEvolutionMemoryEntries({
    previous,
    current,

    comparedAt:
      COMPARED_AT,

    createComparisonId:
      () =>
        COMPARISON_ID,
  });
}

function getSignalTypes(
  comparison:
    RecommendationEvolutionMemoryComparison,
): string[] {
  return comparison.signals.map(
    (
      signal,
    ) =>
      signal.type,
  );
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "compareRecommendationEvolutionMemoryEntries",
  () => {
    it(
      "creates an initial Comparison when previous Entry is null",
      () => {
        const current =
          createCurrentEntry();

        const comparison =
          compareEntries(
            null,
            current,
          );

        expect(
          comparison.id,
        ).toBe(
          COMPARISON_ID,
        );

        expect(
          comparison.previous,
        ).toBeNull();

        expect(
          comparison.current,
        ).toEqual(
          current,
        );

        expect(
          comparison.type,
        ).toBe(
          "initial",
        );

        expect(
          comparison.stateChanged,
        ).toBe(
          false,
        );

        expect(
          comparison.strategyChanged,
        ).toBe(
          false,
        );

        expect(
          comparison.confidenceChanged,
        ).toBe(
          false,
        );

        expect(
          comparison.primarySignalChanged,
        ).toBe(
          false,
        );

        expect(
          comparison.scoreChanges,
        ).toEqual({
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
        });

        expect(
          comparison.decisionChanges.newlyEnabled,
        ).toEqual(
          current.enabledRuntimeDecisionTypes,
        );

        expect(
          comparison.decisionChanges.newlyDisabled,
        ).toEqual(
          [],
        );

        expect(
          comparison.decisionChanges.unchangedEnabled,
        ).toEqual(
          [],
        );

        expect(
          comparison.comparedAt,
        ).toBe(
          COMPARED_AT,
        );
      },
    );

    it(
      "uses the ID returned by createComparisonId",
      () => {
        const createComparisonId =
          vi.fn(
            () =>
              "generated-comparison-id",
          );

        const comparison =
          compareRecommendationEvolutionMemoryEntries({
            previous:
              null,

            current:
              createCurrentEntry(),

            comparedAt:
              COMPARED_AT,

            createComparisonId,
          });

        expect(
          createComparisonId,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          comparison.id,
        ).toBe(
          "generated-comparison-id",
        );
      },
    );

    it(
      "creates an unchanged Comparison for equivalent Entries",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.type,
        ).toBe(
          "unchanged",
        );

        expect(
          comparison.stateChanged,
        ).toBe(
          false,
        );

        expect(
          comparison.strategyChanged,
        ).toBe(
          false,
        );

        expect(
          comparison.confidenceChanged,
        ).toBe(
          false,
        );

        expect(
          comparison.primarySignalChanged,
        ).toBe(
          false,
        );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).toContain(
          "state-unchanged",
        );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).toContain(
          "strategy-unchanged",
        );
      },
    );

    it(
      "calculates all score changes as current minus previous",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.scores = {
          stability:
            previous.scores.stability +
            0.1,

          progress:
            previous.scores.progress +
            0.2,

          repetitionRisk:
            previous.scores.repetitionRisk +
            0.15,

          redirectionRisk:
            Math.max(
              0,
              previous.scores.redirectionRisk -
                0.05,
            ),

          completionMomentum:
            previous.scores.completionMomentum +
            0.25,
        };

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.scoreChanges.stability,
        ).toBeCloseTo(
          0.1,
        );

        expect(
          comparison.scoreChanges.progress,
        ).toBeCloseTo(
          0.2,
        );

        expect(
          comparison.scoreChanges.repetitionRisk,
        ).toBeCloseTo(
          0.15,
        );

        expect(
          comparison.scoreChanges.redirectionRisk,
        ).toBeCloseTo(
          -0.05,
        );

        expect(
          comparison.scoreChanges.completionMomentum,
        ).toBeCloseTo(
          0.25,
        );
      },
    );

    it(
      "detects a state change",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.state =
          "advancing";

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.stateChanged,
        ).toBe(
          true,
        );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).toContain(
          "state-changed",
        );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).not.toContain(
          "state-unchanged",
        );
      },
    );

    it(
      "detects a strategy change",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.strategyType =
          previous.strategyType ===
          "advance"
            ? "maintain"
            : "advance";

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.strategyChanged,
        ).toBe(
          true,
        );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).toContain(
          "strategy-changed",
        );
      },
    );

    it(
      "classifies an isolated strategy change as strategy-shifted",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.strategyType =
          previous.strategyType ===
          "advance"
            ? "maintain"
            : "advance";

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.type,
        ).toBe(
          "strategy-shifted",
        );
      },
    );

    it(
      "detects improved assessment confidence",
      () => {
        const previous =
          createPreviousEntry();

        previous.assessmentConfidence =
          "low";

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.assessmentConfidence =
          "high";

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.confidenceChanged,
        ).toBe(
          true,
        );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).toContain(
          "confidence-increased",
        );

        expect(
          comparison.type,
        ).toBe(
          "confidence-improved",
        );
      },
    );

    it(
      "detects declined assessment confidence",
      () => {
        const previous =
          createPreviousEntry();

        previous.assessmentConfidence =
          "high";

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.assessmentConfidence =
          "low";

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.confidenceChanged,
        ).toBe(
          true,
        );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).toContain(
          "confidence-decreased",
        );

        expect(
          comparison.type,
        ).toBe(
          "confidence-declined",
        );
      },
    );

    it(
      "detects a primary Signal change",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        const signalType =
          "insufficient-history" as
            RecommendationEvolutionIntelligenceSignalType;

        current.primarySignalType =
          signalType;

        current.signalTypes = [
          signalType,
        ];

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.primarySignalChanged,
        ).toBe(
          true,
        );
      },
    );

    it(
      "calculates enabled Runtime Decision changes",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        const firstDecision =
          "allow-new-recommendation" as
            RecommendationEvolutionRuntimeDecisionType;

        const sharedDecision =
          "reduce-direction-changes" as
            RecommendationEvolutionRuntimeDecisionType;

        const newDecision =
          "maintain-current-recommendation" as
            RecommendationEvolutionRuntimeDecisionType;

        previous.enabledRuntimeDecisionTypes = [
          firstDecision,
          sharedDecision,
        ];

        current.enabledRuntimeDecisionTypes = [
          sharedDecision,
          newDecision,
        ];

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.decisionChanges,
        ).toEqual({
          newlyEnabled: [
            newDecision,
          ],

          newlyDisabled: [
            firstDecision,
          ],

          unchangedEnabled: [
            sharedDecision,
          ],
        });
      },
    );

    it(
      "creates score increase and decrease Signals",
      () => {
        const previous =
          createPreviousEntry();

        previous.scores = {
          stability:
            0.4,

          progress:
            0.7,

          repetitionRisk:
            0.2,

          redirectionRisk:
            0.6,

          completionMomentum:
            0.3,
        };

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.scores = {
          stability:
            0.7,

          progress:
            0.4,

          repetitionRisk:
            0.5,

          redirectionRisk:
            0.2,

          completionMomentum:
            0.8,
        };

        const comparison =
          compareEntries(
            previous,
            current,
          );

        const signalTypes =
          getSignalTypes(
            comparison,
          );

        expect(
          signalTypes,
        ).toContain(
          "stability-increased",
        );

        expect(
          signalTypes,
        ).toContain(
          "progress-decreased",
        );

        expect(
          signalTypes,
        ).toContain(
          "repetition-risk-increased",
        );

        expect(
          signalTypes,
        ).toContain(
          "redirection-risk-decreased",
        );

        expect(
          signalTypes,
        ).toContain(
          "completion-momentum-increased",
        );
      },
    );

    it(
      "detects new warning pressure",
      () => {
        const previous =
          createPreviousEntry();

        previous.warningCount =
          0;

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.warningCount =
          2;

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).toContain(
          "new-warning-pressure",
        );
      },
    );

    it(
      "detects reduced warning pressure",
      () => {
        const previous =
          createPreviousEntry();

        previous.warningCount =
          3;

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.warningCount =
          1;

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          getSignalTypes(
            comparison,
          ),
        ).toContain(
          "warning-pressure-reduced",
        );
      },
    );

    it(
      "does not mutate previous or current Entry",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        const previousSnapshot =
          structuredClone(
            previous,
          );

        const currentSnapshot =
          structuredClone(
            current,
          );

        compareEntries(
          previous,
          current,
        );

        expect(
          previous,
        ).toEqual(
          previousSnapshot,
        );

        expect(
          current,
        ).toEqual(
          currentSnapshot,
        );
      },
    );

    it(
      "stores independent Entry copies in the Comparison",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          comparison.previous,
        ).not.toBe(
          previous,
        );

        expect(
          comparison.current,
        ).not.toBe(
          current,
        );

        expect(
          comparison.previous?.scores,
        ).not.toBe(
          previous.scores,
        );

        expect(
          comparison.current.scores,
        ).not.toBe(
          current.scores,
        );

        expect(
          comparison.signals,
        ).not.toBe(
          current.signalTypes,
        );
      },
    );

    it(
      "passes the public Comparison validator",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        const comparison =
          compareEntries(
            previous,
            current,
          );

        expect(
          () =>
            validateRecommendationEvolutionMemoryComparison({
              comparison,
            }),
        ).not.toThrow();
      },
    );

    it(
      "rejects an empty Comparison ID",
      () => {
        expect(
          () =>
            compareRecommendationEvolutionMemoryEntries({
              previous:
                null,

              current:
                createCurrentEntry(),

              comparedAt:
                COMPARED_AT,

              createComparisonId:
                () =>
                  " ",
            }),
        ).toThrow();
      },
    );

    it(
      "rejects an invalid comparedAt timestamp",
      () => {
        expect(
          () =>
            compareRecommendationEvolutionMemoryEntries({
              previous:
                null,

              current:
                createCurrentEntry(),

              comparedAt:
                "invalid-date",

              createComparisonId:
                () =>
                  COMPARISON_ID,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects comparedAt earlier than the current Entry",
      () => {
        expect(
          () =>
            compareRecommendationEvolutionMemoryEntries({
              previous:
                createPreviousEntry(),

              current:
                createCurrentEntry(),

              comparedAt:
                "2026-07-27T04:00:00.000Z",

              createComparisonId:
                () =>
                  COMPARISON_ID,
            }),
        ).toThrow();
      },
    );

    it(
      "rejects Entries from different histories",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createCurrentEntry({
            historyId:
              "history-2",
          });

        expect(
          () =>
            compareEntries(
              previous,
              current,
            ),
        ).toThrow();
      },
    );

    it(
      "rejects a current Entry that is not later than previous",
      () => {
        const previous =
          createPreviousEntry();

        const current =
          createEquivalentCurrentEntry(
            previous,
          );

        current.intelligenceAnalyzedAt =
          previous.intelligenceAnalyzedAt;

        expect(
          () =>
            compareEntries(
              previous,
              current,
            ),
        ).toThrow();
      },
    );
  },
);