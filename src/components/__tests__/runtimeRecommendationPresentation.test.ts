import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    RuntimeRecommendationIntegrationResult,
} from "../../runtime-recommendation-integration/runtimeRecommendationIntegrationTypes";

import {
    createRuntimeRecommendationPresentation,
} from "../runtimeRecommendationPresentation";

/* ------------------------------------------------------------------ */
/* Test Types */
/* ------------------------------------------------------------------ */

type IntegrationFixtureOptions = {
  integrationStatus?:
    | "complete"
    | "partial"
    | "insufficient-data"
    | "unavailable";

  integrationReason?: string;

  headline?: string;
  overview?: string;

  recommendationState?: string;

  recommendationChanged?:
    boolean | null;

  baseRecommendationId?:
    string | null;

  adaptiveRecommendationId?:
    string | null;

  confidenceLevel?: string;
  stabilityLevel?: string;
  driftLevel?: string;

  observationCount?:
    number | null;

  comparableObservationCount?:
    number | null;

  nextFocus?:
    string | null;

  primarySignal?:
    {
      title: string;
      description: string;
    } | null;

  primaryRisk?:
    {
      title: string;
      description: string;
    } | null;

  completedStageCount?: number;
  totalStageCount?: number;

  warnings?: string[];

  includeComparison?: boolean;
};

/* ------------------------------------------------------------------ */
/* Test Fixture */
/* ------------------------------------------------------------------ */

/**
 * Presentation 함수가 실제로 읽는 필드만 포함하는 테스트 Fixture입니다.
 *
 * RuntimeRecommendationIntegrationResult의 전체 생성 책임을 다시
 * 테스트하려는 것이 아니라 Presentation 변환만 검증하는 것이므로,
 * 테스트 마지막 단계에서 공식 타입으로 변환합니다.
 */
