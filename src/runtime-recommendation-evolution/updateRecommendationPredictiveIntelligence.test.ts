import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type {
    AnalyzeRecommendationPredictiveIntelligenceParams,
    RecommendationPredictiveIntelligence,
    RecommendationPredictiveIntelligenceUpdateResult,
    RecommendationPredictivePresentation,
    UpdateRecommendationPredictiveIntelligenceParams,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Hoisted Mocks                                                      */
/* ------------------------------------------------------------------ */

const predictiveAnalysisMocks =
  vi.hoisted(
    () => ({
      analyzeRecommendationPredictiveIntelligence:
        vi.fn(),

      cloneRecommendationPredictiveIntelligence:
        vi.fn(),

      validateRecommendationPredictiveIntelligence:
        vi.fn(),
    }),
  );

const predictivePresentationMocks =
  vi.hoisted(
    () => ({
      createRecommendationPredictivePresentation:
        vi.fn(),

      cloneRecommendationPredictivePresentation:
        vi.fn(),

      validateRecommendationPredictivePresentation:
        vi.fn(),
    }),
  );

/* ------------------------------------------------------------------ */
/* Module Mocks                                                       */
/* ------------------------------------------------------------------ */

vi.mock(
  "./analyzeRecommendationPredictiveIntelligence",
  () => predictiveAnalysisMocks,
);

vi.mock(
  "./createRecommendationPredictivePresentation",
  () => predictivePresentationMocks,
);

/* ------------------------------------------------------------------ */
/* Subject                                                            */
/* ------------------------------------------------------------------ */

import {
    cloneRecommendationPredictiveIntelligenceUpdateResult,
    hasRecommendationPredictiveIntelligenceConflict,
    hasRecommendationPredictiveIntelligencePredictions,
    hasRecommendationPredictiveIntelligencePresentation,
    isRecommendationPredictiveIntelligenceUpdateUsable,
    updateRecommendationPredictiveIntelligence,
    validateRecommendationPredictiveUpdateResult,
} from "./updateRecommendationPredictiveIntelligence";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const MEMORY_ID =
  "recommendation-memory-1";

const HISTORY_ID =
  "recommendation-history-1";

const MEMORY_ANALYZED_AT =
  "2026-07-29T08:00:00.000Z";

const ADAPTIVE_LEARNING_ANALYZED_AT =
  "2026-07-29T08:05:00.000Z";

const PREDICTED_AT =
  "2026-07-29T08:10:00.000Z";

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

function createMockAnalysis():
  RecommendationPredictiveIntelligence {
  return {
    version:
      1,

    memoryId:
      MEMORY_ID,

    historyId:
      HISTORY_ID,

    sourceMemoryAnalyzedAt:
      MEMORY_ANALYZED_AT,

    sourceAdaptiveLearningAnalyzedAt:
      ADAPTIVE_LEARNING_ANALYZED_AT,

    state:
      "predicting",

    horizon:
      "next-evaluation",

    context: {
      version:
        1,

      memoryId:
        MEMORY_ID,

      historyId:
        HISTORY_ID,

      sourceMemoryAnalyzedAt:
        MEMORY_ANALYZED_AT,

      sourceAdaptiveLearningAnalyzedAt:
        ADAPTIVE_LEARNING_ANALYZED_AT,

      horizon:
        "next-evaluation",

      currentEntryId:
        "entry-2",

      currentState:
        "progressing",

      currentStrategyType:
        "maintain",

      currentAssessmentConfidence:
        "medium",

      currentPrimarySignalType:
        null,

      currentMemorySignalTypes:
        [],

      currentRuntimeDecisionTypes: [
        "preserve-current-recommendation",
      ],

      recentEntryIds: [
        "entry-1",
        "entry-2",
      ],

      recentComparisonIds: [
        "comparison-1",
      ],

      recentStates: [
        "stable",
        "progressing",
      ],

      recentStrategyTypes: [
        "maintain",
      ],

      recentRuntimeDecisionTypes: [
        "preserve-current-recommendation",
      ],

      recentLearningPatternTypes:
        [],

      scoreTrend: {
        stability:
          "stable",

        progress:
          "increasing",

        repetitionRisk:
          "decreasing",

        redirectionRisk:
          "stable",

        completionMomentum:
          "increasing",

        stabilityChange:
          0,

        progressChange:
          0.2,

        repetitionRiskChange:
          -0.1,

        redirectionRiskChange:
          0,

        completionMomentumChange:
          0.15,

        sampleCount:
          2,
      },

      activeAdaptationRuleIds:
        [],

      conflictedAdaptationRuleIds:
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

      evidenceStrength:
        0.7,

      learningConfidence:
        0.72,

      adaptationReadiness:
        0.68,

      conflictRisk:
        0.1,

      createdAt:
        PREDICTED_AT,
    },

    statistics: {
      memoryEntryCount:
        2,

      comparisonCount:
        1,

      learningObservationCount:
        0,

      activeAdaptationRuleCount:
        0,

      conflictedAdaptationRuleCount:
        0,

      predictedStateCount:
        1,

      predictedStrategyCount:
        1,

      predictedRuntimeDecisionCount:
        1,

      predictedRiskCount:
        1,

      predictedOpportunityCount:
        1,

      conflictCount:
        0,

      signalCount:
        3,
    },

    scores: {
      evidenceStrength:
        0.7,

      temporalConsistency:
        0.65,

      statePredictionClarity:
        0.75,

      strategyPredictionClarity:
        0.7,

      decisionPredictionClarity:
        0.68,

      riskPressure:
        0.22,

      opportunityStrength:
        0.58,

      adaptiveAlignment:
        0.72,

      conflictRisk:
        0.1,

      predictionConfidence:
        0.71,
    },

    predictedStates: [
      {
        id:
          "state-prediction-1",

        state:
          "progressing",

        rank:
          1,

        scores: {
          rawScore:
            0.8,

          probability:
            1,

          confidence:
            0.76,
        },

        reasoning: [
          "Progress trend is increasing.",
        ],

        evidence: {
          relatedEntryIds: [
            "entry-1",
            "entry-2",
          ],

          relatedComparisonIds: [
            "comparison-1",
          ],

          relatedObservationIds:
            [],

          relatedPatternIds:
            [],

          relatedRuleIds:
            [],

          relatedMemorySignalTypes:
            [],
        },

        predictedAt:
          PREDICTED_AT,
      },
    ],

    predictedStrategies: [
      {
        id:
          "strategy-prediction-1",

        strategyType:
          "maintain",

        rank:
          1,

        scores: {
          rawScore:
            0.75,

          probability:
            1,

          confidence:
            0.72,
        },

        compatibleStateTypes: [
          "stable",
          "progressing",
        ],

        reasoning: [
          "Maintenance supports continued progress.",
        ],

        evidence: {
          relatedEntryIds: [
            "entry-1",
            "entry-2",
          ],

          relatedComparisonIds: [
            "comparison-1",
          ],

          relatedObservationIds:
            [],

          relatedPatternIds:
            [],

          relatedRuleIds:
            [],

          relatedMemorySignalTypes:
            [],
        },

        predictedAt:
          PREDICTED_AT,
      },
    ],

    predictedRuntimeDecisions: [
      {
        id:
          "decision-prediction-1",

        decisionType:
          "preserve-current-recommendation",

        rank:
          1,

        scores: {
          rawScore:
            0.7,

          probability:
            1,

          confidence:
            0.69,
        },

        relatedStateTypes: [
          "stable",
          "progressing",
        ],

        relatedStrategyTypes: [
          "maintain",
        ],

        reasoning: [
          "The current Recommendation may continue.",
        ],

        evidence: {
          relatedEntryIds: [
            "entry-1",
            "entry-2",
          ],

          relatedComparisonIds: [
            "comparison-1",
          ],

          relatedObservationIds:
            [],

          relatedPatternIds:
            [],

          relatedRuleIds:
            [],

          relatedMemorySignalTypes:
            [],
        },

        predictedAt:
          PREDICTED_AT,
      },
    ],

    predictedRisks: [
      {
        id:
          "risk-prediction-1",

        type:
          "stagnation-risk",

        severity:
          "low",

        rank:
          1,

        scores: {
          rawScore:
            0.25,

          probability:
            1,

          confidence:
            0.45,
        },

        description:
          "Low risk: progress may slow.",

        relatedStateTypes: [
          "observing",
          "stalled",
          "stable",
        ],

        relatedStrategyTypes: [
          "observe",
          "maintain",
          "clarify",
        ],

        relatedDecisionTypes: [
          "preserve-current-recommendation",
          "request-progress-evidence",
          "block-new-recommendation",
        ],

        reasoning: [
          "A small stagnation possibility remains.",
        ],

        evidence: {
          relatedEntryIds: [
            "entry-1",
            "entry-2",
          ],

          relatedComparisonIds: [
            "comparison-1",
          ],

          relatedObservationIds:
            [],

          relatedPatternIds:
            [],

          relatedRuleIds:
            [],

          relatedMemorySignalTypes:
            [],
        },

        predictedAt:
          PREDICTED_AT,
      },
    ],

    predictedOpportunities: [
      {
        id:
          "opportunity-prediction-1",

        type:
          "progress-likelihood",

        severity:
          "moderate",

        rank:
          1,

        scores: {
          rawScore:
            0.72,

          probability:
            1,

          confidence:
            0.73,
        },

        description:
          "Moderate opportunity: measurable progress may continue.",

        relatedStateTypes: [
          "progressing",
          "stable",
          "advancing",
          "observing",
        ],

        relatedStrategyTypes: [
          "maintain",
          "advance",
          "clarify",
          "stabilize",
        ],

        relatedDecisionTypes: [
          "preserve-current-recommendation",
          "request-progress-evidence",
          "allow-new-recommendation",
        ],

        reasoning: [
          "Recent progress supports continued development.",
        ],

        evidence: {
          relatedEntryIds: [
            "entry-1",
            "entry-2",
          ],

          relatedComparisonIds: [
            "comparison-1",
          ],

          relatedObservationIds:
            [],

          relatedPatternIds:
            [],

          relatedRuleIds:
            [],

          relatedMemorySignalTypes:
            [],
        },

        predictedAt:
          PREDICTED_AT,
      },
    ],

    conflicts:
      [],

    signals: [
      {
        id:
          "signal-1",

        type:
          "state-transition-likely",

        severity:
          "high",

        score:
          1,

        confidence:
          0.76,

        description:
          "Progressing is the strongest State prediction.",

        relatedStatePredictionIds: [
          "state-prediction-1",
        ],

        relatedStrategyPredictionIds:
          [],

        relatedDecisionPredictionIds:
          [],

        relatedRiskPredictionIds:
          [],

        relatedOpportunityPredictionIds:
          [],

        detectedAt:
          PREDICTED_AT,
      },

      {
        id:
          "signal-2",

        type:
          "strategy-transition-likely",

        severity:
          "high",

        score:
          1,

        confidence:
          0.72,

        description:
          "Maintain is the strongest Strategy prediction.",

        relatedStatePredictionIds:
          [],

        relatedStrategyPredictionIds: [
          "strategy-prediction-1",
        ],

        relatedDecisionPredictionIds:
          [],

        relatedRiskPredictionIds:
          [],

        relatedOpportunityPredictionIds:
          [],

        detectedAt:
          PREDICTED_AT,
      },

      {
        id:
          "signal-3",

        type:
          "runtime-decision-likely",

        severity:
          "high",

        score:
          1,

        confidence:
          0.69,

        description:
          "Preserve is the strongest Runtime Decision prediction.",

        relatedStatePredictionIds:
          [],

        relatedStrategyPredictionIds:
          [],

        relatedDecisionPredictionIds: [
          "decision-prediction-1",
        ],

        relatedRiskPredictionIds:
          [],

        relatedOpportunityPredictionIds:
          [],

        detectedAt:
          PREDICTED_AT,
      },
    ],

    primarySignalType:
      "state-transition-likely",

    primaryState:
      "progressing",

    primaryStrategyType:
      "maintain",

    primaryRuntimeDecisionType:
      "preserve-current-recommendation",

    primaryRiskType:
      "stagnation-risk",

    primaryOpportunityType:
      "progress-likelihood",

    reasoning: [
      "Progressing is the strongest predicted direction.",
    ],

    confidence:
      0.71,

    predictedAt:
      PREDICTED_AT,
  };
}

function createMockPresentation():
  RecommendationPredictivePresentation {
  return {
    tone:
      "predicting",

    headline:
      "The current Recommendation is showing a meaningful opportunity for progress.",

    summary:
      "Progressing is the strongest State candidate.",

    primaryPrediction:
      "A progressing state is the primary predicted transition.",

    statePrediction:
      "A progressing state is predicted.",

    strategyPrediction:
      "Maintenance is the most likely next strategy.",

    decisionPrediction:
      "The Runtime is most likely to preserve the current Recommendation.",

    riskDescription:
      "A small stagnation risk remains.",

    opportunityDescription:
      "Continued progress is the strongest opportunity.",

    confidenceDisclosure:
      "The prediction has moderate support and remains conditional.",

    warnings:
      [],

    evidence: [
      "Two Recommendation Memory Entries were reviewed.",
    ],

    createdAt:
      PREDICTED_AT,
  };
}

function createUpdateParams():
  UpdateRecommendationPredictiveIntelligenceParams {
  const memory = {
    id:
      MEMORY_ID,

    historyId:
      HISTORY_ID,

    entries:
      [],

    version:
      1,

    createdAt:
      MEMORY_ANALYZED_AT,

    updatedAt:
      MEMORY_ANALYZED_AT,
  } as unknown as UpdateRecommendationPredictiveIntelligenceParams[
    "memory"
  ];

  const memoryAnalysis = {
    version:
      1,

    memoryId:
      MEMORY_ID,

    historyId:
      HISTORY_ID,

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
      MEMORY_ANALYZED_AT,
  } as unknown as UpdateRecommendationPredictiveIntelligenceParams[
    "memoryAnalysis"
  ];

  const adaptiveLearningAnalysis = {
    version:
      1,

    memoryId:
      MEMORY_ID,

    historyId:
      HISTORY_ID,

    sourceMemoryAnalyzedAt:
      MEMORY_ANALYZED_AT,

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
      ADAPTIVE_LEARNING_ANALYZED_AT,
  } as unknown as UpdateRecommendationPredictiveIntelligenceParams[
    "adaptiveLearningAnalysis"
  ];

  return {
    memory,

    memoryAnalysis,

    adaptiveLearningAnalysis,

    horizon:
      "next-evaluation",

    predictedAt:
      PREDICTED_AT,

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

    createStatePredictionId:
      (
        state,
        index,
      ) =>
        `state-${state}-${index}`,

    createStrategyPredictionId:
      (
        strategyType,
        index,
      ) =>
        `strategy-${strategyType}-${index}`,

    createDecisionPredictionId:
      (
        decisionType,
        index,
      ) =>
        `decision-${decisionType}-${index}`,

    createRiskPredictionId:
      (
        type,
        index,
      ) =>
        `risk-${type}-${index}`,

    createOpportunityPredictionId:
      (
        type,
        index,
      ) =>
        `opportunity-${type}-${index}`,

    createConflictId:
      (
        type,
        index,
      ) =>
        `conflict-${type}-${index}`,

    createSignalId:
      (
        type,
        index,
      ) =>
        `signal-${type}-${index}`,
  };
}

function cloneValue<
  TValue,
>(
  value:
    TValue,
): TValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as TValue;
}

