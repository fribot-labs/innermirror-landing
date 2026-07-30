import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { RuntimeNextAction } from "../../runtime-next-action/runtimeNextActionTypes";

import type {
  CompareBaseAndAdaptiveRuntimeRecommendationsResult,
} from "../../runtime-recommendation-evolution/compareBaseAndAdaptiveRuntimeRecommendations";

import type {
  CreateAdaptiveRecommendationObservationSummaryResult,
  RuntimeRecommendationAdaptiveObservationSummary,
} from "../../runtime-recommendation-evolution/createAdaptiveRecommendationObservationSummary";

import type {
  CreateRuntimeExecutiveSummaryResult,
} from "../../runtime-recommendation-evolution/createRuntimeExecutiveSummary";

import type {
  RuntimeRecommendationIntegrationResult,
} from "../runtimeRecommendationIntegrationTypes";

import type {
  RunRuntimeRecommendationIntegrationParams,
  RuntimeRecommendationIntegrationDependencies,
} from "../runtimeRecommendationIntegrationPipelineTypes";

import {
  executeRuntimeRecommendationIntegrationPipeline,
  runRuntimeRecommendationIntegration,
} from "../runRuntimeRecommendationIntegration";

/* ------------------------------------------------------------------ */
/* Test Constants */
/* ------------------------------------------------------------------ */

const GENERATED_AT =
  "2026-07-26T03:00:00.000Z";

/* ------------------------------------------------------------------ */
/* Test Fixtures */
/* ------------------------------------------------------------------ */

function createRuntimeNextAction():
  RuntimeNextAction {
  return {
    action: "continue-reflection",
  } as unknown as RuntimeNextAction;
}

function createRecommendationComparison():
  CompareBaseAndAdaptiveRuntimeRecommendationsResult {
  return {
    baseWinner: null,
    adaptiveWinner: null,

    baseWinnerSnapshot: {
      candidateId: "base-candidate",
      baseScore: 0.82,
      isBlocking: false,
    },

    adaptiveWinnerSnapshot: {
      candidateId: "adaptive-candidate",
      baseScore: 0.78,
      adaptiveModifier: 0.12,
      adaptiveScore: 0.9,
      scoreDelta: 0.12,
      adaptiveRank: 1,
      isBlocking: false,
    },

    baseWinnerAdaptiveResult: null,

    scoreComparison: {
      baseWinnerBaseScore: 0.82,
      baseWinnerAdaptiveScore: 0.84,
      baseWinnerAdaptiveModifier: 0.02,
      adaptiveWinnerBaseScore: 0.78,
      adaptiveWinnerAdaptiveScore: 0.9,
      adaptiveWinnerAdaptiveModifier: 0.12,
      baseScoreDifference: 0.04,
      adaptiveScoreDifference: 0.06,
    },

    diagnostics: {
      generatedAt: GENERATED_AT,
      status: "changed",
      reason:
        "adaptive-scoring-selected-different-candidate",
      baseCandidateId: "base-candidate",
      adaptiveCandidateId: "adaptive-candidate",
      sameCandidate: false,
      winnerChanged: true,
      blockingStatusChanged: false,
      baseWinnerAdaptiveRank: 2,
      adaptiveWinnerRank: 1,
      adaptiveCandidateCount: 2,
      warnings: [],
    },
  } as unknown as
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;
}

function createObservationSummary():
  RuntimeRecommendationAdaptiveObservationSummary {
  return {
    observationCount: 10,
    comparableObservationCount: 10,
    incompleteObservationCount: 0,

    headline:
      "Adaptive Recommendation is supported by stable evidence.",

    overview:
      "All available observations were comparable.",

    primaryInsight:
      "Adaptive Winner continuity remains stable.",

    primaryRisk: null,

    dominantAdaptiveCandidateId:
      "adaptive-candidate",

    currentAdaptiveCandidateId:
      "adaptive-candidate",

    agreementRate: 0.8,
    stabilityRate: 0.9,
    driftScore: 0.1,
    confidenceScore: 0.9,

    strengths: [],
    risks: [],
    insights: [],
    recommendations: [],

    sourceStatus: {
      statisticsStatus: "calculated",
      stabilityStatus: "calculated",
      driftStatus: "calculated",
      confidenceStatus: "calculated",
      unavailableSourceCount: 0,
      partialSourceCount: 0,
    },

    tone: "strong",
    status: "complete",
    reason:
      "adaptive-observation-analysis-summarized",
  };
}