function createIntegrationFixture(
  options:
    IntegrationFixtureOptions = {}
): RuntimeRecommendationIntegrationResult {
  const {
    integrationStatus =
      "complete",

    integrationReason =
      "recommendation-integration-complete",

    headline =
      "Runtime recommendation evolution remains stable.",

    overview =
      "The Runtime combined the current action and recommendation evidence.",

    recommendationState =
      "adaptive-stable",

    recommendationChanged =
      false,

    baseRecommendationId =
      "base-candidate",

    adaptiveRecommendationId =
      "adaptive-candidate",

    confidenceLevel =
      "established",

    stabilityLevel =
      "stable",

    driftLevel =
      "stable",

    observationCount =
      10,

    comparableObservationCount =
      9,

    nextFocus =
      "Continue observing the current Reflection direction.",

    primarySignal = {
      title:
        "Stable recommendation pattern",

      description:
        "The adaptive recommendation remained consistent.",
    },

    primaryRisk =
      null,

    completedStageCount =
      4,

    totalStageCount =
      4,

    warnings = [
      "Integration warning",
    ],

    includeComparison =
      true,
  } = options;

  const fixture = {
    runtimeNextAction: {
      action:
        "continue-reflection",
    },

    recommendationComparison:
      includeComparison
        ? {
            baseWinnerSnapshot: {
              candidateId:
                "comparison-base-candidate",
            },

            adaptiveWinnerSnapshot: {
              candidateId:
                "comparison-adaptive-candidate",
            },
          }
        : null,

    observationSummary:
      null,

    executiveSummaryResult: {
      executiveSummary: {
        headline,
        overview,

        runtimeState:
          "stable",

        recommendationState,

        currentAction:
          "continue-reflection",

        baseRecommendationId,
        adaptiveRecommendationId,

        recommendationChanged,

        observationCount,
        comparableObservationCount,

        confidenceLevel,
        stabilityLevel,
        driftLevel,

        confidenceScore:
          0.82,

        stabilityRate:
          0.8,

        driftScore:
          0.1,

        primarySignal,

        primaryRisk,

        nextFocus,

        status:
          integrationStatus,

        reason:
          integrationReason,
      },

      diagnostics: {
        generatedAt:
          "2026-07-26T10:00:00.000Z",

        runtimeNextActionAvailable:
          true,

        recommendationComparisonAvailable:
          includeComparison,

        baseRecommendationAvailable:
          baseRecommendationId !== null,

        adaptiveRecommendationAvailable:
          adaptiveRecommendationId !== null,

        observationSummaryAvailable:
          false,

        observationSummaryStatus:
          null,

        warningCount:
          warnings.length,

        warnings: [
          ...warnings,
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

    diagnostics: {
      generatedAt:
        "2026-07-26T10:00:00.000Z",

      status:
        integrationStatus,

      reason:
        integrationReason,

      availability: {
        runtimeNextActionAvailable:
          true,

        recommendationComparisonAvailable:
          includeComparison,

        observationSummaryAvailable:
          false,

        executiveSummaryAvailable:
          true,

        baseRecommendationAvailable:
          baseRecommendationId !== null,

        adaptiveRecommendationAvailable:
          adaptiveRecommendationId !== null,
      },

      completedStages: [
        "runtime-next-action",
        "recommendation-comparison",
        "observation-summary",
        "executive-summary",
      ],

      completedStageCount,
      totalStageCount,

      warningCount:
        warnings.length,

      warnings: [
        ...warnings,
      ],
    },
  };

  return fixture as unknown as
    RuntimeRecommendationIntegrationResult;
}

/* ------------------------------------------------------------------ */
/* Core Presentation */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeRecommendationPresentation core presentation",
  () => {
    it(
      "maps the Executive Summary into the Presentation Model",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture()
          );

        expect(
          presentation.headline
        ).toBe(
          "Runtime recommendation evolution remains stable."
        );

        expect(
          presentation.overview
        ).toBe(
          "The Runtime combined the current action and recommendation evidence."
        );

        expect(
          presentation.nextFocus
        ).toBe(
          "Continue observing the current Reflection direction."
        );
      }
    );

    it(
      "maps stable recommendation values to user-facing labels",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture()
          );

        expect(
          presentation.recommendationStateLabel
        ).toBe(
          "Adaptive recommendation is stable"
        );

        expect(
          presentation.confidenceLabel
        ).toBe(
          "Established confidence"
        );

        expect(
          presentation.stabilityLabel
        ).toBe(
          "Stable pattern"
        );

        expect(
          presentation.driftLabel
        ).toBe(
          "No meaningful drift"
        );

        expect(
          presentation.tone
        ).toBe(
          "stable"
        );
      }
    );

    it(
      "preserves primary signal information",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture()
          );

        expect(
          presentation.primarySignalTitle
        ).toBe(
          "Stable recommendation pattern"
        );

        expect(
          presentation.primarySignalDescription
        ).toBe(
          "The adaptive recommendation remained consistent."
        );
      }
    );

    it(
      "uses null when optional next focus and signal values are unavailable",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              nextFocus:
                null,

              primarySignal:
                null,
            })
          );

        expect(
          presentation.nextFocus
        ).toBeNull();

        expect(
          presentation.primarySignalTitle
        ).toBeNull();

        expect(
          presentation.primarySignalDescription
        ).toBeNull();
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Recommendation Change */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeRecommendationPresentation recommendation change",
  () => {
    it(
      "describes a changed recommendation",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              recommendationChanged:
                true,

              recommendationState:
                "adaptive-changing",
            })
          );

        expect(
          presentation.recommendationChanged
        ).toBe(true);

        expect(
          presentation.recommendationChangeMessage
        ).toBe(
          "The adaptive recommendation differs from the base recommendation."
        );

        expect(
          presentation.tone
        ).toBe(
          "changing"
        );
      }
    );

    it(
      "describes an aligned recommendation",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              recommendationChanged:
                false,
            })
          );

        expect(
          presentation.recommendationChanged
        ).toBe(false);

        expect(
          presentation.recommendationChangeMessage
        ).toBe(
          "The adaptive recommendation remains aligned with the base recommendation."
        );
      }
    );

    it(
      "does not treat an unknown recommendation change as false evidence",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              recommendationChanged:
                null,
            })
          );

        expect(
          presentation.recommendationChanged
        ).toBe(false);

        expect(
          presentation.recommendationChangeMessage
        ).toBe(
          "The available evidence is not yet sufficient to determine whether the recommendation changed."
        );
      }
    );

    it(
      "uses comparison snapshots when Executive Summary candidate IDs are missing",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              baseRecommendationId:
                null,

              adaptiveRecommendationId:
                null,

              includeComparison:
                true,
            })
          );

        expect(
          presentation.baseRecommendationLabel
        ).toBe(
          "comparison-base-candidate"
        );

        expect(
          presentation.adaptiveRecommendationLabel
        ).toBe(
          "comparison-adaptive-candidate"
        );
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Integration Status */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeRecommendationPresentation integration status",
  () => {
    it(
      "maps complete status",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              integrationStatus:
                "complete",
            })
          );

        expect(
          presentation.integrationStatusLabel
        ).toBe(
          "Analysis complete"
        );

        expect(
          presentation.completedStageLabel
        ).toBe(
          "4 of 4 integration stages completed."
        );
      }
    );

    it(
      "maps partial status to a caution presentation",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              integrationStatus:
                "partial",

              integrationReason:
                "recommendation-integration-partial",
            })
          );

        expect(
          presentation.integrationStatusLabel
        ).toBe(
          "Partial analysis available"
        );

        expect(
          presentation.integrationReasonLabel
        ).toBe(
          "Some recommendation analysis stages produced limited results."
        );

        expect(
          presentation.tone
        ).toBe(
          "caution"
        );
      }
    );

    it(
      "maps insufficient-data without presenting it as a failure",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              integrationStatus:
                "insufficient-data",

              integrationReason:
                "recommendation-integration-insufficient-data",

              observationCount:
                2,

              comparableObservationCount:
                1,
            })
          );

        expect(
          presentation.integrationStatusLabel
        ).toBe(
          "More reflection history is needed"
        );

        expect(
          presentation.integrationReasonLabel
        ).toBe(
          "The analysis completed, but more observation history is required."
        );

        expect(
          presentation.tone
        ).toBe(
          "caution"
        );
      }
    );

    it(
      "maps unavailable status",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              integrationStatus:
                "unavailable",

              integrationReason:
                "recommendation-integration-unavailable",
            })
          );

        expect(
          presentation.integrationStatusLabel
        ).toBe(
          "Analysis is not available"
        );

        expect(
          presentation.tone
        ).toBe(
          "unavailable"
        );
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Observation Counts */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeRecommendationPresentation observation counts",
  () => {
    it(
      "creates a comparable observation count label",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              observationCount:
                10,

              comparableObservationCount:
                9,
            })
          );

        expect(
          presentation.observationCount
        ).toBe(10);

        expect(
          presentation.comparableObservationCount
        ).toBe(9);

        expect(
          presentation.observationCountLabel
        ).toBe(
          "9 of 10 observations were comparable."
        );
      }
    );

    it(
      "describes an unavailable observation history",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              observationCount:
                null,

              comparableObservationCount:
                null,
            })
          );

        expect(
          presentation.observationCount
        ).toBeNull();

        expect(
          presentation.comparableObservationCount
        ).toBeNull();

        expect(
          presentation.observationCountLabel
        ).toBe(
          "Observation history is not available yet."
        );
      }
    );

    it(
      "normalizes negative and fractional stage counts",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              completedStageCount:
                -2.8,

              totalStageCount:
                4.9,
            })
          );

        expect(
          presentation.completedStageCount
        ).toBe(0);

        expect(
          presentation.totalStageCount
        ).toBe(4);

        expect(
          presentation.completedStageLabel
        ).toBe(
          "0 of 4 integration stages completed."
        );
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Risk and Tone */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeRecommendationPresentation risk and tone",
  () => {
    it(
      "maps a primary risk and uses caution tone",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              primaryRisk: {
                title:
                  "Limited observation history",

                description:
                  "More Reflection evidence is required.",
              },
            })
          );

        expect(
          presentation.primaryRiskTitle
        ).toBe(
          "Limited observation history"
        );

        expect(
          presentation.primaryRiskDescription
        ).toBe(
          "More Reflection evidence is required."
        );

        expect(
          presentation.tone
        ).toBe(
          "caution"
        );
      }
    );

    it(
      "uses changing tone for meaningful drift",
      () => {
        const presentation =
          createRuntimeRecommendationPresentation(
            createIntegrationFixture({
              driftLevel:
                "moderate",
            })
          );

        expect(
          presentation.driftLabel
        ).toBe(
          "Noticeable directional change"
        );

        expect(
          presentation.tone
        ).toBe(
          "changing"
        );
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Defensive Copies */
/* ------------------------------------------------------------------ */

describe(
  "createRuntimeRecommendationPresentation defensive copying",
  () => {
    it(
      "clones the Integration warnings array",
      () => {
        const integration =
          createIntegrationFixture({
            warnings: [
              "First warning",
            ],
          });

        const presentation =
          createRuntimeRecommendationPresentation(
            integration
          );

        expect(
          presentation.warnings
        ).toEqual([
          "First warning",
        ]);

        expect(
          presentation.warnings
        ).not.toBe(
          integration
            .diagnostics
            .warnings
        );

        presentation
          .warnings
          .push(
            "Presentation-only warning"
          );

        expect(
          integration
            .diagnostics
            .warnings
        ).toEqual([
          "First warning",
        ]);
      }
    );
  }
);