/* ------------------------------------------------------------------ */
/* Test Setup                                                         */
/* ------------------------------------------------------------------ */

beforeEach(
  () => {
    vi.clearAllMocks();

    predictiveAnalysisMocks
      .cloneRecommendationPredictiveIntelligence
      .mockImplementation(
        (
          analysis:
            RecommendationPredictiveIntelligence,
        ) =>
          cloneValue(
            analysis,
          ),
      );

    predictivePresentationMocks
      .cloneRecommendationPredictivePresentation
      .mockImplementation(
        (
          presentation:
            RecommendationPredictivePresentation,
        ) =>
          cloneValue(
            presentation,
          ),
      );

    predictiveAnalysisMocks
      .validateRecommendationPredictiveIntelligence
      .mockImplementation(
        () => undefined,
      );

    predictivePresentationMocks
      .validateRecommendationPredictivePresentation
      .mockImplementation(
        () => undefined,
      );
  },
);

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "updateRecommendationPredictiveIntelligence",
  () => {
    it(
      "runs analysis and presentation in sequence and returns one update result",
      () => {
        const params =
          createUpdateParams();

        const analysis =
          createMockAnalysis();

        const presentation =
          createMockPresentation();

        predictiveAnalysisMocks
          .analyzeRecommendationPredictiveIntelligence
          .mockReturnValue(
            analysis,
          );

        predictivePresentationMocks
          .createRecommendationPredictivePresentation
          .mockReturnValue(
            presentation,
          );

        const result =
          updateRecommendationPredictiveIntelligence(
            params,
          );

        expect(
          predictiveAnalysisMocks
            .analyzeRecommendationPredictiveIntelligence,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          predictiveAnalysisMocks
            .analyzeRecommendationPredictiveIntelligence,
        ).toHaveBeenCalledWith({
          memory:
            params.memory,

          memoryAnalysis:
            params.memoryAnalysis,

          adaptiveLearningAnalysis:
            params.adaptiveLearningAnalysis,

          horizon:
            params.horizon,

          predictedAt:
            params.predictedAt,

          recentEntryLimit:
            params.recentEntryLimit,

          recentComparisonLimit:
            params.recentComparisonLimit,

          maximumStateCandidateCount:
            params.maximumStateCandidateCount,

          maximumStrategyCandidateCount:
            params.maximumStrategyCandidateCount,

          maximumDecisionCandidateCount:
            params.maximumDecisionCandidateCount,

          minimumCandidateProbability:
            params.minimumCandidateProbability,

          createStatePredictionId:
            params.createStatePredictionId,

          createStrategyPredictionId:
            params.createStrategyPredictionId,

          createDecisionPredictionId:
            params.createDecisionPredictionId,

          createRiskPredictionId:
            params.createRiskPredictionId,

          createOpportunityPredictionId:
            params.createOpportunityPredictionId,

          createConflictId:
            params.createConflictId,

          createSignalId:
            params.createSignalId,
        } satisfies AnalyzeRecommendationPredictiveIntelligenceParams);

        expect(
          predictivePresentationMocks
            .createRecommendationPredictivePresentation,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          predictivePresentationMocks
            .createRecommendationPredictivePresentation,
        ).toHaveBeenCalledWith({
          memory:
            params.memory,

          memoryAnalysis:
            params.memoryAnalysis,

          adaptiveLearningAnalysis:
            params.adaptiveLearningAnalysis,

          analysis,

          createdAt:
            PREDICTED_AT,
        });

        expect(
          result.predictedAt,
        ).toBe(
          PREDICTED_AT,
        );

        expect(
          result.analysis,
        ).toEqual(
          analysis,
        );

        expect(
          result.presentation,
        ).toEqual(
          presentation,
        );

        expect(
          predictiveAnalysisMocks
            .validateRecommendationPredictiveIntelligence,
        ).toHaveBeenCalled();

        expect(
          predictivePresentationMocks
            .validateRecommendationPredictivePresentation,
        ).toHaveBeenCalled();
      },
    );

    it(
      "returns cloned analysis and presentation values",
      () => {
        const params =
          createUpdateParams();

        const analysis =
          createMockAnalysis();

        const presentation =
          createMockPresentation();

        predictiveAnalysisMocks
          .analyzeRecommendationPredictiveIntelligence
          .mockReturnValue(
            analysis,
          );

        predictivePresentationMocks
          .createRecommendationPredictivePresentation
          .mockReturnValue(
            presentation,
          );

        const result =
          updateRecommendationPredictiveIntelligence(
            params,
          );

        expect(
          result.analysis,
        ).not.toBe(
          analysis,
        );

        expect(
          result.presentation,
        ).not.toBe(
          presentation,
        );

        expect(
          result.analysis.predictedStates,
        ).not.toBe(
          analysis.predictedStates,
        );

        expect(
          result.presentation.evidence,
        ).not.toBe(
          presentation.evidence,
        );

        result.analysis.reasoning.push(
          "Result-only reasoning.",
        );

        result.presentation.evidence.push(
          "Result-only evidence.",
        );

        expect(
          analysis.reasoning,
        ).not.toContain(
          "Result-only reasoning.",
        );

        expect(
          presentation.evidence,
        ).not.toContain(
          "Result-only evidence.",
        );
      },
    );
  },
);