function createObservationSummaryResult():
  CreateAdaptiveRecommendationObservationSummaryResult {
  const summary =
    createObservationSummary();

  return {
    summary,

    diagnostics: {
      generatedAt: GENERATED_AT,
      observationCount: 10,
      comparableObservationCount: 10,
      incompleteObservationCount: 0,
      strengthCount: 0,
      riskCount: 0,
      insightCount: 0,
      recommendationCount: 0,
      sourceStatus: {
        ...summary.sourceStatus,
      },
      warningCount: 0,
      warnings: [],
    },

    policy: {
      maximumStrengthCount: 3,
      maximumRiskCount: 3,
      maximumInsightCount: 4,
      maximumRecommendationCount: 3,
      decimalPlaces: 2,
      includeStatusExplanation: true,
      includeMetricEvidence: true,
    },
  };
}

function createExecutiveSummaryResult():
  CreateRuntimeExecutiveSummaryResult {
  return {
    executiveSummary: {
      headline:
        "Runtime recommendation behavior is stable.",

      overview:
        "The current Runtime and Recommendation Evolution evidence were summarized.",

      runtimeState: "stable",
      recommendationState: "adaptive-stable",

      currentAction: "continue-reflection",

      baseRecommendationId:
        "base-candidate",

      adaptiveRecommendationId:
        "adaptive-candidate",

      recommendationChanged: true,

      observationCount: 10,
      comparableObservationCount: 10,

      confidenceLevel: "strong",
      stabilityLevel: "stable",
      driftLevel: "stable",

      confidenceScore: 0.9,
      stabilityRate: 0.9,
      driftScore: 0.1,

      primarySignal: null,
      primaryRisk: null,

      nextFocus:
        "Continue monitoring the stable Recommendation pattern.",

      status: "complete",
      reason: "runtime-state-summarized",
    },

    diagnostics: {
      generatedAt: GENERATED_AT,
      runtimeNextActionAvailable: true,
      recommendationComparisonAvailable: true,
      baseRecommendationAvailable: true,
      adaptiveRecommendationAvailable: true,
      observationSummaryAvailable: true,
      observationSummaryStatus: "complete",
      warningCount: 0,
      warnings: [],
    },

    policy: {
      includeObservationMetrics: true,
      includeRecommendationComparison: true,
      maximumOverviewSentenceCount: 3,
      decimalPlaces: 2,
    },
  };
}

function createIntegrationResult():
  RuntimeRecommendationIntegrationResult {
  return {
    runtimeNextAction:
      createRuntimeNextAction(),

    recommendationComparison:
      createRecommendationComparison(),

    observationSummary:
      createObservationSummary(),

    executiveSummaryResult:
      createExecutiveSummaryResult(),

    predictiveIntelligenceResult:
      null,

    diagnostics: {
      generatedAt: GENERATED_AT,

      status: "complete",

      reason:
        "recommendation-integration-complete",

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

      warningCount: 0,
      warnings: [],
    },
  };
}

/**
 * Pipeline 테스트는 각 도메인 분석기의 내부 로직을 다시 검증하지
 * 않습니다.
 *
 * 따라서 Comparison과 Observation 분석 입력은 실제 Params 계약으로
 * 타입을 지정하되, 최소 fixture를 사용합니다.
 */
