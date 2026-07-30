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

import type {
  RecommendationPredictiveIntelligenceUpdateResult,
} from "../../runtime-recommendation-evolution";

/* ------------------------------------------------------------------ */
/* Test Constants */
/* ------------------------------------------------------------------ */

const GENERATED_AT =
  "2026-07-26T03:00:00.000Z";

type RuntimePredictiveTestInput =
  NonNullable<
    RunRuntimeRecommendationIntegrationParams[
      "predictiveInput"
    ]
  >;

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

function createPredictiveIntelligenceResult():
  RecommendationPredictiveIntelligenceUpdateResult {
  return {
    analysis: {
      state: "predicting",
      predictedAt: GENERATED_AT,
    },

    presentation: {
      headline:
        "A stable recommendation transition is predicted.",

      createdAt:
        GENERATED_AT,
    },

    predictedAt:
      GENERATED_AT,
  } as unknown as
    RecommendationPredictiveIntelligenceUpdateResult;
}

function createPredictiveInput():
  RuntimePredictiveTestInput {
  const memory = {
    id:
      "recommendation-memory-1",

    historyId:
      "recommendation-history-1",

    entries:
      [],

    version:
      1,

    createdAt:
      GENERATED_AT,

    updatedAt:
      GENERATED_AT,
  } as unknown as
    RuntimePredictiveTestInput[
      "memory"
    ];

  const memoryAnalysis = {
    version:
      1,

    memoryId:
      "recommendation-memory-1",

    historyId:
      "recommendation-history-1",

    state:
      "stable",

    confidence:
      "high",

    statistics: {
      entryCount:
        0,

      comparisonCount:
        0,

      stateCounts:
        {},

      strategyCounts:
        {},

      stateChangeCount:
        0,

      strategyChangeCount:
        0,

      observeStreak:
        0,

      maintainStreak:
        0,

      stalledStreak:
        0,

      fragmentedStreak:
        0,

      advancingStreak:
        0,

      averageScores:
        {},

      latestScoreChanges:
        null,
    },

    scores: {
      longTermStability:
        0,

      longTermProgress:
        0,

      longTermRisk:
        0,

      recovery:
        0,
    },

    comparisons:
      [],

    signals:
      [],

    primarySignalType:
      null,

    reasoning:
      [],

    analyzedAt:
      GENERATED_AT,
  } as unknown as
    RuntimePredictiveTestInput[
      "memoryAnalysis"
    ];

  const adaptiveLearningAnalysis = {
    version:
      1,

    memoryId:
      "recommendation-memory-1",

    historyId:
      "recommendation-history-1",

    sourceMemoryAnalyzedAt:
      GENERATED_AT,

    state:
      "learning",

    statistics:
      {},

    scores: {
      evidenceStrength:
        0.7,

      learningConfidence:
        0.72,

      adaptationReadiness:
        0.68,

      conflictRisk:
        0.1,
    },

    observations:
      [],

    patterns:
      [],

    adaptationRules:
      [],

    runtimeAdjustment: {
      strategyPreferenceAdjustments:
        {},

      decisionPreferenceAdjustments:
        {},

      signalConfidenceAdjustments:
        {},

      evidenceRequirementAdjustment:
        0,

      newRecommendationThresholdAdjustment:
        0,

      redirectionThresholdAdjustment:
        0,

      stabilizationPreferenceAdjustment:
        0,

      recoveryPreferenceAdjustment:
        0,
    },

    primaryPatternType:
      null,

    reasoning:
      [],

    analyzedAt:
      GENERATED_AT,
  } as unknown as
    RuntimePredictiveTestInput[
      "adaptiveLearningAnalysis"
    ];

  return {
    memory,

    memoryAnalysis,

    adaptiveLearningAnalysis,

    horizon:
      "next-evaluation",

    recentEntryLimit:
      5,

    recentComparisonLimit:
      5,

    maximumStateCandidateCount:
      3,

    maximumStrategyCandidateCount:
      3,

    maximumDecisionCandidateCount:
      4,

    minimumCandidateProbability:
      0.05,
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

  predictiveInput =
    null,

  generatedAt =
    GENERATED_AT,

  warnings = [
    "Pipeline source warning.",
  ],
}: {
  runtimeNextAction?:
    RuntimeNextAction | null;

  predictiveInput?:
    RunRuntimeRecommendationIntegrationParams[
      "predictiveInput"
    ];

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

    predictiveInput,

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

  predictiveIntelligenceResult =
    createPredictiveIntelligenceResult(),

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

  predictiveIntelligenceResult?:
    RecommendationPredictiveIntelligenceUpdateResult;

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

  updatePredictiveIntelligence:
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

  const updatePredictiveIntelligence =
    vi.fn(
      (
        _params: Parameters<
          RuntimeRecommendationIntegrationDependencies[
            "updatePredictiveIntelligence"
          ]
        >[0]
      ) => {
        calls?.push(
          "predictive-intelligence"
        );

        return predictiveIntelligenceResult;
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
      updatePredictiveIntelligence,
      createIntegrationResult,
    };

  return {
    dependencies,
    compareRecommendations,
    createObservationSummary,
    createExecutiveSummary,
    updatePredictiveIntelligence,
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
          updatePredictiveIntelligence,
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
          updatePredictiveIntelligence
        ).not.toHaveBeenCalled();

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
          result.predictiveIntelligenceResult
        ).toBeNull();

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

    it(
      "skips Predictive Intelligence when predictive input is unavailable",
      () => {
        const {
          dependencies,
          updatePredictiveIntelligence,
          createIntegrationResult,
        } = createMockDependencies();

        const result =
          executeRuntimeRecommendationIntegrationPipeline(
            createPipelineParams(),
            dependencies
          );

        expect(
          updatePredictiveIntelligence
        ).not.toHaveBeenCalled();

        expect(
          result.predictiveIntelligenceResult
        ).toBeNull();

        expect(
          createIntegrationResult
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            predictiveIntelligenceResult:
              null,
          })
        );
      }
    );

    it(
      "executes Predictive Intelligence when predictive input is available",
      () => {
        const {
          dependencies,
          updatePredictiveIntelligence,
        } = createMockDependencies();

        executeRuntimeRecommendationIntegrationPipeline(
          createPipelineParams({
            predictiveInput:
              createPredictiveInput(),
          }),
          dependencies
        );

        expect(
          updatePredictiveIntelligence
        ).toHaveBeenCalledTimes(1);
      }
    );

    it(
      "passes Predictive input, normalized predictedAt, and ID factories to the Predictive stage",
      () => {
        const predictiveInput =
          createPredictiveInput();

        const generatedAt =
          "2026-07-30T04:00:00.000Z";

        const {
          dependencies,
          updatePredictiveIntelligence,
        } = createMockDependencies();

        executeRuntimeRecommendationIntegrationPipeline(
          createPipelineParams({
            predictiveInput,
            generatedAt,
          }),
          dependencies
        );

        expect(
          updatePredictiveIntelligence
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            ...predictiveInput,

            predictedAt:
              generatedAt,

            createStatePredictionId:
              expect.any(Function),

            createStrategyPredictionId:
              expect.any(Function),

            createDecisionPredictionId:
              expect.any(Function),

            createRiskPredictionId:
              expect.any(Function),

            createOpportunityPredictionId:
              expect.any(Function),

            createConflictId:
              expect.any(Function),

            createSignalId:
              expect.any(Function),
          })
        );
      }
    );

    it(
      "uses one shared timestamp for Predictive Intelligence and Integration assembly",
      () => {
        const generatedAt =
          "2026-07-30T05:30:00.000Z";

        const {
          dependencies,
          updatePredictiveIntelligence,
          createIntegrationResult,
        } = createMockDependencies();

        executeRuntimeRecommendationIntegrationPipeline(
          createPipelineParams({
            predictiveInput:
              createPredictiveInput(),

            generatedAt,
          }),
          dependencies
        );

        expect(
          updatePredictiveIntelligence
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            predictedAt:
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

    it(
      "passes the Predictive Intelligence result to the Integration assembler",
      () => {
        const predictiveIntelligenceResult =
          createPredictiveIntelligenceResult();

        const {
          dependencies,
          createIntegrationResult,
        } = createMockDependencies({
          predictiveIntelligenceResult,
        });

        executeRuntimeRecommendationIntegrationPipeline(
          createPipelineParams({
            predictiveInput:
              createPredictiveInput(),
          }),
          dependencies
        );

        expect(
          createIntegrationResult
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            predictiveIntelligenceResult,
          })
        );
      }
    );

    it(
      "preserves the Predictive Intelligence result in the Pipeline intermediate results",
      () => {
        const predictiveIntelligenceResult =
          createPredictiveIntelligenceResult();

        const {
          dependencies,
        } = createMockDependencies({
          predictiveIntelligenceResult,
        });

        const result =
          executeRuntimeRecommendationIntegrationPipeline(
            createPipelineParams({
              predictiveInput:
                createPredictiveInput(),
            }),
            dependencies
          );

        expect(
          result.predictiveIntelligenceResult
        ).toBe(
          predictiveIntelligenceResult
        );
      }
    );

    it(
      "preserves the Pipeline execution order when Predictive Intelligence runs",
      () => {
        const calls: string[] = [];

        const {
          dependencies,
        } = createMockDependencies({
          calls,
        });

        executeRuntimeRecommendationIntegrationPipeline(
          createPipelineParams({
            predictiveInput:
              createPredictiveInput(),
          }),
          dependencies
        );

        expect(calls).toEqual([
          "recommendation-comparison",
          "observation-summary",
          "executive-summary",
          "predictive-intelligence",
          "integration-result",
        ]);
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

    it(
      "propagates Predictive Intelligence errors and does not assemble a final result",
      () => {
        const {
          dependencies,
          updatePredictiveIntelligence,
          createIntegrationResult,
        } = createMockDependencies();

        updatePredictiveIntelligence
          .mockImplementationOnce(
            () => {
              throw new Error(
                "Predictive Intelligence failed"
              );
            }
          );

        expect(() =>
          runRuntimeRecommendationIntegration(
            createPipelineParams({
              predictiveInput:
                createPredictiveInput(),
            }),
            dependencies
          )
        ).toThrow(
          "Predictive Intelligence failed"
        );

        expect(
          createIntegrationResult
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects an invalid Predictive Intelligence dependency",
      () => {
        const {
          dependencies,
        } = createMockDependencies();

        const invalidDependencies = {
          ...dependencies,

          updatePredictiveIntelligence:
            undefined,
        } as unknown as
          RuntimeRecommendationIntegrationDependencies;

        expect(() =>
          runRuntimeRecommendationIntegration(
            createPipelineParams(),
            invalidDependencies
          )
        ).toThrow(
          'dependency="updatePredictiveIntelligence"'
        );
      }
    );
  }
);