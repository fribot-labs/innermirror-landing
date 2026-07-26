import { describe, expect, it } from "vitest";

import type { RuntimeNextAction } from "../../runtime-next-action/runtimeNextActionTypes";

import type {
    CompareBaseAndAdaptiveRuntimeRecommendationsResult,
} from "../../runtime-recommendation-evolution/compareBaseAndAdaptiveRuntimeRecommendations";

import type {
    RuntimeRecommendationAdaptiveObservationSummary,
} from "../../runtime-recommendation-evolution/createAdaptiveRecommendationObservationSummary";

import type {
    CreateRuntimeExecutiveSummaryResult,
    RuntimeExecutiveSummaryStatus,
} from "../../runtime-recommendation-evolution/createRuntimeExecutiveSummary";

import {
    RUNTIME_RECOMMENDATION_INTEGRATION_STAGES,
    TOTAL_RUNTIME_RECOMMENDATION_INTEGRATION_STAGE_COUNT,
    cloneCreateRuntimeExecutiveSummaryResult,
    cloneRuntimeRecommendationIntegrationDiagnostics,
    cloneRuntimeRecommendationIntegrationResult,
    collectRuntimeRecommendationIntegrationWarnings,
    createRuntimeRecommendationIntegrationResult,
    resolveRuntimeRecommendationIntegrationAvailability,
    resolveRuntimeRecommendationIntegrationCompletedStages,
    resolveRuntimeRecommendationIntegrationReason,
    resolveRuntimeRecommendationIntegrationStatus,
} from "../createRuntimeRecommendationIntegrationResult";

import type {
    RuntimeRecommendationIntegrationAvailability,
    RuntimeRecommendationIntegrationDiagnostics,
    RuntimeRecommendationIntegrationResult,
} from "../runtimeRecommendationIntegrationTypes";

const GENERATED_AT = "2026-07-25T12:00:00.000Z";

function createRuntimeNextAction(
  overrides: Record<string, unknown> = {}
): RuntimeNextAction {
  return {
    action: "continue-reflection",
    ...overrides,
  } as unknown as RuntimeNextAction;
}

function createRecommendationComparison({
  baseWinnerAvailable = true,
  adaptiveWinnerAvailable = true,
  baseCandidateId = "base-candidate",
  adaptiveCandidateId = "adaptive-candidate",
  sameCandidate = false,
  winnerChanged = true,
  status = "changed",
}: {
  baseWinnerAvailable?: boolean;
  adaptiveWinnerAvailable?: boolean;
  baseCandidateId?: string | null;
  adaptiveCandidateId?: string | null;
  sameCandidate?: boolean;
  winnerChanged?: boolean;
  status?: string;
} = {}): CompareBaseAndAdaptiveRuntimeRecommendationsResult {
  return {
    baseWinnerSnapshot: baseWinnerAvailable
      ? {
          candidateId: baseCandidateId,
          recommendationId: baseCandidateId,
        }
      : null,

    adaptiveWinnerSnapshot: adaptiveWinnerAvailable
      ? {
          candidateId: adaptiveCandidateId,
          recommendationId: adaptiveCandidateId,
        }
      : null,

    diagnostics: {
      baseCandidateId,
      adaptiveCandidateId,
      sameCandidate,
      winnerChanged,
      status,
    },
  } as unknown as
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;
}

function createObservationSummary(
  overrides: Record<string, unknown> = {}
): RuntimeRecommendationAdaptiveObservationSummary {
  return {
    status: "complete",
    tone: "stable",

    observationCount: 10,
    comparableObservationCount: 8,
    incompleteObservationCount: 2,

    agreementRate: 0.75,
    stabilityRate: 0.8,
    driftScore: 0.1,
    confidenceScore: 0.9,

    primaryInsight:
      "Adaptive Recommendation behavior remained stable.",
    primaryRisk: null,

    strengths: [],
    risks: [],
    recommendations: [],

    ...overrides,
  } as unknown as
    RuntimeRecommendationAdaptiveObservationSummary;
}

