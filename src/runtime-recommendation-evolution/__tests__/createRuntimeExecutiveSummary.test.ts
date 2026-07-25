import { describe, expect, it } from "vitest";

import type { RuntimeNextAction } from "../../runtime-next-action/runtimeNextActionTypes";
import type { CompareBaseAndAdaptiveRuntimeRecommendationsResult } from "../compareBaseAndAdaptiveRuntimeRecommendations";
import type {
    RuntimeRecommendationAdaptiveObservationSummary,
    RuntimeRecommendationAdaptiveObservationSummaryItem,
} from "../createAdaptiveRecommendationObservationSummary";
import {
    DEFAULT_RUNTIME_EXECUTIVE_SUMMARY_POLICY,
    cloneRuntimeExecutiveSummary,
    cloneRuntimeExecutiveSummaryDiagnostics,
    cloneRuntimeExecutiveSummaryPolicy,
    createRuntimeExecutiveSummary,
    normalizeRuntimeExecutiveSummaryPolicy,
} from "../createRuntimeExecutiveSummary";

const GENERATED_AT = "2026-07-25T02:00:00.000Z";

function createRuntimeNextAction(
  overrides: Record<string, unknown> = {}
): RuntimeNextAction {
  return {
    action: "continue-reflection",
    ...overrides,
  } as unknown as RuntimeNextAction;
}

function createRecommendationComparison({
  baseCandidateId = "base-candidate",
  adaptiveCandidateId = "adaptive-candidate",
  sameCandidate = false,
  winnerChanged = true,
  status = "changed",
  baseWinnerAvailable = true,
  adaptiveWinnerAvailable = true,
}: {
  baseCandidateId?: string | null;
  adaptiveCandidateId?: string | null;
  sameCandidate?: boolean;
  winnerChanged?: boolean;
  status?: string;
  baseWinnerAvailable?: boolean;
  adaptiveWinnerAvailable?: boolean;
} = {}): CompareBaseAndAdaptiveRuntimeRecommendationsResult {
  return {
    baseWinnerSnapshot: baseWinnerAvailable
      ? {
          candidateId: baseCandidateId,
        }
      : null,
    adaptiveWinnerSnapshot: adaptiveWinnerAvailable
      ? {
          candidateId: adaptiveCandidateId,
        }
      : null,
    diagnostics: {
      baseCandidateId,
      adaptiveCandidateId,
      sameCandidate,
      winnerChanged,
      status,
    },
  } as unknown as CompareBaseAndAdaptiveRuntimeRecommendationsResult;
}

function createObservationItem({
  category = "stability",
  severity = "positive",
  title = "Stable recommendation pattern",
  description = "The recommendation pattern remained stable.",
}: {
  category?:
    RuntimeRecommendationAdaptiveObservationSummaryItem["category"];
  severity?:
    RuntimeRecommendationAdaptiveObservationSummaryItem["severity"];
  title?: string;
  description?: string;
} = {}): RuntimeRecommendationAdaptiveObservationSummaryItem {
  return {
    category,
    severity,
    title,
    description,
  } as RuntimeRecommendationAdaptiveObservationSummaryItem;
}

function createObservationSummary(
  overrides: Partial<RuntimeRecommendationAdaptiveObservationSummary> = {}
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
      "Adaptive Recommendation behavior remained stable across observations.",
    primaryRisk: null,
    strengths: [
      createObservationItem({
        category: "stability",
        severity: "positive",
        title: "Stable Adaptive pattern",
        description:
          "The Adaptive Winner remained consistent across observations.",
      }),
    ],
    risks: [],
    recommendations: [
      createObservationItem({
        category: "evidence",
        severity: "info",
        title: "Continue Shadow Mode monitoring",
        description:
          "Continue monitoring the stable recommendation pattern in Shadow Mode.",
      }),
    ],
    ...overrides,
  } as RuntimeRecommendationAdaptiveObservationSummary;
}