function createPipelineParams({
  runtimeNextAction =
    createRuntimeNextAction(),
  generatedAt = GENERATED_AT,
  warnings = [
    "Pipeline source warning.",
  ],
}: {
  runtimeNextAction?:
    RuntimeNextAction | null;

  generatedAt?:
    string;

  warnings?:
    string[];
} = {}):
  RunRuntimeRecommendationIntegrationParams {
  return {
    runtimeNextAction,

    comparisonInput: {
      baseWinner: null,

      adaptiveResolution: {
        winner: null,
        rankedCandidates: [],

        diagnostics: {
          warnings: [],
        },
      } as unknown as
        RunRuntimeRecommendationIntegrationParams[
          "comparisonInput"
        ]["adaptiveResolution"],

      decimalPlaces: 4,
    },

    observationSummaryInput: {
      statistics: {
        observationCount: 10,
      },

      stability: {
        observationCount: 10,
      },

      drift: {
        observationCount: 10,
      },

      confidence: {
        observationCount: 10,
      },
    } as unknown as
      RunRuntimeRecommendationIntegrationParams[
        "observationSummaryInput"
      ],

    policy: {
      observationSummary: {
        decimalPlaces: 3,
        maximumStrengthCount: 2,
      },

      executiveSummary: {
        includeObservationMetrics: false,
        decimalPlaces: 1,
      },
    },

    generatedAt,
    warnings,
  };
}

/* ------------------------------------------------------------------ */
/* Mock Dependencies */
/* ------------------------------------------------------------------ */

function createMockDependencies({
  recommendationComparison =
    createRecommendationComparison(),

  observationSummaryResult =
    createObservationSummaryResult(),

  executiveSummaryResult =
    createExecutiveSummaryResult(),

  integrationResult =
    createIntegrationResult(),

  calls,
}: {
  recommendationComparison?:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;

  observationSummaryResult?:
    CreateAdaptiveRecommendationObservationSummaryResult;

  executiveSummaryResult?:
    CreateRuntimeExecutiveSummaryResult;

  integrationResult?:
    RuntimeRecommendationIntegrationResult;

  calls?: string[];
} = {}): {
  dependencies:
    RuntimeRecommendationIntegrationDependencies;

  compareRecommendations:
    ReturnType<typeof vi.fn>;

  createObservationSummary:
    ReturnType<typeof vi.fn>;

  createExecutiveSummary:
    ReturnType<typeof vi.fn>;

  createIntegrationResult:
    ReturnType<typeof vi.fn>;
} {
  const compareRecommendations =
    vi.fn(
      (
        _params: Parameters<
          RuntimeRecommendationIntegrationDependencies[
            "compareRecommendations"
          ]
        >[0]
      ) => {
        calls?.push(
          "recommendation-comparison"
        );

        return recommendationComparison;
      }
    );

  const createObservationSummary =
    vi.fn(
      (
        _params: Parameters<
          RuntimeRecommendationIntegrationDependencies[
            "createObservationSummary"
          ]
        >[0]
      ) => {
        calls?.push(
          "observation-summary"
        );

        return observationSummaryResult;
      }
    );

  const createExecutiveSummary =
    vi.fn(
      (
        _params: Parameters<
          RuntimeRecommendationIntegrationDependencies[
            "createExecutiveSummary"
          ]
        >[0]
      ) => {
        calls?.push(
          "executive-summary"
        );

        return executiveSummaryResult;
      }
    );

  const createIntegrationResult =
    vi.fn(
      (
        _params: Parameters<
          RuntimeRecommendationIntegrationDependencies[
            "createIntegrationResult"
          ]
        >[0]
      ) => {
        calls?.push(
          "integration-result"
        );

        return integrationResult;
      }
    );

  const dependencies:
    RuntimeRecommendationIntegrationDependencies = {
      compareRecommendations,
      createObservationSummary,
      createExecutiveSummary,
      createIntegrationResult,
    };

  return {
    dependencies,
    compareRecommendations,
    createObservationSummary,
    createExecutiveSummary,
    createIntegrationResult,
  };
}

/* ------------------------------------------------------------------ */
/* Public Pipeline Tests */
/* ------------------------------------------------------------------ */

