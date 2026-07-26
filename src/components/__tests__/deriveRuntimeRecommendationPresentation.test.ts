import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    RuntimeReflectionResult,
} from "../../runtime-adapter/runtimeAdapterTypes";

import type {
    RuntimeRecommendationIntegrationResult,
} from "../../runtime-recommendation-integration/runtimeRecommendationIntegrationTypes";

import type {
    RuntimeRecommendationPresentation,
} from "../runtimeRecommendationPresentation";

import {
    createRuntimeRecommendationPresentation,
} from "../runtimeRecommendationPresentation";

import {
    deriveRuntimeRecommendationPresentation,
} from "../deriveRuntimeRecommendationPresentation";

vi.mock(
  "../runtimeRecommendationPresentation",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import(
          "../runtimeRecommendationPresentation"
        )
      >();

    return {
      ...original,

      createRuntimeRecommendationPresentation:
        vi.fn(),
    };
  }
);

const mockedCreateRuntimeRecommendationPresentation =
  vi.mocked(
    createRuntimeRecommendationPresentation
  );

function createIntegrationFixture():
  RuntimeRecommendationIntegrationResult {
  return {
    runtimeNextAction: {
      id:
        "runtime-next-action-001",

      title:
        "Review the current project focus",

      description:
        "Compare the current implementation with the original project goal.",

      target:
        "current-focus",

      reason:
        "The current work has produced enough evidence for a focused review.",

      evidence: [],
    },

    recommendationComparison:
      null,

    observationSummary:
      null,

    executiveSummaryResult: {
      executiveSummary: {
        headline:
          "The current recommendation remains stable.",

        overview:
          "The available evidence supports continuing the current direction.",

        runtimeState:
          "available",

        recommendationState:
          "aligned",

        currentAction:
          "Review the current project focus",

        recommendationChanged:
          false,

        baseRecommendationId:
          "review-current-focus",

        adaptiveRecommendationId:
          "review-current-focus",

        observationCount:
          3,

        comparableObservationCount:
          3,

        confidenceLevel:
          "moderate",

        stabilityLevel:
          "stable",

        driftLevel:
          "none",

        primarySignal:
          null,

        primaryRisk:
          null,

        nextFocus:
          "Confirm the next project milestone.",
      },

      diagnostics: {
        status:
          "complete",

        reason:
          "runtime-executive-summary-complete",

        generatedAt:
          "2026-07-26T00:00:00.000Z",

        warnings: [],
      },
    },

    diagnostics: {
      status:
        "complete",

      reason:
        "recommendation-integration-complete",

      completedStageCount:
        4,

      totalStageCount:
        4,

      completedStages: [
        "recommendation-comparison",
        "observation-summary",
        "runtime-executive-summary",
        "integration-result",
      ],

      warnings: [],

      generatedAt:
        "2026-07-26T00:00:00.000Z",
    },
  } as unknown as
    RuntimeRecommendationIntegrationResult;
}

function createRuntimeResultFixture(
  recommendationIntegration:
    RuntimeRecommendationIntegrationResult | null
): RuntimeReflectionResult {
  return {
    contractVersion:
      "v1",

    reflectionId:
      "reflection-001",

    summary: {
      text:
        "The current project direction is becoming clearer.",

      confidence:
        "moderate",
    },

    pacing: {
      level:
        "steady",

      message:
        "Continue at the current pace.",
    },

    nextQuestion: {
      question:
        "What evidence would confirm the next step?",

      reason:
        "The current direction is stable enough for validation.",
    },

    continuitySignal: {
      status:
        "connected",

      message:
        "This reflection continues the previous project direction.",

      strength:
        "moderate",

      relatedSummary:
        null,

      relatedTimeLabel:
        null,

      driftStrength:
        null,

      driftDirection:
        null,
    },

    recommendationIntegration,
  } as unknown as
    RuntimeReflectionResult;
}

function createPresentationFixture():
  RuntimeRecommendationPresentation {
  return {
    headline:
      "The current recommendation remains stable.",

    overview:
      "The available evidence supports continuing the current direction.",

    recommendationStateLabel:
      "Base and adaptive recommendations are aligned",

    recommendationChanged:
      false,

    recommendationChangeMessage:
      "The adaptive recommendation remains aligned with the base recommendation.",

    confidenceLabel:
      "Moderate confidence",

    stabilityLabel:
      "Stable pattern",

    driftLabel:
      "No meaningful drift",

    nextFocus:
      "Confirm the next project milestone.",

    baseRecommendationLabel:
      "review-current-focus",

    adaptiveRecommendationLabel:
      "review-current-focus",

    observationCount:
      3,

    comparableObservationCount:
      3,

    observationCountLabel:
      "3 of 3 observations were comparable.",

    primarySignalTitle:
      null,

    primarySignalDescription:
      null,

    primaryRiskTitle:
      null,

    primaryRiskDescription:
      null,

    integrationStatusLabel:
      "Analysis complete",

    integrationReasonLabel:
      "All available recommendation analysis stages completed.",

    completedStageCount:
      4,

    totalStageCount:
      4,

    completedStageLabel:
      "4 of 4 integration stages completed.",

    warnings: [],

    tone:
      "stable",
  };
}