function createExecutiveSummaryResult({
  status = "complete",
  warnings = [],
}: {
  status?: RuntimeExecutiveSummaryStatus;
  warnings?: string[];
} = {}): CreateRuntimeExecutiveSummaryResult {
  return {
    executiveSummary: {
      headline:
        status === "complete"
          ? "Runtime recommendation behavior is stable."
          : "Runtime Recommendation Evolution remains under observation.",

      overview:
        "The current Runtime action and Recommendation Evolution evidence were summarized.",

      runtimeState:
        status === "insufficient-data"
          ? "insufficient-data"
          : status === "partial"
            ? "observing"
            : "stable",

      recommendationState: "adaptive-stable",

      currentAction: "continue-reflection",

      baseRecommendationId: "base-candidate",
      adaptiveRecommendationId: "adaptive-candidate",
      recommendationChanged: true,

      observationCount: 10,
      comparableObservationCount: 8,

      confidenceLevel: "strong",
      stabilityLevel: "stable",
      driftLevel: "stable",

      confidenceScore: 0.9,
      stabilityRate: 0.8,
      driftScore: 0.1,

      primarySignal: {
        category: "stability",
        severity: "positive",
        title: "Stable recommendation pattern",
        description:
          "The Adaptive Recommendation pattern remained stable.",
      },

      primaryRisk: null,

      nextFocus:
        "Continue monitoring the Recommendation pattern in Shadow Mode.",

      status,

      reason:
        status === "complete"
          ? "runtime-state-summarized"
          : status === "partial"
            ? "runtime-state-partially-summarized"
            : "no-runtime-summary-evidence",
    },

    diagnostics: {
      generatedAt: GENERATED_AT,
      runtimeNextActionAvailable: true,
      recommendationComparisonAvailable: true,
      baseRecommendationAvailable: true,
      adaptiveRecommendationAvailable: true,
      observationSummaryAvailable: true,
      observationSummaryStatus: "complete",
      warningCount: warnings.length,
      warnings: [...warnings],
    },

    policy: {
      includeObservationMetrics: true,
      includeRecommendationComparison: true,
      maximumOverviewSentenceCount: 3,
      decimalPlaces: 2,
    },
  };
}

function createCompleteIntegrationResult():
  RuntimeRecommendationIntegrationResult {
  return createRuntimeRecommendationIntegrationResult({
    runtimeNextAction: createRuntimeNextAction(),
    recommendationComparison:
      createRecommendationComparison(),
    observationSummary: createObservationSummary(),
    executiveSummaryResult:
      createExecutiveSummaryResult(),
    generatedAt: GENERATED_AT,
  });
}