describe(
  "validateRecommendationPredictiveUpdateResult",
  () => {
    it(
      "accepts a structurally consistent update result",
      () => {
        const params =
          createUpdateParams();

        const result:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis:
              createMockAnalysis(),

            presentation:
              createMockPresentation(),

            predictedAt:
              PREDICTED_AT,
          };

        expect(
          () =>
            validateRecommendationPredictiveUpdateResult({
              memory:
                params.memory,

              memoryAnalysis:
                params.memoryAnalysis,

              adaptiveLearningAnalysis:
                params.adaptiveLearningAnalysis,

              result,
            }),
        ).not.toThrow();
      },
    );

    it(
      "rejects a result timestamp that differs from the analysis timestamp",
      () => {
        const params =
          createUpdateParams();

        const result:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis:
              createMockAnalysis(),

            presentation:
              createMockPresentation(),

            predictedAt:
              "2026-07-29T08:11:00.000Z",
          };

        expect(
          () =>
            validateRecommendationPredictiveUpdateResult({
              memory:
                params.memory,

              memoryAnalysis:
                params.memoryAnalysis,

              adaptiveLearningAnalysis:
                params.adaptiveLearningAnalysis,

              result,
            }),
        ).toThrow(
          "Predictive Update Result predictedAt must match Analysis predictedAt.",
        );
      },
    );

    it(
      "rejects a presentation timestamp that differs from predictedAt",
      () => {
        const params =
          createUpdateParams();

        const presentation =
          createMockPresentation();

        presentation.createdAt =
          "2026-07-29T08:11:00.000Z";

        const result:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis:
              createMockAnalysis(),

            presentation,

            predictedAt:
              PREDICTED_AT,
          };

        expect(
          () =>
            validateRecommendationPredictiveUpdateResult({
              memory:
                params.memory,

              memoryAnalysis:
                params.memoryAnalysis,

              adaptiveLearningAnalysis:
                params.adaptiveLearningAnalysis,

              result,
            }),
        ).toThrow(
          "Predictive Presentation createdAt must match Update Result predictedAt.",
        );
      },
    );

    it(
      "rejects an analysis connected to another Memory",
      () => {
        const params =
          createUpdateParams();

        const analysis =
          createMockAnalysis();

        analysis.memoryId =
          "another-memory";

        const result:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis,

            presentation:
              createMockPresentation(),

            predictedAt:
              PREDICTED_AT,
          };

        expect(
          () =>
            validateRecommendationPredictiveUpdateResult({
              memory:
                params.memory,

              memoryAnalysis:
                params.memoryAnalysis,

              adaptiveLearningAnalysis:
                params.adaptiveLearningAnalysis,

              result,
            }),
        ).toThrow(
          "Predictive Update Result Analysis memoryId must match Memory id.",
        );
      },
    );
  },
);