describe(
  "deriveRuntimeRecommendationPresentation",
  () => {
    beforeEach(() => {
      mockedCreateRuntimeRecommendationPresentation
        .mockReset();
    });

    it(
      "returns null when the Runtime Reflection Result is null",
      () => {
        const presentation =
          deriveRuntimeRecommendationPresentation(
            null
          );

        expect(
          presentation
        ).toBeNull();

        expect(
          mockedCreateRuntimeRecommendationPresentation
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "returns null when Recommendation Integration is null",
      () => {
        const runtimeResult =
          createRuntimeResultFixture(
            null
          );

        const presentation =
          deriveRuntimeRecommendationPresentation(
            runtimeResult
          );

        expect(
          presentation
        ).toBeNull();

        expect(
          mockedCreateRuntimeRecommendationPresentation
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "creates a Presentation when Recommendation Integration is available",
      () => {
        const integration =
          createIntegrationFixture();

        const runtimeResult =
          createRuntimeResultFixture(
            integration
          );

        const expectedPresentation =
          createPresentationFixture();

        mockedCreateRuntimeRecommendationPresentation
          .mockReturnValue(
            expectedPresentation
          );

        const presentation =
          deriveRuntimeRecommendationPresentation(
            runtimeResult
          );

        expect(
          mockedCreateRuntimeRecommendationPresentation
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          mockedCreateRuntimeRecommendationPresentation
        ).toHaveBeenCalledWith(
          integration
        );

        expect(
          presentation
        ).toBe(
          expectedPresentation
        );
      }
    );

    it(
      "uses the Recommendation Integration belonging to the latest Runtime Result",
      () => {
        const firstIntegration =
          createIntegrationFixture();

        const secondIntegration = {
          ...createIntegrationFixture(),

          diagnostics: {
            ...createIntegrationFixture()
              .diagnostics,

            generatedAt:
              "2026-07-26T01:00:00.000Z",
          },
        } as RuntimeRecommendationIntegrationResult;

        const firstPresentation = {
          ...createPresentationFixture(),

          headline:
            "First recommendation presentation",
        };

        const secondPresentation = {
          ...createPresentationFixture(),

          headline:
            "Second recommendation presentation",
        };

        mockedCreateRuntimeRecommendationPresentation
          .mockReturnValueOnce(
            firstPresentation
          )
          .mockReturnValueOnce(
            secondPresentation
          );

        const firstResult =
          deriveRuntimeRecommendationPresentation(
            createRuntimeResultFixture(
              firstIntegration
            )
          );

        const secondResult =
          deriveRuntimeRecommendationPresentation(
            createRuntimeResultFixture(
              secondIntegration
            )
          );

        expect(
          firstResult
        ).toBe(
          firstPresentation
        );

        expect(
          secondResult
        ).toBe(
          secondPresentation
        );

        expect(
          mockedCreateRuntimeRecommendationPresentation
        ).toHaveBeenNthCalledWith(
          1,
          firstIntegration
        );

        expect(
          mockedCreateRuntimeRecommendationPresentation
        ).toHaveBeenNthCalledWith(
          2,
          secondIntegration
        );
      }
    );

    it(
      "does not modify the Runtime Reflection Result",
      () => {
        const integration =
          createIntegrationFixture();

        const runtimeResult =
          createRuntimeResultFixture(
            integration
          );

        const originalReflectionId =
          runtimeResult.reflectionId;

        const originalIntegration =
          runtimeResult
            .recommendationIntegration;

        mockedCreateRuntimeRecommendationPresentation
          .mockReturnValue(
            createPresentationFixture()
          );

        deriveRuntimeRecommendationPresentation(
          runtimeResult
        );

        expect(
          runtimeResult.reflectionId
        ).toBe(
          originalReflectionId
        );

        expect(
          runtimeResult
            .recommendationIntegration
        ).toBe(
          originalIntegration
        );
      }
    );
  }
);