describe(
  "runRuntimeRecommendationIntegration",
  () => {
    it(
      "returns the final Integration Result produced by the assembler",
      () => {
        const integrationResult =
          createIntegrationResult();

        const {
          dependencies,
        } = createMockDependencies({
          integrationResult,
        });

        const result =
          runRuntimeRecommendationIntegration(
            createPipelineParams(),
            dependencies
          );

        expect(result).toBe(
          integrationResult
        );
      }
    );

    it(
      "executes every Pipeline stage exactly once",
      () => {
        const {
          dependencies,
          compareRecommendations,
          createObservationSummary,
          createExecutiveSummary,
          createIntegrationResult,
        } = createMockDependencies();

        runRuntimeRecommendationIntegration(
          createPipelineParams(),
          dependencies
        );

        expect(
          compareRecommendations
        ).toHaveBeenCalledTimes(1);

        expect(
          createObservationSummary
        ).toHaveBeenCalledTimes(1);

        expect(
          createExecutiveSummary
        ).toHaveBeenCalledTimes(1);

        expect(
          createIntegrationResult
        ).toHaveBeenCalledTimes(1);
      }
    );

    it(
      "preserves the official Pipeline execution order",
      () => {
        const calls: string[] = [];

        const {
          dependencies,
        } = createMockDependencies({
          calls,
        });

        runRuntimeRecommendationIntegration(
          createPipelineParams(),
          dependencies
        );

        expect(calls).toEqual([
          "recommendation-comparison",
          "observation-summary",
          "executive-summary",
          "integration-result",
        ]);
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Intermediate Result Tests */
/* ------------------------------------------------------------------ */

describe(
  "executeRuntimeRecommendationIntegrationPipeline",
  () => {
    it(
      "returns all intermediate Pipeline results",
      () => {
        const recommendationComparison =
          createRecommendationComparison();

        const observationSummaryResult =
          createObservationSummaryResult();

        const executiveSummaryResult =
          createExecutiveSummaryResult();

        const integrationResult =
          createIntegrationResult();

        const {
          dependencies,
        } = createMockDependencies({
          recommendationComparison,
          observationSummaryResult,
          executiveSummaryResult,
          integrationResult,
        });

        const result =
          executeRuntimeRecommendationIntegrationPipeline(
            createPipelineParams(),
            dependencies
          );

        expect(
          result.recommendationComparison
        ).toBe(recommendationComparison);

        expect(
          result.observationSummaryResult
        ).toBe(observationSummaryResult);

        expect(
          result.executiveSummaryResult
        ).toBe(executiveSummaryResult);

        expect(
          result.integrationResult
        ).toBe(integrationResult);
      }
    );

    it(
      "passes Comparison input and the normalized generatedAt to the Comparison stage",
      () => {
        const params =
          createPipelineParams();

        const {
          dependencies,
          compareRecommendations,
        } = createMockDependencies();

        executeRuntimeRecommendationIntegrationPipeline(
          params,
          dependencies
        );

        expect(
          compareRecommendations
        ).toHaveBeenCalledWith({
          ...params.comparisonInput,
          generatedAt: GENERATED_AT,
        });
      }
    );

    it(
      "passes Observation analytics, policy, and generatedAt to the Observation Summary stage",
      () => {
        const params =
          createPipelineParams();

        const {
          dependencies,
          createObservationSummary,
        } = createMockDependencies();

        executeRuntimeRecommendationIntegrationPipeline(
          params,
          dependencies
        );

        expect(
          createObservationSummary
        ).toHaveBeenCalledWith({
          ...params.observationSummaryInput,

          policy:
            params.policy
              ?.observationSummary,

          generatedAt:
            GENERATED_AT,
        });
      }
    );

    it(
      "passes Runtime action, Comparison, Summary projection, policy, and generatedAt to the Executive Summary stage",
      () => {
        const params =
          createPipelineParams();

        const recommendationComparison =
          createRecommendationComparison();

        const observationSummaryResult =
          createObservationSummaryResult();

        const {
          dependencies,
          createExecutiveSummary,
        } = createMockDependencies({
          recommendationComparison,
          observationSummaryResult,
        });

        executeRuntimeRecommendationIntegrationPipeline(
          params,
          dependencies
        );

        expect(
          createExecutiveSummary
        ).toHaveBeenCalledWith({
          runtimeNextAction:
            params.runtimeNextAction,

          recommendationComparison,

          observationSummary:
            observationSummaryResult.summary,

          policy:
            params.policy
              ?.executiveSummary,

          generatedAt:
            GENERATED_AT,
        });
      }
    );

    it(
      "passes all domain results and caller warnings to the Integration assembler",
      () => {
        const params =
          createPipelineParams({
            warnings: [
              "First warning",
              "Second warning",
            ],
          });

        const recommendationComparison =
          createRecommendationComparison();

        const observationSummaryResult =
          createObservationSummaryResult();

        const executiveSummaryResult =
          createExecutiveSummaryResult();

        const {
          dependencies,
          createIntegrationResult,
        } = createMockDependencies({
          recommendationComparison,
          observationSummaryResult,
          executiveSummaryResult,
        });

        executeRuntimeRecommendationIntegrationPipeline(
          params,
          dependencies
        );

        expect(
          createIntegrationResult
        ).toHaveBeenCalledWith({
          runtimeNextAction:
            params.runtimeNextAction,

          recommendationComparison,

          observationSummary:
            observationSummaryResult.summary,

          executiveSummaryResult,

          predictiveIntelligenceResult:
              null,

          generatedAt:
            GENERATED_AT,

          warnings: [
            "First warning",
            "Second warning",
          ],
        });
      }
    );

    it(
      "uses observationSummaryResult.summary rather than the complete Observation Summary result",
      () => {
        const observationSummaryResult =
          createObservationSummaryResult();

        const {
          dependencies,
          createExecutiveSummary,
          createIntegrationResult,
        } = createMockDependencies({
          observationSummaryResult,
        });

        executeRuntimeRecommendationIntegrationPipeline(
          createPipelineParams(),
          dependencies
        );

        expect(
          createExecutiveSummary
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            observationSummary:
              observationSummaryResult.summary,
          })
        );

        expect(
          createIntegrationResult
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            observationSummary:
              observationSummaryResult.summary,
          })
        );

        expect(
          createExecutiveSummary
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            observationSummary:
              observationSummaryResult,
          })
        );
      }
    );

    it(
      "continues the complete Pipeline when RuntimeNextAction is null",
      () => {
        const params =
          createPipelineParams({
            runtimeNextAction: null,
          });

        const {
          dependencies,
          compareRecommendations,
          createObservationSummary,
          createExecutiveSummary,
          createIntegrationResult,
        } = createMockDependencies();

        executeRuntimeRecommendationIntegrationPipeline(
          params,
          dependencies
        );

        expect(
          compareRecommendations
        ).toHaveBeenCalledTimes(1);

        expect(
          createObservationSummary
        ).toHaveBeenCalledTimes(1);

        expect(
          createExecutiveSummary
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            runtimeNextAction: null,
          })
        );

        expect(
          createIntegrationResult
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            runtimeNextAction: null,
          })
        );
      }
    );

    it(
      "passes undefined policies when no Pipeline policy is supplied",
      () => {
        const params =
          createPipelineParams();

        delete params.policy;

        const {
          dependencies,
          createObservationSummary,
          createExecutiveSummary,
        } = createMockDependencies();

        executeRuntimeRecommendationIntegrationPipeline(
          params,
          dependencies
        );

        expect(
          createObservationSummary
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            policy: undefined,
          })
        );

        expect(
          createExecutiveSummary
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            policy: undefined,
          })
        );
      }
    );

    it(
      "preserves one shared generatedAt across every supported stage",
      () => {
        const generatedAt =
          "2026-07-26T08:30:00.000Z";

        const {
          dependencies,
          compareRecommendations,
          createObservationSummary,
          createExecutiveSummary,
          createIntegrationResult,
        } = createMockDependencies();

        executeRuntimeRecommendationIntegrationPipeline(
          createPipelineParams({
            generatedAt,
          }),
          dependencies
        );

        expect(
          compareRecommendations
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            generatedAt,
          })
        );

        expect(
          createObservationSummary
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            generatedAt,
          })
        );

        expect(
          createExecutiveSummary
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            generatedAt,
          })
        );

        expect(
          createIntegrationResult
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            generatedAt,
          })
        );
      }
    );
  }
);

