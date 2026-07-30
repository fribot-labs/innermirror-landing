import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RuntimeRecommendationIntegrationResult,
} from "../../runtime-recommendation-integration/runtimeRecommendationIntegrationTypes";

import type {
  RuntimeReflectionTransportResult,
} from "../runtimeAdapterTypes";

import {
  normalizeRuntimeReflectionResult,
} from "../normalizeRuntimeReflectionResult";

/* ------------------------------------------------------------------ */
/* Test Constants */
/* ------------------------------------------------------------------ */

const GENERATED_AT =
  "2026-07-26T10:00:00.000Z";

/* ------------------------------------------------------------------ */
/* Runtime Transport Fixtures */
/* ------------------------------------------------------------------ */

function createRuntimeReflectionTransportResult({
  recommendationIntegration,
  continuitySignalOverrides,
}: {
  recommendationIntegration?:
    RuntimeRecommendationIntegrationResult | null;

  continuitySignalOverrides?:
    Partial<
      RuntimeReflectionTransportResult[
        "continuitySignal"
      ]
    >;
} = {}): RuntimeReflectionTransportResult {
  return {
    contractVersion: "v1",

    reflectionId:
      "reflection-test-001",

    summary: {
      text:
        "The current Reflection is becoming more structurally defined.",

      confidence: 0.84,
    },

    pacing: {
      level: "medium",

      message:
        "Continue developing the current Reflection without rushing.",
    },

    nextQuestion: {
      question:
        "Which part of this thought has changed most clearly?",

      reason:
        "The Reflection contains an emerging structural transition.",
    },

    continuitySignal: {
      status: "forming",

      strength: 68,

      message:
        "The current Reflection is connecting with an earlier thought flow.",

      ...continuitySignalOverrides,
    },

    ...(recommendationIntegration !== undefined
      ? {
          recommendationIntegration,
        }
      : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Recommendation Integration Fixture */
/* ------------------------------------------------------------------ */

function createRuntimeRecommendationIntegrationResult():
  RuntimeRecommendationIntegrationResult {
  return {
    runtimeNextAction: {
      action:
        "continue-reflection",
    } as unknown as
      RuntimeRecommendationIntegrationResult[
        "runtimeNextAction"
      ],

    recommendationComparison: {
      baseWinner: null,
      adaptiveWinner: null,

      baseWinnerSnapshot: {
        candidateId:
          "base-candidate",

        baseScore: 0.82,

        isBlocking: false,
      },

      adaptiveWinnerSnapshot: {
        candidateId:
          "adaptive-candidate",

        baseScore: 0.78,

        adaptiveModifier: 0.12,

        adaptiveScore: 0.9,

        scoreDelta: 0.12,

        adaptiveRank: 1,

        isBlocking: false,
      },

      baseWinnerAdaptiveResult:
        null,

      scoreComparison: {
        baseWinnerBaseScore:
          0.82,

        baseWinnerAdaptiveScore:
          0.84,

        baseWinnerAdaptiveModifier:
          0.02,

        adaptiveWinnerBaseScore:
          0.78,

        adaptiveWinnerAdaptiveScore:
          0.9,

        adaptiveWinnerAdaptiveModifier:
          0.12,

        baseScoreDifference:
          0.04,

        adaptiveScoreDifference:
          0.06,
      },

      diagnostics: {
        generatedAt:
          GENERATED_AT,

        status:
          "changed",

        reason:
          "adaptive-scoring-selected-different-candidate",

        baseCandidateId:
          "base-candidate",

        adaptiveCandidateId:
          "adaptive-candidate",

        sameCandidate:
          false,

        winnerChanged:
          true,

        blockingStatusChanged:
          false,

        baseWinnerAdaptiveRank:
          2,

        adaptiveWinnerRank:
          1,

        adaptiveCandidateCount:
          2,

        warnings: [
          "Comparison warning",
        ],
      },
    } as unknown as
      NonNullable<
        RuntimeRecommendationIntegrationResult[
          "recommendationComparison"
        ]
      >,

    observationSummary: {
      observationCount:
        10,

      comparableObservationCount:
        9,

      incompleteObservationCount:
        1,

      headline:
        "Adaptive Recommendation evidence is becoming stable.",

      overview:
        "Nine of ten observations were comparable.",

      primaryInsight:
        "Adaptive Winner continuity is becoming established.",

      primaryRisk:
        "One observation remains incomplete.",

      dominantAdaptiveCandidateId:
        "adaptive-candidate",

      currentAdaptiveCandidateId:
        "adaptive-candidate",

      agreementRate:
        0.7,

      stabilityRate:
        0.8,

      driftScore:
        0.15,

      confidenceScore:
        0.82,

      strengths: [
        {
          id:
            "stable-pattern",

          category:
            "stability",

          severity:
            "positive",

          title:
            "Stable Adaptive pattern",

          description:
            "The Adaptive Winner remained consistent.",

          metricName:
            "stabilityRate",

          metricValue:
            0.8,
        },
      ],

      risks: [
        {
          id:
            "incomplete-evidence",

          category:
            "completeness",

          severity:
            "warning",

          title:
            "Incomplete evidence",

          description:
            "One observation could not be compared.",

          metricName:
            "incompleteObservationCount",

          metricValue:
            1,
        },
      ],

      insights: [],

      recommendations: [
        {
          id:
            "continue-shadow",

          priority:
            "low",

          title:
            "Continue Shadow Mode observation",

          description:
            "Continue collecting observations.",

          rationale:
            "A longer history will improve confidence.",
        },
      ],

      sourceStatus: {
        statisticsStatus:
          "calculated",

        stabilityStatus:
          "calculated",

        driftStatus:
          "calculated",

        confidenceStatus:
          "calculated",

        unavailableSourceCount:
          0,

        partialSourceCount:
          0,
      },

      tone:
        "stable",

      status:
        "partial",

      reason:
        "analysis-contains-partial-data",
    },

    executiveSummaryResult: {
      executiveSummary: {
        headline:
          "Runtime Recommendation Evolution remains stable.",

        overview:
          "The current Runtime action and Adaptive Recommendation evidence were summarized.",

        runtimeState:
          "stable",

        recommendationState:
          "adaptive-stable",

        currentAction:
          "continue-reflection",

        baseRecommendationId:
          "base-candidate",

        adaptiveRecommendationId:
          "adaptive-candidate",

        recommendationChanged:
          true,

        observationCount:
          10,

        comparableObservationCount:
          9,

        confidenceLevel:
          "established",

        stabilityLevel:
          "stable",

        driftLevel:
          "stable",

        confidenceScore:
          0.82,

        stabilityRate:
          0.8,

        driftScore:
          0.15,

        primarySignal: {
          category:
            "stability",

          severity:
            "positive",

          title:
            "Stable Adaptive pattern",

          description:
            "The Adaptive Winner remained consistent.",
        },

        primaryRisk: {
          category:
            "evidence",

          severity:
            "warning",

          title:
            "Incomplete evidence",

          description:
            "One observation could not be compared.",
        },

        nextFocus:
          "Continue collecting observations.",

        status:
          "complete",

        reason:
          "runtime-state-summarized",
      },

      diagnostics: {
        generatedAt:
          GENERATED_AT,

        runtimeNextActionAvailable:
          true,

        recommendationComparisonAvailable:
          true,

        baseRecommendationAvailable:
          true,

        adaptiveRecommendationAvailable:
          true,

        observationSummaryAvailable:
          true,

        observationSummaryStatus:
          "partial",

        warningCount:
          1,

        warnings: [
          "Executive Summary warning",
        ],
      },

      policy: {
        includeObservationMetrics:
          true,

        includeRecommendationComparison:
          true,

        maximumOverviewSentenceCount:
          3,

        decimalPlaces:
          2,
      },
    },

    predictiveIntelligenceResult:
      null,

    diagnostics: {
      generatedAt:
        GENERATED_AT,

      status:
        "complete",

      reason:
        "recommendation-integration-complete",

      availability: {
        runtimeNextActionAvailable:
          true,

        recommendationComparisonAvailable:
          true,

        observationSummaryAvailable:
          true,

        executiveSummaryAvailable:
          true,

        baseRecommendationAvailable:
          true,

        adaptiveRecommendationAvailable:
          true,
      },

      completedStages: [
        "runtime-next-action",
        "recommendation-comparison",
        "observation-summary",
        "executive-summary",
      ],

      completedStageCount:
        4,

      totalStageCount:
        4,

      warningCount:
        1,

      warnings: [
        "Integration warning",
      ],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Recommendation Integration Normalization */
/* ------------------------------------------------------------------ */

describe(
  "normalizeRuntimeReflectionResult recommendationIntegration",
  () => {
    it(
      "normalizes an omitted recommendationIntegration field to null",
      () => {
        const transportResult =
          createRuntimeReflectionTransportResult();

        expect(
          transportResult
            .recommendationIntegration
        ).toBeUndefined();

        const result =
          normalizeRuntimeReflectionResult(
            transportResult
          );

        expect(
          result
            .recommendationIntegration
        ).toBeNull();
      }
    );

    it(
      "preserves an explicitly null recommendationIntegration value",
      () => {
        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult({
              recommendationIntegration:
                null,
            })
          );

        expect(
          result
            .recommendationIntegration
        ).toBeNull();
      }
    );

    it(
      "includes a supplied Recommendation Integration Result",
      () => {
        const integrationResult =
          createRuntimeRecommendationIntegrationResult();

        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult({
              recommendationIntegration:
                integrationResult,
            })
          );

        expect(
          result
            .recommendationIntegration
        ).toEqual(
          integrationResult
        );
      }
    );

    it(
      "defensively clones a supplied Recommendation Integration Result",
      () => {
        const integrationResult =
          createRuntimeRecommendationIntegrationResult();

        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult({
              recommendationIntegration:
                integrationResult,
            })
          );

        const normalizedIntegration =
          result
            .recommendationIntegration;

        expect(
          normalizedIntegration
        ).not.toBeNull();

        expect(
          normalizedIntegration
        ).not.toBe(
          integrationResult
        );

        expect(
          normalizedIntegration
            ?.diagnostics
        ).not.toBe(
          integrationResult
            .diagnostics
        );

        expect(
          normalizedIntegration
            ?.diagnostics
            .availability
        ).not.toBe(
          integrationResult
            .diagnostics
            .availability
        );

        expect(
          normalizedIntegration
            ?.diagnostics
            .completedStages
        ).not.toBe(
          integrationResult
            .diagnostics
            .completedStages
        );

        expect(
          normalizedIntegration
            ?.diagnostics
            .warnings
        ).not.toBe(
          integrationResult
            .diagnostics
            .warnings
        );

        expect(
          normalizedIntegration
            ?.executiveSummaryResult
        ).not.toBe(
          integrationResult
            .executiveSummaryResult
        );

        expect(
          normalizedIntegration
            ?.executiveSummaryResult
            .executiveSummary
        ).not.toBe(
          integrationResult
            .executiveSummaryResult
            .executiveSummary
        );

        expect(
          normalizedIntegration
            ?.observationSummary
        ).not.toBe(
          integrationResult
            .observationSummary
        );

        expect(
          normalizedIntegration
            ?.predictiveIntelligenceResult
        ).toBeNull();
      }
    );

    it(
      "prevents normalized Integration mutations from changing the source result",
      () => {
        const integrationResult =
          createRuntimeRecommendationIntegrationResult();

        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult({
              recommendationIntegration:
                integrationResult,
            })
          );

        const normalizedIntegration =
          result
            .recommendationIntegration;

        expect(
          normalizedIntegration
        ).not.toBeNull();

        normalizedIntegration
          ?.diagnostics
          .warnings
          .push(
            "Normalized-only warning"
          );

        normalizedIntegration
          ?.diagnostics
          .completedStages
          .push(
            "runtime-next-action"
          );

        if (
          normalizedIntegration !== null
        ) {
          normalizedIntegration
            .executiveSummaryResult
            .executiveSummary
            .headline =
              "Modified normalized headline";

          if (
            normalizedIntegration
              .observationSummary !== null
          ) {
            normalizedIntegration
              .observationSummary
              .strengths[0]
              .title =
                "Modified normalized strength";
          }
        }

        expect(
          integrationResult
            .diagnostics
            .warnings
        ).toEqual([
          "Integration warning",
        ]);

        expect(
          integrationResult
            .diagnostics
            .completedStages
        ).toHaveLength(4);

        expect(
          integrationResult
            .executiveSummaryResult
            .executiveSummary
            .headline
        ).toBe(
          "Runtime Recommendation Evolution remains stable."
        );

        expect(
          integrationResult
            .observationSummary
            ?.strengths[0]
            .title
        ).toBe(
          "Stable Adaptive pattern"
        );

        expect(
          integrationResult
            .predictiveIntelligenceResult
        ).toBeNull();
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Existing Runtime Field Normalization */
/* ------------------------------------------------------------------ */

describe(
  "normalizeRuntimeReflectionResult existing Runtime fields",
  () => {
    it(
      "preserves the core Runtime Reflection fields",
      () => {
        const transportResult =
          createRuntimeReflectionTransportResult();

        const result =
          normalizeRuntimeReflectionResult(
            transportResult
          );

        expect(result).toMatchObject({
          contractVersion:
            "v1",

          reflectionId:
            "reflection-test-001",

          summary: {
            text:
              "The current Reflection is becoming more structurally defined.",

            confidence:
              0.84,
          },

          pacing: {
            level:
              "medium",

            message:
              "Continue developing the current Reflection without rushing.",
          },

          nextQuestion: {
            question:
              "Which part of this thought has changed most clearly?",

            reason:
              "The Reflection contains an emerging structural transition.",
          },
        });
      }
    );

    it(
      "clones summary, pacing, nextQuestion, and continuitySignal objects",
      () => {
        const transportResult =
          createRuntimeReflectionTransportResult();

        const result =
          normalizeRuntimeReflectionResult(
            transportResult
          );

        expect(
          result.summary
        ).not.toBe(
          transportResult.summary
        );

        expect(
          result.pacing
        ).not.toBe(
          transportResult.pacing
        );

        expect(
          result.nextQuestion
        ).not.toBe(
          transportResult.nextQuestion
        );

        expect(
          result.continuitySignal
        ).not.toBe(
          transportResult
            .continuitySignal
        );
      }
    );

    it(
      "applies the existing Continuity Signal defaults",
      () => {
        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult()
          );

        expect(
          result.continuitySignal
        ).toMatchObject({
          relatedSummary:
            "A similar Reflection flow appeared earlier.",

          relatedTimeLabel:
            "Recent flow",

          bridgeKind:
            "weak-signal",

          longGapDays:
            0,

          driftStrength:
            "none",

          driftDirection:
            "stable",

          driftFromLabel:
            "Previous thought flow",

          driftToLabel:
            "Current thought flow",
        });
      }
    );

    it(
      "preserves valid Continuity Signal values",
      () => {
        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult({
              continuitySignalOverrides: {
                relatedSummary:
                  "Earlier robotics architecture Reflection",

                relatedTimeLabel:
                  "Three days ago",

                bridgeKind:
                  "direct-theme",

                longGapDays:
                  3,

                driftStrength:
                  "moderate",

                driftDirection:
                  "branching",

                driftFromLabel:
                  "Earlier architecture",

                driftToLabel:
                  "Current architecture",
              },
            })
          );

        expect(
          result.continuitySignal
        ).toMatchObject({
          relatedSummary:
            "Earlier robotics architecture Reflection",

          relatedTimeLabel:
            "Three days ago",

          bridgeKind:
            "direct-theme",

          longGapDays:
            3,

          driftStrength:
            "moderate",

          driftDirection:
            "branching",

          driftFromLabel:
            "Earlier architecture",

          driftToLabel:
            "Current architecture",
        });
      }
    );

    it(
      "normalizes legacy Korean Drift labels",
      () => {
        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult({
              continuitySignalOverrides: {
                driftFromLabel:
                  "기존 생각 흐름",

                driftToLabel:
                  "현재 생각 흐름",
              },
            })
          );

        expect(
          result
            .continuitySignal
            .driftFromLabel
        ).toBe(
          "Previous thought flow"
        );

        expect(
          result
            .continuitySignal
            .driftToLabel
        ).toBe(
          "Current thought flow"
        );
      }
    );

    it(
      "trims custom Drift display labels",
      () => {
        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult({
              continuitySignalOverrides: {
                driftFromLabel:
                  "  Earlier direction  ",

                driftToLabel:
                  "  Current direction  ",
              },
            })
          );

        expect(
          result
            .continuitySignal
            .driftFromLabel
        ).toBe(
          "Earlier direction"
        );

        expect(
          result
            .continuitySignal
            .driftToLabel
        ).toBe(
          "Current direction"
        );
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Serialization */
/* ------------------------------------------------------------------ */

describe(
  "normalizeRuntimeReflectionResult serialization",
  () => {
    it(
      "always serializes the recommendationIntegration field",
      () => {
        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult()
          );

        const serialized =
          JSON.parse(
            JSON.stringify(result)
          ) as Record<
            string,
            unknown
          >;

        expect(
          serialized
        ).toHaveProperty(
          "recommendationIntegration"
        );

        expect(
          serialized
            .recommendationIntegration
        ).toBeNull();
      }
    );

    it(
      "serializes a non-null Recommendation Integration Result",
      () => {
        const result =
          normalizeRuntimeReflectionResult(
            createRuntimeReflectionTransportResult({
              recommendationIntegration:
                createRuntimeRecommendationIntegrationResult(),
            })
          );

        const serialized =
          JSON.parse(
            JSON.stringify(result)
          ) as {
            recommendationIntegration?: {
              diagnostics?: {
                status?: string;
              };
            };
          };

        expect(
          serialized
            .recommendationIntegration
            ?.diagnostics
            ?.status
        ).toBe(
          "complete"
        );
      }
    );
  }
);