describe("createRuntimeExecutiveSummary", () => {
  it("returns insufficient-data when every source is unavailable", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: null,
      recommendationComparison: null,
      observationSummary: null,
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary).toMatchObject({
      runtimeState: "insufficient-data",
      recommendationState: "unavailable",
      currentAction: null,
      baseRecommendationId: null,
      adaptiveRecommendationId: null,
      recommendationChanged: null,
      status: "insufficient-data",
      reason: "no-runtime-summary-evidence",
      headline:
        "Runtime evidence is not yet sufficient for an executive summary.",
      nextFocus:
        "Collect more complete Runtime and Recommendation Evolution evidence.",
    });

    expect(result.executiveSummary.overview).toBe(
      "The current Runtime action is unavailable. " +
        "Recommendation comparison evidence is unavailable."
    );

    expect(result.executiveSummary.primarySignal).toBeNull();

    expect(result.executiveSummary.primaryRisk).toEqual({
      category: "evidence",
      severity: "warning",
      title: "Runtime evidence is insufficient",
      description:
        "The available Runtime and Recommendation Evolution sources are not sufficient for a complete executive interpretation.",
    });

    expect(result.diagnostics).toEqual({
      generatedAt: GENERATED_AT,
      runtimeNextActionAvailable: false,
      recommendationComparisonAvailable: false,
      baseRecommendationAvailable: false,
      adaptiveRecommendationAvailable: false,
      observationSummaryAvailable: false,
      observationSummaryStatus: null,
      warningCount: 0,
      warnings: [],
    });

    expect(result.policy).toEqual(
      DEFAULT_RUNTIME_EXECUTIVE_SUMMARY_POLICY
    );
  });

  it("creates a complete stable summary when all evidence is available", () => {
    const observationSummary = createObservationSummary();

    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction({
        action: "continue-reflection",
      }),
      recommendationComparison: createRecommendationComparison({
        baseCandidateId: "candidate-a",
        adaptiveCandidateId: "candidate-b",
        sameCandidate: false,
        winnerChanged: false,
        status: "unchanged",
      }),
      observationSummary,
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary).toMatchObject({
      runtimeState: "stable",
      recommendationState: "adaptive-stable",
      currentAction: "continue-reflection",
      baseRecommendationId: "candidate-a",
      adaptiveRecommendationId: "candidate-b",
      recommendationChanged: false,
      observationCount: 10,
      comparableObservationCount: 8,
      confidenceLevel: "strong",
      stabilityLevel: "stable",
      driftLevel: "stable",
      confidenceScore: 0.9,
      stabilityRate: 0.8,
      driftScore: 0.1,
      status: "complete",
      reason: "runtime-state-summarized",
    });

    expect(result.executiveSummary.headline).toBe(
      "A distinct Adaptive Recommendation pattern is remaining stable in Shadow Mode."
    );

    expect(result.executiveSummary.overview).toContain(
      'The current Runtime action is "continue-reflection".'
    );

    expect(result.executiveSummary.overview).toContain(
      "The Adaptive Winner differs from the Base Winner but remains stable across accumulated observations."
    );

    expect(result.executiveSummary.overview).toContain(
      "stability 80.00%"
    );
    expect(result.executiveSummary.overview).toContain("Drift 0.10");
    expect(result.executiveSummary.overview).toContain(
      "Confidence 0.90"
    );

    expect(result.executiveSummary.primarySignal).toEqual({
      category: "stability",
      severity: "positive",
      title: "Stable Adaptive pattern",
      description:
        "The Adaptive Winner remained consistent across observations.",
    });

    expect(result.executiveSummary.primaryRisk).toBeNull();

    expect(result.executiveSummary.nextFocus).toBe(
      "Continue monitoring the stable recommendation pattern in Shadow Mode."
    );

    expect(result.diagnostics).toMatchObject({
      generatedAt: GENERATED_AT,
      runtimeNextActionAvailable: true,
      recommendationComparisonAvailable: true,
      baseRecommendationAvailable: true,
      adaptiveRecommendationAvailable: true,
      observationSummaryAvailable: true,
      observationSummaryStatus: "complete",
      warningCount: 0,
      warnings: [],
    });
  });

  it("reports aligned recommendation state when Base and Adaptive candidates match", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction({
        type: "observe-runtime",
        action: undefined,
      }),
      recommendationComparison: createRecommendationComparison({
        baseCandidateId: "candidate-a",
        adaptiveCandidateId: "candidate-a",
        sameCandidate: true,
        winnerChanged: false,
        status: "unchanged",
      }),
      observationSummary: createObservationSummary(),
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary.currentAction).toBe(
      "observe-runtime"
    );
    expect(result.executiveSummary.recommendationState).toBe("aligned");
    expect(result.executiveSummary.runtimeState).toBe("stable");
    expect(result.executiveSummary.headline).toBe(
      "Runtime and Adaptive Recommendation signals remain aligned and stable."
    );
    expect(result.executiveSummary.overview).toContain(
      "Base and Adaptive Recommendation Winners are aligned."
    );
  });

  it("reports changing and adaptive-emerging when a new Adaptive candidate begins emerging", () => {
    const observationSummary = createObservationSummary({
      tone: "stable",
      stabilityRate: 0.55,
      driftScore: 0.35,
      confidenceScore: 0.7,
      primaryInsight:
        "A new Adaptive Recommendation pattern is emerging.",
      strengths: [],
      recommendations: [],
    });

    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison({
        baseCandidateId: "candidate-a",
        adaptiveCandidateId: "candidate-b",
        winnerChanged: true,
        status: "changed",
      }),
      observationSummary,
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary).toMatchObject({
      runtimeState: "changing",
      recommendationState: "adaptive-emerging",
      recommendationChanged: true,
      confidenceLevel: "established",
      stabilityLevel: "emerging",
      driftLevel: "emerging",
      status: "complete",
    });

    expect(result.executiveSummary.headline).toBe(
      "Runtime recommendation behavior is currently changing."
    );

    expect(result.executiveSummary.overview).toContain(
      "A different Adaptive Winner is beginning to emerge from the observation history."
    );

    expect(result.executiveSummary.nextFocus).toBe(
      "Continue observing whether the changing Adaptive Recommendation pattern persists."
    );
  });

  it("reports attention-required when a critical observation risk exists", () => {
    const criticalRisk = createObservationItem({
      category: "drift",
      severity: "critical",
      title: "Material recommendation drift",
      description:
        "The Adaptive Winner changed repeatedly across recent observations.",
    });

    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison({
        winnerChanged: true,
        status: "changed",
      }),
      observationSummary: createObservationSummary({
        tone: "cautious",
        stabilityRate: 0.2,
        driftScore: 0.8,
        confidenceScore: 0.75,
        strengths: [],
        risks: [criticalRisk],
        recommendations: [],
        primaryRisk:
          "Recommendation drift requires immediate review.",
      }),
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary).toMatchObject({
      runtimeState: "attention-required",
      stabilityLevel: "unstable",
      driftLevel: "significant",
      confidenceLevel: "established",
      headline:
        "Runtime recommendation evolution requires attention.",
    });

    expect(result.executiveSummary.primaryRisk).toEqual({
      category: "drift",
      severity: "critical",
      title: "Material recommendation drift",
      description:
        "The Adaptive Winner changed repeatedly across recent observations.",
    });

    expect(result.executiveSummary.nextFocus).toBe(
      "Review the primary Recommendation Evolution risk before drawing a broader Runtime conclusion."
    );
  });

  it("returns partial status when only Runtime Next Action is available", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction({
        action: "continue-base-runtime",
      }),
      recommendationComparison: null,
      observationSummary: null,
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary).toMatchObject({
      runtimeState: "observing",
      recommendationState: "unavailable",
      currentAction: "continue-base-runtime",
      status: "partial",
      reason: "recommendation-comparison-unavailable",
    });

    expect(result.diagnostics).toMatchObject({
      runtimeNextActionAvailable: true,
      recommendationComparisonAvailable: false,
      observationSummaryAvailable: false,
    });
  });

  it("returns base-only when an Adaptive candidate is unavailable", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison({
        baseCandidateId: "base-candidate",
        adaptiveCandidateId: null,
        adaptiveWinnerAvailable: false,
        winnerChanged: false,
        status: "unchanged",
      }),
      observationSummary: null,
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary).toMatchObject({
      runtimeState: "observing",
      recommendationState: "base-only",
      baseRecommendationId: "base-candidate",
      adaptiveRecommendationId: null,
      status: "partial",
      reason: "evolution-summary-unavailable",
    });

    expect(result.executiveSummary.headline).toBe(
      "Runtime is operating on the Base Recommendation while Adaptive evidence is still unavailable."
    );

    expect(result.executiveSummary.nextFocus).toBe(
      "Continue the current Base Runtime flow while collecting Adaptive observation evidence."
    );

    expect(result.diagnostics).toMatchObject({
      baseRecommendationAvailable: true,
      adaptiveRecommendationAvailable: false,
    });
  });

  it("uses the observation primary risk when no structured risk item exists", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison({
        winnerChanged: false,
        status: "unchanged",
      }),
      observationSummary: createObservationSummary({
        tone: "cautious",
        stabilityRate: 0.45,
        driftScore: 0.3,
        risks: [],
        primaryRisk:
          "The current evidence window is still relatively narrow.",
      }),
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary.primaryRisk).toEqual({
      category: "evidence",
      severity: "warning",
      title: "Recommendation Evolution requires continued review",
      description:
        "The current evidence window is still relatively narrow.",
    });
  });

  it("applies policy options to overview generation and metric formatting", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction({
        action: "review-recommendation",
      }),
      recommendationComparison: createRecommendationComparison({
        baseCandidateId: "candidate-a",
        adaptiveCandidateId: "candidate-b",
        winnerChanged: true,
        status: "changed",
      }),
      observationSummary: createObservationSummary({
        stabilityRate: 0.81234,
        driftScore: 0.12345,
        confidenceScore: 0.95678,
      }),
      policy: {
        includeRecommendationComparison: false,
        includeObservationMetrics: true,
        maximumOverviewSentenceCount: 2,
        decimalPlaces: 1,
      },
      generatedAt: GENERATED_AT,
    });

    expect(result.policy).toEqual({
      includeObservationMetrics: true,
      includeRecommendationComparison: false,
      maximumOverviewSentenceCount: 2,
      decimalPlaces: 1,
    });

    expect(result.executiveSummary.overview).toBe(
      'The current Runtime action is "review-recommendation". ' +
        "Adaptive Recommendation behavior remained stable across observations. " +
        "Current analytics show stability 81.2%, Drift 0.1, and Confidence 1.0."
    );

    expect(result.executiveSummary.overview).not.toContain(
      "Adaptive scoring selected"
    );
  });

  it("uses only the primary insight when observation metrics are disabled", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison(),
      observationSummary: createObservationSummary({
        primaryInsight: "Observation metrics are intentionally hidden.",
      }),
      policy: {
        includeObservationMetrics: false,
      },
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary.overview).toContain(
      "Observation metrics are intentionally hidden."
    );
    expect(result.executiveSummary.overview).not.toContain(
      "Current analytics show"
    );
  });

  it("normalizes candidate identifiers and treats blank IDs as unavailable", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison({
        baseCandidateId: "  base-candidate  ",
        adaptiveCandidateId: "   ",
        adaptiveWinnerAvailable: true,
        winnerChanged: false,
        status: "unchanged",
      }),
      observationSummary: null,
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary.baseRecommendationId).toBe(
      "base-candidate"
    );
    expect(result.executiveSummary.adaptiveRecommendationId).toBeNull();
    expect(result.executiveSummary.recommendationState).toBe("base-only");
  });

  it("adds warnings for inconsistent comparison and observation data", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison({
        winnerChanged: false,
        status: "changed",
      }),
      observationSummary: createObservationSummary({
        observationCount: 10,
        comparableObservationCount: 4,
        incompleteObservationCount: 3,
        agreementRate: 1.2,
        stabilityRate: -0.2,
        driftScore: 2,
        confidenceScore: Number.POSITIVE_INFINITY,
      }),
      generatedAt: GENERATED_AT,
    });

    expect(result.diagnostics.warnings).toEqual(
      expect.arrayContaining([
        "Recommendation Comparison winnerChanged does not match its status.",
        "Observation Summary counts are inconsistent.",
        "Observation Summary agreementRate is outside the valid range.",
        "Observation Summary stabilityRate is outside the valid range.",
        "Observation Summary driftScore is outside the valid range.",
        "Observation Summary confidenceScore is outside the valid range.",
      ])
    );

    expect(result.diagnostics.warningCount).toBe(
      result.diagnostics.warnings.length
    );

    expect(result.executiveSummary.stabilityRate).toBe(0);
    expect(result.executiveSummary.driftScore).toBe(1);
    expect(result.executiveSummary.confidenceScore).toBeNull();
  });

  it("maps observation categories to executive signal categories", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison({
        baseCandidateId: "candidate-a",
        adaptiveCandidateId: "candidate-a",
        sameCandidate: true,
        winnerChanged: false,
        status: "unchanged",
      }),
      observationSummary: createObservationSummary({
        strengths: [
          createObservationItem({
            category: "agreement",
            severity: "positive",
            title: "Recommendation agreement",
            description:
              "Base and Adaptive Recommendation Winners agree.",
          }),
        ],
      }),
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary.primarySignal).toEqual({
      category: "recommendation",
      severity: "positive",
      title: "Recommendation agreement",
      description:
        "Base and Adaptive Recommendation Winners agree.",
    });
  });

  it("resolves Runtime action from supported fallback keys", () => {
    const supportedCases: Array<{
      runtimeNextAction: Record<string, unknown>;
      expected: string;
    }> = [
      {
        runtimeNextAction: {
          action: " action-value ",
        },
        expected: "action-value",
      },
      {
        runtimeNextAction: {
          action: "",
          type: " type-value ",
        },
        expected: "type-value",
      },
      {
        runtimeNextAction: {
          nextAction: " next-action-value ",
        },
        expected: "next-action-value",
      },
      {
        runtimeNextAction: {
          recommendation: " recommendation-value ",
        },
        expected: "recommendation-value",
      },
      {
        runtimeNextAction: {
          id: " action-id ",
        },
        expected: "action-id",
      },
    ];

    for (const testCase of supportedCases) {
      const result = createRuntimeExecutiveSummary({
        runtimeNextAction:
          testCase.runtimeNextAction as unknown as RuntimeNextAction,
        recommendationComparison: null,
        observationSummary: null,
        generatedAt: GENERATED_AT,
      });

      expect(result.executiveSummary.currentAction).toBe(
        testCase.expected
      );
    }
  });

  it("returns null when Runtime Next Action contains no usable action field", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: {
        action: "   ",
        type: 123,
      } as unknown as RuntimeNextAction,
      recommendationComparison: null,
      observationSummary: null,
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary.currentAction).toBeNull();
  });

  it("returns insufficient-data when only an insufficient observation summary exists", () => {
    const result = createRuntimeExecutiveSummary({
      runtimeNextAction: null,
      recommendationComparison: null,
      observationSummary: createObservationSummary({
        status: "insufficient-data",
        tone: "cautious",
        observationCount: 0,
        comparableObservationCount: 0,
        incompleteObservationCount: 0,
        agreementRate: null,
        stabilityRate: null,
        driftScore: null,
        confidenceScore: null,
        primaryInsight:
          "There are not enough observations for interpretation.",
        strengths: [],
        risks: [],
        recommendations: [],
      }),
      generatedAt: GENERATED_AT,
    });

    expect(result.executiveSummary).toMatchObject({
      runtimeState: "observing",
      recommendationState: "unavailable",
      confidenceLevel: "insufficient-data",
      stabilityLevel: "insufficient-data",
      driftLevel: "insufficient-data",
      status: "insufficient-data",
      reason: "no-runtime-summary-evidence",
    });

    expect(result.executiveSummary.headline).toBe(
      "Runtime state is available, but Recommendation Evolution evidence remains limited."
    );
  });
});