/* ------------------------------------------------------------------ */
/* Error Propagation Tests */
/* ------------------------------------------------------------------ */

describe(
  "Runtime Recommendation Integration Pipeline errors",
  () => {
    it(
      "propagates Comparison errors and does not execute later stages",
      () => {
        const {
          dependencies,
          compareRecommendations,
          createObservationSummary,
          createExecutiveSummary,
          createIntegrationResult,
        } = createMockDependencies();

        compareRecommendations
          .mockImplementationOnce(
            () => {
              throw new Error(
                "Comparison failed"
              );
            }
          );

        expect(() =>
          runRuntimeRecommendationIntegration(
            createPipelineParams(),
            dependencies
          )
        ).toThrow(
          "Comparison failed"
        );

        expect(
          createObservationSummary
        ).not.toHaveBeenCalled();

        expect(
          createExecutiveSummary
        ).not.toHaveBeenCalled();

        expect(
          createIntegrationResult
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "propagates Observation Summary errors and stops later stages",
      () => {
        const {
          dependencies,
          compareRecommendations,
          createObservationSummary,
          createExecutiveSummary,
          createIntegrationResult,
        } = createMockDependencies();

        createObservationSummary
          .mockImplementationOnce(
            () => {
              throw new Error(
                "Observation Summary failed"
              );
            }
          );

        expect(() =>
          runRuntimeRecommendationIntegration(
            createPipelineParams(),
            dependencies
          )
        ).toThrow(
          "Observation Summary failed"
        );

        expect(
          compareRecommendations
        ).toHaveBeenCalledTimes(1);

        expect(
          createExecutiveSummary
        ).not.toHaveBeenCalled();

        expect(
          createIntegrationResult
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "propagates Executive Summary errors and does not assemble a final result",
      () => {
        const {
          dependencies,
          compareRecommendations,
          createObservationSummary,
          createExecutiveSummary,
          createIntegrationResult,
        } = createMockDependencies();

        createExecutiveSummary
          .mockImplementationOnce(
            () => {
              throw new Error(
                "Executive Summary failed"
              );
            }
          );

        expect(() =>
          runRuntimeRecommendationIntegration(
            createPipelineParams(),
            dependencies
          )
        ).toThrow(
          "Executive Summary failed"
        );

        expect(
          compareRecommendations
        ).toHaveBeenCalledTimes(1);

        expect(
          createObservationSummary
        ).toHaveBeenCalledTimes(1);

        expect(
          createIntegrationResult
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "propagates Integration assembler errors",
      () => {
        const {
          dependencies,
          createIntegrationResult,
        } = createMockDependencies();

        createIntegrationResult
          .mockImplementationOnce(
            () => {
              throw new Error(
                "Integration assembly failed"
              );
            }
          );

        expect(() =>
          runRuntimeRecommendationIntegration(
            createPipelineParams(),
            dependencies
          )
        ).toThrow(
          "Integration assembly failed"
        );
      }
    );

    it(
      "rejects an invalid injected dependency",
      () => {
        const {
          dependencies,
        } = createMockDependencies();

        const invalidDependencies = {
          ...dependencies,

          createExecutiveSummary:
            undefined,
        } as unknown as
          RuntimeRecommendationIntegrationDependencies;

        expect(() =>
          runRuntimeRecommendationIntegration(
            createPipelineParams(),
            invalidDependencies
          )
        ).toThrow(
          'dependency="createExecutiveSummary"'
        );
      }
    );
  }
);