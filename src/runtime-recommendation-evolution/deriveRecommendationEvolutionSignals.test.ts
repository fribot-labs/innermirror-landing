import {
    describe,
    expect,
    it,
} from "vitest";

import {
    deriveRecommendationEvolutionSignals,
} from "./deriveRecommendationEvolutionSignals";

import type {
    RecommendationEvolutionConfidence,
    RecommendationEvolutionDataQuality,
    RecommendationEvolutionResult,
    RecommendationEvolutionSnapshot,
    RecommendationEvolutionSummary,
    RecommendationEvolutionType,
    RecommendationLifecycleComparison
} from "./recommendationEvolutionTypes";

import type {
    RecommendationEvolutionIntelligenceSignalType,
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
  comparisons?:
    RecommendationLifecycleComparison[];

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
  const comparisons =
    overrides.comparisons ??
    [];

  return {
    version:
      1,

    historyId:
      "history-1",

    comparisons,

    statistics: {
      totalRecommendationCount:
        0,

      comparableRecommendationCount:
        0,

      transitionCount:
        0,

      activeCount:
        0,

      completedCount:
        0,

      supersededCount:
        0,

      archivedCount:
        0,

      repeatedTransitionCount:
        0,

      changedTransitionCount:
        0,

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
        "unknown",

      drift:
        "unknown",

      repeatPattern:
        "unknown",

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
        false,

      ...overrides.summary,
    },

    dataQuality:
      overrides.dataQuality ??
      "insufficient",

    confidence:
      overrides.confidence ??
      "low",

    analyzedAt:
      ANALYZED_AT,
  };
}

type CreateComparisonParams = {
  id:
    string;

  type:
    RecommendationEvolutionType;

  confidence?:
    RecommendationEvolutionConfidence;

  direction?:
    RecommendationLifecycleComparison["direction"];

  hasPrevious?:
    boolean;
};

function createSnapshot(
  lifecycleId:
    string,
): RecommendationEvolutionSnapshot {
  return {
    lifecycleId,

    recommendationId:
      `${lifecycleId}-recommendation`,

    fingerprint:
      `${lifecycleId}-fingerprint`,

    kind:
      "implementation" as RecommendationEvolutionSnapshot["kind"],

    title:
      "Test recommendation",

    description:
      "Test recommendation description",

    target:
      "runtime" as RecommendationEvolutionSnapshot["target"],

    confidence:
      "medium" as RecommendationEvolutionSnapshot["confidence"],

    source:
      "runtime" as RecommendationEvolutionSnapshot["source"],

    sourceLabel:
      "Runtime",

    whySummary:
      null,

    evidenceSummary:
      null,

    signalCount:
      0,

    createdAt:
      ANALYZED_AT,

    activatedAt:
      ANALYZED_AT,

    resolvedAt:
      null,

    resolution:
      null,
  };
}

function createComparison(
  params:
    CreateComparisonParams,
): RecommendationLifecycleComparison {
  return {
    id:
      params.id,

    previous:
      params.hasPrevious ===
        false
        ? null
        : {
            ...createSnapshot(
              `${params.id}-previous`,
            ),

            fingerprint:
              params.type ===
                "repeated"
                ? `${params.id}-shared-fingerprint`
                : `${params.id}-previous-fingerprint`,
          },

    current: {
      ...createSnapshot(
        `${params.id}-current`,
      ),

      fingerprint:
        params.type ===
          "repeated"
          ? `${params.id}-shared-fingerprint`
          : `${params.id}-current-fingerprint`,
    },

    type:
      params.type,

    direction:
      params.direction ??
      "stable",

    magnitude:
      params.type ===
        "repeated"
        ? "none"
        : "minor",

    confidence:
      params.confidence ??
      "high",

    dataQuality:
      "sufficient",

    isRepeated:
      params.type ===
      "repeated",

    isCompletionAdvance:
      params.type ===
      "completed-and-advanced",

    isSupersession:
      params.type ===
      "superseded",

    targetChanged:
      params.type ===
      "redirected",

    kindChanged:
      false,

    confidenceChanged:
      false,

    fieldChanges:
      [],

    signals:
      [],

    comparedAt:
      ANALYZED_AT,
  };
}

