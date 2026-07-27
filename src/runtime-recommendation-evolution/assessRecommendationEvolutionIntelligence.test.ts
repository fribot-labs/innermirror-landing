import {
    describe,
    expect,
    it,
} from "vitest";

import {
    assessRecommendationEvolutionIntelligence,
} from "./assessRecommendationEvolutionIntelligence";

import type {
    RecommendationEvolutionConfidence,
    RecommendationEvolutionDataQuality,
    RecommendationEvolutionResult,
    RecommendationEvolutionSummary,
} from "./recommendationEvolutionTypes";

import type {
    RecommendationEvolutionIntelligenceSignal,
    RecommendationEvolutionIntelligenceSignalConfidence,
    RecommendationEvolutionIntelligenceSignalSeverity,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionIntelligenceState,
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

const ANALYZED_AT =
  "2026-07-27T00:00:00.000Z";

const DETECTED_AT =
  "2026-07-27T00:05:00.000Z";

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
      ANALYZED_AT,
  };
}

type CreateSignalParams = {
  id?:
    string;

  type:
    RecommendationEvolutionIntelligenceSignalType;

  severity?:
    RecommendationEvolutionIntelligenceSignalSeverity;

  confidence?:
    RecommendationEvolutionIntelligenceSignalConfidence;

  score?:
    number;
};

function createSignal(
  params:
    CreateSignalParams,
): RecommendationEvolutionIntelligenceSignal {
  return {
    id:
      params.id ??
      `signal-${params.type}`,

    type:
      params.type,

    severity:
      params.severity ??
      "moderate",

    confidence:
      params.confidence ??
      "high",

    score:
      params.score ??
      0.8,

    title:
      `Signal ${params.type}`,

    description:
      `Description for ${params.type}`,

    evidence:
      [],

    relatedComparisonIds:
      [],

    detectedAt:
      DETECTED_AT,
  };
}

function assess(
  evolution:
    RecommendationEvolutionResult,
  signals:
    RecommendationEvolutionIntelligenceSignal[],
) {
  return assessRecommendationEvolutionIntelligence({
    evolution,
    signals,
  });
}