describe("createRuntimeRecommendationIntegrationResult", () => {
  it("returns complete when all Integration sources are available", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: createRuntimeNextAction(),
        recommendationComparison:
          createRecommendationComparison(),
        observationSummary: createObservationSummary(),
        executiveSummaryResult:
          createExecutiveSummaryResult(),
        generatedAt: GENERATED_AT,
      });

    expect(result.diagnostics).toMatchObject({
      generatedAt: GENERATED_AT,
      status: "complete",
      reason: "recommendation-integration-complete",
      completedStageCount: 4,
      totalStageCount: 4,
      warningCount: 0,
      warnings: [],
    });

    expect(result.diagnostics.availability).toEqual({
      runtimeNextActionAvailable: true,
      recommendationComparisonAvailable: true,
      observationSummaryAvailable: true,
      executiveSummaryAvailable: true,
      baseRecommendationAvailable: true,
      adaptiveRecommendationAvailable: true,
    });

    expect(result.diagnostics.completedStages).toEqual([
      "runtime-next-action",
      "recommendation-comparison",
      "observation-summary",
      "executive-summary",
    ]);

    expect(result.runtimeNextAction).not.toBeNull();
    expect(result.recommendationComparison).not.toBeNull();
    expect(result.observationSummary).not.toBeNull();

    expect(
      result.executiveSummaryResult.executiveSummary.status
    ).toBe("complete");
  });

  it("returns insufficient-data when no source evidence exists", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: null,
        recommendationComparison: null,
        observationSummary: null,

        executiveSummaryResult:
          createExecutiveSummaryResult({
            status: "insufficient-data",
          }),

        generatedAt: GENERATED_AT,
      });

    expect(result.diagnostics.status).toBe(
      "insufficient-data"
    );

    expect(result.diagnostics.reason).toBe(
      "no-recommendation-integration-evidence"
    );

    expect(result.diagnostics.availability).toEqual({
      runtimeNextActionAvailable: false,
      recommendationComparisonAvailable: false,
      observationSummaryAvailable: false,
      executiveSummaryAvailable: true,
      baseRecommendationAvailable: false,
      adaptiveRecommendationAvailable: false,
    });

    expect(result.diagnostics.completedStages).toEqual([
      "executive-summary",
    ]);

    expect(result.diagnostics.completedStageCount).toBe(1);
  });

  it("returns partial when Runtime Next Action is unavailable", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: null,

        recommendationComparison:
          createRecommendationComparison(),

        observationSummary:
          createObservationSummary(),

        executiveSummaryResult:
          createExecutiveSummaryResult({
            status: "partial",
          }),

        generatedAt: GENERATED_AT,
      });

    expect(result.diagnostics.status).toBe("partial");

    expect(result.diagnostics.reason).toBe(
      "runtime-next-action-unavailable"
    );

    expect(
      result.diagnostics.availability
        .runtimeNextActionAvailable
    ).toBe(false);

    expect(result.diagnostics.completedStages).toEqual([
      "recommendation-comparison",
      "observation-summary",
      "executive-summary",
    ]);
  });

  it("returns partial when Recommendation Comparison is unavailable", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: createRuntimeNextAction(),
        recommendationComparison: null,
        observationSummary: createObservationSummary(),

        executiveSummaryResult:
          createExecutiveSummaryResult({
            status: "partial",
          }),

        generatedAt: GENERATED_AT,
      });

    expect(result.diagnostics.status).toBe("partial");

    expect(result.diagnostics.reason).toBe(
      "recommendation-comparison-unavailable"
    );

    expect(
      result.diagnostics.availability
        .recommendationComparisonAvailable
    ).toBe(false);

    expect(
      result.diagnostics.availability
        .baseRecommendationAvailable
    ).toBe(false);

    expect(
      result.diagnostics.availability
        .adaptiveRecommendationAvailable
    ).toBe(false);
  });

  it("returns partial when Observation Summary is unavailable", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: createRuntimeNextAction(),

        recommendationComparison:
          createRecommendationComparison(),

        observationSummary: null,

        executiveSummaryResult:
          createExecutiveSummaryResult({
            status: "partial",
          }),

        generatedAt: GENERATED_AT,
      });

    expect(result.diagnostics.status).toBe("partial");

    expect(result.diagnostics.reason).toBe(
      "observation-summary-unavailable"
    );

    expect(
      result.diagnostics.availability
        .observationSummaryAvailable
    ).toBe(false);
  });

  it("returns executive-summary-partial when all sources exist but the Executive Summary is partial", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: createRuntimeNextAction(),

        recommendationComparison:
          createRecommendationComparison(),

        observationSummary:
          createObservationSummary(),

        executiveSummaryResult:
          createExecutiveSummaryResult({
            status: "partial",
          }),

        generatedAt: GENERATED_AT,
      });

    expect(result.diagnostics.status).toBe("partial");

    expect(result.diagnostics.reason).toBe(
      "executive-summary-partial"
    );

    expect(result.diagnostics.completedStageCount).toBe(4);
  });

  it("reports Base-only Recommendation availability", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: createRuntimeNextAction(),

        recommendationComparison:
          createRecommendationComparison({
            baseWinnerAvailable: true,
            adaptiveWinnerAvailable: false,
            adaptiveCandidateId: null,
            winnerChanged: false,
            status: "unchanged",
          }),

        observationSummary:
          createObservationSummary(),

        executiveSummaryResult:
          createExecutiveSummaryResult(),

        generatedAt: GENERATED_AT,
      });

    expect(
      result.diagnostics.availability
        .baseRecommendationAvailable
    ).toBe(true);

    expect(
      result.diagnostics.availability
        .adaptiveRecommendationAvailable
    ).toBe(false);
  });

  it("reports Adaptive-only Recommendation availability", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: createRuntimeNextAction(),

        recommendationComparison:
          createRecommendationComparison({
            baseWinnerAvailable: false,
            adaptiveWinnerAvailable: true,
            baseCandidateId: null,
          }),

        observationSummary:
          createObservationSummary(),

        executiveSummaryResult:
          createExecutiveSummaryResult(),

        generatedAt: GENERATED_AT,
      });

    expect(
      result.diagnostics.availability
        .baseRecommendationAvailable
    ).toBe(false);

    expect(
      result.diagnostics.availability
        .adaptiveRecommendationAvailable
    ).toBe(true);
  });

  it("combines, trims, and removes duplicate warnings", () => {
    const executiveSummaryResult =
      createExecutiveSummaryResult({
        warnings: [
          "Shared warning",
          "Executive Summary warning",
        ],
      });

    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: createRuntimeNextAction(),

        recommendationComparison:
          createRecommendationComparison(),

        observationSummary:
          createObservationSummary(),

        executiveSummaryResult,

        warnings: [
          " Shared warning ",
          "",
          "   ",
          "Integration warning",
          "Integration warning",
        ],

        generatedAt: GENERATED_AT,
      });

    expect(result.diagnostics.warnings).toEqual([
      "Shared warning",
      "Integration warning",
      "Executive Summary warning",
    ]);

    expect(result.diagnostics.warningCount).toBe(3);
  });

  it("preserves the supplied generatedAt value", () => {
    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction: createRuntimeNextAction(),

        recommendationComparison:
          createRecommendationComparison(),

        observationSummary:
          createObservationSummary(),

        executiveSummaryResult:
          createExecutiveSummaryResult(),

        generatedAt: GENERATED_AT,
      });

    expect(result.diagnostics.generatedAt).toBe(
      GENERATED_AT
    );
  });

  it("returns defensively cloned nested result values", () => {
    const runtimeNextAction =
      createRuntimeNextAction({
        metadata: {
          source: "runtime",
        },
      });

    const recommendationComparison =
      createRecommendationComparison();

    const observationSummary =
      createObservationSummary({
        strengths: [
          {
            category: "stability",
            severity: "positive",
            title: "Original signal",
            description: "Original description",
          },
        ],
      });

    const executiveSummaryResult =
      createExecutiveSummaryResult({
        warnings: ["Original warning"],
      });

    const result =
      createRuntimeRecommendationIntegrationResult({
        runtimeNextAction,
        recommendationComparison,
        observationSummary,
        executiveSummaryResult,
        generatedAt: GENERATED_AT,
      });

    expect(result.runtimeNextAction).not.toBe(
      runtimeNextAction
    );

    expect(result.recommendationComparison).not.toBe(
      recommendationComparison
    );

    expect(result.observationSummary).not.toBe(
      observationSummary
    );

    expect(result.executiveSummaryResult).not.toBe(
      executiveSummaryResult
    );

    expect(
      result.executiveSummaryResult.executiveSummary
    ).not.toBe(
      executiveSummaryResult.executiveSummary
    );

    expect(
      result.executiveSummaryResult.diagnostics
    ).not.toBe(
      executiveSummaryResult.diagnostics
    );

    expect(
      result.executiveSummaryResult.diagnostics.warnings
    ).not.toBe(
      executiveSummaryResult.diagnostics.warnings
    );

    result.executiveSummaryResult.diagnostics.warnings.push(
      "External mutation"
    );

    result.executiveSummaryResult.executiveSummary.headline =
      "Externally modified headline";

    expect(
      executiveSummaryResult.diagnostics.warnings
    ).toEqual(["Original warning"]);

    expect(
      executiveSummaryResult.executiveSummary.headline
    ).not.toBe("Externally modified headline");
  });
});