describe("normalizeRuntimeExecutiveSummaryPolicy", () => {
  it("returns the default policy when no policy is supplied", () => {
    expect(normalizeRuntimeExecutiveSummaryPolicy()).toEqual(
      DEFAULT_RUNTIME_EXECUTIVE_SUMMARY_POLICY
    );
  });

  it("normalizes sentence count and decimal places", () => {
    expect(
      normalizeRuntimeExecutiveSummaryPolicy({
        maximumOverviewSentenceCount: 0,
        decimalPlaces: 20,
      })
    ).toEqual({
      includeObservationMetrics: true,
      includeRecommendationComparison: true,
      maximumOverviewSentenceCount: 1,
      decimalPlaces: 8,
    });

    expect(
      normalizeRuntimeExecutiveSummaryPolicy({
        maximumOverviewSentenceCount: 4.9,
        decimalPlaces: 3.8,
      })
    ).toEqual({
      includeObservationMetrics: true,
      includeRecommendationComparison: true,
      maximumOverviewSentenceCount: 4,
      decimalPlaces: 3,
    });
  });

  it("falls back to defaults for non-finite numeric values", () => {
    expect(
      normalizeRuntimeExecutiveSummaryPolicy({
        maximumOverviewSentenceCount: Number.NaN,
        decimalPlaces: Number.POSITIVE_INFINITY,
      })
    ).toEqual(DEFAULT_RUNTIME_EXECUTIVE_SUMMARY_POLICY);
  });
});

