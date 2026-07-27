import {
    describe,
    expect,
    it,
} from "vitest";

import {
    analyzeRecommendationEvolutionIntelligence,
} from "./analyzeRecommendationEvolutionIntelligence";

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

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

const EVOLUTION_ANALYZED_AT =
  "2026-07-27T00:00:00.000Z";

const INTELLIGENCE_ANALYZED_AT =
  "2026-07-27T03:00:00.000Z";

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

function createParams(
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

function analyze(
  evolution:
    RecommendationEvolutionResult,
) {
  return analyzeRecommendationEvolutionIntelligence(
    createParams(
      evolution,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "analyzeRecommendationEvolutionIntelligence",
  () => {
    it(
      "runs the complete unavailable pipeline for empty evolution history",
      () => {
        const result =
          analyze(
            createEvolution({
              statistics: {
                totalRecommendationCount:
                  0,

                comparableRecommendationCount:
                  0,

                transitionCount:
                  0,
              },

              summary: {
                stability:
                  "unknown",

                drift:
                  "unknown",

                repeatPattern:
                  "unknown",

                hasSufficientHistory:
                  false,
              },

              dataQuality:
                "insufficient",

              confidence:
                "low",
            }),
          );

        expect(
          result.version,
        ).toBe(
          1,
        );

        expect(
          result.assessment.state,
        ).toBe(
          "unavailable",
        );

        expect(
          result.strategy.type,
        ).toBe(
          "observe",
        );

        expect(
          result.guidance.tone,
        ).toBe(
          "unavailable",
        );

        expect(
          result.signalCollection.signalTypes,
        ).toContain(
          "insufficient-history",
        );

        expect(
          result.runtimeDecisionCollection
            .canGenerateNewRecommendation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "produces stable assessment, maintain strategy, and stable guidance",
      () => {
        const result =
          analyze(
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

              dataQuality:
                "sufficient",

              confidence:
                "high",
            }),
          );

        expect(
          result.signalCollection.signalTypes,
        ).toContain(
          "stable-continuation",
        );

        expect(
          result.signalCollection.signalTypes,
        ).toContain(
          "stable-direction",
        );

        expect(
          result.assessment.state,
        ).toBe(
          "stable",
        );

        expect(
          result.strategy.type,
        ).toBe(
          "maintain",
        );

        expect(
          result.guidance.tone,
        ).toBe(
          "stable",
        );

        expect(
          result.runtimeDecisionCollection
            .mustPreserveCurrentRecommendation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "produces stalled assessment and confirm-completion strategy for unresolved repetition",
      () => {
        const result =
          analyze(
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

        expect(
          result.signalCollection.signalTypes,
        ).toContain(
          "unresolved-repetition",
        );

        expect(
          result.assessment.state,
        ).toBe(
          "stalled",
        );

        expect(
          result.strategy.type,
        ).toBe(
          "confirm-completion",
        );

        expect(
          result.runtimeDecisions.some(
            (
              decision,
            ) =>
              decision.enabled &&
              decision.type ===
                "request-completion-confirmation",
          ),
        ).toBe(
          true,
        );

        expect(
          result.guidance.warnings.length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "produces fragmented assessment and stabilize strategy for high drift",
      () => {
        const result =
          analyze(
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

        expect(
          result.signalCollection.signalTypes,
        ).toContain(
          "high-drift",
        );

        expect(
          result.assessment.state,
        ).toBe(
          "fragmented",
        );

        expect(
          result.strategy.type,
        ).toBe(
          "stabilize",
        );

        expect(
          result.runtimeDecisions.some(
            (
              decision,
            ) =>
              decision.enabled &&
              decision.type ===
                "reduce-direction-changes",
          ),
        ).toBe(
          true,
        );

        expect(
          result.guidance.tone,
        ).toBe(
          "attention",
        );
      },
    );

    it(
      "produces advancing assessment and allows a new recommendation",
      () => {
        const result =
          analyze(
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

        expect(
          result.signalCollection.signalTypes,
        ).toContain(
          "completion-momentum",
        );

        expect(
          result.assessment.state,
        ).toBe(
          "advancing",
        );

        expect(
          result.strategy.type,
        ).toBe(
          "advance",
        );

        expect(
          result.runtimeDecisionCollection
            .canGenerateNewRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.runtimeDecisions.some(
            (
              decision,
            ) =>
              decision.enabled &&
              decision.type ===
                "allow-new-recommendation",
          ),
        ).toBe(
          true,
        );

        expect(
          result.guidance.tone,
        ).toBe(
          "progressing",
        );
      },
    );

    it(
      "keeps public alias arrays identical to their collection arrays",
      () => {
        const result =
          analyze(
            createEvolution({
              summary: {
                stability:
                  "highly-stable",

                drift:
                  "none",

                dominantDirection:
                  "stable",
              },
            }),
          );

        expect(
          result.signals,
        ).toBe(
          result.signalCollection.signals,
        );

        expect(
          result.runtimeDecisions,
        ).toBe(
          result.runtimeDecisionCollection
            .decisions,
        );

        expect(
          result.runtimeDecisionCollection
            .strategy,
        ).toBe(
          result.strategy,
        );
      },
    );

    it(
      "uses the same analyzedAt timestamp across generated artifacts",
      () => {
        const result =
          analyze(
            createEvolution({
              summary: {
                stability:
                  "highly-stable",

                drift:
                  "none",

                dominantDirection:
                  "stable",
              },
            }),
          );

        expect(
          result.analyzedAt,
        ).toBe(
          INTELLIGENCE_ANALYZED_AT,
        );

        expect(
          result.signals.every(
            (
              signal,
            ) =>
              signal.detectedAt ===
              INTELLIGENCE_ANALYZED_AT,
          ),
        ).toBe(
          true,
        );

        expect(
          result.strategy.resolvedAt,
        ).toBe(
          INTELLIGENCE_ANALYZED_AT,
        );

        expect(
          result.runtimeDecisions.every(
            (
              decision,
            ) =>
              decision.decidedAt ===
              INTELLIGENCE_ANALYZED_AT,
          ),
        ).toBe(
          true,
        );

        expect(
          result.guidance.createdAt,
        ).toBe(
          INTELLIGENCE_ANALYZED_AT,
        );
      },
    );

    it(
      "creates unique IDs for signals, runtime decisions, warnings, and observations",
      () => {
        const result =
          analyze(
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
              },
            }),
          );

        expect(
          new Set(
            result.signals.map(
              (
                signal,
              ) =>
                signal.id,
            ),
          ).size,
        ).toBe(
          result.signals.length,
        );

        expect(
          new Set(
            result.runtimeDecisions.map(
              (
                decision,
              ) =>
                decision.id,
            ),
          ).size,
        ).toBe(
          result.runtimeDecisions.length,
        );

        expect(
          new Set(
            result.guidance.warnings.map(
              (
                warning,
              ) =>
                warning.id,
            ),
          ).size,
        ).toBe(
          result.guidance.warnings.length,
        );

        expect(
          new Set(
            result.guidance.observations.map(
              (
                observation,
              ) =>
                observation.id,
            ),
          ).size,
        ).toBe(
          result.guidance.observations.length,
        );
      },
    );

    it(
      "throws when createDecisionId returns duplicate IDs",
      () => {
        const params =
          createParams(
            createEvolution({
              summary: {
                stability:
                  "highly-stable",

                drift:
                  "none",

                dominantDirection:
                  "stable",
              },
            }),
          );

        expect(
          () =>
            analyzeRecommendationEvolutionIntelligence({
              ...params,

              createDecisionId:
                () =>
                  "duplicate-decision-id",
            }),
        ).toThrow(
          'Duplicate Recommendation Evolution Runtime Decision ID "duplicate-decision-id".',
        );
      },
    );

    it(
      "throws when analyzedAt is invalid",
      () => {
        const params =
          createParams(
            createEvolution(),
          );

        expect(
          () =>
            analyzeRecommendationEvolutionIntelligence({
              ...params,

              analyzedAt:
                "invalid-date",
            }),
        ).toThrow(
          "analyzedAt must be a valid ISO 8601 timestamp.",
        );
      },
    );
  },
);