describe(
  "cloneRecommendationPredictiveIntelligenceUpdateResult",
  () => {
    it(
      "creates an independent copy of the update result",
      () => {
        const source:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis:
              createMockAnalysis(),

            presentation:
              createMockPresentation(),

            predictedAt:
              PREDICTED_AT,
          };

        const cloned =
          cloneRecommendationPredictiveIntelligenceUpdateResult(
            source,
          );

        expect(
          cloned,
        ).toEqual(
          source,
        );

        expect(
          cloned,
        ).not.toBe(
          source,
        );

        expect(
          cloned.analysis,
        ).not.toBe(
          source.analysis,
        );

        expect(
          cloned.presentation,
        ).not.toBe(
          source.presentation,
        );
      },
    );
  },
);

describe(
  "Recommendation Predictive Intelligence Update query helpers",
  () => {
    it(
      "detects predictions, presentation, usability, and conflict state",
      () => {
        const result:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis:
              createMockAnalysis(),

            presentation:
              createMockPresentation(),

            predictedAt:
              PREDICTED_AT,
          };

        expect(
          hasRecommendationPredictiveIntelligencePredictions(
            result,
          ),
        ).toBe(
          true,
        );

        expect(
          hasRecommendationPredictiveIntelligencePresentation(
            result,
          ),
        ).toBe(
          true,
        );

        expect(
          isRecommendationPredictiveIntelligenceUpdateUsable(
            result,
          ),
        ).toBe(
          true,
        );

        expect(
          hasRecommendationPredictiveIntelligenceConflict(
            result,
          ),
        ).toBe(
          false,
        );

        result.analysis.conflicts.push({
          id:
            "conflict-1",

          type:
            "state-distribution-conflict",

          severity:
            "moderate",

          score:
            0.5,

          confidence:
            0.6,

          description:
            "Two State candidates remain similarly likely.",

          relatedPredictionIds: [
            "state-prediction-1",
          ],

          reasoning: [
            "The State distribution remains uncertain.",
          ],
        });

        expect(
          hasRecommendationPredictiveIntelligenceConflict(
            result,
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "does not treat unavailable or insufficient analysis as usable",
      () => {
        const unavailableResult:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis: {
              ...createMockAnalysis(),

              state:
                "unavailable",
            },

            presentation:
              createMockPresentation(),

            predictedAt:
              PREDICTED_AT,
          };

        const insufficientResult:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis: {
              ...createMockAnalysis(),

              state:
                "insufficient",
            },

            presentation:
              createMockPresentation(),

            predictedAt:
              PREDICTED_AT,
          };

        expect(
          isRecommendationPredictiveIntelligenceUpdateUsable(
            unavailableResult,
          ),
        ).toBe(
          false,
        );

        expect(
          isRecommendationPredictiveIntelligenceUpdateUsable(
            insufficientResult,
          ),
        ).toBe(
          false,
        );
      },
    );

    it(
      "requires all essential presentation strings",
      () => {
        const result:
          RecommendationPredictiveIntelligenceUpdateResult = {
            analysis:
              createMockAnalysis(),

            presentation: {
              ...createMockPresentation(),

              confidenceDisclosure:
                "",
            },

            predictedAt:
              PREDICTED_AT,
          };

        expect(
          hasRecommendationPredictiveIntelligencePresentation(
            result,
          ),
        ).toBe(
          false,
        );
      },
    );
  },
);