describe("Integration Contract resolvers", () => {
  it("defines the four official Integration stages", () => {
    expect(
      RUNTIME_RECOMMENDATION_INTEGRATION_STAGES
    ).toEqual([
      "runtime-next-action",
      "recommendation-comparison",
      "observation-summary",
      "executive-summary",
    ]);

    expect(
      TOTAL_RUNTIME_RECOMMENDATION_INTEGRATION_STAGE_COUNT
    ).toBe(4);
  });

  it("resolves availability from Integration source objects", () => {
    const availability =
      resolveRuntimeRecommendationIntegrationAvailability({
        runtimeNextActionAvailable: true,

        recommendationComparison:
          createRecommendationComparison({
            baseWinnerAvailable: true,
            adaptiveWinnerAvailable: false,
          }),

        observationSummaryAvailable: true,

        executiveSummaryResult:
          createExecutiveSummaryResult(),
      });

    expect(availability).toEqual({
      runtimeNextActionAvailable: true,
      recommendationComparisonAvailable: true,
      observationSummaryAvailable: true,
      executiveSummaryAvailable: true,
      baseRecommendationAvailable: true,
      adaptiveRecommendationAvailable: false,
    });
  });

  it("resolves complete, partial, and insufficient-data statuses", () => {
    const completeAvailability:
      RuntimeRecommendationIntegrationAvailability = {
        runtimeNextActionAvailable: true,
        recommendationComparisonAvailable: true,
        observationSummaryAvailable: true,
        executiveSummaryAvailable: true,
        baseRecommendationAvailable: true,
        adaptiveRecommendationAvailable: true,
      };

    expect(
      resolveRuntimeRecommendationIntegrationStatus({
        availability: completeAvailability,
        executiveSummaryStatus: "complete",
      })
    ).toBe("complete");

    expect(
      resolveRuntimeRecommendationIntegrationStatus({
        availability: {
          ...completeAvailability,
          observationSummaryAvailable: false,
        },
        executiveSummaryStatus: "partial",
      })
    ).toBe("partial");

    expect(
      resolveRuntimeRecommendationIntegrationStatus({
        availability: {
          ...completeAvailability,
          runtimeNextActionAvailable: false,
          recommendationComparisonAvailable: false,
          observationSummaryAvailable: false,
          baseRecommendationAvailable: false,
          adaptiveRecommendationAvailable: false,
        },
        executiveSummaryStatus: "insufficient-data",
      })
    ).toBe("insufficient-data");
  });

  it("resolves the earliest unavailable stage as the Integration reason", () => {
    const baseAvailability:
      RuntimeRecommendationIntegrationAvailability = {
        runtimeNextActionAvailable: true,
        recommendationComparisonAvailable: true,
        observationSummaryAvailable: true,
        executiveSummaryAvailable: true,
        baseRecommendationAvailable: true,
        adaptiveRecommendationAvailable: true,
      };

    expect(
      resolveRuntimeRecommendationIntegrationReason({
        availability: {
          ...baseAvailability,
          runtimeNextActionAvailable: false,
        },
        status: "partial",
        executiveSummaryStatus: "partial",
      })
    ).toBe("runtime-next-action-unavailable");

    expect(
      resolveRuntimeRecommendationIntegrationReason({
        availability: {
          ...baseAvailability,
          recommendationComparisonAvailable: false,
        },
        status: "partial",
        executiveSummaryStatus: "partial",
      })
    ).toBe("recommendation-comparison-unavailable");

    expect(
      resolveRuntimeRecommendationIntegrationReason({
        availability: {
          ...baseAvailability,
          observationSummaryAvailable: false,
        },
        status: "partial",
        executiveSummaryStatus: "partial",
      })
    ).toBe("observation-summary-unavailable");

    expect(
      resolveRuntimeRecommendationIntegrationReason({
        availability: baseAvailability,
        status: "partial",
        executiveSummaryStatus: "partial",
      })
    ).toBe("executive-summary-partial");

    expect(
      resolveRuntimeRecommendationIntegrationReason({
        availability: baseAvailability,
        status: "complete",
        executiveSummaryStatus: "complete",
      })
    ).toBe("recommendation-integration-complete");
  });

  it("resolves completed stages in official stage order", () => {
    const stages =
      resolveRuntimeRecommendationIntegrationCompletedStages({
        runtimeNextActionAvailable: true,
        recommendationComparisonAvailable: false,
        observationSummaryAvailable: true,
        executiveSummaryAvailable: true,
        baseRecommendationAvailable: false,
        adaptiveRecommendationAvailable: false,
      });

    expect(stages).toEqual([
      "runtime-next-action",
      "observation-summary",
      "executive-summary",
    ]);
  });

  it("normalizes warnings independently", () => {
    const executiveSummaryResult =
      createExecutiveSummaryResult({
        warnings: [
          "Shared warning",
          "Executive warning",
        ],
      });

    const warnings =
      collectRuntimeRecommendationIntegrationWarnings({
        warnings: [
          " Shared warning ",
          "",
          "Integration warning",
        ],
        executiveSummaryResult,
      });

    expect(warnings).toEqual([
      "Shared warning",
      "Integration warning",
      "Executive warning",
    ]);
  });
});