function expectState(
  actual:
    RecommendationEvolutionIntelligenceState,
  expected:
    RecommendationEvolutionIntelligenceState,
): void {
  expect(
    actual,
  ).toBe(
    expected,
  );
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "assessRecommendationEvolutionIntelligence",
  () => {
    it(
      "returns unavailable when no analyzable recommendations exist",
      () => {
        const result =
          assess(
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
            [
              createSignal({
                type:
                  "insufficient-history",

                severity:
                  "info",
              }),
            ],
          );

        expectState(
          result.state,
          "unavailable",
        );

        expect(
          result.confidence,
        ).toBe(
          "low",
        );

        expect(
          result.needsObservation,
        ).toBe(
          true,
        );

        expect(
          result.shouldMaintainCurrentRecommendation,
        ).toBe(
          false,
        );
      },
    );

    it(
      "returns observing when history is not yet sufficient",
      () => {
        const result =
          assess(
            createEvolution({
              statistics: {
                totalRecommendationCount:
                  1,

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
                "partial",

              confidence:
                "low",
            }),
            [
              createSignal({
                type:
                  "insufficient-history",

                severity:
                  "info",
              }),
              createSignal({
                type:
                  "observation-needed",

                severity:
                  "low",
              }),
            ],
          );

        expectState(
          result.state,
          "observing",
        );

        expect(
          result.needsObservation,
        ).toBe(
          true,
        );

        expect(
          result.shouldMaintainCurrentRecommendation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "returns fragmented when high drift is present",
      () => {
        const result =
          assess(
            createEvolution({
              statistics: {
                redirectedTransitionCount:
                  2,

                supersessionRate:
                  0.5,
              },

              summary: {
                stability:
                  "unstable",

                drift:
                  "high",

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
            [
              createSignal({
                type:
                  "high-drift",

                severity:
                  "high",

                score:
                  1,
              }),
              createSignal({
                type:
                  "frequent-redirection",

                severity:
                  "high",

                score:
                  0.9,
              }),
            ],
          );

        expectState(
          result.state,
          "fragmented",
        );

        expect(
          result.primarySignalType,
        ).toBe(
          "high-drift",
        );

        expect(
          result.shouldStabilizeDirection,
        ).toBe(
          true,
        );

        expect(
          result.scores.redirectionRisk,
        ).toBeGreaterThanOrEqual(
          0.65,
        );
      },
    );

    it(
      "returns stalled when repetition remains unresolved",
      () => {
        const result =
          assess(
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
            [
              createSignal({
                type:
                  "persistent-repetition",

                severity:
                  "moderate",

                score:
                  1,
              }),
              createSignal({
                type:
                  "unresolved-repetition",

                severity:
                  "high",

                score:
                  1,
              }),
            ],
          );

        expectState(
          result.state,
          "stalled",
        );

        expect(
          result.primarySignalType,
        ).toBe(
          "unresolved-repetition",
        );

        expect(
          result.shouldConfirmCompletion,
        ).toBe(
          true,
        );

        expect(
          result.shouldMaintainCurrentRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.scores.repetitionRisk,
        ).toBeGreaterThanOrEqual(
          0.6,
        );
      },
    );

    it(
      "returns advancing when completion momentum is strong",
      () => {
        const result =
          assess(
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
            [
              createSignal({
                type:
                  "completion-momentum",

                severity:
                  "moderate",

                score:
                  1,
              }),
            ],
          );

        expectState(
          result.state,
          "advancing",
        );

        expect(
          result.primarySignalType,
        ).toBe(
          "completion-momentum",
        );

        expect(
          result.scores.completionMomentum,
        ).toBeGreaterThanOrEqual(
          0.55,
        );

        expect(
          result.shouldMaintainCurrentRecommendation,
        ).toBe(
          false,
        );
      },
    );

    it(
      "returns progressing when productive refinement is present",
      () => {
        const result =
          assess(
            createEvolution({
              statistics: {
                refinedTransitionCount:
                  2,

                completionRate:
                  0.4,
              },

              summary: {
                stability:
                  "developing",

                drift:
                  "low",

                dominantType:
                  "refined",

                dominantDirection:
                  "narrowing",

                latestType:
                  "refined",

                latestDirection:
                  "narrowing",

                recommendationChanged:
                  true,

                hasMeaningfulEvolution:
                  true,
              },
            }),
            [
              createSignal({
                type:
                  "productive-refinement",

                severity:
                  "moderate",

                score:
                  0.9,
              }),
            ],
          );

        expectState(
          result.state,
          "progressing",
        );

        expect(
          result.primarySignalType,
        ).toBe(
          "productive-refinement",
        );

        expect(
          result.shouldMaintainCurrentRecommendation,
        ).toBe(
          true,
        );

        expect(
          result.shouldRefineRecommendation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "returns stable when stable continuation is present",
      () => {
        const result =
          assess(
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
            [
              createSignal({
                type:
                  "stable-continuation",

                severity:
                  "info",

                score:
                  1,
              }),
              createSignal({
                type:
                  "stable-direction",

                severity:
                  "info",

                score:
                  1,
              }),
            ],
          );

        expectState(
          result.state,
          "stable",
        );

        expect(
          result.primarySignalType,
        ).toBe(
          "stable-continuation",
        );

        expect(
          result.scores.stability,
        ).toBe(
          1,
        );

        expect(
          result.shouldMaintainCurrentRecommendation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "uses state-specific signal preference over globally stronger unrelated signals",
      () => {
        const result =
          assess(
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

                latestType:
                  "completed-and-advanced",

                latestDirection:
                  "advancing",

                hasMeaningfulEvolution:
                  true,
              },
            }),
            [
              createSignal({
                type:
                  "completion-momentum",

                severity:
                  "moderate",

                score:
                  0.8,
              }),
              createSignal({
                type:
                  "observation-needed",

                severity:
                  "high",

                score:
                  1,
              }),
            ],
          );

        expectState(
          result.state,
          "advancing",
        );

        expect(
          result.primarySignalType,
        ).toBe(
          "completion-momentum",
        );
      },
    );

    it(
      "returns high confidence for sufficient high-confidence evidence",
      () => {
        const result =
          assess(
            createEvolution({
              summary: {
                stability:
                  "highly-stable",

                drift:
                  "none",

                dominantDirection:
                  "stable",
              },

              dataQuality:
                "sufficient",

              confidence:
                "high",
            }),
            [
              createSignal({
                type:
                  "stable-continuation",

                severity:
                  "info",

                confidence:
                  "high",

                score:
                  1,
              }),
            ],
          );

        expect(
          result.confidence,
        ).toBe(
          "high",
        );
      },
    );

    it(
      "returns low confidence and needsObservation when observation-needed is present",
      () => {
        const result =
          assess(
            createEvolution({
              summary: {
                stability:
                  "stable",

                drift:
                  "low",
              },

              dataQuality:
                "partial",

              confidence:
                "medium",
            }),
            [
              createSignal({
                type:
                  "stable-continuation",

                severity:
                  "info",

                confidence:
                  "medium",
              }),
              createSignal({
                type:
                  "observation-needed",

                severity:
                  "low",

                confidence:
                  "medium",
              }),
            ],
          );

        expect(
          result.confidence,
        ).toBe(
          "low",
        );

        expect(
          result.needsObservation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "includes state, score, and signal evidence in reasoning",
      () => {
        const result =
          assess(
            createEvolution({
              summary: {
                stability:
                  "stable",

                drift:
                  "none",
              },
            }),
            [
              createSignal({
                type:
                  "stable-continuation",

                severity:
                  "info",
              }),
            ],
          );

        expect(
          result.reasoning.some(
            (
              reason,
            ) =>
              reason.includes(
                "Recommendation direction remains stable",
              ),
          ),
        ).toBe(
          true,
        );

        expect(
          result.reasoning.some(
            (
              reason,
            ) =>
              reason.includes(
                'Primary signal "stable-continuation"',
              ),
          ),
        ).toBe(
          true,
        );

        expect(
          result.reasoning.some(
            (
              reason,
            ) =>
              reason.includes(
                "Stability score",
              ),
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "throws when duplicate signal types are supplied",
      () => {
        expect(
          () =>
            assess(
              createEvolution(),
              [
                createSignal({
                  id:
                    "signal-1",

                  type:
                    "stable-continuation",
                }),
                createSignal({
                  id:
                    "signal-2",

                  type:
                    "stable-continuation",
                }),
              ],
            ),
        ).toThrow(
          'Duplicate Recommendation Evolution Intelligence signal type "stable-continuation".',
        );
      },
    );
  },
);