function createSignalId(
  type:
    RecommendationEvolutionIntelligenceSignalType,
  index:
    number,
): string {
  return `signal-${index}-${type}`;
}

function derive(
  evolution:
    RecommendationEvolutionResult,
) {
  return deriveRecommendationEvolutionSignals({
    evolution,

    detectedAt:
      DETECTED_AT,

    createSignalId,
  });
}

function getSignalTypes(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalType[] {
  return derive(
    evolution,
  ).signalTypes;
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "deriveRecommendationEvolutionSignals",
  () => {
    it(
      "returns insufficient-history and observation-needed for empty evolution history",
      () => {
        const result =
          derive(
            createEvolution(),
          );

        expect(
          result.signalTypes,
        ).toContain(
          "insufficient-history",
        );

        expect(
          result.signalTypes,
        ).toContain(
          "observation-needed",
        );

        expect(
          result.needsObservation,
        ).toBe(
          true,
        );

        expect(
          result.signals.every(
            (
              signal,
            ) =>
              signal.detectedAt ===
              DETECTED_AT,
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "derives stable-continuation and stable-direction for a stable low-drift history",
      () => {
        const comparisons = [
          createComparison({
            id:
              "comparison-1",
            type:
              "refined",
          }),
          createComparison({
            id:
              "comparison-2",
            type:
              "expanded",
          }),
        ];

        const signalTypes =
          getSignalTypes(
            createEvolution({
              comparisons,

              statistics: {
                totalRecommendationCount:
                  3,

                comparableRecommendationCount:
                  2,

                transitionCount:
                  2,

                changedTransitionCount:
                  2,

                refinedTransitionCount:
                  1,

                repetitionRate:
                  0,
              },

              summary: {
                stability:
                  "highly-stable",

                drift:
                  "none",

                repeatPattern:
                  "none",

                dominantDirection:
                  "stable",

                latestType:
                  "expanded",

                latestDirection:
                  "stable",

                recommendationChanged:
                  true,

                hasMeaningfulEvolution:
                  true,

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
          signalTypes,
        ).toContain(
          "stable-continuation",
        );

        expect(
          signalTypes,
        ).toContain(
          "stable-direction",
        );
      },
    );

    it(
      "derives productive-refinement when refinement transitions are present",
      () => {
        const comparison =
          createComparison({
            id:
              "comparison-refined",
            type:
              "refined",
            direction:
              "narrowing",
          });

        const result =
          derive(
            createEvolution({
              comparisons: [
                comparison,
              ],

              statistics: {
                totalRecommendationCount:
                  2,

                comparableRecommendationCount:
                  1,

                transitionCount:
                  1,

                changedTransitionCount:
                  1,

                refinedTransitionCount:
                  1,
              },

              summary: {
                stability:
                  "developing",

                drift:
                  "low",

                repeatPattern:
                  "none",

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

                hasSufficientHistory:
                  true,
              },

              dataQuality:
                "sufficient",

              confidence:
                "high",
            }),
          );

        const signal =
          result.signals.find(
            (
              item,
            ) =>
              item.type ===
              "productive-refinement",
          );

        expect(
          signal,
        ).toBeDefined();

        expect(
          signal?.severity,
        ).toBe(
          "moderate",
        );

        expect(
          signal?.relatedComparisonIds,
        ).toEqual([
          "comparison-refined",
        ]);
      },
    );

    it(
      "derives persistent-repetition and unresolved-repetition for repeated low-completion flow",
      () => {
        const comparisons = [
          createComparison({
            id:
              "comparison-repeat-1",
            type:
              "repeated",
          }),
          createComparison({
            id:
              "comparison-repeat-2",
            type:
              "repeated",
          }),
        ];

        const result =
          derive(
            createEvolution({
              comparisons,

              statistics: {
                totalRecommendationCount:
                  3,

                comparableRecommendationCount:
                  2,

                transitionCount:
                  2,

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

                recommendationChanged:
                  false,

                hasMeaningfulEvolution:
                  false,

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
          result.signalTypes,
        ).toContain(
          "persistent-repetition",
        );

        expect(
          result.signalTypes,
        ).toContain(
          "unresolved-repetition",
        );

        expect(
          result.hasActionableSignal,
        ).toBe(
          true,
        );

        expect(
          result.primarySignalId,
        ).not.toBeNull();
      },
    );

    it(
      "derives frequent-redirection and high-drift for fragmented direction changes",
      () => {
        const comparisons = [
          createComparison({
            id:
              "comparison-redirect-1",
            type:
              "redirected",
            direction:
              "redirecting",
          }),
          createComparison({
            id:
              "comparison-redirect-2",
            type:
              "redirected",
            direction:
              "redirecting",
          }),
        ];

        const signalTypes =
          getSignalTypes(
            createEvolution({
              comparisons,

              statistics: {
                totalRecommendationCount:
                  3,

                comparableRecommendationCount:
                  2,

                transitionCount:
                  2,

                changedTransitionCount:
                  2,

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
          signalTypes,
        ).toContain(
          "frequent-redirection",
        );

        expect(
          signalTypes,
        ).toContain(
          "high-drift",
        );
      },
    );

    it(
      "derives premature-supersession, high-supersession-rate, and low-completion-rate",
      () => {
        const comparisons = [
          createComparison({
            id:
              "comparison-superseded-1",
            type:
              "superseded",
            direction:
              "redirecting",
          }),
          createComparison({
            id:
              "comparison-superseded-2",
            type:
              "superseded",
            direction:
              "redirecting",
          }),
        ];

        const signalTypes =
          getSignalTypes(
            createEvolution({
              comparisons,

              statistics: {
                totalRecommendationCount:
                  3,

                comparableRecommendationCount:
                  2,

                transitionCount:
                  2,

                changedTransitionCount:
                  2,

                completedCount:
                  0,

                supersededCount:
                  2,

                completionRate:
                  0,

                supersessionRate:
                  1,
              },

              summary: {
                stability:
                  "unstable",

                drift:
                  "moderate",

                repeatPattern:
                  "none",

                dominantType:
                  "superseded",

                dominantDirection:
                  "redirecting",

                latestType:
                  "superseded",

                latestDirection:
                  "redirecting",

                recommendationChanged:
                  true,

                hasMeaningfulEvolution:
                  true,

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
          signalTypes,
        ).toContain(
          "premature-supersession",
        );

        expect(
          signalTypes,
        ).toContain(
          "high-supersession-rate",
        );

        expect(
          signalTypes,
        ).toContain(
          "low-completion-rate",
        );
      },
    );

    it(
      "derives completion-momentum when completed recommendations advance to the next stage",
      () => {
        const comparison =
          createComparison({
            id:
              "comparison-completed",
            type:
              "completed-and-advanced",
            direction:
              "narrowing",
          });

        const result =
          derive(
            createEvolution({
              comparisons: [
                comparison,
              ],

              statistics: {
                totalRecommendationCount:
                  2,

                comparableRecommendationCount:
                  1,

                transitionCount:
                  1,

                changedTransitionCount:
                  1,

                completedCount:
                  1,

                completionAdvanceCount:
                  1,

                completionRate:
                  1,

                supersessionRate:
                  0,
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
                  "narrowing",

                latestType:
                  "completed-and-advanced",

                latestDirection:
                  "narrowing",

                recommendationChanged:
                  true,

                hasMeaningfulEvolution:
                  true,

                hasSufficientHistory:
                  true,
              },

              dataQuality:
                "sufficient",

              confidence:
                "high",
            }),
          );

        const signal =
          result.signals.find(
            (
              item,
            ) =>
              item.type ===
              "completion-momentum",
          );

        expect(
          signal,
        ).toBeDefined();

        expect(
          signal?.relatedComparisonIds,
        ).toEqual([
          "comparison-completed",
        ]);
      },
    );

    it(
      "derives increasing-confidence from the two latest comparable comparisons",
      () => {
        const signalTypes =
          getSignalTypes(
            createEvolution({
              comparisons: [
                createComparison({
                  id:
                    "comparison-confidence-1",
                  type:
                    "refined",
                  confidence:
                    "low",
                }),
                createComparison({
                  id:
                    "comparison-confidence-2",
                  type:
                    "refined",
                  confidence:
                    "high",
                }),
              ],

              statistics: {
                totalRecommendationCount:
                  3,

                comparableRecommendationCount:
                  2,

                transitionCount:
                  2,

                changedTransitionCount:
                  2,

                refinedTransitionCount:
                  2,
              },

              summary: {
                stability:
                  "developing",

                drift:
                  "low",

                repeatPattern:
                  "none",

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
          signalTypes,
        ).toContain(
          "increasing-confidence",
        );

        expect(
          signalTypes,
        ).not.toContain(
          "decreasing-confidence",
        );
      },
    );

    it(
      "derives decreasing-confidence and observation-needed when latest comparison confidence falls",
      () => {
        const result =
          derive(
            createEvolution({
              comparisons: [
                createComparison({
                  id:
                    "comparison-confidence-high",
                  type:
                    "refined",
                  confidence:
                    "high",
                }),
                createComparison({
                  id:
                    "comparison-confidence-low",
                  type:
                    "redirected",
                  confidence:
                    "low",
                  direction:
                    "redirecting",
                }),
              ],

              statistics: {
                totalRecommendationCount:
                  3,

                comparableRecommendationCount:
                  2,

                transitionCount:
                  2,

                changedTransitionCount:
                  2,

                refinedTransitionCount:
                  1,

                redirectedTransitionCount:
                  1,
              },

              summary: {
                stability:
                  "developing",

                drift:
                  "moderate",

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

                hasSufficientHistory:
                  true,
              },

              dataQuality:
                "partial",

              confidence:
                "medium",
            }),
          );

        expect(
          result.signalTypes,
        ).toContain(
          "decreasing-confidence",
        );

        expect(
          result.signalTypes,
        ).toContain(
          "observation-needed",
        );

        expect(
          result.needsObservation,
        ).toBe(
          true,
        );
      },
    );

    it(
      "creates unique deterministic signal IDs and preserves signal type order",
      () => {
        const result =
          derive(
            createEvolution(),
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
          result.signalTypes,
        ).toEqual(
          result.signals.map(
            (
              signal,
            ) =>
              signal.type,
          ),
        );
      },
    );

    it(
      "throws when createSignalId returns duplicate IDs",
      () => {
        expect(
          () =>
            deriveRecommendationEvolutionSignals({
              evolution:
                createEvolution(),

              detectedAt:
                DETECTED_AT,

              createSignalId:
                () =>
                  "duplicate-signal-id",
            }),
        ).toThrow(
          'Duplicate Recommendation Evolution Intelligence signal ID "duplicate-signal-id".',
        );
      },
    );

    it(
      "throws when detectedAt is not a valid timestamp",
      () => {
        expect(
          () =>
            deriveRecommendationEvolutionSignals({
              evolution:
                createEvolution(),

              detectedAt:
                "invalid-date",

              createSignalId,
            }),
        ).toThrow(
          "detectedAt must be a valid ISO 8601 timestamp.",
        );
      },
    );
  },
);