describe("Integration clone helpers", () => {
  it("clones the Executive Summary result independently", () => {
    const source =
      createExecutiveSummaryResult({
        warnings: ["Original warning"],
      });

    const clone =
      cloneCreateRuntimeExecutiveSummaryResult(source);

    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);

    expect(clone.executiveSummary).not.toBe(
      source.executiveSummary
    );

    expect(clone.diagnostics).not.toBe(
      source.diagnostics
    );

    expect(clone.diagnostics.warnings).not.toBe(
      source.diagnostics.warnings
    );

    expect(clone.policy).not.toBe(source.policy);

    clone.executiveSummary.headline =
      "Modified headline";

    clone.diagnostics.warnings.push(
      "Modified warning"
    );

    clone.policy.decimalPlaces = 7;

    expect(source.executiveSummary.headline).not.toBe(
      "Modified headline"
    );

    expect(source.diagnostics.warnings).toEqual([
      "Original warning",
    ]);

    expect(source.policy.decimalPlaces).toBe(2);
  });

  it("clones Integration diagnostics independently", () => {
    const source:
      RuntimeRecommendationIntegrationDiagnostics = {
        generatedAt: GENERATED_AT,
        status: "complete",
        reason: "recommendation-integration-complete",

        availability: {
          runtimeNextActionAvailable: true,
          recommendationComparisonAvailable: true,
          observationSummaryAvailable: true,
          executiveSummaryAvailable: true,
          baseRecommendationAvailable: true,
          adaptiveRecommendationAvailable: true,
        },

        completedStages: [
          "runtime-next-action",
          "recommendation-comparison",
          "observation-summary",
          "executive-summary",
        ],

        completedStageCount: 4,
        totalStageCount: 4,

        warningCount: 1,
        warnings: ["Original warning"],
      };

    const clone =
      cloneRuntimeRecommendationIntegrationDiagnostics(
        source
      );

    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);

    expect(clone.availability).not.toBe(
      source.availability
    );

    expect(clone.completedStages).not.toBe(
      source.completedStages
    );

    expect(clone.warnings).not.toBe(
      source.warnings
    );

    clone.availability.runtimeNextActionAvailable =
      false;

    clone.completedStages.push(
      "runtime-next-action"
    );

    clone.warnings.push("New warning");

    expect(
      source.availability.runtimeNextActionAvailable
    ).toBe(true);

    expect(source.completedStages).toHaveLength(4);

    expect(source.warnings).toEqual([
      "Original warning",
    ]);
  });

  it("clones the complete Integration result independently", () => {
    const source = createCompleteIntegrationResult();

    const clone =
      cloneRuntimeRecommendationIntegrationResult(source);

    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);

    expect(clone.runtimeNextAction).not.toBe(
      source.runtimeNextAction
    );

    expect(clone.recommendationComparison).not.toBe(
      source.recommendationComparison
    );

    expect(clone.observationSummary).not.toBe(
      source.observationSummary
    );

    expect(clone.executiveSummaryResult).not.toBe(
      source.executiveSummaryResult
    );

    expect(clone.diagnostics).not.toBe(
      source.diagnostics
    );

    clone.diagnostics.warnings.push(
      "Clone-only warning"
    );

    clone.executiveSummaryResult.executiveSummary
      .headline = "Clone-only headline";

    expect(source.diagnostics.warnings).not.toContain(
      "Clone-only warning"
    );

    expect(
      source.executiveSummaryResult.executiveSummary
        .headline
    ).not.toBe("Clone-only headline");
  });
});