describe("clone helpers", () => {
  it("clones executive summary nested signal objects", () => {
    const source = createRuntimeExecutiveSummary({
      runtimeNextAction: createRuntimeNextAction(),
      recommendationComparison: createRecommendationComparison(),
      observationSummary: createObservationSummary({
        risks: [
          createObservationItem({
            category: "drift",
            severity: "warning",
            title: "Emerging drift",
            description: "A drift pattern may be emerging.",
          }),
        ],
      }),
      generatedAt: GENERATED_AT,
    }).executiveSummary;

    const clone = cloneRuntimeExecutiveSummary(source);

    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);
    expect(clone.primarySignal).not.toBe(source.primarySignal);
    expect(clone.primaryRisk).not.toBe(source.primaryRisk);

    if (clone.primarySignal !== null) {
      clone.primarySignal.title = "Modified signal";
    }

    if (clone.primaryRisk !== null) {
      clone.primaryRisk.title = "Modified risk";
    }

    expect(source.primarySignal?.title).not.toBe("Modified signal");
    expect(source.primaryRisk?.title).not.toBe("Modified risk");
  });

  it("clones diagnostics warnings independently", () => {
    const source = {
      generatedAt: GENERATED_AT,
      runtimeNextActionAvailable: true,
      recommendationComparisonAvailable: true,
      baseRecommendationAvailable: true,
      adaptiveRecommendationAvailable: true,
      observationSummaryAvailable: true,
      observationSummaryStatus: "complete",
      warningCount: 1,
      warnings: ["Original warning"],
    };

    const clone = cloneRuntimeExecutiveSummaryDiagnostics(source);

    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);
    expect(clone.warnings).not.toBe(source.warnings);

    clone.warnings.push("New warning");

    expect(source.warnings).toEqual(["Original warning"]);
  });

  it("clones policy independently", () => {
    const source = {
      ...DEFAULT_RUNTIME_EXECUTIVE_SUMMARY_POLICY,
    };

    const clone = cloneRuntimeExecutiveSummaryPolicy(source);

    expect(clone).toEqual(source);
    expect(clone).not.toBe(source);

    clone.decimalPlaces = 6;

    expect(source.decimalPlaces).toBe(2);
  });
});
